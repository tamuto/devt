import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * evidenceフォルダで次の連番を取得（ハッシュ別）
 */
export async function getNextEvidenceSequence(outputDir: string, hash: string): Promise<number> {
  try {
    const evidenceDir = path.join(outputDir, 'evidence');
    const files = await fs.readdir(evidenceDir).catch(() => []);
    const pattern = new RegExp(`^${hash}_(\\d{3})\\.json$`);
    
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
 * URLからハッシュを生成
 */
export function generateUrlHash(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
}

/**
 * ファイル名を生成 (フォルダ分離版)
 */
export function generateFilename(hash: string, sequence: number, type: 'logs' | 'evidence'): string {
  if (type === 'evidence') {
    return `${hash}_${sequence.toString().padStart(3, '0')}.json`;
  } else {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${hash}_${timestamp}.json`;
  }
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
 * 既存ファイルから次の連番を取得 (フォルダ分離版)
 */
export async function getNextSequence(outputDir: string, hash: string): Promise<number> {
  try {
    // logsフォルダ内のファイルを確認
    const logsDir = path.join(outputDir, 'logs');
    const files = await fs.readdir(logsDir).catch(() => []);
    const pattern = new RegExp(`^${hash}_.*\.json$`);
    
    let count = 0;
    for (const file of files) {
      if (pattern.test(file)) {
        count++;
      }
    }
    
    return count + 1;
  } catch {
    return 1;
  }
}

/**
 * 最新のスクリーンショットファイルを取得 (フォルダ分離版)
 */
export async function getLatestScreenshot(outputDir: string, hash: string): Promise<string | null> {
  try {
    const logsDir = path.join(outputDir, 'logs');
    const files = await fs.readdir(logsDir).catch(() => []);
    const pattern = new RegExp(`^${hash}_.*\.json$`);
    
    let latestFile: string | null = null;
    let latestTime = 0;
    
    for (const file of files) {
      if (pattern.test(file)) {
        const filePath = path.join(logsDir, file);
        const stats = await fs.stat(filePath);
        if (stats.mtime.getTime() > latestTime) {
          latestTime = stats.mtime.getTime();
          latestFile = file;
        }
      }
    }
    
    return latestFile ? path.join(logsDir, latestFile) : null;
  } catch {
    return null;
  }
}
