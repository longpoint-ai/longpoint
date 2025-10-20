#!/usr/bin/env node

import { cli } from './lib/cli.js';

if (import.meta.url === `file://${process.argv[1]}`) {
  cli();
}
