import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { CaptureHandler } from './handlers/capture';
import { ExtractHandler } from './handlers/extract';
import { InfoHandler } from './handlers/info';

const server = new FastMCP({
  name: 'webshot-mcp-server',
  version: '1.0.0',
});

// Initialize handlers
const captureHandler = new CaptureHandler();
const extractHandler = new ExtractHandler();
const infoHandler = new InfoHandler();

// Register capture_screenshot tool
server.addTool({
  name: 'capture_screenshot',
  description: 'Capture a screenshot of a web page with optional authentication and diff detection',
  parameters: z.object({
    url: z.string().url().describe('The URL to capture'),
    output_dir: z.string().optional().describe('Output directory for screenshots (default: ./screenshots)'),
    prefix: z.string().optional().describe('Prefix for output files'),
    auth: z.object({
      type: z.enum(['basic', 'form', 'cookie', 'header']).describe('Authentication type'),
      credentials: z.record(z.string()).optional().describe('Authentication credentials'),
      cookies: z.array(z.object({
        name: z.string(),
        value: z.string(),
        domain: z.string().optional(),
        path: z.string().optional(),
      })).optional().describe('Cookies for authentication'),
      headers: z.record(z.string()).optional().describe('Custom headers for authentication'),
    }).optional().describe('Authentication options'),
    options: z.object({
      viewport_width: z.number().optional().describe('Viewport width (default: 1920)'),
      viewport_height: z.number().optional().describe('Viewport height (default: 1080)'),
      full_page: z.boolean().optional().describe('Capture full page (default: true)'),
      timeout: z.number().optional().describe('Page load timeout in milliseconds (default: 30000)'),
      diff_threshold: z.number().optional().describe('Diff detection threshold (default: 0.1)'),
    }).optional().describe('Capture options'),
  }),
  execute: async (params: any) => {
    const result = await captureHandler.handleCapture({
      url: params.url,
      outputDir: params.output_dir,
      prefix: params.prefix,
      auth: params.auth,
      options: {
        viewportWidth: params.options?.viewport_width,
        viewportHeight: params.options?.viewport_height,
        fullPage: params.options?.full_page,
        timeout: params.options?.timeout,
        diffThreshold: params.options?.diff_threshold,
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
});

// Register extract_images tool
server.addTool({
  name: 'extract_images',
  description: 'Extract PNG images from JSON screenshot files',
  parameters: z.object({
    input_file: z.string().describe('Input JSON file containing screenshot data'),
    output_dir: z.string().optional().describe('Output directory for extracted images (default: ./extracted)'),
  }),
  execute: async (params: any) => {
    const result = await extractHandler.handleExtract({
      inputFile: params.input_file,
      outputDir: params.output_dir,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
});

// Register get_capture_info tool
server.addTool({
  name: 'get_capture_info',
  description: 'Get information about captured screenshots',
  parameters: z.object({
    directory: z.string().optional().describe('Directory to scan for screenshots (default: ./screenshots)'),
    hash_prefix: z.string().optional().describe('Filter by hash prefix'),
  }),
  execute: async (params: any) => {
    const result = await infoHandler.handleInfo({
      directory: params.directory,
      hashPrefix: params.hash_prefix,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
});

export async function runServer() {
  await server.start();
  console.error('Webshot MCP server running with FastMCP');
}
