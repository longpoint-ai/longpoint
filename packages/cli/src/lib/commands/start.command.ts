import chalk from 'chalk';
import { ChildProcess, spawn } from 'child_process';
import { Command } from 'commander';
import { config } from 'dotenv';
import fs from 'fs-extra';
import path from 'path';

export function startCommand(program: Command) {
  program
    .command('start')
    .description('Start the Longpoint project')
    .option('-d, --debug', 'Enable debug mode for detailed output')
    .action(start);
}

async function start(options: { debug?: boolean }) {
  let child: ChildProcess | null = null;

  const cleanup = async () => {
    if (child && !child.killed) {
      // Try graceful shutdown first
      child.kill('SIGTERM');

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Force kill if still running
      if (!child.killed) {
        child.kill('SIGKILL');
      }
    }
    process.exit(0);
  };

  process.on('SIGTERM', () => cleanup());
  process.on('SIGINT', () => cleanup());

  try {
    console.log(
      chalk.blue.bold('\n┌─────────────────────────────────────────┐')
    );
    console.log(
      chalk.blue.bold('│') +
        chalk.white.bold('           Starting Longpoint            ') +
        chalk.blue.bold('│')
    );
    console.log(
      chalk.blue.bold('└─────────────────────────────────────────┘\n')
    );

    console.log(chalk.gray('🔍 Verifying setup...'));

    if (options.debug) {
      console.log();
    }
    const projectRoot = await findProjectRoot();
    if (options.debug) {
      console.log(
        chalk.gray('   - Project root found: ') + chalk.cyan(projectRoot)
      );
    }

    const envPath = path.join(projectRoot, '.env');
    if (await fs.pathExists(envPath)) {
      config({
        path: envPath,
        quiet: true,
      });
    } else {
      if (options.debug) {
        console.log(
          chalk.yellow('   ⚠') +
            chalk.white(
              ' No .env file found, using system environment variables'
            )
        );
      }
    }

    const corePath = await findCorePackage(projectRoot);
    if (!corePath) {
      console.log();
      console.log(
        chalk.red.bold('❌ Error: @longpoint/core package not found')
      );
      console.log(chalk.red('   Make sure it is installed in your project.\n'));
      process.exit(1);
    }
    if (options.debug) {
      console.log(
        chalk.gray('   - Core package found: ') + chalk.cyan(corePath)
      );
    }

    const mainJsPath = path.join(corePath, 'dist', 'main.js');
    if (!(await fs.pathExists(mainJsPath))) {
      console.log();
      console.log(chalk.red.bold('❌ Error: Invalid installation'));
      console.log(chalk.red('   Please reinstall @longpoint/core\n'));
      process.exit(1);
    }

    if (await fs.pathExists(envPath)) {
      const fileName = path.basename(envPath);
      console.log(
        chalk.gray('📄 Environment variables loaded from ') +
          chalk.bold.cyan(fileName)
      );
    } else if (options.debug) {
      console.log(
        chalk.yellow('⚠ No .env file found, using system environment variables')
      );
    }

    console.log(chalk.gray('⛵️ Launching...'));
    console.log(chalk.blue('─'.repeat(50)));

    child = spawn('node', [mainJsPath], {
      stdio: 'inherit',
      cwd: projectRoot,
      env: process.env,
    });

    child.on('error', (error: Error) => {
      console.log(chalk.red.bold('\n❌ Failed to start Longpoint:'));
      console.log(chalk.red(`   ${error.message}\n`));
      process.exit(1);
    });

    child.on('exit', (code: number | null) => {
      if (code !== 0) {
        process.exit(code || 1);
      }
    });
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Error starting Longpoint:'));
    console.log(chalk.red(`   ${error}\n`));
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
