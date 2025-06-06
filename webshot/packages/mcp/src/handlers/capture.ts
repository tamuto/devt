import { WebScreenshotCapture, AuthenticationOptions } from '@infodb/webshot';

export interface CaptureRequest {
  url: string;
  outputDir?: string;
  prefix?: string;
  auth?: {
    type?: 'basic' | 'form' | 'cookie' | 'header';
    credentials?: Record<string, string>;
    cookies?: Array<{
      name: string;
      value: string;
      domain?: string;
      path?: string;
    }>;
    headers?: Record<string, string>;
  };
  options?: {
    viewportWidth?: number;
    viewportHeight?: number;
    fullPage?: boolean;
    timeout?: number;
    diffThreshold?: number;
  };
}

export interface CaptureResult {
  success: boolean;
  message: string;
  screenshotPath?: string;
  evidencePath?: string;
  diffResult?: {
    hasDiff: boolean;
    diffPixels: number;
    diffPercentage: number;
  };
}

export class CaptureHandler {
  constructor() {
    // No need for persistent instance since we create per-request
  }

  async handleCapture(request: CaptureRequest): Promise<CaptureResult> {
    try {
      const outputDir = request.outputDir || './screenshots';
      const capture = new WebScreenshotCapture(outputDir);
      
      // ブラウザを初期化
      await capture.init();
      
      try {
        const authOptions = this.convertAuthOptions(request.auth);
        const captureOptions = {
          url: request.url,
          outputDir,
          prefix: request.prefix,
          viewport: {
            width: request.options?.viewportWidth || 1920,
            height: request.options?.viewportHeight || 1080,
          },
          fullPage: request.options?.fullPage ?? true,
          diffThreshold: request.options?.diffThreshold || 0.1,
          auth: authOptions,
        };

        const result = await capture.capture(captureOptions);

        return {
          success: true,
          message: 'Screenshot captured successfully',
          screenshotPath: result.metadata.filename,
          evidencePath: '', // TODO: Implement evidence path from core
          diffResult: {
            hasDiff: result.metadata.hasDiff || false,
            diffPixels: 0, // TODO: Get from core if available
            diffPercentage: result.metadata.diffPercentage || 0,
          },
        };
      } finally {
        // ブラウザを閉じる
        await capture.close();
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private convertAuthOptions(auth?: CaptureRequest['auth']): AuthenticationOptions | undefined {
    if (!auth || !auth.type) {
      return undefined;
    }

    const authOptions: AuthenticationOptions = {
      type: auth.type,
    };

    if (auth.credentials) {
      authOptions.credentials = {
        username: auth.credentials.username,
        password: auth.credentials.password,
      };
    }

    if (auth.cookies) {
      authOptions.cookies = auth.cookies;
    }

    if (auth.headers) {
      authOptions.headers = auth.headers;
    }

    return authOptions;
  }
}