# @infodb/webshot Monorepo

Webスクリーンショット撮影と差分検出のためのモジュラー型ツールスイート

## パッケージ構成

このmonorepoには以下の3つのパッケージが含まれています：

| パッケージ | 説明 | 用途 |
|------------|------|------|
| [`@infodb/webshot`](./packages/core/) | メインCLIツールとコアライブラリ | スタンドアロンでの使用、ライブラリとしての組み込み |
| [`@infodb/webshot-grpc`](./packages/grpc/) | gRPCアダプタ | リモートAPI、マイクロサービス、分散システム |
| [`@infodb/webshot-mcp`](./packages/mcp/) | MCPアダプタ | AI/LLMツール、Claude等のModel Context Protocol |

## 特徴

- **モジュラー設計**: 必要な機能のみをインストール
- **独立したバージョニング**: 各パッケージを独立してリリース
- **共通コア**: すべてのアダプタが同じコア機能を使用
- **TypeScript**: 型安全な開発環境

## クイックスタート

### 1. CLIツールとして使用

```bash
# インストール
npm install -g @infodb/webshot

# 使用
webshot capture https://example.com
```

### 2. gRPCサーバーとして使用

```bash
# インストール
npm install -g @infodb/webshot-grpc

# サーバー起動
webshot-grpc-server --port 50051

# 別の端末からクライアント使用（Node.jsプロジェクト内）
npm install @infodb/webshot-grpc
```

### 3. MCP（Model Context Protocol）として使用

```bash
# インストール
npm install -g @infodb/webshot-mcp

# MCPサーバー起動
webshot-mcp-server

# Claude Code等のAIツールから使用可能
```

## 開発環境セットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd webshot

# 依存関係のインストール
pnpm install

# 全パッケージのビルド
pnpm run build

# Playwright ブラウザのインストール（coreパッケージで必要）
pnpm --filter @infodb/webshot exec npx playwright install chromium
```

## 開発コマンド

### 全体操作

```bash
# 全パッケージのビルド
pnpm run build

# 全パッケージのクリーン
pnpm run clean

# 全パッケージのテスト実行
pnpm run test
```

### 個別パッケージ操作

```bash
# coreパッケージのみビルド
pnpm --filter @infodb/webshot build

# gRPCパッケージの開発サーバー起動
pnpm --filter @infodb/webshot-grpc dev

# MCPパッケージのテスト実行
pnpm --filter @infodb/webshot-mcp test
```

## 使用例

### Core（CLI）

```bash
# 基本的なスクリーンショット撮影
webshot capture https://example.com

# 認証付きサイトの撮影
webshot capture https://secure.example.com \
  --auth-config ./auth.json

# 差分検出の閾値設定
webshot capture https://example.com \
  --threshold 2.0
```

### gRPC

```javascript
import { WebshotGrpcClient } from '@infodb/webshot-grpc';

const client = new WebshotGrpcClient('localhost:50051');

const result = await client.captureScreenshot({
  url: 'https://example.com',
  outputDir: './screenshots',
  options: {
    viewportWidth: 1920,
    viewportHeight: 1080,
    diffThreshold: 0.1
  }
});

console.log('Screenshot saved:', result.screenshotPath);
```

### MCP（AI/LLMツール内）

```bash
# Claude Code等のAIツールから以下のツールが利用可能：

# capture_screenshot - Webページのスクリーンショット撮影
# extract_images - JSONファイルからPNG画像を抽出  
# get_capture_info - 撮影したスクリーンショットの情報取得
```

## アーキテクチャ

```
@infodb/webshot (Core)
├── WebScreenshotCapture    # メインエンジン
├── AuthenticationHandler   # 認証処理
├── CLI Interface          # コマンドライン
└── Utilities              # ユーティリティ
    ↑
    │ (workspace dependency)
    │
├── @infodb/webshot-grpc   # gRPCアダプタ
│   ├── gRPCServer         # リモートAPI
│   ├── gRPCClient         # クライアントライブラリ  
│   └── Protocol Buffers   # API定義
│
└── @infodb/webshot-mcp    # MCPアダプタ
    ├── FastMCP Server     # MCP実装
    ├── Tool Handlers      # ツール処理
    └── AI Integration     # AI/LLM統合
```

## コア機能

- **高品質スクリーンショット**: Playwright使用
- **差分検出**: pixelmatch による自動変更検出
- **多様な認証**: Basic、Form、Cookie、Header認証対応
- **柔軟な出力**: JSON + Base64、PNG抽出対応
- **ファイル管理**: ハッシュベースの整理システム

## リリース

各パッケージは独立してリリースされます：

- `@infodb/webshot` - メインCLIツール
- `@infodb/webshot-grpc` - gRPCアダプタ  
- `@infodb/webshot-mcp` - MCPアダプタ

## ライセンス

MIT

## 貢献

プルリクエストやイシューは歓迎します。開発に参加する場合は、[CLAUDE.md](./CLAUDE.md) をご参照ください。

---

詳細な使用方法は各パッケージのREADMEをご覧ください：
- [Core パッケージ](./packages/core/README.md)
- [gRPC パッケージ](./packages/grpc/README.md)  
- [MCP パッケージ](./packages/mcp/README.md)