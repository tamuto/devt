import { Page } from 'playwright';
import { AuthenticationOptions } from '../types/auth';

export class AuthenticationHandler {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 認証を実行
   */
  async authenticate(auth: AuthenticationOptions): Promise<void> {
    switch (auth.type) {
      case 'basic':
        await this.handleBasicAuth(auth);
        break;
      case 'form':
        await this.handleFormAuth(auth);
        break;
      case 'cookie':
        await this.handleCookieAuth(auth);
        break;
      case 'header':
        await this.handleHeaderAuth(auth);
        break;
      default:
        throw new Error(`Unsupported authentication type: ${auth.type}`);
    }
  }

  /**
   * Basic認証
   */
  private async handleBasicAuth(auth: AuthenticationOptions): Promise<void> {
    if (!auth.credentials?.username || !auth.credentials?.password) {
      throw new Error('Username and password are required for basic authentication');
    }

    await this.page.setExtraHTTPHeaders({
      'Authorization': `Basic ${Buffer.from(
        `${auth.credentials.username}:${auth.credentials.password}`
      ).toString('base64')}`
    });
  }

  /**
   * フォーム認証
   */
  private async handleFormAuth(auth: AuthenticationOptions): Promise<void> {
    if (!auth.formSelectors) {
      throw new Error('Form selectors are required for form authentication');
    }

    if (!auth.credentials?.username || !auth.credentials?.password) {
      throw new Error('Username and password are required for form authentication');
    }

    const { formSelectors, credentials } = auth;
    const timeout = auth.timeout || 30000;

    // ログインページに移動（指定されている場合）
    if (formSelectors.loginUrl) {
      await this.page.goto(formSelectors.loginUrl, { waitUntil: 'networkidle' });
    }

    // ユーザー名を入力
    await this.page.waitForSelector(formSelectors.usernameSelector, { timeout });
    await this.page.fill(formSelectors.usernameSelector, credentials.username!);

    // パスワードを入力
    await this.page.waitForSelector(formSelectors.passwordSelector, { timeout });
    await this.page.fill(formSelectors.passwordSelector, credentials.password!);

    // ログイン前の状態を記録
    const originalUrl = await this.page.evaluate('window.location.href');
    const originalTitle = await this.page.title();
    console.log(`🔍 Original URL (before login): ${originalUrl}`);

    // ログインボタンをクリック
    await Promise.all([
      this.page.waitForResponse(response => response.status() !== 404, { timeout }).catch(() => null),
      this.page.click(formSelectors.submitSelector)
    ]);

    // 多段階フォールバック戦略でログイン成功を確認
    let loginSuccess = false;
    const strategies: string[] = [];

    try {
      // 戦略1: URL変更検知（最も確実）- ハッシュ変更も含む
      await this.page.waitForFunction(
        `(originalUrl) => {
          const currentUrl = window.location.href;
          const currentHash = window.location.hash;
          // URL変更またはハッシュの追加/変更を検知
          return currentUrl !== originalUrl || (currentHash && currentHash.length > 0);
        }`,
        originalUrl,
        { timeout: 10000, polling: 100 } // ポーリング間隔を短くして確実に検知
      );
      
      // ハッシュ変更後、さらに少し待機してDOM更新を確実にする
      await this.page.waitForTimeout(1000);
      
      loginSuccess = true;
      strategies.push('URL change detected');
      const currentUrl = await this.page.evaluate('window.location.href');
      console.log(`🔍 URL changed during login: ${originalUrl} → ${currentUrl}`);
    } catch (e) {
      // 戦略2: カスタムセレクター待機
      if (auth.waitForSelector) {
        try {
          await this.page.waitForSelector(auth.waitForSelector, { timeout: 5000 });
          // セレクターが見つかったが、ログインフォームがまだ存在しないか確認
          const loginFormExists = await this.page.$('input[type="password"], input[name="password"]');
          if (!loginFormExists) {
            loginSuccess = true;
            strategies.push(`waitForSelector: ${auth.waitForSelector}`);
          } else {
            strategies.push(`waitForSelector found but login form still exists`);
          }
        } catch (e) {
          strategies.push(`waitForSelector failed: ${auth.waitForSelector}`);
        }
      }

      // 戦略3: ログインフォームの消失確認
      if (!loginSuccess) {
        try {
          await this.page.waitForFunction(
            `() => !document.querySelector('input[type="password"], input[name="password"]')`,
            { timeout: 3000 }
          );
          loginSuccess = true;
          strategies.push('Login form disappeared');
        } catch (e) {
          strategies.push('Login form still present');
        }
      }

      // 戦略4: ページタイトル変更検知
      if (!loginSuccess) {
        try {
          await this.page.waitForFunction(
            `(originalTitle) => document.title !== originalTitle`,
            originalTitle,
            { timeout: 3000 }
          );
          loginSuccess = true;
          strategies.push('Page title changed');
        } catch (e) {
          strategies.push('Page title unchanged');
        }
      }

      // 戦略5: エラーメッセージ確認（失敗判定）
      const errorMessage = await this.page.$('.error, .alert, [class*="error"], [class*="alert"], [role="alert"]');
      if (errorMessage) {
        const errorText = await errorMessage.textContent();
        throw new Error(`Login failed - Error detected: ${errorText?.substring(0, 100)}`);
      }

      // 戦略6: 最終フォールバック - 時間待機
      if (!loginSuccess) {
        console.warn('⚠️  Warning: Could not detect login success reliably. Using time-based fallback.');
        console.warn(`Strategies attempted: ${strategies.join(', ')}`);
        await this.page.waitForTimeout(3000);
        strategies.push('Time-based fallback (3s)');
      }
    }

    // 最終的にネットワークが安定するまで待機
    await this.page.waitForLoadState('networkidle');

    // 認証成功直後のURLを記録（capture.tsでの移動前）
    const postAuthUrl = await this.page.evaluate('window.location.href');
    const finalTitle = await this.page.title();
    console.log(`🔍 Login detection strategies: ${strategies.join(' → ')}`);
    console.log(`🔍 URL: ${originalUrl} → ${postAuthUrl}`);
    console.log(`🔍 Title: ${originalTitle} → ${finalTitle}`);
  }

  /**
   * Cookie認証
   */
  private async handleCookieAuth(auth: AuthenticationOptions): Promise<void> {
    if (!auth.cookies || auth.cookies.length === 0) {
      throw new Error('Cookies are required for cookie authentication');
    }

    await this.page.context().addCookies(auth.cookies.map(cookie => ({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain || new URL(this.page.url()).hostname,
      path: cookie.path || '/'
    })));
  }

  /**
   * ヘッダー認証（API Key等）
   */
  private async handleHeaderAuth(auth: AuthenticationOptions): Promise<void> {
    if (!auth.headers) {
      throw new Error('Headers are required for header authentication');
    }

    await this.page.setExtraHTTPHeaders(auth.headers);
  }
}
