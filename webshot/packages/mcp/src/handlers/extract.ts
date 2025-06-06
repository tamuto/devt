import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';

export interface ExtractRequest {
  inputFile: string;
  outputDir?: string;
}

export interface ExtractResult {
  success: boolean;
  message: string;
  extractedFiles?: string[];
}

export class ExtractHandler {
  async handleExtract(request: ExtractRequest): Promise<ExtractResult> {
    try {
      const outputDir = request.outputDir || './extracted';
      
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Read the JSON file
      const jsonContent = fs.readFileSync(request.inputFile, 'utf-8');
      const data = JSON.parse(jsonContent);

      const extractedFiles: string[] = [];

      // Extract screenshots from the JSON data
      if (Array.isArray(data)) {
        // Handle array of screenshot data
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          if (item.screenshot && item.screenshot.data) {
            const filename = `screenshot_${i + 1}.png`;
            const outputPath = path.join(outputDir, filename);
            await this.extractPngFromBase64(item.screenshot.data, outputPath);
            extractedFiles.push(outputPath);
          }
        }
      } else if (data.screenshot && data.screenshot.data) {
        // Handle single screenshot data
        const filename = 'screenshot.png';
        const outputPath = path.join(outputDir, filename);
        await this.extractPngFromBase64(data.screenshot.data, outputPath);
        extractedFiles.push(outputPath);
      }

      return {
        success: true,
        message: `Successfully extracted ${extractedFiles.length} images`,
        extractedFiles,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async extractPngFromBase64(base64Data: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Remove data URL prefix if present
        const cleanBase64 = base64Data.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(cleanBase64, 'base64');
        
        const png = new PNG();
        png.parse(buffer, (error, data) => {
          if (error) {
            reject(error);
            return;
          }

          const writeStream = fs.createWriteStream(outputPath);
          png.pack().pipe(writeStream);
          
          writeStream.on('finish', () => resolve());
          writeStream.on('error', reject);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}