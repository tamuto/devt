import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { DiffResult } from '../types';

/**
 * 2つの画像を比較して差分を検出
 */
export async function compareImages(
  currentImageBuffer: Buffer,
  previousImageBuffer: Buffer,
  threshold: number = 0.1
): Promise<DiffResult> {
  try {
    const currentImg = PNG.sync.read(currentImageBuffer);
    const previousImg = PNG.sync.read(previousImageBuffer);

    // 画像サイズが異なる場合は差分ありとする
    if (currentImg.width !== previousImg.width || currentImg.height !== previousImg.height) {
      return {
        hasDiff: true,
        diffPercentage: 100
      };
    }

    const { width, height } = currentImg;
    const diffImg = new PNG({ width, height });

    // pixelmatchで差分を計算
    const diffPixels = pixelmatch(
      currentImg.data,
      previousImg.data,
      diffImg.data,
      width,
      height,
      { threshold: 0.1 }
    );

    const totalPixels = width * height;
    const diffPercentage = (diffPixels / totalPixels) * 100;

    const result: DiffResult = {
      hasDiff: diffPercentage > threshold,
      diffPercentage: Math.round(diffPercentage * 100) / 100
    };

    // 差分がある場合は差分画像も返す
    if (result.hasDiff) {
      const diffBuffer = PNG.sync.write(diffImg);
      result.diffImageBase64 = diffBuffer.toString('base64');
    }

    return result;
  } catch (error) {
    console.error('Error comparing images:', error);
    // エラーの場合は差分ありとして処理
    return {
      hasDiff: true,
      diffPercentage: 100
    };
  }
}

/**
 * Base64文字列をBufferに変換
 */
export function base64ToBuffer(base64String: string): Buffer {
  return Buffer.from(base64String, 'base64');
}

/**
 * BufferをBase64文字列に変換
 */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}
