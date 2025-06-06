# @infodb/webshot

PlaywrightでWebスクリーンショット撮影とエビデンス管理を行うCLIツール

## 特徴

- **Playwright**を使用した高品質なWebスクリーンショット撮影
- **差分検出**による効率的なエビデンス管理
- **インターラクティブモード**でリアルタイム操作とスクリーンショット撮影
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
npx @infodb/webshot extract --file ./screenshots/logs/12ab34cd_2024-01-01T12-00-00-000Z.json
```

### インターラクティブモード

```bash
# ブラウザを表示してリアルタイム操作
npx @infodb/webshot interactive https://example.com

# 認証付きでインターラクティブモード
npx @infodb/webshot interactive https://secure.example.com \
  --auth-config ./auth-config.json

# ビューポートサイズを指定
npx @infodb/webshot interactive https://example.com \
  --width 1920 \
  --height 1080
```

#### インターラクティブモードの操作方法

ブラウザが表示されたら：
- **`Ctrl+S`**: 現在のページをスクリーンショット撮影
- **`Ctrl+Q`**: インターラクティブモードを終了
- **ブラウザウィンドウを閉じる**: インターラクティブモードを終了

撮影されたスクリーンショットは通常の`capture`コマンドと同様に`logs/`と`evidence/`フォルダに保存され、差分検出も行われます。

### ログインフォーム解析と認証設定生成

```bash
# ログインページの解析
npx @infodb/webshot analyze-auth https://example.com/login

# 認証テスト付きで解析
npx @infodb/webshot analyze-auth https://example.com/login \
  --username testuser \
  --password testpass

# 設定ファイル出力先を指定
npx @infodb/webshot analyze-auth https://example.com/login \
  --output ./my-auth-config.json

# ヘッドレスモードで実行
npx @infodb/webshot analyze-auth https://example.com/login --headless
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

### `interactive` コマンド

- `<url>`: 表示するWebページのURL（必須）
- `-o, --output <dir>`: 出力ディレクトリ（デフォルト: `./screenshots`）
- `-w, --width <number>`: ビューポート幅（デフォルト: `1280`）
- `-h, --height <number>`: ビューポート高さ（デフォルト: `720`）
- `--auth-config <path>`: 認証設定ファイルのパス
- `--auth-type <type>`: 認証タイプ（basic|form|cookie|header）
- `--username <username>`: 認証用ユーザー名
- `--password <password>`: 認証用パスワード

### `analyze-auth` コマンド

- `<url>`: 解析するログインページのURL（必須）
- `-u, --username <username>`: ログインテスト用ユーザー名
- `-p, --password <password>`: ログインテスト用パスワード  
- `-o, --output <path>`: 認証設定ファイルの出力パス（デフォルト: `./auth-config.json`）
- `--headless`: ヘッドレスモードでブラウザを実行

## ファイル構造

```
screenshots/
├── logs/
│   ├── 12ab34cd_2024-01-01T12-00-00-000Z.json  # 全スクリーンショット（ログ用）
│   ├── 12ab34cd_2024-01-01T12-05-00-000Z.json
│   └── ef56gh78_2024-01-01T12-10-00-000Z.json  # 別URL
├── evidence/
│   ├── 12ab34cd_001.json                       # 差分のみ（エビデンス用）
│   ├── 12ab34cd_002.json
│   └── ef56gh78_001.json                       # 別URL
└── extracted/                                  # 抽出されたPNG画像
    ├── logs_12ab34cd_2024-01-01T12-00-00-000Z.png
    └── evidence_12ab34cd_001.png
```

### ファイル命名規則

- **ハッシュ**: URLのMD5ハッシュの最初の8文字
- **Logsフォルダ**: `{hash}_{timestamp}.json` 形式（時系列順）
- **Evidenceフォルダ**: `{hash}_{3桁連番}.json` 形式（差分検出時のみ保存）
- **フォルダ分離**: `logs/`と`evidence/`でファイル種別を管理

## JSONファイル構造

### Logsファイル例
```json
{
  "metadata": {
    "url": "https://example.com",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "sequence": 1,
    "hash": "12ab34cd",
    "filename": "12ab34cd_2024-01-01T12-00-00-000Z.json",
    "viewport": {
      "width": 1280,
      "height": 720
    },
    "fullPage": true,
    "hasDiff": true,
    "diffPercentage": 5.23
  },
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "html": "<html>...</html>"
}
```

### Evidenceファイル例
```json
{
  "metadata": {
    "url": "https://example.com",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "sequence": 1,
    "hash": "12ab34cd",
    "filename": "12ab34cd_001.json",
    "logsFilename": "12ab34cd_2024-01-01T12-00-00-000Z.json",
    "viewport": {
      "width": 1280,
      "height": 720
    },
    "fullPage": true,
    "hasDiff": true,
    "diffPercentage": 5.23
  },
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "html": "<html>...</html>"
}
```

## 差分検出の仕組み

1. **初回撮影**: 必ず`logs/`と`evidence/`両方のフォルダに保存
2. **2回目以降**: 前回のlogsと比較して差分を検出
   - 差分が閾値以上: `logs/`と`evidence/`両方に保存
   - 差分が閾値未満: `logs/`のみに保存（`evidence/`には作成しない）

これにより、`evidence/`フォルダには**意味のある変更があった場合のみ**スクリーンショットが保存されます。

### ファイル間の関連性

- **Evidenceファイルのメタデータ**には、対応する`logsFilename`が記録される
- 同一URLのファイルは同じハッシュプレフィックスで識別可能
- `logs/`は時系列順、`evidence/`は差分検出順で管理される

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

# インターラクティブモードで開発実行
npm run dev interactive https://example.com

# Playwrightブラウザのインストール
npx playwright install chromium
```

## ライセンス

MIT
