#!/usr/bin/env tsx

import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import kill from 'tree-kill';
import waitPort from 'wait-port';
import { GeneratorConfig } from './generators/base/types';
import { OpenAPIParser } from './parsers/openapi-parser';
import { OpenAPISpec } from './parsers/types';
import { SDKGenerator } from './sdk-generator';

export async function generateSDK(
  target: string = 'typescript',
  specUrl: string = 'http://localhost:3000/docs-json',
  outputDir?: string
): Promise<void> {
  try {
    const port = 3000;
    let child: childProcess.ChildProcess | undefined = undefined;

    // Check if server is already running
    const { open: isServiceRunning } = await waitPort({
      host: 'localhost',
      port,
      timeout: 200,
      output: 'silent',
    });

    // Start server if not running and using default spec URL
    if (!isServiceRunning && specUrl === 'http://localhost:3000/docs-json') {
      console.log('🐎 API service not running. Starting...');
      const rootDir = path.join(__dirname, '../../../');
      const cwd = process.cwd();
      process.chdir(rootDir);

      const command = 'npx nx serve @longpoint/core';
      child = childProcess.exec(command);
      process.chdir(cwd);

      const result = await waitPort({
        host: 'localhost',
        port,
        timeout: 30000,
      });

      if (!result.open) {
        throw new Error('❗️API service failed to start');
      }
      console.log('✅ Service is now running');
    }

    console.log(`📡 Fetching OpenAPI spec from ${specUrl}...`);
    const response = await fetch(specUrl);
    const spec = (await response.json()) as OpenAPISpec;

    console.log('🔍 Parsing operations...');
    const parser = new OpenAPIParser(spec);
    const operations = parser.parseOperations();

    console.log(`📝 Found ${operations.length} operations:`);
    operations.forEach((op) => {
      console.log(`  - ${op.tag}.${op.operationId} (${op.method} ${op.path})`);
    });

    console.log(`⚡ Generating ${target} SDK...`);
    const generator = new SDKGenerator();
    const config: GeneratorConfig = {
      packageName: '@longpoint/sdk',
      version: '0.1.0',
      description: 'TypeScript SDK for the Longpoint API',
      outputDir,
    };
    const files = await generator.generate(target, spec, config);

    if (outputDir) {
      for (const [filename, content] of Object.entries(files)) {
        const filePath = path.join(outputDir, filename);
        const dir = path.dirname(filePath);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, content);
        console.log(`📁 Generated: ${filename}`);
      }
    } else {
      console.log('📋 Generated files:');
      Object.keys(files).forEach((filename) => {
        console.log(`  - ${filename}`);
      });
    }

    console.log('✅ SDK generated successfully!');

    // Cleanup: only shut down server if we started it
    if (child) {
      console.log('🐎 Shutting down service...');
      await new Promise<void>((resolve, reject) => {
        child!.on('close', () => {
          console.log('✅ Service is shut down.');
          resolve();
        });
        if (child!.pid) {
          kill(child!.pid, 'SIGKILL');
        } else {
          console.log('❗️ Service is not running.');
          reject(new Error('Service is not running'));
        }
      });
    }
  } catch (error) {
    console.error('❌ Error generating SDK:', error);
    process.exit(1);
  }
}

// CLI entry point
if (require.main === module) {
  const target = process.argv[2] || 'typescript';
  const specUrl = process.argv[3] || 'http://localhost:3000/docs-json';
  const outputDir = process.argv[4];

  generateSDK(target, specUrl, outputDir);
}
