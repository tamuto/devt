import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';

const PROTO_PATH = path.join(__dirname, '../src/proto/webshot.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const webshotProto = grpc.loadPackageDefinition(packageDefinition).webshot as any;

export interface CaptureRequest {
  url: string;
  outputDir?: string;
  prefix?: string;
  auth?: {
    type: 'NONE' | 'BASIC' | 'FORM' | 'COOKIE' | 'HEADER';
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

export interface CaptureResponse {
  success: boolean;
  message: string;
  screenshotPath: string;
  evidencePath: string;
  diffResult: {
    hasDiff: boolean;
    diffPixels: number;
    diffPercentage: number;
  };
}

export class WebshotGrpcClient {
  private client: any;

  constructor(serverAddress: string = 'localhost:50051') {
    this.client = new webshotProto.WebshotService(
      serverAddress,
      grpc.credentials.createInsecure()
    );
  }

  public async captureScreenshot(request: CaptureRequest): Promise<CaptureResponse> {
    return new Promise((resolve, reject) => {
      const grpcRequest = {
        url: request.url,
        output_dir: request.outputDir || './screenshots',
        prefix: request.prefix || '',
        auth: request.auth ? {
          type: request.auth.type,
          credentials: request.auth.credentials || {},
          cookies: request.auth.cookies || [],
          headers: request.auth.headers || {},
        } : { type: 'NONE' },
        options: {
          viewport_width: request.options?.viewportWidth || 1920,
          viewport_height: request.options?.viewportHeight || 1080,
          full_page: request.options?.fullPage || true,
          timeout: request.options?.timeout || 30000,
          diff_threshold: request.options?.diffThreshold || 0.1,
        },
      };

      this.client.CaptureScreenshot(grpcRequest, (error: any, response: any) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          success: response.success,
          message: response.message,
          screenshotPath: response.screenshot_path,
          evidencePath: response.evidence_path,
          diffResult: {
            hasDiff: response.diff_result.has_diff,
            diffPixels: response.diff_result.diff_pixels,
            diffPercentage: response.diff_result.diff_percentage,
          },
        });
      });
    });
  }

  public captureScreenshotStream(): {
    write: (request: CaptureRequest) => void;
    end: () => void;
    on: (event: 'data' | 'end' | 'error', callback: (data?: any) => void) => void;
  } {
    const call = this.client.CaptureScreenshotStream();

    return {
      write: (request: CaptureRequest) => {
        const grpcRequest = {
          url: request.url,
          output_dir: request.outputDir || './screenshots',
          prefix: request.prefix || '',
          auth: request.auth ? {
            type: request.auth.type,
            credentials: request.auth.credentials || {},
            cookies: request.auth.cookies || [],
            headers: request.auth.headers || {},
          } : { type: 'NONE' },
          options: {
            viewport_width: request.options?.viewportWidth || 1920,
            viewport_height: request.options?.viewportHeight || 1080,
            full_page: request.options?.fullPage || true,
            timeout: request.options?.timeout || 30000,
            diff_threshold: request.options?.diffThreshold || 0.1,
          },
        };
        call.write(grpcRequest);
      },
      end: () => call.end(),
      on: (event: string, callback: (data?: any) => void) => {
        if (event === 'data') {
          call.on('data', (response: any) => {
            callback({
              success: response.success,
              message: response.message,
              screenshotPath: response.screenshot_path,
              evidencePath: response.evidence_path,
              diffResult: {
                hasDiff: response.diff_result.has_diff,
                diffPixels: response.diff_result.diff_pixels,
                diffPercentage: response.diff_result.diff_percentage,
              },
            });
          });
        } else {
          call.on(event, callback);
        }
      },
    };
  }

  public async getCaptureInfo(hashPrefix?: string, directory?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = {
        hash_prefix: hashPrefix || '',
        directory: directory || './screenshots',
      };

      this.client.GetCaptureInfo(request, (error: any, response: any) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  }

  public close(): void {
    this.client.close();
  }
}