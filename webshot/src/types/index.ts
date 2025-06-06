export interface ScreenshotMetadata {
  url: string;
  timestamp: string;
  sequence: number;
  hash: string;
  filename: string;
  viewport: {
    width: number;
    height: number;
  };
  fullPage: boolean;
  hasDiff?: boolean;
  diffPercentage?: number;
  logsFilename?: string;
}

export interface ScreenshotData {
  metadata: ScreenshotMetadata;
  imageBase64: string;
  html?: string;
}

export interface CaptureOptions {
  url: string;
  outputDir?: string;
  viewport?: {
    width: number;
    height: number;
  };
  fullPage?: boolean;
  diffThreshold?: number; // 差分として認識する最小変更率（％）
}

export interface DiffResult {
  hasDiff: boolean;
  diffPercentage: number;
  diffImageBase64?: string;
}
