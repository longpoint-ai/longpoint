#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { createCommand } from './commands/create.command.js';
import { startCommand } from './commands/start.command.js';

const packageJson = fileURLToPath(import.meta.resolve('../package.json'));
const packageJsonContent = fs.readFileSync(packageJson, 'utf8');
const packageJsonData = JSON.parse(packageJsonContent);
const version = packageJsonData.version ?? '0.0.0';

const program = new Command();

program.name('longpoint').description('Longpoint CLI').version(version);

createCommand(program);
startCommand(program);

export function cli(): void {
  program.parse();
}
