#!/usr/bin/env node

import { GitHooks } from './git-hooks.js';
import chalk from 'chalk';

async function main() {
  try {
    console.log(chalk.blue('🔧 Setting up ScreenGraph Document Index Git Hooks'));
    
    const gitHooks = new GitHooks();
    await gitHooks.setupHooks();
    
    console.log(chalk.green('✅ Git hooks setup completed!'));
    console.log(chalk.blue('📋 Hooks installed:'));
    console.log(chalk.gray('  • pre-push: Updates document index before pushing'));
    console.log(chalk.gray('  • post-commit: Updates index after committing markdown changes'));
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to setup git hooks:'), error);
    process.exit(1);
  }
}

main();
