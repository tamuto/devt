# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `npm run build` - Compiles TypeScript to dist/ directory
- **Development**: `npm run dev capture <url>` - Run CLI in development mode with ts-node
- **Install dependencies**: `npm install`
- **Install Playwright browsers**: `npx playwright install chromium`

## Architecture Overview

This is a CLI tool for capturing web screenshots with diff detection using Playwright. The project is structured around three main concepts:

### Core Components

1. **WebScreenshotCapture** (`src/core/capture.ts`) - Main orchestrator class that:
   - Manages Playwright browser lifecycle
   - Handles the screenshot capture flow
   - Performs diff detection against previous screenshots
   - Saves both "logs" (all screenshots) and "evidence" (only changed screenshots)

2. **AuthenticationHandler** (`src/core/auth.ts`) - Handles various authentication methods:
   - Basic HTTP authentication
   - Form-based login flows
   - Cookie-based authentication
   - Custom header authentication

3. **CLI Interface** (`src/bin/cli.ts`) - Commander.js-based CLI with three commands:
   - `capture` - Take screenshots with diff detection
   - `extract` - Export PNG images from JSON files
   - `info` - Display statistics about captured screenshots

### Key Design Patterns

**Dual File System**: Screenshots are saved in two formats:
- `{hash}_{sequence}_logs.json` - All screenshots (complete history)
- `{hash}_{sequence}_evidence.json` - Only when significant changes detected (based on threshold)

**Hash-based Organization**: URLs are hashed (MD5, 8 chars) to create consistent file prefixes, allowing multiple screenshots of the same URL to be grouped together.

**Diff Detection**: Uses pixelmatch library to compare PNG data between current and previous screenshots. Only saves to "evidence" when changes exceed the configured threshold.

### File Structure

- `src/types/` - TypeScript interfaces for ScreenshotData, AuthenticationOptions, etc.
- `src/utils/` - Utility functions for file operations, image processing, and auth config
- `examples/` - Sample authentication configuration files
- `dist/` - Compiled JavaScript output (built from TypeScript)

### Dependencies

- **Playwright**: Web automation and screenshot capture
- **pixelmatch + pngjs**: Image diffing and PNG processing
- **commander**: CLI argument parsing
- **chalk**: Terminal colors and formatting

The codebase is fully TypeScript with strict typing enabled and follows a modular architecture separating concerns between CLI, core logic, authentication, and utilities.