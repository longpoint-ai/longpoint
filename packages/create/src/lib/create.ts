import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';

export interface CreateOptions {
  projectName?: string;
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';
}

export async function create(options: CreateOptions) {
  try {
    console.log(chalk.blue.bold('\n🚀 Welcome to Longpoint!\n'));

    // Get project name - either from argument or prompt
    let finalProjectName: string;

    if (!options.projectName) {
      // Prompt for project name if not provided as argument
      const { projectName: promptedName } = await inquirer.prompt([
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
      finalProjectName = promptedName;
    } else {
      // Validate the provided project name
      if (!options.projectName.trim()) {
        console.error(chalk.red('Error: Project name is required'));
        process.exit(1);
      }
      if (options.projectName.includes(' ')) {
        console.error(chalk.red('Error: Project name cannot contain spaces'));
        process.exit(1);
      }
      if (!/^[a-zA-Z0-9-_]+$/.test(options.projectName)) {
        console.error(
          chalk.red(
            'Error: Project name can only contain letters, numbers, hyphens, and underscores'
          )
        );
        process.exit(1);
      }
      if (fs.existsSync(options.projectName)) {
        console.error(
          chalk.red('Error: A directory with this name already exists')
        );
        process.exit(1);
      }
      finalProjectName = options.projectName;
    }

    // Prompt for package manager
    let packageManager: string;
    if (!options.packageManager) {
      const { packageManager: promptedPackageManager } = await inquirer.prompt([
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
      packageManager = promptedPackageManager;
    } else {
      packageManager = options.packageManager;
    }

    console.log(
      chalk.yellow(`\n📁 Creating project directory: ${finalProjectName}`)
    );

    // Create project directory
    const projectPath = path.resolve(finalProjectName);
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
      content = content.replace(/\{\{PROJECT_NAME\}\}/g, finalProjectName);

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
      console.log(chalk.yellow(`   cd ${finalProjectName}`));
      console.log(
        chalk.yellow(
          `   ${packageManager} install @longpoint/core @longpoint/admin`
        )
      );
    }

    console.log(chalk.blue.bold('\n🎉 Project created successfully!\n'));
    console.log(chalk.white('Next steps:'));
    console.log(chalk.white(`1. cd ${finalProjectName}`));
    console.log(chalk.white('2. npm start (to run the core server)'));
  } catch (error) {
    console.error(chalk.red('Error creating project:'), error);
    process.exit(1);
  }
}
