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
  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true
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
  async capture(options: CaptureOptionsWithAuth): Promise<{
    logsData: ScreenshotData;
    evidenceData?: ScreenshotData;
  }> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call init() first.');
    }

    const {
      url,
      viewport = { width: 1280, height: 720 },
      fullPage = true,
      diffThreshold = 1.0,
      auth
    } = options;

    // 出力ディレクトリを作成
    await ensureDirectory(this.outputDir);

    // URLハッシュと連番を生成
    const hash = generateUrlHash(url);
    const sequence = await getNextSequence(this.outputDir, hash);

    // ページを作成
    const page = await this.browser.newPage();
    
    try {
      await page.setViewportSize(viewport);
      
      // 認証が必要な場合は実行
      if (auth) {
        const authHandler = new AuthenticationHandler(page);
        await authHandler.authenticate(auth);
      }
      
      // 目的のページに移動
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // スクリーンショットを撮影
      const screenshotBuffer = await page.screenshot({
        fullPage,
        type: 'png'
      });

      const imageBase64 = bufferToBase64(screenshotBuffer);
      const timestamp = new Date().toISOString();

      // メタデータを作成
      const metadata: ScreenshotMetadata = {
        url,
        timestamp,
        sequence,
        hash,
        filename: generateFilename(hash, sequence, 'logs'),
        viewport,
        fullPage
      };

      // logsデータを作成
      const logsData: ScreenshotData = {
        metadata,
        imageBase64
      };

      // 前回のスクリーンショットと比較
      let evidenceData: ScreenshotData | undefined;
      const previousScreenshotPath = await getLatestScreenshot(this.outputDir, hash);
      
      if (previousScreenshotPath && sequence > 1) {
        try {
          const previousData = JSON.parse(await fs.readFile(previousScreenshotPath, 'utf-8')) as ScreenshotData;
          const previousBuffer = base64ToBuffer(previousData.imageBase64);
          
          const diffResult = await compareImages(screenshotBuffer, previousBuffer, diffThreshold);
          
          // メタデータに差分情報を追加
          metadata.hasDiff = diffResult.hasDiff;
          metadata.diffPercentage = diffResult.diffPercentage;

          // 差分がある場合のみevidenceデータを作成
          if (diffResult.hasDiff) {
            const evidenceMetadata: ScreenshotMetadata = {
              ...metadata,
              filename: generateFilename(hash, sequence, 'evidence')
            };

            evidenceData = {
              metadata: evidenceMetadata,
              imageBase64
            };
          }
        } catch (error) {
          console.warn('Failed to compare with previous screenshot:', error);
          // 比較に失敗した場合は差分ありとして扱う
          metadata.hasDiff = true;
          metadata.diffPercentage = 100;
          
          const evidenceMetadata: ScreenshotMetadata = {
            ...metadata,
            filename: generateFilename(hash, sequence, 'evidence')
          };

          evidenceData = {
            metadata: evidenceMetadata,
            imageBase64
          };
        }
      } else {
        // 初回の場合は必ずevidenceに保存
        metadata.hasDiff = true;
        metadata.diffPercentage = 100;
        
        const evidenceMetadata: ScreenshotMetadata = {
          ...metadata,
          filename: generateFilename(hash, sequence, 'evidence')
        };

        evidenceData = {
          metadata: evidenceMetadata,
          imageBase64
        };
      }

      // ファイルに保存
      await this.saveScreenshotData(logsData, 'logs');
      
      if (evidenceData) {
        await this.saveScreenshotData(evidenceData, 'evidence');
      }

      return {
        logsData,
        evidenceData
      };

    } finally {
      await page.close();
    }
  }

  /**
   * スクリーンショットデータをファイルに保存
   */
  private async saveScreenshotData(data: ScreenshotData, type: 'logs' | 'evidence'): Promise<void> {
    const filePath = path.join(this.outputDir, data.metadata.filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }
}
