# @infodb/webshot-mcp

Model Context Protocol (MCP) アダプタで @infodb/webshot をAI/LLMツールに統合

## 概要

`@infodb/webshot-mcp` は、[@infodb/webshot](https://www.npmjs.com/package/@infodb/webshot) のコア機能をModel Context Protocol (MCP) 経由で提供するアダプタパッケージです。Claude Code、その他のAI/LLMツールからスクリーンショット撮影機能を直接利用できます。

## 特徴

- **MCP対応**: Model Context Protocol による標準化されたAI統合
- **FastMCP使用**: 軽量で高性能なMCP実装
- **構造化ツール**: 3つの主要ツール（capture、extract、info）を提供
- **認証サポート**: 全ての認証方式（Basic、Form、Cookie、Header）に対応
- **差分検出**: コア機能の差分検出をAIツールから利用可能

## インストール

### グローバルインストール

```bash
npm install -g @infodb/webshot-mcp
```

### プロジェクトにインストール

```bash
npm install @infodb/webshot-mcp
```

## 使用方法

### MCPサーバーの起動

```bash
# MCPサーバーを起動
webshot-mcp-server

# 開発モード（TypeScriptから直接実行）
npm run dev
```

### Claude Code での使用

Claude Code では、MCPサーバーが起動していると以下のツールが自動的に利用可能になります：

#### capture_screenshot

Webページのスクリーンショットを撮影し、差分検出を行います。

```json
{
  "url": "https://example.com",
  "output_dir": "./screenshots",
  "prefix": "myproject",
  "auth": {
    "type": "basic",
    "credentials": {
      "username": "user",
      "password": "pass"
    }
  },
  "options": {
    "viewport_width": 1920,
    "viewport_height": 1080,
    "full_page": true,
    "timeout": 30000,
    "diff_threshold": 0.1
  }
}
```

#### extract_images

JSONファイルからPNG画像を抽出します。

```json
{
  "input_file": "./screenshots/12ab34cd_001.json",
  "output_dir": "./extracted"
}
```

#### get_capture_info

撮影したスクリーンショットの情報を取得します。

```json
{
  "directory": "./screenshots",
  "hash_prefix": "12ab34cd"
}
```

## 利用可能なツール

### 1. capture_screenshot

**説明**: Webページのスクリーンショットを撮影し、差分検出を実行

**パラメータ**:
- `url` (必須): 撮影するWebページのURL
- `output_dir` (オプション): 出力ディレクトリ（デフォルト: ./screenshots）
- `prefix` (オプション): ファイル名のプレフィックス
- `auth` (オプション): 認証設定
- `options` (オプション): 撮影オプション

**認証設定**:
```json
{
  "type": "basic|form|cookie|header",
  "credentials": {"username": "user", "password": "pass"},
  "cookies": [{"name": "session", "value": "abc123", "domain": "example.com"}],
  "headers": {"Authorization": "Bearer token"}
}
```

**撮影オプション**:
```json
{
  "viewport_width": 1920,
  "viewport_height": 1080,
  "full_page": true,
  "timeout": 30000,
  "diff_threshold": 0.1
}
```

**レスポンス例**:
```json
{
  "success": true,
  "message": "Screenshot captured successfully",
  "screenshot_path": "./screenshots/12ab34cd_001.json",
  "evidence_path": "./screenshots/12ab34cd_001_evidence.json",
  "diff_result": {
    "has_diff": true,
    "diff_pixels": 1234,
    "diff_percentage": 5.67
  }
}
```

### 2. extract_images

**説明**: JSONファイルからPNG画像を抽出

**パラメータ**:
- `input_file` (必須): 入力JSONファイルのパス
- `output_dir` (オプション): 出力ディレクトリ（デフォルト: ./extracted）

**レスポンス例**:
```json
{
  "success": true,
  "message": "Successfully extracted 3 images",
  "extracted_files": [
    "./extracted/screenshot_1.png",
    "./extracted/screenshot_2.png",
    "./extracted/screenshot_3.png"
  ]
}
```

### 3. get_capture_info

**説明**: 撮影したスクリーンショットの情報を取得

**パラメータ**:
- `directory` (オプション): スキャンするディレクトリ（デフォルト: ./screenshots）
- `hash_prefix` (オプション): ハッシュプレフィックスでフィルタ

**レスポンス例**:
```json
{
  "success": true,
  "message": "Found 5 screenshot files",
  "files": [
    {
      "filename": "12ab34cd_001_logs.json",
      "hash": "12ab34cd",
      "sequence": 1,
      "type": "logs",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "url": "https://example.com",
      "size": 2048576
    }
  ],
  "summary": {
    "total_files": 5,
    "logs_files": 5,
    "evidence_files": 2,
    "unique_hashes": 2
  }
}
```

## 実用例

### Claude Code での基本的な使用

1. **サイトの変更監視**
```
Claude Codeで以下のツールを使用してWebサイトの変更を監視してください：

1. https://example.com のスクリーンショットを撮影
2. 差分があれば evidence ファイルを確認
3. 変更点をレポート
```

2. **認証が必要なサイトの撮影**
```
以下の認証情報を使用してダッシュボードのスクリーンショットを撮影：

- URL: https://app.example.com/dashboard
- 認証: Basic認証（username: admin, password: secret）
- ビューポート: 1920x1080
```

3. **スクリーンショット管理**
```
screenshots/ ディレクトリ内のスクリーンショット情報を取得し、
最新の変更があったファイルから画像を抽出してください。
```

## 設定ファイル

### MCP設定（Claude Desktop等）

```json
{
  "mcpServers": {
    "webshot": {
      "command": "webshot-mcp-server",
      "args": []
    }
  }
}
```

### 環境変数

```bash
# デフォルト出力ディレクトリ
export WEBSHOT_OUTPUT_DIR=./screenshots

# デフォルトプレフィックス
export WEBSHOT_PREFIX=myproject

# デバッグモード
export DEBUG=webshot:*
```

## 開発

### セットアップ

```bash
# 依存関係のインストール
npm install

# TypeScriptビルド
npm run build

# 開発モード
npm run dev
```

### カスタムハンドラーの追加

新しいツールを追加する場合：

```typescript
// src/handlers/custom.ts
export class CustomHandler {
  async handleCustom(request: CustomRequest): Promise<CustomResult> {
    // カスタム処理の実装
  }
}

// src/server.ts に追加
server.tool('custom_tool', {
  description: 'Custom tool description',
  parameters: { /* スキーマ定義 */ }
}, async (params) => {
  const result = await customHandler.handleCustom(params);
  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
  };
});
```

## トラブルシューティング

### MCPサーバーが認識されない

1. **サーバーの起動確認**
```bash
# プロセス確認
ps aux | grep webshot-mcp-server

# ログ確認
webshot-mcp-server 2>&1 | tee mcp-server.log
```

2. **パーミッション確認**
```bash
# 実行権限の確認
ls -la $(which webshot-mcp-server)

# 必要に応じて権限付与
chmod +x $(which webshot-mcp-server)
```

### ツールエラーの対処

```bash
# デバッグモードで詳細ログを確認
DEBUG=webshot:* webshot-mcp-server

# Playwright ブラウザの確認
npx playwright install chromium
```

### パフォーマンス最適化

```javascript
// 大量のスクリーンショット処理時
{
  "options": {
    "timeout": 60000,        // タイムアウト延長
    "diff_threshold": 1.0    // 差分検出の調整
  }
}
```

## ライセンス

MIT

## 関連パッケージ

- [@infodb/webshot](https://www.npmjs.com/package/@infodb/webshot) - コアCLIツール
- [@infodb/webshot-grpc](https://www.npmjs.com/package/@infodb/webshot-grpc) - gRPCアダプタ
- [FastMCP](https://github.com/janhq/fastmcp) - 軽量MCP実装（依存関係）