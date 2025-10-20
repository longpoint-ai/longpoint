#!/usr/bin/env node

import chalk from 'chalk';
import { execSync } from 'child_process';
import { Command } from 'commander';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';

const program = new Command();

program
  .name('longpoint')
  .description('Longpoint CLI for managing media projects')
  .version('0.0.1');

program
  .command('init')
  .description('Initialize a new Longpoint project')
  .action(async () => {
    try {
      console.log(chalk.blue.bold('\n🚀 Welcome to Longpoint!\n'));

      // Prompt for project name
      const { projectName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'Project name is required';
            }
            if (input.includes(' ')) {
              return 'Project name cannot contain spaces';
            }
            if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
              return 'Project name can only contain letters, numbers, hyphens, and underscores';
            }
            if (fs.existsSync(input)) {
              return 'A directory with this name already exists';
            }
            return true;
          },
        },
      ]);

      // Prompt for package manager
      const { packageManager } = await inquirer.prompt([
        {
          type: 'list',
          name: 'packageManager',
          message: 'Which package manager would you like to use?',
          choices: [
            { name: 'npm', value: 'npm' },
            { name: 'yarn', value: 'yarn' },
            { name: 'pnpm', value: 'pnpm' },
            { name: 'bun', value: 'bun' },
          ],
          default: 'npm',
        },
      ]);

      console.log(
        chalk.yellow(`\n📁 Creating project directory: ${projectName}`)
      );

      // Create project directory
      const projectPath = path.resolve(projectName);
      await fs.ensureDir(projectPath);

      // Get template directory
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const templateDir = path.join(__dirname, 'templates/default-init');

      // Read all template files dynamically
      const templateFiles = await fs.readdir(templateDir);
      const templateFilesWithSuffix = templateFiles.filter((file) =>
        file.endsWith('.template')
      );

      for (const templateFile of templateFilesWithSuffix) {
        const templatePath = path.join(templateDir, templateFile);
        const targetPath = path.join(
          projectPath,
          templateFile.replace('.template', '')
        );

        let content = await fs.readFile(templatePath, 'utf-8');

        // Replace template variables
        content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);

        await fs.writeFile(targetPath, content);
        console.log(chalk.green(`✓ Created ${path.basename(targetPath)}`));
      }

      console.log(
        chalk.yellow(`\n📦 Installing dependencies with ${packageManager}...`)
      );

      // Change to project directory and install dependencies
      process.chdir(projectPath);

      try {
        execSync(`${packageManager} install @longpoint/core @longpoint/admin`, {
          stdio: 'inherit',
          cwd: projectPath,
        });
        console.log(chalk.green('✓ Dependencies installed successfully'));
      } catch (error) {
        console.log(
          chalk.red(
            '⚠️  Failed to install dependencies automatically. Please run:'
          )
        );
        console.log(chalk.yellow(`   cd ${projectName}`));
        console.log(
          chalk.yellow(
            `   ${packageManager} install @longpoint/core @longpoint/admin`
          )
        );
      }

      console.log(chalk.blue.bold('\n🎉 Project created successfully!\n'));
      console.log(chalk.white('Next steps:'));
      console.log(chalk.white(`1. cd ${projectName}`));
      console.log(chalk.white('2. npm start (to run the core server)'));
    } catch (error) {
      console.error(chalk.red('Error creating project:'), error);
      process.exit(1);
    }
  });

export function cli(): void {
  program.parse();
}
