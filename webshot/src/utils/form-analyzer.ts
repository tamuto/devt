import { Page } from 'playwright';
import { AuthenticationOptions } from '../types/auth';

export interface FormAnalysisResult {
  hasLoginForm: boolean;
  formSelectors?: {
    usernameSelector: string;
    passwordSelector: string;
    submitSelector: string;
    loginUrl: string;
  };
  suggestedWaitSelectors: string[];
  postLoginUrl?: string;
  recommendations: string[];
}

export class LoginFormAnalyzer {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * ログインフォームを解析し、認証設定を生成
   */
  async analyzeLoginForm(url: string): Promise<FormAnalysisResult> {
    const result: FormAnalysisResult = {
      hasLoginForm: false,
      suggestedWaitSelectors: [],
      recommendations: []
    };

    await this.page.goto(url, { waitUntil: 'networkidle' });

    // フォーム要素を解析
    const forms = await this.page.$$('form');
    
    if (forms.length === 0) {
      result.recommendations.push('No forms found on the page');
      return result;
    }

    result.recommendations.push(`Found ${forms.length} form(s) on the page`);

    // ログインフォームを特定
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const analysis = await this.analyzeForm(form, i);
      
      if (analysis.isLoginForm) {
        result.hasLoginForm = true;
        result.formSelectors = {
          usernameSelector: analysis.usernameSelector!,
          passwordSelector: analysis.passwordSelector!,
          submitSelector: analysis.submitSelector!,
          loginUrl: url
        };
        
        result.recommendations.push(
          `Login form detected (Form ${i + 1})`,
          `Username field: ${analysis.usernameSelector}`,
          `Password field: ${analysis.passwordSelector}`,
          `Submit button: ${analysis.submitSelector}`
        );
        break;
      }
    }

    if (!result.hasLoginForm) {
      result.recommendations.push('No login form detected');
      return result;
    }

    // ページ全体の要素を解析して待機セレクターを提案
    await this.analyzePage(result);

    return result;
  }

  /**
   * ログイン実行後の解析
   */
  async analyzePostLogin(authConfig: AuthenticationOptions, credentials: { username: string; password: string }): Promise<{
    success: boolean;
    postLoginUrl: string;
    suggestedWaitSelectors: string[];
    recommendations: string[];
  }> {
    const result = {
      success: false,
      postLoginUrl: '',
      suggestedWaitSelectors: [] as string[],
      recommendations: [] as string[]
    };

    try {
      if (!authConfig.formSelectors) {
        throw new Error('Form selectors not provided');
      }

      const { formSelectors } = authConfig;
      
      // ログインページに移動
      await this.page.goto(formSelectors.loginUrl!, { waitUntil: 'networkidle' });
      
      // ログイン実行
      await this.page.fill(formSelectors.usernameSelector, credentials.username);
      await this.page.fill(formSelectors.passwordSelector, credentials.password);
      
      const originalUrl = this.page.url();
      
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {
          // ナビゲーションが発生しない場合は無視
        }),
        this.page.click(formSelectors.submitSelector)
      ]);

      // 少し待ってからURL確認
      await this.page.waitForTimeout(2000);

      const newUrl = this.page.url();
      result.postLoginUrl = newUrl;

      // URL変更またはページ内容変更の確認
      if (newUrl !== originalUrl) {
        result.success = true;
        result.recommendations.push(`URL changed from ${originalUrl} to ${newUrl}`);
      } else {
        // URL変更がない場合、ページ内容の変化を確認
        const hasErrorMessage = await this.page.$('.error, .alert, [class*="error"], [class*="alert"]');
        if (!hasErrorMessage) {
          result.success = true;
          result.recommendations.push('Page content changed (same URL)');
        } else {
          result.recommendations.push('Login may have failed (error message detected)');
        }
      }

      if (result.success) {
        // ログイン後のページ要素を解析
        await this.analyzePostLoginPage(result);
      }

    } catch (error) {
      result.recommendations.push(`Login failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }

  private async analyzeForm(form: any, index: number): Promise<{
    isLoginForm: boolean;
    usernameSelector?: string;
    passwordSelector?: string;
    submitSelector?: string;
  }> {
    const result = {
      isLoginForm: false,
      usernameSelector: undefined as string | undefined,
      passwordSelector: undefined as string | undefined,
      submitSelector: undefined as string | undefined
    };

    // フォーム内の入力フィールドを取得
    const inputs = await form.$$('input');
    const buttons = await form.$$('button, input[type="submit"]');

    let usernameField = null;
    let passwordField = null;

    for (const input of inputs) {
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const placeholder = await input.getAttribute('placeholder');

      // ユーザー名フィールドの検出
      if (type === 'email' || type === 'text' || type === null) {
        if (name?.includes('email') || name?.includes('user') || name?.includes('login') ||
            id?.includes('email') || id?.includes('user') || id?.includes('login') ||
            placeholder?.includes('email') || placeholder?.includes('user') || placeholder?.includes('メール')) {
          usernameField = input;
          if (name) result.usernameSelector = `input[name="${name}"]`;
          else if (id) result.usernameSelector = `#${id}`;
          else result.usernameSelector = `form:nth-child(${index + 1}) input[type="${type || 'text'}"]`;
        }
      }

      // パスワードフィールドの検出
      if (type === 'password') {
        passwordField = input;
        if (name) result.passwordSelector = `input[name="${name}"]`;
        else if (id) result.passwordSelector = `#${id}`;
        else result.passwordSelector = `form:nth-child(${index + 1}) input[type="password"]`;
      }
    }

    // 送信ボタンの検出
    for (const button of buttons) {
      const type = await button.getAttribute('type');
      const text = await button.textContent();
      const className = await button.getAttribute('class');

      if (type === 'submit' || 
          text?.includes('ログイン') || text?.includes('サインイン') || text?.includes('Login') || text?.includes('Sign in') ||
          className?.includes('login') || className?.includes('submit')) {
        const id = await button.getAttribute('id');
        const tagName = await button.evaluate((el: any) => el.tagName.toLowerCase());
        
        if (id && !id.includes(':')) {
          result.submitSelector = `#${id}`;
        } else if (type === 'submit') {
          result.submitSelector = `${tagName}[type="submit"]`;
        } else {
          result.submitSelector = `form:nth-child(${index + 1}) ${tagName}`;
        }
        break;
      }
    }

    // ログインフォームかどうかの判定
    result.isLoginForm = !!(usernameField && passwordField && result.submitSelector);

    return result;
  }

  private async analyzePage(result: FormAnalysisResult): Promise<void> {
    // 一般的な待機セレクターの候補を探す
    const commonSelectors = [
      '.dashboard',
      '.main-content',
      '.content',
      '.app-content',
      '[role="main"]',
      '.MuiContainer-root',
      '.container',
      '.wrapper',
      '.home',
      '[data-testid="dashboard"]',
      '[data-testid="home"]'
    ];

    for (const selector of commonSelectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim().length > 0) {
            result.suggestedWaitSelectors.push(selector);
          }
        }
      } catch (e) {
        // セレクターが無効な場合は無視
      }
    }

    // ページ固有の要素も提案
    const uniqueElements = await this.page.$$eval('*[class], *[id]', (elements: any[]) => {
      return elements
        .filter((el: any) => el.className && el.className.length > 0)
        .slice(0, 10)
        .map((el: any) => `.${el.className.split(' ')[0]}`)
        .filter((selector, index, arr) => arr.indexOf(selector) === index);
    });

    result.suggestedWaitSelectors.push(...uniqueElements.slice(0, 5));
  }

  private async analyzePostLoginPage(result: any): Promise<void> {
    // ログイン後のページで適切な待機セレクターを特定
    const selectors = [
      '.MuiContainer-root',
      '.dashboard',
      '.main-content',
      '.content',
      '[role="main"]',
      '.app-content',
      '.home',
      '.facility-select' // allesc.jp specific
    ];

    // ログインフォーム要素が存在しないことを確認
    const loginFormExists = await this.page.$('input[name="email"], input[name="password"], input[type="password"]');
    
    for (const selector of selectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          const text = await element.textContent();
          
          // ログインフォーム関連のテキストを除外
          if (text && text.trim().length > 0 && 
              !text.includes('ログイン') && 
              !text.includes('サインイン') && 
              !text.includes('メールアドレス') &&
              !text.includes('パスワード') &&
              !text.includes('Sign in') &&
              !text.includes('Login') &&
              !text.includes('Email') &&
              !text.includes('Password')) {
            
            // 要素内にログインフォームが含まれていないかチェック
            const hasLoginForm = await element.$('input[type="password"], input[name="email"], input[name="password"]');
            
            if (!hasLoginForm) {
              result.suggestedWaitSelectors.push(selector);
              result.recommendations.push(`Suggested wait selector: ${selector} (contains: "${text.substring(0, 50)}...")`);
            }
          }
        }
      } catch (e) {
        // セレクターが無効な場合は無視
      }
    }

    // ログインフォームが完全に消えていない場合の特別処理
    if (loginFormExists) {
      result.recommendations.push('Warning: Login form still exists on page - may need different approach');
      
      // URL変更ベースの検出を提案
      if (result.postLoginUrl && result.postLoginUrl !== 'https://allesc.jp/') {
        result.recommendations.push(`Consider using URL change detection: ${result.postLoginUrl}`);
      }
      
      // 特定のテキストを含む要素を探す
      const specificTexts = ['施設選択', '選択', 'dashboard', 'home', 'main'];
      for (const searchText of specificTexts) {
        try {
          const element = this.page.locator(`text=${searchText}`).first();
          if (await element.isVisible()) {
            result.suggestedWaitSelectors.push(`text=${searchText}`);
            result.recommendations.push(`Found specific text selector: text=${searchText}`);
            break;
          }
        } catch (e) {
          // テキストが見つからない場合は無視
        }
      }
    }
  }

  /**
   * 認証設定JSONを生成
   */
  generateAuthConfig(analysis: FormAnalysisResult, credentials: { username: string; password: string }): AuthenticationOptions {
    if (!analysis.formSelectors) {
      throw new Error('No form selectors available');
    }

    const config: AuthenticationOptions = {
      type: 'form',
      credentials,
      formSelectors: analysis.formSelectors,
      timeout: 30000
    };

    // waitForSelectorは意図的に設定しない
    // フォールバック戦略（URL変更検知等）に任せる
    
    return config;
  }
}