/**
 * @module GraphitiCLI
 * @description CLI for monitoring Graphiti MCP connectivity.
 * @dependencies commander
 */

import { Command } from 'commander';
import { createDefaultGraphitiManager } from './manager.js';

async function simulatedCheck(): Promise<boolean> {
  // Placeholder: actual environment will use MCP Graphiti tool calls.
  return true;
}

export async function main(): Promise<void> {
  const program = new Command();

  program
    .name('graphiti')
    .description('Graphiti MCP connectivity utilities')
    .version('1.0.0');

  program
    .command('monitor')
    .description('Start monitoring Graphiti connectivity')
    .action(async () => {
      const manager = createDefaultGraphitiManager(simulatedCheck);
      await manager.start();
      // keep alive
      process.on('SIGINT', () => {
        manager.stop();
        process.exit(0);
      });
    });

  program
    .command('status')
    .description('Print current connectivity status')
    .action(async () => {
      const manager = createDefaultGraphitiManager(simulatedCheck);
      const status = manager.getStatus();
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(status, null, 2));
    });

  await program.parseAsync(process.argv);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // eslint-disable-next-line unicorn/prefer-top-level-await
  void main();
}


