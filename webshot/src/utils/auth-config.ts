import * as fs from 'fs/promises';
import * as path from 'path';
import { AuthenticationOptions } from '../types/auth';

/**
 * 認証設定ファイルを読み込み
 */
export async function loadAuthConfig(configPath: string): Promise<AuthenticationOptions> {
  try {
    const fullPath = path.resolve(configPath);
    const content = await fs.readFile(fullPath, 'utf-8');
    
    // JSONファイルまたはJSファイルをサポート
    if (configPath.endsWith('.json')) {
      return JSON.parse(content) as AuthenticationOptions;
    } else if (configPath.endsWith('.js') || configPath.endsWith('.mjs')) {
      // 動的インポートでJSファイルを読み込み
      const module = await import(fullPath);
      return module.default || module;
    } else {
      throw new Error('Unsupported config file format. Use .json, .js, or .mjs');
    }
  } catch (error) {
    throw new Error(`Failed to load auth config from ${configPath}: ${error}`);
  }
}

/**
 * 環境変数から認証情報を取得
 */
export function getAuthFromEnv(type: string): AuthenticationOptions | undefined {
  switch (type) {
    case 'basic':
      const username = process.env.WEBSHOT_USERNAME;
      const password = process.env.WEBSHOT_PASSWORD;
      if (username && password) {
        return {
          type: 'basic',
          credentials: { username, password }
        };
      }
      break;
    case 'header':
      const authHeader = process.env.WEBSHOT_AUTH_HEADER;
      const authValue = process.env.WEBSHOT_AUTH_VALUE;
      if (authHeader && authValue) {
        return {
          type: 'header',
          headers: {
            [authHeader]: authValue
          }
        };
      }
      break;
  }
  return undefined;
}

/**
 * インタラクティブに認証情報を取得
 */
export async function promptForAuth(): Promise<AuthenticationOptions> {
  // この実装では簡単な例として、環境変数のチェックを行う
  // 実際のプロダクションでは、inquirer等のライブラリを使用することを推奨
  
  console.log('Authentication required. Please set environment variables:');
  console.log('WEBSHOT_USERNAME=your_username');
  console.log('WEBSHOT_PASSWORD=your_password');
  
  const username = process.env.WEBSHOT_USERNAME;
  const password = process.env.WEBSHOT_PASSWORD;
  
  if (!username || !password) {
    throw new Error('Username and password are required. Please set WEBSHOT_USERNAME and WEBSHOT_PASSWORD environment variables.');
  }
  
  return {
    type: 'basic',
    credentials: {
      username,
      password
    }
  };
}
