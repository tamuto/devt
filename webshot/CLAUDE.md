# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo containing three packages for web screenshot capture with diff detection:

```
webshot/
├── packages/
│   ├── core/               # @infodb/webshot (main CLI tool)
│   ├── grpc/               # @infodb/webshot-grpc (gRPC adapter)
│   └── mcp/                # @infodb/webshot-mcp (MCP adapter)
├── package.json            # Root package.json (monorepo)
├── pnpm-workspace.yaml     # pnpm workspace configuration
└── CLAUDE.md               # This file
```

## Development Commands

### Root Level (Monorepo)
- **Install all dependencies**: `pnpm install`
- **Build all packages**: `pnpm run build`
- **Clean all packages**: `pnpm run clean`
- **Run tests for all packages**: `pnpm run test`

### Core Package (@infodb/webshot)
- **Build core**: `pnpm --filter @infodb/webshot build`
- **Development**: `pnpm --filter @infodb/webshot dev capture <url>`
- **Install Playwright browsers**: `pnpm --filter @infodb/webshot exec npx playwright install chromium`

### gRPC Package (@infodb/webshot-grpc)
- **Build gRPC**: `pnpm --filter @infodb/webshot-grpc build`
- **Start gRPC server**: `pnpm --filter @infodb/webshot-grpc dev`
- **Generate proto files**: `pnpm --filter @infodb/webshot-grpc run build:proto`

### MCP Package (@infodb/webshot-mcp)
- **Build MCP**: `pnpm --filter @infodb/webshot-mcp build`
- **Start MCP server**: `pnpm --filter @infodb/webshot-mcp dev`

## Architecture Overview

### Package Responsibilities

#### @infodb/webshot (Core)
Main CLI tool and core library functionality:

1. **WebScreenshotCapture** (`packages/core/src/core/capture.ts`) - Main orchestrator class that:
   - Manages Playwright browser lifecycle
   - Handles the screenshot capture flow
   - Performs diff detection against previous screenshots
   - Saves both "logs" (all screenshots) and "evidence" (only changed screenshots)

2. **AuthenticationHandler** (`packages/core/src/core/auth.ts`) - Handles various authentication methods:
   - Basic HTTP authentication
   - Form-based login flows
   - Cookie-based authentication
   - Custom header authentication

3. **CLI Interface** (`packages/core/src/bin/cli.ts`) - Commander.js-based CLI with three commands:
   - `capture` - Take screenshots with diff detection
   - `extract` - Export PNG images from JSON files
   - `info` - Display statistics about captured screenshots

#### @infodb/webshot-grpc (gRPC Adapter)
Remote API access via gRPC:

1. **WebshotGrpcServer** (`packages/grpc/src/server.ts`) - gRPC server implementation
2. **WebshotGrpcClient** (`packages/grpc/src/client.ts`) - gRPC client library
3. **Protocol Definitions** (`packages/grpc/src/proto/webshot.proto`) - gRPC service definitions
4. **CLI Server** (`packages/grpc/src/bin/server.ts`) - Standalone gRPC server

#### @infodb/webshot-mcp (MCP Adapter)
Model Context Protocol integration for AI/LLM tools:

1. **FastMCP Server** (`packages/mcp/src/server.ts`) - MCP protocol implementation
2. **Tool Handlers** (`packages/mcp/src/handlers/`) - Individual tool implementations
   - `capture.ts` - Screenshot capture handler
   - `extract.ts` - Image extraction handler
   - `info.ts` - Information retrieval handler
3. **CLI Server** (`packages/mcp/src/bin/server.ts`) - Standalone MCP server

### Key Design Patterns

**Dual File System**: Screenshots are saved in two formats:
- `{hash}_{sequence}_logs.json` - All screenshots (complete history)
- `{hash}_{sequence}_evidence.json` - Only when significant changes detected (based on threshold)

**Hash-based Organization**: URLs are hashed (MD5, 8 chars) to create consistent file prefixes, allowing multiple screenshots of the same URL to be grouped together.

**Diff Detection**: Uses pixelmatch library to compare PNG data between current and previous screenshots. Only saves to "evidence" when changes exceed the configured threshold.

**Workspace Dependencies**: Core package is shared across gRPC and MCP adapters using `workspace:*` dependency notation.

### Dependencies

#### Core Package
- **Playwright**: Web automation and screenshot capture
- **pixelmatch + pngjs**: Image diffing and PNG processing
- **commander**: CLI argument parsing
- **chalk**: Terminal colors and formatting

#### gRPC Package
- **@grpc/grpc-js**: gRPC Node.js implementation
- **@grpc/proto-loader**: Protocol buffer loader
- **grpc-tools**: Protocol buffer compiler

#### MCP Package
- **fastmcp**: Lightweight MCP server implementation
- **pngjs**: PNG processing for image extraction

## Development Guidelines

1. **Workspace Commands**: Use `pnpm --filter <package-name>` to run commands on specific packages
2. **Inter-package Dependencies**: Core package exports are available to adapter packages
3. **Build Order**: Core package should be built before adapter packages
4. **Testing**: Each package should have its own test suite
5. **Documentation**: Each package should have its own README.md

## Publishing

The packages are intended to be published separately:
- `@infodb/webshot` - Main CLI tool
- `@infodb/webshot-grpc` - gRPC adapter
- `@infodb/webshot-mcp` - MCP adapter

All packages follow semantic versioning and can be released independently.