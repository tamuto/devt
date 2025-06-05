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
 * 連番付きファイル名を生成
 */
export function generateFilename(hash: string, sequence: number, type: 'logs' | 'evidence'): string {
  const paddedSequence = sequence.toString().padStart(4, '0');
  return `${hash}_${paddedSequence}_${type}.json`;
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
 * 既存ファイルから次の連番を取得
 */
export async function getNextSequence(outputDir: string, hash: string): Promise<number> {
  try {
    const files = await fs.readdir(outputDir);
    const pattern = new RegExp(`^${hash}_(\\d{4})_`);
    
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
 * 最新のスクリーンショットファイルを取得
 */
export async function getLatestScreenshot(outputDir: string, hash: string): Promise<string | null> {
  try {
    const files = await fs.readdir(outputDir);
    const pattern = new RegExp(`^${hash}_(\\d{4})_logs\\.json$`);
    
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
