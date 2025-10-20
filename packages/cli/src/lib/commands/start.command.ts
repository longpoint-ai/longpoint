import { spawn } from 'child_process';
import { Command } from 'commander';
import { config } from 'dotenv';
import fs from 'fs-extra';
import path from 'path';

export function startCommand(program: Command) {
  program
    .command('start')
    .description('Start the Longpoint project')
    .action(start);
}

async function start() {
  try {
    // Find the project root (where package.json is located)
    const projectRoot = await findProjectRoot();

    // Load environment variables from .env file
    const envPath = path.join(projectRoot, '.env');
    if (await fs.pathExists(envPath)) {
      config({ path: envPath });
      console.log('✓ Loaded environment variables from .env');
    } else {
      console.log('⚠ No .env file found, using system environment variables');
    }

    // Find the @longpoint/core package
    const corePath = await findCorePackage(projectRoot);
    if (!corePath) {
      console.error(
        '❌ @longpoint/core package not found. Make sure it is installed.'
      );
      process.exit(1);
    }

    const mainJsPath = path.join(corePath, 'dist', 'main.js');
    if (!(await fs.pathExists(mainJsPath))) {
      console.error('❌ main.js not found in @longpoint/core package');
      process.exit(1);
    }

    console.log('🚀 Starting Longpoint project...');
    console.log(`📍 Running: ${mainJsPath}`);

    // Execute the main.js file
    const child = spawn('node', [mainJsPath], {
      stdio: 'inherit',
      cwd: projectRoot,
      env: process.env,
    });

    child.on('error', (error) => {
      console.error('❌ Failed to start Longpoint:', error.message);
      process.exit(1);
    });

    child.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ Longpoint exited with code ${code}`);
        process.exit(code || 1);
      }
    });
  } catch (error) {
    console.error('❌ Error starting Longpoint:', error);
    process.exit(1);
  }
}

async function findProjectRoot(): Promise<string> {
  let currentDir = process.cwd();

  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  throw new Error('Could not find project root (package.json)');
}

async function findCorePackage(projectRoot: string): Promise<string | null> {
  // Check node_modules/@longpoint/core
  const corePath = path.join(projectRoot, 'node_modules', '@longpoint', 'core');
  if (await fs.pathExists(corePath)) {
    return corePath;
  }

  // Check if we're in a monorepo and core is a sibling package
  const parentDir = path.dirname(projectRoot);
  const siblingCorePath = path.join(parentDir, 'packages', 'core');
  if (await fs.pathExists(siblingCorePath)) {
    return siblingCorePath;
  }

  return null;
}
