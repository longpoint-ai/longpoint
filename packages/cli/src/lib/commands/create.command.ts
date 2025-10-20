import { Command } from 'commander';
import { create } from 'create-longpoint/create';

export function createCommand(program: Command) {
  program
    .command('create [projectName]')
    .description('Create a new Longpoint project')
    .option(
      '-p, --package-manager <manager>',
      'Package manager to use (npm, yarn, pnpm, bun)',
      'npm'
    )
    .action((projectName, options) => {
      create({
        projectName,
        packageManager: options.packageManager as
          | 'npm'
          | 'yarn'
          | 'pnpm'
          | 'bun',
      });
    });
}
