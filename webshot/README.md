# @infodb/webshot

PlaywrightでWebスクリーンショット撮影と差分検出を行うCLIツール

## 特徴

- **Playwright**を使用した高品質なWebスクリーンショット撮影
- **差分検出**による変更の自動判定
- **インターラクティブモード**でリアルタイム操作とスクリーンショット撮影
- **JSON形式**でのメタデータ保存（Base64画像データ含む）
- **柔軟なファイル命名**（URLハッシュまたはカスタムプレフィックス）
- **環境変数サポート**で設定の外部化が可能
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

# カスタムプレフィックスを使用
npx @infodb/webshot capture https://example.com \
  --prefix mysite

# オプション付きで実行
npx @infodb/webshot capture https://example.com \
  --output ./my-screenshots \
  --width 1920 \
  --height 1080 \
  --threshold 2.0

# 環境変数を使用
export WEBSHOT_OUTPUT_DIR=./my-screenshots
export WEBSHOT_PREFIX=myproject
npx @infodb/webshot capture https://example.com
```

### 認証が必要なサイトの撮影

```bash
# Basic認証（コマンドライン）
npx @infodb/webshot capture https://secure.example.com \
  --auth-type basic \
  --username myuser \
  --password mypass

# 環境変数を使用（Basic認証）
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
npx @infodb/webshot extract --file ./screenshots/12ab34cd_001.json
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

撮影されたスクリーンショットは通常の`capture`コマンドと同様に出力ディレクトリに保存され、差分検出も行われます。

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
- `-o, --output <dir>`: 出力ディレクトリ（デフォルト: `./screenshots`、環境変数: `WEBSHOT_OUTPUT_DIR`）
- `-p, --prefix <prefix>`: カスタムプレフィックス（環境変数: `WEBSHOT_PREFIX`）
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
- `-o, --output <dir>`: 出力ディレクトリ（デフォルト: `./screenshots`、環境変数: `WEBSHOT_OUTPUT_DIR`）
- `-p, --prefix <prefix>`: カスタムプレフィックス（環境変数: `WEBSHOT_PREFIX`）
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
├── 12ab34cd_001.json  # URLハッシュ + 連番
├── 12ab34cd_002.json
├── ef56gh78_001.json  # 別URL
├── mysite_001.json    # カスタムプレフィックス使用
├── mysite_002.json
└── extracted/         # 抽出されたPNG画像
    ├── 12ab34cd_001.png
    ├── mysite_001.png
    └── mysite_002.png
```

### ファイル命名規則

- **URLハッシュ使用時**: `{URLハッシュ}_{3桁連番}.json` （例: `12ab34cd_001.json`）
- **プレフィックス使用時**: `{プレフィックス}_{3桁連番}.json` （例: `mysite_001.json`）
- **識別子**: URLのMD5ハッシュの最初の8文字、またはカスタムプレフィックス
- **連番**: 同一識別子で001から開始し、撮影毎に増加

## JSONファイル構造

### スクリーンショットファイル例
```json
{
  "metadata": {
    "url": "https://example.com",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "sequence": 1,
    "hash": "12ab34cd",
    "filename": "12ab34cd_001.json",
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

### カスタムプレフィックス使用時の例
```json
{
  "metadata": {
    "url": "https://example.com",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "sequence": 1,
    "hash": "mysite",
    "filename": "mysite_001.json",
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

1. **初回撮影**: 差分検出の基準がないため `hasDiff: true`、`diffPercentage: 100` で保存
2. **2回目以降**: 前回のスクリーンショットと比較して差分を検出
   - 差分がある場合: `hasDiff: true` と実際の差分パーセンテージを記録
   - 差分がない場合: `hasDiff: false`、`diffPercentage: 0` を記録

### 識別子による管理

- **同一識別子**: 同じURLまたは同じプレフィックスのスクリーンショットは同じ識別子でグループ化
- **連番管理**: 識別子ごとに001から開始し、撮影の度に増加
- **差分比較**: 同一識別子内で最新のスクリーンショットと比較

### 環境変数の活用

```bash
# 出力ディレクトリとプレフィックスの設定
export WEBSHOT_OUTPUT_DIR=/path/to/screenshots
export WEBSHOT_PREFIX=project_name

# 認証情報の設定
export WEBSHOT_USERNAME=your_username  
export WEBSHOT_PASSWORD=your_password
```

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
# Basic認証用
export WEBSHOT_USERNAME=your_username
export WEBSHOT_PASSWORD=your_password

# その他のツール設定
export WEBSHOT_OUTPUT_DIR=/path/to/screenshots
export WEBSHOT_PREFIX=project_name
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
