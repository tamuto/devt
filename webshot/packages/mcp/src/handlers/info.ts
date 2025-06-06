import * as fs from 'fs';
import * as path from 'path';

export interface InfoRequest {
  directory?: string;
  hashPrefix?: string;
}

export interface ScreenshotFileInfo {
  filename: string;
  filepath: string;
  hash: string;
  sequence: number;
  type: 'logs' | 'evidence';
  timestamp: string;
  url?: string;
  size: number;
}

export interface InfoResult {
  success: boolean;
  message: string;
  files?: ScreenshotFileInfo[];
  summary?: {
    totalFiles: number;
    logsFiles: number;
    evidenceFiles: number;
    uniqueHashes: number;
  };
}

export class InfoHandler {
  async handleInfo(request: InfoRequest): Promise<InfoResult> {
    try {
      const directory = request.directory || './screenshots';
      
      if (!fs.existsSync(directory)) {
        return {
          success: false,
          message: `Directory does not exist: ${directory}`,
        };
      }

      const files = fs.readdirSync(directory);
      const screenshotFiles: ScreenshotFileInfo[] = [];
      const uniqueHashes = new Set<string>();

      for (const file of files) {
        if (file.endsWith('.json')) {
          const match = file.match(/^([a-f0-9]{8})_(\d+)_(logs|evidence)\.json$/);
          if (match) {
            const [, hash, sequence, type] = match;
            
            // Filter by hash prefix if specified
            if (request.hashPrefix && !hash.startsWith(request.hashPrefix)) {
              continue;
            }

            const filepath = path.join(directory, file);
            const stats = fs.statSync(filepath);
            
            // Try to extract URL from file content
            let url: string | undefined;
            try {
              const content = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
              if (Array.isArray(content) && content.length > 0) {
                url = content[0].url;
              } else if (content.url) {
                url = content.url;
              }
            } catch (error) {
              // Ignore JSON parsing errors
            }

            screenshotFiles.push({
              filename: file,
              filepath,
              hash,
              sequence: parseInt(sequence, 10),
              type: type as 'logs' | 'evidence',
              timestamp: stats.mtime.toISOString(),
              url,
              size: stats.size,
            });

            uniqueHashes.add(hash);
          }
        }
      }

      // Sort by hash and sequence
      screenshotFiles.sort((a, b) => {
        if (a.hash !== b.hash) {
          return a.hash.localeCompare(b.hash);
        }
        return a.sequence - b.sequence;
      });

      const summary = {
        totalFiles: screenshotFiles.length,
        logsFiles: screenshotFiles.filter(f => f.type === 'logs').length,
        evidenceFiles: screenshotFiles.filter(f => f.type === 'evidence').length,
        uniqueHashes: uniqueHashes.size,
      };

      return {
        success: true,
        message: `Found ${screenshotFiles.length} screenshot files`,
        files: screenshotFiles,
        summary,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}