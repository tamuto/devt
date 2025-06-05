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

    // ログインボタンをクリック
    const [response] = await Promise.all([
      this.page.waitForResponse(response => response.status() !== 404, { timeout }),
      this.page.click(formSelectors.submitSelector)
    ]);

    // ログイン成功の確認
    if (auth.waitForSelector) {
      await this.page.waitForSelector(auth.waitForSelector, { timeout });
    } else {
      // デフォルトでネットワークが安定するまで待機
      await this.page.waitForLoadState('networkidle');
    }
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
