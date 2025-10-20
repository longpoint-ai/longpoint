import { Command } from 'commander';

export function startCommand(program: Command) {
  program
    .command('start')
    .description('Start the Longpoint project')
    .action(start);
}

async function start() {}
