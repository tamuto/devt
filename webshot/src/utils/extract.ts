import * as fs from 'fs/promises';
import * as path from 'path';
import { ScreenshotData } from '../types';

/**
 * JSONファイルから画像を抽出してPNGファイルとして保存
 */
export async function extractImageFromJson(
  jsonFilePath: string,
  outputImagePath?: string
): Promise<string> {
  try {
    // JSONファイルを読み込み
    const jsonContent = await fs.readFile(jsonFilePath, 'utf-8');
    const data: ScreenshotData = JSON.parse(jsonContent);
    
    // 出力パスが指定されていない場合は、JSONファイルと同じディレクトリに
    if (!outputImagePath) {
      const dir = path.dirname(jsonFilePath);
      const baseName = path.basename(jsonFilePath, '.json');
      outputImagePath = path.join(dir, `${baseName}.png`);
    }
    
    // Base64データをBufferに変換してPNGファイルとして保存
    const imageBuffer = Buffer.from(data.imageBase64, 'base64');
    await fs.writeFile(outputImagePath, imageBuffer);
    
    return outputImagePath;
  } catch (error) {
    throw new Error(`Failed to extract image from JSON: ${error}`);
  }
}

/**
 * 指定されたディレクトリ内のすべてのJSONファイルから画像を抽出
 */
export async function extractAllImages(
  screenshotsDir: string,
  outputDir?: string
): Promise<string[]> {
  if (!outputDir) {
    outputDir = path.join(screenshotsDir, 'extracted');
  }
  
  // 出力ディレクトリを作成
  try {
    await fs.access(outputDir);
  } catch {
    await fs.mkdir(outputDir, { recursive: true });
  }
  
  // JSONファイルを検索
  const files = await fs.readdir(screenshotsDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  
  const extractedFiles: string[] = [];
  
  for (const jsonFile of jsonFiles) {
    const jsonPath = path.join(screenshotsDir, jsonFile);
    const imageName = jsonFile.replace('.json', '.png');
    const imagePath = path.join(outputDir, imageName);
    
    try {
      await extractImageFromJson(jsonPath, imagePath);
      extractedFiles.push(imagePath);
    } catch (error) {
      console.error(`Failed to extract ${jsonFile}:`, error);
    }
  }
  
  return extractedFiles;
}
