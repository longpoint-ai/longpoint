#!/usr/bin/env node

import * as childProcess from 'child_process';
import * as path from 'path';
import kill from 'tree-kill';
import waitPort from 'wait-port';

/**
 * Fetch API spec and generate TypeScript types for the Longpoint API
 *
 * This script:
 * 1. Checks if the API server is already running
 * 2. If not, starts it temporarily
 * 3. Fetches the OpenAPI spec from /docs-json
 * 4. Generates TypeScript types using openapi-typescript
 * 5. Outputs to packages/types/src/lib/api.types.ts
 * 6. Shuts down the temp server if it was started
 */
export const fetchSpec = async () => {
  const rootDir = path.join(__dirname, '..');
  const port = process.env['PORT'] ? Number(process.env['PORT']) : 3000;
  const outputPath = path.join(rootDir, 'packages/types/src/lib/api.types.ts');

  const startServiceAndWait = async () => {
    console.log(
      '🚀 API service not running. Starting temporarily...\n' +
        '   (Keep dev server running to skip this step)'
    );
    const cwd = process.cwd();
    process.chdir(rootDir);
    const command = 'npx nx serve core';
    const child = childProcess.exec(command, {
      env: { ...process.env, CODEGEN: '1' },
    });

    // Log output for debugging
    child.stdout?.on('data', (data) => {
      if (data.includes('running on')) {
        console.log(data.toString().trim());
      }
    });

    process.chdir(cwd);

    const result = await waitPort({
      host: 'localhost',
      port,
      timeout: 60000, // Increased timeout for build time
    });

    if (!result.open) {
      throw new Error('❗️ API service failed to start');
    }

    console.log('✅ Service is now running\n');

    // Give it a moment to fully initialize
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return child;
  };

  const generateTypes = async () => {
    console.log(
      `📡 Fetching OpenAPI spec from http://localhost:${port}/docs-json`
    );
    console.log(
      `📝 Generating types to ${path.relative(rootDir, outputPath)}\n`
    );

    const result = childProcess.spawnSync(
      'npx',
      [
        'openapi-typescript',
        `http://localhost:${port}/docs-json`,
        '-o',
        outputPath,
        '--alphabetize',
      ],
      {
        stdio: 'inherit',
        encoding: 'utf8',
      }
    );

    if (result.status !== 0) {
      throw new Error(
        `❗️ Failed to generate types (exit code: ${result.status})`
      );
    }
  };

  const stopServiceAndWait = async (child: childProcess.ChildProcess) => {
    console.log('🛑 Shutting down temporary service...');
    return await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log('⚠️  Service shutdown timed out, forcing kill...');
        if (child.pid) {
          kill(child.pid, 'SIGKILL');
        }
        resolve(0);
      }, 5000);

      child.on('close', () => {
        clearTimeout(timeout);
        console.log('✅ Service shut down\n');
        resolve(0);
      });

      if (child.pid) {
        kill(child.pid, 'SIGTERM');
      } else {
        clearTimeout(timeout);
        console.log('⚠️  Service process not found');
        reject(1);
      }
    });
  };

  // Check if service is already running
  const { open: isServiceRunning } = await waitPort({
    host: 'localhost',
    port,
    timeout: 200,
    output: 'silent',
  });

  let child: childProcess.ChildProcess | undefined = undefined;

  try {
    if (!isServiceRunning) {
      child = await startServiceAndWait();
    } else {
      console.log('✅ API service already running\n');
    }

    await generateTypes();

    console.log('🎉 Done! You can now import types from @longpoint/types\n');
  } catch (error) {
    console.error('❗️ Error generating API types:', error);
    process.exit(1);
  } finally {
    if (child) {
      await stopServiceAndWait(child);
    }
  }
};

fetchSpec();
