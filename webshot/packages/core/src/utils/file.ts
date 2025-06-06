import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';


/**
 * URLからハッシュを生成
 */
export function generateUrlHash(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
}

/**
 * ファイル名を生成 (統一版)
 */
export function generateFilename(identifier: string, sequence: number): string {
  return `${identifier}_${sequence.toString().padStart(3, '0')}.json`;
}

/**
 * ディレクトリを確実に作成
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * 既存ファイルから次の連番を取得 (統一版)
 */
export async function getNextSequence(outputDir: string, identifier: string): Promise<number> {
  try {
    const files = await fs.readdir(outputDir).catch(() => []);
    const pattern = new RegExp(`^${identifier}_(\\d{3})\\.json$`);
    
    let maxSequence = 0;
    for (const file of files) {
      const match = file.match(pattern);
      if (match) {
        const sequence = parseInt(match[1], 10);
        maxSequence = Math.max(maxSequence, sequence);
      }
    }
    
    return maxSequence + 1;
  } catch {
    return 1;
  }
}

/**
 * 最新のスクリーンショットファイルを取得 (統一版)
 */
export async function getLatestScreenshot(outputDir: string, identifier: string): Promise<string | null> {
  try {
    const files = await fs.readdir(outputDir).catch(() => []);
    const pattern = new RegExp(`^${identifier}_(\\d{3})\\.json$`);
    
    let latestFile: string | null = null;
    let maxSequence = 0;
    
    for (const file of files) {
      const match = file.match(pattern);
      if (match) {
        const sequence = parseInt(match[1], 10);
        if (sequence > maxSequence) {
          maxSequence = sequence;
          latestFile = file;
        }
      }
    }
    
    return latestFile ? path.join(outputDir, latestFile) : null;
  } catch {
    return null;
  }
}
