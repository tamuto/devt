import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { WebScreenshotCapture, AuthenticationOptions as CoreAuthOptions, CaptureOptionsWithAuth } from '@infodb/webshot';
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

export class WebshotGrpcServer {
  private server: grpc.Server;

  constructor() {
    this.server = new grpc.Server();
    this.setupServices();
  }

  private setupServices() {
    this.server.addService(webshotProto.WebshotService.service, {
      CaptureScreenshot: this.captureScreenshot.bind(this),
      CaptureScreenshotStream: this.captureScreenshotStream.bind(this),
      GetCaptureInfo: this.getCaptureInfo.bind(this),
    });
  }

  private async captureScreenshot(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) {
    try {
      const request = call.request;
      const outputDir = request.output_dir || './screenshots';
      const capture = new WebScreenshotCapture(outputDir);
      
      // ブラウザを初期化
      await capture.init();
      
      try {
        const authOptions = this.convertAuthOptions(request.auth);
        const captureOptions: CaptureOptionsWithAuth = {
          url: request.url,
          outputDir,
          prefix: request.prefix,
          viewport: {
            width: request.options?.viewport_width || 1920,
            height: request.options?.viewport_height || 1080,
          },
          fullPage: request.options?.full_page !== false,
          diffThreshold: request.options?.diff_threshold || 0.1,
          auth: authOptions,
        };

        const result = await capture.capture(captureOptions);

        const response = {
          success: true,
          message: 'Screenshot captured successfully',
          screenshot_path: result.metadata.filename,
          evidence_path: '', // TODO: Implement evidence path from core
          diff_result: {
            has_diff: result.metadata.hasDiff || false,
            diff_pixels: 0, // TODO: Get from core if available
            diff_percentage: result.metadata.diffPercentage || 0,
          },
        };

        callback(null, response);
      } finally {
        // ブラウザを閉じる
        await capture.close();
      }
    } catch (error) {
      const response = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        screenshot_path: '',
        evidence_path: '',
        diff_result: {
          has_diff: false,
          diff_pixels: 0,
          diff_percentage: 0,
        },
      };
      callback(null, response);
    }
  }

  private captureScreenshotStream(call: grpc.ServerDuplexStream<any, any>) {
    let capture: WebScreenshotCapture | null = null;
    
    call.on('data', async (request) => {
      try {
        // 初回のみブラウザを初期化
        if (!capture) {
          const outputDir = request.output_dir || './screenshots';
          capture = new WebScreenshotCapture(outputDir);
          await capture.init();
        }
        
        const authOptions = this.convertAuthOptions(request.auth);
        const captureOptions: CaptureOptionsWithAuth = {
          url: request.url,
          outputDir: request.output_dir || './screenshots',
          prefix: request.prefix,
          viewport: {
            width: request.options?.viewport_width || 1920,
            height: request.options?.viewport_height || 1080,
          },
          fullPage: request.options?.full_page !== false,
          diffThreshold: request.options?.diff_threshold || 0.1,
          auth: authOptions,
        };

        const result = await capture.capture(captureOptions);

        const response = {
          success: true,
          message: 'Screenshot captured successfully',
          screenshot_path: result.metadata.filename,
          evidence_path: '',
          diff_result: {
            has_diff: result.metadata.hasDiff || false,
            diff_pixels: 0,
            diff_percentage: result.metadata.diffPercentage || 0,
          },
        };

        call.write(response);
      } catch (error) {
        const response = {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          screenshot_path: '',
          evidence_path: '',
          diff_result: {
            has_diff: false,
            diff_pixels: 0,
            diff_percentage: 0,
          },
        };
        call.write(response);
      }
    });

    call.on('end', async () => {
      // ストリーム終了時にブラウザを閉じる
      if (capture) {
        await capture.close();
      }
      call.end();
    });
  }

  private getCaptureInfo(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) {
    // Implementation for getting capture info would go here
    // This would involve reading existing screenshot files and returning metadata
    const response = {
      screenshots: [],
      total_count: 0,
      evidence_count: 0,
    };
    callback(null, response);
  }

  private convertAuthOptions(grpcAuth: any): CoreAuthOptions | undefined {
    if (!grpcAuth || grpcAuth.type === 'NONE') {
      return undefined;
    }

    const authOptions: CoreAuthOptions = {
      type: grpcAuth.type.toLowerCase() as 'basic' | 'form' | 'cookie' | 'header',
    };

    if (grpcAuth.credentials) {
      authOptions.credentials = {
        username: grpcAuth.credentials.username,
        password: grpcAuth.credentials.password,
      };
    }

    if (grpcAuth.cookies) {
      authOptions.cookies = grpcAuth.cookies.map((cookie: any) => ({
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
      }));
    }

    if (grpcAuth.headers) {
      authOptions.headers = grpcAuth.headers;
    }

    return authOptions;
  }

  public start(port: number = 50051, host: string = '0.0.0.0'): void {
    const address = `${host}:${port}`;
    this.server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
      if (err) {
        console.error('Failed to start gRPC server:', err);
        return;
      }
      console.log(`gRPC server running at ${host}:${boundPort}`);
      this.server.start();
    });
  }

  public stop(): void {
    this.server.forceShutdown();
  }
}