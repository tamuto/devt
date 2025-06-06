# @infodb/webshot

A powerful CLI tool and TypeScript library for capturing web screenshots with intelligent diff detection using Playwright.

## Features

- **High-Quality Screenshots**: Powered by Playwright for accurate rendering
- **Intelligent Diff Detection**: Automatically detect changes using pixelmatch
- **Multiple Authentication Methods**: Support for Basic, Form, Cookie, and Header authentication
- **Dual Output System**: Saves complete history and change evidence separately
- **Interactive Mode**: Browser-based interactive screenshot capture
- **Form Analysis**: Automatic login form detection and configuration generation
- **TypeScript Support**: Full type safety and IntelliSense support
- **CLI & Library**: Use as a command-line tool or integrate into your TypeScript/JavaScript projects

## Installation

### Global CLI Installation

```bash
npm install -g @infodb/webshot
```

### Library Installation

```bash
npm install @infodb/webshot
```

### Browser Dependencies

After installation, install the required Playwright browser:

```bash
npx playwright install chromium
```

## CLI Usage

### Basic Screenshot Capture

```bash
# Capture a screenshot of a public webpage
webshot capture https://example.com

# Capture with custom output directory
webshot capture https://example.com --output ./my-screenshots

# Capture with custom viewport size
webshot capture https://example.com --width 1920 --height 1080

# Capture visible area only (not full page)
webshot capture https://example.com --no-full-page

# Set diff detection threshold (0-100%)
webshot capture https://example.com --threshold 2.5
```

### Authentication

```bash
# Using authentication config file
webshot capture https://secure.example.com --auth-config ./auth.json

# Basic authentication via command line
webshot capture https://secure.example.com --auth-type basic --username user --password pass

# Using environment variables for credentials
export WEBSHOT_USERNAME=myuser
export WEBSHOT_PASSWORD=mypass
webshot capture https://secure.example.com --auth-type env
```

### Advanced Commands

```bash
# Interactive mode (opens browser for manual interaction)
webshot interactive https://example.com

# Analyze login form and generate auth config
webshot analyze-auth https://example.com/login --username user --password pass --output auth.json

# Extract PNG images from JSON files
webshot extract --input ./screenshots --output ./images

# Extract single JSON file
webshot extract --file ./screenshots/abc123_001.json --output ./image.png

# View screenshot information and statistics
webshot info

# View screenshots for specific URL
webshot info https://example.com
```

### Environment Variables

```bash
# Set default output directory
export WEBSHOT_OUTPUT_DIR=/path/to/screenshots

# Set custom filename prefix
export WEBSHOT_PREFIX=my-project

# Set authentication credentials
export WEBSHOT_USERNAME=username
export WEBSHOT_PASSWORD=password
```

## Library Usage

### Basic Screenshot Capture

```typescript
import { WebScreenshotCapture } from '@infodb/webshot';

const capture = new WebScreenshotCapture('./screenshots');

await capture.init();

const result = await capture.capture({
  url: 'https://example.com',
  viewport: { width: 1280, height: 720 },
  fullPage: true,
  diffThreshold: 1.0
});

console.log(`Screenshot saved: ${result.metadata.filename}`);
console.log(`Diff percentage: ${result.metadata.diffPercentage}%`);

await capture.close();
```

### Authentication Example

```typescript
import { WebScreenshotCapture } from '@infodb/webshot';
import { AuthenticationOptions } from '@infodb/webshot/types';

const auth: AuthenticationOptions = {
  type: 'form',
  credentials: {
    username: 'myuser',
    password: 'mypass'
  },
  formSelectors: {
    usernameSelector: '#username',
    passwordSelector: '#password',
    submitSelector: '#login-button'
  }
};

const capture = new WebScreenshotCapture('./screenshots');
await capture.init();

const result = await capture.capture({
  url: 'https://secure.example.com/dashboard',
  auth,
  viewport: { width: 1920, height: 1080 }
});

await capture.close();
```

### Interactive Mode

```typescript
const capture = new WebScreenshotCapture('./screenshots');

// Initialize with headless=false for interactive mode
await capture.init(false);

await capture.startInteractive({
  url: 'https://example.com',
  auth: myAuthConfig
});

await capture.close();
```

## Configuration

### Authentication Configuration

Create JSON files for different authentication methods:

#### Basic Authentication (`auth-basic.json`)
```json
{
  "type": "basic",
  "credentials": {
    "username": "your_username",
    "password": "your_password"
  }
}
```

#### Form-based Authentication (`auth-form.json`)
```json
{
  "type": "form",
  "credentials": {
    "username": "your_username",
    "password": "your_password"
  },
  "formSelectors": {
    "usernameSelector": "#username",
    "passwordSelector": "#password",
    "submitSelector": "#login-button",
    "loginUrl": "https://example.com/login"
  },
  "waitForSelector": ".dashboard",
  "timeout": 10000
}
```

#### Cookie Authentication (`auth-cookie.json`)
```json
{
  "type": "cookie",
  "cookies": [
    {
      "name": "session_token",
      "value": "your_session_token",
      "domain": ".example.com",
      "path": "/"
    }
  ]
}
```

#### Header Authentication (`auth-header.json`)
```json
{
  "type": "header",
  "headers": {
    "Authorization": "Bearer your_token",
    "X-API-Key": "your_api_key"
  }
}
```

### Capture Options

```typescript
interface CaptureOptions {
  url: string;
  outputDir?: string;
  prefix?: string;
  viewport?: {
    width: number;
    height: number;
  };
  fullPage?: boolean;
  diffThreshold?: number;
  auth?: AuthenticationOptions;
}
```

## File Structure and Outputs

Screenshots are saved in a dual-file system:

### Filename Format
```
{hash}_{sequence}_{type}.json
```

- **hash**: 8-character MD5 hash of the URL
- **sequence**: 3-digit sequence number (001, 002, etc.)
- **type**: Either "logs" or "evidence"

### File Types

#### Logs Files (`*_logs.json`)
- Contains ALL screenshots taken
- Complete historical record
- Used for tracking and analysis

#### Evidence Files (`*_evidence.json`)
- Contains ONLY screenshots with significant changes
- Created when diff percentage exceeds threshold
- Used for change detection and alerts

### JSON Structure

```json
{
  "url": "https://example.com",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "metadata": {
    "filename": "abc12345_001_logs.json",
    "diffPercentage": 2.5,
    "hasChanges": true,
    "viewport": {
      "width": 1280,
      "height": 720
    }
  },
  "screenshot": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

## Development

### Setup Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd webshot/packages/core

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Build the project
npm run build
```

### Development Commands

```bash
# Run in development mode
npm run dev capture https://example.com

# Build TypeScript
npm run build

# Clean build artifacts
rm -rf dist/
```

### Building from Source

```bash
# Build TypeScript to JavaScript
npm run build

# The compiled files will be in the dist/ directory
ls dist/
```

## API Reference

### WebScreenshotCapture Class

#### Constructor
```typescript
constructor(outputDir: string)
```

#### Methods

##### `init(headless?: boolean): Promise<void>`
Initialize the Playwright browser instance.

##### `capture(options: CaptureOptionsWithAuth): Promise<ScreenshotResult>`
Capture a screenshot with optional authentication.

##### `startInteractive(options: CaptureOptionsWithAuth): Promise<void>`
Start interactive mode for manual browser interaction.

##### `close(): Promise<void>`
Close the browser instance and cleanup resources.

### Types

```typescript
interface ScreenshotResult {
  metadata: {
    filename: string;
    diffPercentage?: number;
    hasChanges: boolean;
    viewport: {
      width: number;
      height: number;
    };
  };
  screenshot: string; // Base64 encoded PNG
}
```

## Troubleshooting

### Common Issues

#### Browser Installation
If you encounter browser-related errors:
```bash
npx playwright install chromium
```

#### Permission Errors
On Linux systems, you may need to install additional dependencies:
```bash
npx playwright install-deps chromium
```

#### Authentication Issues
1. Use `webshot analyze-auth` to automatically detect form selectors
2. Check that your authentication configuration matches the target site
3. Try interactive mode to manually verify the login flow

### Debug Mode

Run with environment variable for verbose logging:
```bash
DEBUG=webshot* webshot capture https://example.com
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Support

For support and questions:
- Open an issue on GitHub
- Check the documentation for common solutions
- Use `webshot analyze-auth` for authentication troubleshooting