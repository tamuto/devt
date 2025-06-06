import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  CaptureOptions,
  ScreenshotData,
  ScreenshotMetadata,
  DiffResult
} from '../types';
import { CaptureOptionsWithAuth } from '../types/auth';
import { AuthenticationHandler } from './auth';
import {
  generateUrlHash,
  generateFilename,
  ensureDirectory,
  getNextSequence,
  getLatestScreenshot
} from '../utils/file';
import {
  compareImages,
  base64ToBuffer,
  bufferToBase64
} from '../utils/image';

export class WebScreenshotCapture {
  private browser?: Browser;
  private outputDir: string;

  constructor(outputDir: string = './screenshots') {
    this.outputDir = path.resolve(outputDir);
  }

  /**
   * ブラウザを起動
   */
  async init(headless: boolean = true): Promise<void> {
    this.browser = await chromium.launch({
      headless
    });
  }

  /**
   * ブラウザを終了
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * スクリーンショットを撮影（認証対応）
   */
  async capture(options: CaptureOptionsWithAuth): Promise<ScreenshotData> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call init() first.');
    }

    const {
      url,
      prefix,
      viewport = { width: 1280, height: 720 },
      fullPage = true,
      diffThreshold = 1.0,
      auth
    } = options;

    // 出力ディレクトリを作成
    await ensureDirectory(this.outputDir);

    // ファイル名の識別子を決定（prefix指定時はprefixを使用、未指定時はURLハッシュ）
    const identifier = prefix || generateUrlHash(url);
    const sequence = await getNextSequence(this.outputDir, identifier);

    // ページを作成
    const page = await this.browser.newPage();
    
    try {
      await page.setViewportSize(viewport);
      
      // 認証が必要な場合は実行
      if (auth) {
        const authHandler = new AuthenticationHandler(page);
        await authHandler.authenticate(auth);
      }
      
      // 認証後のURLが目的URLと異なる場合のみ移動
      const currentUrl = await page.evaluate('window.location.href');
      const targetUrl = url;
      
      console.log(`🔍 Checking URLs: Current=${currentUrl}, Target=${targetUrl}`);
      
      if (currentUrl !== targetUrl) {
        console.log(`🔄 Navigating to target URL: ${currentUrl} → ${targetUrl}`);
        await page.goto(url, { waitUntil: 'networkidle' });
      } else {
        console.log(`✅ Already at target URL: ${currentUrl}`);
      }
      
      // 複合アプローチで描画完了を待機
      await this.waitForCompleteRender(page);
      
      // スクリーンショットを撮影
      const screenshotBuffer = await page.screenshot({
        fullPage,
        type: 'png'
      });

      // HTMLコンテンツを取得
      const htmlContent = await page.content();

      const imageBase64 = bufferToBase64(screenshotBuffer);
      const timestamp = new Date().toISOString();

      // ファイル名を生成
      const filename = generateFilename(identifier, sequence);
      
      // メタデータを作成
      const metadata: ScreenshotMetadata = {
        url,
        timestamp,
        sequence,
        hash: prefix ? identifier : generateUrlHash(url),
        filename,
        viewport,
        fullPage
      };

      // スクリーンショットデータを作成
      const screenshotData: ScreenshotData = {
        metadata,
        imageBase64,
        html: htmlContent
      };

      // 前回のスクリーンショットと比較
      const previousScreenshotPath = await getLatestScreenshot(this.outputDir, identifier);
      
      if (previousScreenshotPath && sequence > 1) {
        try {
          const previousData = JSON.parse(await fs.readFile(previousScreenshotPath, 'utf-8')) as ScreenshotData;
          const previousBuffer = base64ToBuffer(previousData.imageBase64);
          
          const diffResult = await compareImages(screenshotBuffer, previousBuffer, diffThreshold);
          
          // メタデータに差分情報を追加
          metadata.hasDiff = diffResult.hasDiff;
          metadata.diffPercentage = diffResult.diffPercentage;
        } catch (error) {
          console.warn('Failed to compare with previous screenshot:', error);
          // 比較に失敗した場合は差分ありとして扱う
          metadata.hasDiff = true;
          metadata.diffPercentage = 100;
        }
      } else {
        // 初回の場合
        metadata.hasDiff = true;
        metadata.diffPercentage = 100;
      }

      // ファイルに保存
      await this.saveScreenshotData(screenshotData);

      return screenshotData;

    } finally {
      await page.close();
    }
  }

  /**
   * 複合アプローチでページの描画完了を待機
   */
  private async waitForCompleteRender(page: Page): Promise<void> {
    console.log('⏳ Waiting for complete page render...');
    
    try {
      // Phase 1: 基本的な読み込み完了
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      console.log('✓ Basic loading completed');
      
      // Phase 2: React特有の待機
      await this.waitForReactStability(page);
      
      // Phase 3: DOM変更の安定化待機
      await this.waitForDOMStability(page);
      
      // Phase 4: 最終安定化待機
      await page.waitForTimeout(1000);
      console.log('✓ Complete render waiting finished');
      
    } catch (error) {
      console.warn('⚠️ Render waiting timeout, proceeding with screenshot:', error);
    }
  }

  /**
   * React特有の描画完了を待機
   */
  private async waitForReactStability(page: Page): Promise<void> {
    try {
      // React DevTools APIの存在確認と安定性チェック
      await page.waitForFunction(`() => {
        if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          return !window.__REACT_DEVTOOLS_GLOBAL_HOOK__.isProfiling;
        }
        return true;
      }`, { timeout: 5000 }).catch(() => {});

      // RequestIdleCallback による空き時間待機
      await page.waitForFunction(`() => {
        return new Promise(resolve => {
          if (window.requestIdleCallback) {
            window.requestIdleCallback(() => resolve(true), { timeout: 3000 });
          } else {
            setTimeout(() => resolve(true), 100);
          }
        });
      }`, { timeout: 8000 }).catch(() => {});
      
      console.log('✓ React stability check completed');
    } catch (error) {
      console.warn('⚠️ React stability check failed:', error);
    }
  }

  /**
   * DOM変更の安定化を待機
   */
  private async waitForDOMStability(page: Page): Promise<void> {
    try {
      await page.waitForFunction(`() => {
        return new Promise(resolve => {
          let mutationCount = 0;
          const observer = new MutationObserver(() => {
            mutationCount++;
          });
          
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
          });
          
          // 500ms間DOM変更がないことを確認
          setTimeout(() => {
            observer.disconnect();
            resolve(mutationCount === 0);
          }, 500);
        });
      }`, { timeout: 10000 }).catch(() => {});
      
      console.log('✓ DOM stability check completed');
    } catch (error) {
      console.warn('⚠️ DOM stability check failed:', error);
    }
  }

  /**
   * インターラクティブモードでブラウザを起動
   */
  async startInteractive(options: CaptureOptionsWithAuth): Promise<void> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call init() first.');
    }

    const {
      url,
      viewport = { width: 1280, height: 720 },
      auth
    } = options;

    // 出力ディレクトリを作成
    await ensureDirectory(this.outputDir);

    console.log('🚀 Starting interactive mode...');
    console.log('📋 Controls:');
    console.log('  Ctrl+S: Take screenshot');
    console.log('  Ctrl+Q: Exit');
    console.log('  Or close browser window to exit');

    // ページを作成
    const page = await this.browser.newPage();
    await page.setViewportSize(viewport);

    // 認証が必要な場合は実行
    if (auth) {
      console.log('🔑 Authenticating...');
      const authHandler = new AuthenticationHandler(page);
      await authHandler.authenticate(auth);
    }

    // スクリーンショット撮影関数を公開
    await page.exposeFunction('takeScreenshot', async () => {
      try {
        // ファイル名の識別子を決定（prefix指定時はprefixを使用、未指定時はURLハッシュ）
        const identifier = options.prefix || generateUrlHash(url);
        const sequence = await getNextSequence(this.outputDir, identifier);

        // 複合アプローチで描画完了を待機
        await this.waitForCompleteRender(page);

        // スクリーンショットを撮影
        const screenshotBuffer = await page.screenshot({
          fullPage: true,
          type: 'png'
        });

        // HTMLコンテンツを取得
        const htmlContent = await page.content();
        const imageBase64 = bufferToBase64(screenshotBuffer);
        const timestamp = new Date().toISOString();

        // ファイル名を生成
        const filename = generateFilename(identifier, sequence);

        // メタデータを作成
        const metadata: ScreenshotMetadata = {
          url,
          timestamp,
          sequence,
          hash: options.prefix ? identifier : generateUrlHash(url),
          filename,
          viewport,
          fullPage: true
        };

        // スクリーンショットデータを作成
        const screenshotData: ScreenshotData = {
          metadata,
          imageBase64,
          html: htmlContent
        };

        // 前回のスクリーンショットと比較
        const previousScreenshotPath = await getLatestScreenshot(this.outputDir, identifier);

        if (previousScreenshotPath && sequence > 1) {
          try {
            const previousData = JSON.parse(await fs.readFile(previousScreenshotPath, 'utf-8')) as ScreenshotData;
            const previousBuffer = base64ToBuffer(previousData.imageBase64);

            const diffResult = await compareImages(screenshotBuffer, previousBuffer, 1.0);

            // メタデータに差分情報を追加
            metadata.hasDiff = diffResult.hasDiff;
            metadata.diffPercentage = diffResult.diffPercentage;
          } catch (error) {
            console.warn('Failed to compare with previous screenshot:', error);
            metadata.hasDiff = true;
            metadata.diffPercentage = 100;
          }
        } else {
          // 初回の場合
          metadata.hasDiff = true;
          metadata.diffPercentage = 100;
        }

        // ファイルに保存
        await this.saveScreenshotData(screenshotData);

        console.log(`📸 Screenshot saved (Diff: ${metadata.diffPercentage?.toFixed(2)}%)`);
        console.log(`📁 File: ${filename}`);

      } catch (error) {
        console.error('❌ Screenshot error:', error);
      }
    });

    // ページ終了関数を公開
    await page.exposeFunction('exitInteractive', async () => {
      console.log('🚪 Exit requested from browser');
      await page.close();
    });

    // URLに移動
    await page.goto(url, { waitUntil: 'networkidle' });

    // キーボードショートカットを追加（ページ読み込み後に実行）
    try {
      console.log('🔧 Setting up keyboard shortcuts...');
      
      // 直接実行形式で試す
      await page.addScriptTag({
        content: `
          console.log('Script injected, setting up shortcuts...');
          document.addEventListener('keydown', function(e) {
            console.log('Key pressed:', e.key, 'Ctrl:', e.ctrlKey);
            if (e.ctrlKey && e.key === 's') {
              e.preventDefault();
              console.log('Taking screenshot...');
              if (window.takeScreenshot) {
                window.takeScreenshot();
              } else {
                console.error('takeScreenshot function not found');
              }
            }
            if (e.ctrlKey && e.key === 'q') {
              e.preventDefault();
              console.log('Exit requested...');
              if (window.exitInteractive) {
                window.exitInteractive();
              } else {
                console.error('exitInteractive function not found');
                // Fallback to window.close()
                try {
                  window.close();
                } catch(err) {
                  console.error('window.close() failed:', err);
                }
              }
            }
          });
          console.log('Keyboard shortcuts registered successfully!');
        `
      });
      
      console.log('✅ Keyboard shortcuts injected via script tag');
    } catch (error) {
      console.error('❌ Failed to setup keyboard shortcuts:', error);
    }

    // ページクローズイベントを監視
    page.once('close', () => {
      console.log('\n👋 Interactive session ended');
    });

    // ブラウザクローズイベントを監視
    if (this.browser) {
      this.browser.on('disconnected', () => {
        console.log('\n👋 Browser closed, exiting...');
        process.exit(0);
      });
    }

    console.log('✅ Interactive mode ready! Navigate and use keyboard shortcuts.');

    // ブラウザが閉じられるまで待機
    try {
      await new Promise<void>((resolve) => {
        const onClose = () => resolve();
        page.once('close', onClose);
      });
    } finally {
      if (!page.isClosed()) {
        await page.close();
      }
    }
  }

  /**
   * スクリーンショットデータをファイルに保存 (統一版)
   */
  private async saveScreenshotData(data: ScreenshotData): Promise<void> {
    const filePath = path.join(this.outputDir, data.metadata.filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }
}
