export interface AuthenticationOptions {
  type: 'basic' | 'form' | 'cookie' | 'header';
  credentials?: {
    username?: string;
    password?: string;
  };
  formSelectors?: {
    usernameSelector: string;
    passwordSelector: string;
    submitSelector: string;
    loginUrl?: string;
  };
  cookies?: Array<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
  }>;
  headers?: Record<string, string>;
  waitForSelector?: string; // ログイン成功後に待機するセレクター
  timeout?: number; // 認証のタイムアウト（ミリ秒）
}

import { CaptureOptions } from './index';

export interface CaptureOptionsWithAuth extends CaptureOptions {
  auth?: AuthenticationOptions;
}
