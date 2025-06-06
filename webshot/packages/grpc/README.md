# @infodb/webshot-grpc

gRPCアダプタで @infodb/webshot のリモートスクリーンショット撮影機能を提供

## 概要

`@infodb/webshot-grpc` は、[@infodb/webshot](https://www.npmjs.com/package/@infodb/webshot) のコア機能をgRPCサーバー・クライアントとして提供するアダプタパッケージです。マイクロサービスアーキテクチャや分散システムでリモートスクリーンショット撮影を行う際に使用できます。

## 特徴

- **リモートAPI**: gRPCを通じたスクリーンショット撮影
- **ストリーミング対応**: 大量のスクリーンショット処理に対応
- **型安全**: TypeScriptで記述されたクライアント・サーバー
- **認証サポート**: 全ての認証方式（Basic、Form、Cookie、Header）に対応
- **差分検出**: コア機能の差分検出をリモートで利用可能

## インストール

### サーバーとして使用

```bash
# グローバルインストール（サーバー用）
npm install -g @infodb/webshot-grpc

# ローカルプロジェクトにインストール
npm install @infodb/webshot-grpc
```

### クライアントライブラリとして使用

```bash
# Node.jsプロジェクトにクライアントライブラリを追加
npm install @infodb/webshot-grpc
```

## 使用方法

### gRPCサーバーの起動

```bash
# デフォルト設定で起動 (localhost:50051)
webshot-grpc-server

# ポートとホストを指定
webshot-grpc-server --port 50051 --host 0.0.0.0

# 開発モード（TypeScriptから直接実行）
npm run dev
```

### クライアントライブラリの使用

#### 基本的な使用例

```typescript
import { WebshotGrpcClient } from '@infodb/webshot-grpc';

const client = new WebshotGrpcClient('localhost:50051');

// スクリーンショット撮影
const result = await client.captureScreenshot({
  url: 'https://example.com',
  outputDir: './screenshots',
  options: {
    viewportWidth: 1920,
    viewportHeight: 1080,
    fullPage: true,
    diffThreshold: 0.1
  }
});

console.log('Screenshot saved:', result.screenshotPath);
console.log('Evidence saved:', result.evidencePath);
console.log('Has changes:', result.diffResult.hasDiff);

// クライアントを閉じる
client.close();
```

#### 認証付きサイトの撮影

```typescript
// Basic認証
const result = await client.captureScreenshot({
  url: 'https://secure.example.com',
  auth: {
    type: 'BASIC',
    credentials: {
      username: 'myuser',
      password: 'mypass'
    }
  }
});

// Cookie認証
const result = await client.captureScreenshot({
  url: 'https://app.example.com',
  auth: {
    type: 'COOKIE',
    cookies: [
      {
        name: 'sessionId',
        value: 'abc123xyz789',
        domain: 'app.example.com',
        path: '/'
      }
    ]
  }
});
```

#### ストリーミングでの大量処理

```typescript
const stream = client.captureScreenshotStream();

// レスポンス処理
stream.on('data', (response) => {
  console.log('Screenshot completed:', response.screenshotPath);
});

stream.on('end', () => {
  console.log('All screenshots completed');
});

stream.on('error', (error) => {
  console.error('Stream error:', error);
});

// 複数のURLを送信
const urls = [
  'https://example.com',
  'https://google.com',
  'https://github.com'
];

urls.forEach(url => {
  stream.write({
    url,
    outputDir: './screenshots',
    options: { viewportWidth: 1920, viewportHeight: 1080 }
  });
});

stream.end();
```

### 情報取得

```typescript
// スクリーンショット情報の取得
const info = await client.getCaptureInfo('./screenshots', 'myproject');
console.log('Screenshot info:', info);
```

## API リファレンス

### WebshotGrpcClient

#### constructor(serverAddress?: string)

```typescript
const client = new WebshotGrpcClient('localhost:50051');
```

#### captureScreenshot(request: CaptureRequest): Promise\<CaptureResponse\>

単一スクリーンショットの撮影

```typescript
interface CaptureRequest {
  url: string;
  outputDir?: string;
  prefix?: string;
  auth?: AuthenticationOptions;
  options?: CaptureOptions;
}

interface CaptureResponse {
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
```

#### captureScreenshotStream()

ストリーミングでの複数スクリーンショット撮影

```typescript
const stream = client.captureScreenshotStream();
stream.write(request);
stream.end();
```

#### getCaptureInfo(hashPrefix?: string, directory?: string): Promise\<any\>

撮影済みスクリーンショットの情報取得

### 認証オプション

```typescript
interface AuthenticationOptions {
  type: 'NONE' | 'BASIC' | 'FORM' | 'COOKIE' | 'HEADER';
  credentials?: Record<string, string>;
  cookies?: Array<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
  }>;
  headers?: Record<string, string>;
}
```

### 撮影オプション

```typescript
interface CaptureOptions {
  viewportWidth?: number;    // デフォルト: 1920
  viewportHeight?: number;   // デフォルト: 1080
  fullPage?: boolean;        // デフォルト: true
  timeout?: number;          // デフォルト: 30000 (ms)
  diffThreshold?: number;    // デフォルト: 0.1
}
```

## サーバー設定

### 環境変数

```bash
# サーバーポート
export GRPC_PORT=50051

# バインドアドレス
export GRPC_HOST=0.0.0.0

# デフォルト出力ディレクトリ
export WEBSHOT_OUTPUT_DIR=./screenshots
```

### Dockerでの実行

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 50051

CMD ["node", "dist/bin/server.js", "--port", "50051", "--host", "0.0.0.0"]
```

```bash
# Dockerビルドと実行
docker build -t webshot-grpc-server .
docker run -p 50051:50051 webshot-grpc-server
```

## 開発

### セットアップ

```bash
# 依存関係のインストール
npm install

# プロトコルバッファのコンパイル
npm run build:proto

# TypeScriptビルド
npm run build

# 開発サーバー起動
npm run dev
```

### プロトコルバッファの更新

プロトコル定義を変更した場合：

```bash
# Protocol Buffersの再生成
npm run build:proto

# TypeScriptの再ビルド
npm run build
```

## トラブルシューティング

### 接続エラー

```bash
# サーバーが起動しているか確認
netstat -an | grep 50051

# ファイアウォール設定の確認
sudo ufw status
```

### プロトコルエラー

```bash
# Protocol Buffersツールのインストール確認
which protoc
npm list grpc-tools

# 再生成
npm run build:proto
```

### パフォーマンス最適化

```typescript
// 接続プールの設定（大量リクエスト時）
const client = new WebshotGrpcClient('localhost:50051');

// タイムアウト設定
const result = await client.captureScreenshot({
  url: 'https://slow-site.com',
  options: {
    timeout: 60000  // 60秒
  }
});
```

## ライセンス

MIT

## 関連パッケージ

- [@infodb/webshot](https://www.npmjs.com/package/@infodb/webshot) - コアCLIツール
- [@infodb/webshot-mcp](https://www.npmjs.com/package/@infodb/webshot-mcp) - MCP (Model Context Protocol) アダプタ