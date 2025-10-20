import { parseArgs } from 'node:util';
import { create } from './create.js';

export function cli() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      projectName: {
        type: 'string',
      },
      packageManager: {
        type: 'string',
        choices: ['npm', 'yarn', 'pnpm', 'bun'],
        default: 'npm',
      },
    },
  });

  const projectName = positionals[0];

  create({
    projectName,
    packageManager: values.packageManager as 'npm' | 'yarn' | 'pnpm' | 'bun',
  });
}
