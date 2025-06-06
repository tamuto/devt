#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { WebScreenshotCapture } from '../core/capture';
import { CaptureOptionsWithAuth, AuthenticationOptions } from '../types/auth';
import { loadAuthConfig, getAuthFromEnv } from '../utils/auth-config';
import { LoginFormAnalyzer } from '../utils/form-analyzer';
import { chromium } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';

// パッケージ情報を読み込み
const packageJson = require('../../package.json');

program
  .name('webshot')
  .description('CLI tool for capturing web screenshots with diff detection using Playwright')
  .version(packageJson.version);

program
  .command('capture')
  .description('Capture screenshot of a web page')
  .argument('<url>', 'URL of the web page to capture')
  .option('-o, --output <dir>', 'Output directory for screenshots', './screenshots')
  .option('-w, --width <number>', 'Viewport width', '1280')
  .option('-h, --height <number>', 'Viewport height', '720')
  .option('--no-full-page', 'Capture only visible area instead of full page')
  .option('-t, --threshold <number>', 'Diff threshold percentage (0-100)', '1.0')
  .option('--auth-config <path>', 'Path to authentication config file')
  .option('--auth-type <type>', 'Authentication type (basic|form|cookie|header)')
  .option('--username <username>', 'Username for authentication')
  .option('--password <password>', 'Password for authentication')
  .action(async (url: string, options: any) => {
    try {
      console.log(chalk.blue('🚀 Starting screenshot capture...'));
      console.log(chalk.gray(`URL: ${url}`));
      console.log(chalk.gray(`Output: ${path.resolve(options.output)}`));

      // 認証設定を取得
      let auth: AuthenticationOptions | undefined;
      if (options.authConfig) {
        console.log(chalk.yellow('🔐 Loading authentication config...'));
        auth = await loadAuthConfig(options.authConfig);
      } else if (options.authType) {
        if (options.authType === 'basic' && options.username && options.password) {
          auth = {
            type: 'basic' as const,
            credentials: {
              username: options.username,
              password: options.password
            }
          };
        } else if (options.authType === 'env') {
          auth = getAuthFromEnv('basic');
        }
      }

      const captureOptions: CaptureOptionsWithAuth = {
        url,
        outputDir: options.output,
        viewport: {
          width: parseInt(options.width, 10),
          height: parseInt(options.height, 10)
        },
        fullPage: options.fullPage,
        diffThreshold: parseFloat(options.threshold),
        auth
      };

      const capture = new WebScreenshotCapture(options.output);
      
      await capture.init();
      console.log(chalk.yellow('📸 Capturing screenshot...'));
      
      if (auth) {
        console.log(chalk.cyan('🔑 Authenticating...'));
      }
      
      const result = await capture.capture(captureOptions);
      
      await capture.close();
      
      console.log(chalk.green('✅ Screenshot captured successfully!'));
      console.log(chalk.cyan(`📁 Logs: ${result.logsData.metadata.filename}`));
      
      if (result.evidenceData) {
        console.log(chalk.cyan(`📁 Evidence: ${result.evidenceData.metadata.filename}`));
        console.log(chalk.yellow(`🔍 Diff: ${result.logsData.metadata.diffPercentage?.toFixed(2)}%`));
      } else {
        console.log(chalk.gray('📁 No significant changes detected (evidence not saved)'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('extract')
  .description('Extract PNG images from JSON screenshot files')
  .option('-i, --input <dir>', 'Screenshots directory', './screenshots')
  .option('-o, --output <dir>', 'Output directory for extracted images')
  .option('-f, --file <path>', 'Extract single JSON file')
  .action(async (options: any) => {
    try {
      const { extractImageFromJson, extractAllImages } = await import('../utils/extract');
      
      if (options.file) {
        // 単一ファイルの抽出
        console.log(chalk.blue('🖼️  Extracting image from JSON file...'));
        const outputPath = await extractImageFromJson(options.file, options.output);
        console.log(chalk.green('✅ Image extracted successfully!'));
        console.log(chalk.cyan(`📁 Output: ${outputPath}`));
      } else {
        // ディレクトリ内の全ファイルを抽出
        console.log(chalk.blue('🖼️  Extracting images from JSON files...'));
        const extractedFiles = await extractAllImages(options.input, options.output);
        
        if (extractedFiles.length === 0) {
          console.log(chalk.yellow('⚠️  No JSON files found to extract'));
        } else {
          console.log(chalk.green(`✅ Extracted ${extractedFiles.length} images successfully!`));
          console.log(chalk.cyan(`📁 Output directory: ${path.dirname(extractedFiles[0])}`));
          
          extractedFiles.forEach((file, index) => {
            console.log(chalk.white(`  ${index + 1}. ${path.basename(file)}`));
          });
        }
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('info')
  .description('Show information about captured screenshots')
  .argument('[url]', 'URL to filter screenshots (optional)')
  .option('-o, --output <dir>', 'Screenshots directory', './screenshots')
  .action(async (url?: string, options?: any) => {
    try {
      const fs = await import('fs/promises');
      const { generateUrlHash } = await import('../utils/file');
      
      const outputDir = options?.output || './screenshots';
      
      console.log(chalk.blue('📊 Screenshot Information'));
      console.log(chalk.gray(`Directory: ${path.resolve(outputDir)}`));
      
      try {
        // Check for new folder structure first
        const logsDir = path.join(outputDir, 'logs');
        const evidenceDir = path.join(outputDir, 'evidence');
        
        let logFiles: string[] = [];
        let evidenceFiles: string[] = [];
        let useFolderStructure = false;
        
        try {
          await fs.access(logsDir);
          await fs.access(evidenceDir);
          logFiles = await fs.readdir(logsDir);
          evidenceFiles = await fs.readdir(evidenceDir);
          useFolderStructure = true;
        } catch {
          // Fallback to old structure
          const files = await fs.readdir(outputDir);
          logFiles = files.filter(file => file.endsWith('_logs.json'));
          evidenceFiles = files.filter(file => file.endsWith('_evidence.json'));
        }
        
        if (url) {
          const hash = generateUrlHash(url);
          
          const filteredLogFiles = logFiles.filter(file => useFolderStructure ? file.startsWith(hash) : file.includes(hash));
          const filteredEvidenceFiles = evidenceFiles.filter(file => useFolderStructure ? file.startsWith(hash) : file.includes(hash));
          
          console.log(chalk.cyan(`\n🔍 Screenshots for URL: ${url}`));
          console.log(chalk.cyan(`Hash: ${hash}`));
          console.log(chalk.gray(`Log files found: ${filteredLogFiles.length}`));
          console.log(chalk.gray(`Evidence files found: ${filteredEvidenceFiles.length}`));
          
          if (useFolderStructure) {
            console.log(chalk.white('\n📁 Logs folder:'));
            for (const file of filteredLogFiles.sort()) {
              console.log(chalk.white(`  - ${file}`));
            }
            console.log(chalk.white('\n📁 Evidence folder:'));
            for (const file of filteredEvidenceFiles.sort()) {
              console.log(chalk.white(`  - ${file}`));
            }
          } else {
            for (const file of [...filteredLogFiles, ...filteredEvidenceFiles].sort()) {
              console.log(chalk.white(`  - ${file}`));
            }
          }
        } else {
          console.log(chalk.cyan(`\nTotal files:`));
          console.log(chalk.white(`  - Logs: ${logFiles.length}`));
          console.log(chalk.white(`  - Evidence: ${evidenceFiles.length}`));
          
          if (useFolderStructure) {
            console.log(chalk.cyan('\n📁 Folder structure: logs/ and evidence/'));
          } else {
            console.log(chalk.cyan('\n📁 Legacy structure: files with suffixes'));
          }
          
          // ハッシュ別の統計を表示
          const hashStats = new Map<string, number>();
          for (const file of logFiles) {
            let hash: string;
            if (useFolderStructure) {
              // New structure: extract hash from filename like c984d06a_timestamp.json
              hash = file.substring(0, 8);
            } else {
              // Old structure: extract hash from filename like hash_sequence_logs.json
              hash = file.substring(0, 8);
            }
            hashStats.set(hash, (hashStats.get(hash) || 0) + 1);
          }
          
          if (hashStats.size > 0) {
            console.log(chalk.cyan('\n📈 Statistics by URL:'));
            for (const [hash, count] of hashStats.entries()) {
              console.log(chalk.white(`  - ${hash}: ${count} screenshots`));
            }
          }
        }
        
      } catch (error) {
        console.log(chalk.yellow('⚠️  No screenshots directory found or empty directory'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('analyze-auth')
  .description('Analyze login form and generate authentication config')
  .argument('<url>', 'URL of the login page to analyze')
  .option('-u, --username <username>', 'Username for login test')
  .option('-p, --password <password>', 'Password for login test')
  .option('-o, --output <path>', 'Output path for auth config file', './auth-config.json')
  .option('--headless', 'Run browser in headless mode')
  .action(async (url: string, options: any) => {
    let browser;
    try {
      console.log(chalk.blue('🔍 Analyzing login form...'));
      console.log(chalk.gray(`URL: ${url}`));

      browser = await chromium.launch({
        headless: !!options.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      const analyzer = new LoginFormAnalyzer(page);

      // フォーム解析
      console.log(chalk.yellow('📋 Analyzing page structure...'));
      const analysis = await analyzer.analyzeLoginForm(url);

      if (!analysis.hasLoginForm) {
        console.log(chalk.red('❌ No login form detected on this page'));
        console.log(chalk.cyan('Recommendations:'));
        analysis.recommendations.forEach(rec => {
          console.log(chalk.gray(`  • ${rec}`));
        });
        return;
      }

      console.log(chalk.green('✅ Login form detected!'));
      console.log(chalk.cyan('Form details:'));
      console.log(chalk.white(`  • Username field: ${analysis.formSelectors!.usernameSelector}`));
      console.log(chalk.white(`  • Password field: ${analysis.formSelectors!.passwordSelector}`));
      console.log(chalk.white(`  • Submit button: ${analysis.formSelectors!.submitSelector}`));

      // 認証情報が提供されている場合、ログインテストを実行
      if (options.username && options.password) {
        console.log(chalk.yellow('🔑 Testing login with provided credentials...'));
        
        const authConfig = analyzer.generateAuthConfig(analysis, {
          username: options.username,
          password: options.password
        });

        const loginResult = await analyzer.analyzePostLogin(authConfig, {
          username: options.username,
          password: options.password
        });

        if (loginResult.success) {
          console.log(chalk.green('✅ Login test successful!'));
          console.log(chalk.cyan(`  • Post-login URL: ${loginResult.postLoginUrl}`));

          console.log(chalk.cyan('Post-login analysis:'));
          loginResult.recommendations.forEach(rec => {
            console.log(chalk.gray(`  • ${rec}`));
          });
        } else {
          console.log(chalk.yellow('⚠️  Login test failed or uncertain'));
          console.log(chalk.cyan('Issues found:'));
          loginResult.recommendations.forEach(rec => {
            console.log(chalk.gray(`  • ${rec}`));
          });
        }
      } else {
        console.log(chalk.yellow('ℹ️  Provide --username and --password to test login'));
      }

      console.log(chalk.cyan('🔍 Authentication detection strategy:'));
      console.log(chalk.gray('  • Uses multi-stage fallback detection (URL change → form disappear → timeout)'));
      console.log(chalk.gray('  • No waitForSelector needed - automatic detection enabled'));

      // 認証設定JSONを生成
      const authConfig = analyzer.generateAuthConfig(analysis, {
        username: options.username || 'your_username',
        password: options.password || 'your_password'
      });

      // ファイルに保存
      const outputPath = path.resolve(options.output);
      await fs.writeFile(outputPath, JSON.stringify(authConfig, null, 2), 'utf-8');

      console.log(chalk.green('📄 Authentication config generated!'));
      console.log(chalk.cyan(`  • File saved: ${outputPath}`));
      
      if (!options.username || !options.password) {
        console.log(chalk.yellow('⚠️  Remember to update the username and password in the config file'));
      }

      console.log(chalk.cyan('\nTo use this config with webshot:'));
      console.log(chalk.white(`  webshot capture <target_url> --auth-config ${outputPath}`));

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  });

// エラーハンドリング
process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Uncaught Exception:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('❌ Unhandled Rejection:'), reason);
  process.exit(1);
});

program.parse();
