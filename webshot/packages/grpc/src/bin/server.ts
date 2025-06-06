#!/usr/bin/env node

import { WebshotGrpcServer } from '../server';
import { Command } from 'commander';

const program = new Command();

program
  .name('webshot-grpc-server')
  .description('gRPC server for webshot screenshot capture')
  .version('1.0.0')
  .option('-p, --port <number>', 'Port to listen on', '50051')
  .option('-h, --host <string>', 'Host to bind to', '0.0.0.0')
  .action((options) => {
    const server = new WebshotGrpcServer();
    const port = parseInt(options.port, 10);
    
    console.log(`Starting webshot gRPC server on ${options.host}:${port}`);
    
    server.start(port, options.host);

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nReceived SIGINT, shutting down gracefully...');
      server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\nReceived SIGTERM, shutting down gracefully...');
      server.stop();
      process.exit(0);
    });
  });

program.parse();