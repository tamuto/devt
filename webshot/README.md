# @infodb/webshot

PlaywrightでWebスクリーンショット撮影とエビデンス管理を行うCLIツール

## 特徴

- **Playwright**を使用した高品質なWebスクリーンショット撮影
- **差分検出**による効率的なエビデンス管理
- **JSON形式**でのメタデータ保存（Base64画像データ含む）
- **ハッシュ+連番**による体系的なファイル命名
- **TypeScript**製で型安全

## インストール

```bash
npm install -g @infodb/webshot
```

## 使用方法

### スクリーンショット撮影

```bash
# 基本的な使用方法
npx @infodb/webshot capture https://example.com

# オプション付きで実行
npx @infodb/webshot capture https://example.com \
  --output ./my-screenshots \
  --width 1920 \
  --height 1080 \
  --threshold 2.0
```

### 認証が必要なサイトの撮影

```bash
# Basic認証（コマンドライン）
npx @infodb/webshot capture https://secure.example.com \
  --auth-type basic \
  --username myuser \
  --password mypass

# 環境変数を使用
export WEBSHOT_USERNAME=myuser
export WEBSHOT_PASSWORD=mypass
npx @infodb/webshot capture https://secure.example.com --auth-type env

# 設定ファイルを使用
npx @infodb/webshot capture https://secure.example.com \
  --auth-config ./auth-config.json
```

### 撮影したスクリーンショットの情報表示

```bash
# 全体の統計を表示
npx @infodb/webshot info

# 特定URLのスクリーンショット一覧
npx @infodb/webshot info https://example.com

# 特定ディレクトリの情報
npx @infodb/webshot info --output ./my-screenshots
```

### 画像の抽出（PNG形式で表示可能）

```bash
# 全JSONファイルから画像を抽出
npx @infodb/webshot extract --input ./screenshots

# 特定ディレクトリに抽出
npx @infodb/webshot extract --input ./screenshots --output ./images

# 単一ファイルから抽出
npx @infodb/webshot extract --file ./screenshots/hash_0001_logs.json
```

## オプション

### `capture` コマンド

- `<url>`: 撮影するWebページのURL（必須）
- `-o, --output <dir>`: 出力ディレクトリ（デフォルト: `./screenshots`）
- `-w, --width <number>`: ビューポート幅（デフォルト: `1280`）
- `-h, --height <number>`: ビューポート高さ（デフォルト: `720`）
- `--no-full-page`: フルページではなく表示領域のみ撮影
- `-t, --threshold <number>`: 差分検出の閾値（0-100、デフォルト: `1.0`）
- `--auth-config <path>`: 認証設定ファイルのパス
- `--auth-type <type>`: 認証タイプ（basic|form|cookie|header|env）
- `--username <username>`: 認証用ユーザー名
- `--password <password>`: 認証用パスワード

### `info` コマンド

- `[url]`: フィルターするURL（オプション）
- `-o, --output <dir>`: スクリーンショットディレクトリ（デフォルト: `./screenshots`）

### `extract` コマンド

- `-i, --input <dir>`: スクリーンショットディレクトリ（デフォルト: `./screenshots`）
- `-o, --output <dir>`: 抽出画像の出力ディレクトリ（オプション）
- `-f, --file <path>`: 単一JSONファイルから抽出（オプション）

## ファイル構造

```
screenshots/
├── 12ab34cd_0001_logs.json      # 全スクリーンショット（ログ用）
├── 12ab34cd_0001_evidence.json  # 差分のみ（エビデンス用）
├── 12ab34cd_0002_logs.json
└── ef56gh78_0001_logs.json      # 別URL
```

### ファイル命名規則

- **ハッシュ**: URLのMD5ハッシュの最初の8文字
- **連番**: 4桁のゼロパディング（撮影順序を維持）
- **タイプ**: `logs`（全記録）または `evidence`（差分のみ）

## JSONファイル構造

```json
{
  "metadata": {
    "url": "https://example.com",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "sequence": 1,
    "hash": "12ab34cd",
    "filename": "12ab34cd_0001_logs.json",
    "viewport": {
      "width": 1280,
      "height": 720
    },
    "fullPage": true,
    "hasDiff": true,
    "diffPercentage": 5.23
  },
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA..."
}
```

## 差分検出の仕組み

1. **初回撮影**: 必ず`logs`と`evidence`両方に保存
2. **2回目以降**: 前回と比較して差分を検出
   - 差分が閾値以上: `logs`と`evidence`両方に保存
   - 差分が閾値未満: `logs`のみに保存（`evidence`は作成しない）

これにより、`evidence`フォルダには**意味のある変更があった場合のみ**スクリーンショットが保存されます。

## 認証設定

webshot は複数の認証方式をサポートしています：

### 1. Basic認証

```json
{
  "type": "basic",
  "credentials": {
    "username": "your_username",
    "password": "your_password"
  }
}
```

### 2. フォーム認証

```json
{
  "type": "form",
  "credentials": {
    "username": "your_username",
    "password": "your_password"
  },
  "formSelectors": {
    "loginUrl": "https://example.com/login",
    "usernameSelector": "#username",
    "passwordSelector": "#password",
    "submitSelector": "#login-button"
  },
  "waitForSelector": ".dashboard",
  "timeout": 30000
}
```

### 3. Cookie認証

```json
{
  "type": "cookie",
  "cookies": [
    {
      "name": "sessionId",
      "value": "abc123xyz789",
      "domain": "example.com",
      "path": "/"
    }
  ]
}
```

### 4. ヘッダー認証（API Key等）

```json
{
  "type": "header",
  "headers": {
    "Authorization": "Bearer your_api_token_here",
    "X-API-Key": "your_api_key_here"
  }
}
```

### 環境変数

セキュリティ向上のため、環境変数の使用を推奨します：

```bash
export WEBSHOT_USERNAME=your_username
export WEBSHOT_PASSWORD=your_password
export WEBSHOT_AUTH_HEADER=Authorization
export WEBSHOT_AUTH_VALUE="Bearer your_token"
```

## 開発・ビルド

```bash
# 依存関係のインストール
npm install

# TypeScriptビルド
npm run build

# 開発モードで実行
npm run dev capture https://example.com

# Playwrightブラウザのインストール
npx playwright install chromium
```

## ライセンス

MIT
