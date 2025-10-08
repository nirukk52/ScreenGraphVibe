#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

export class GitHooks {
  private docsPath: string;

  constructor(docsPath: string = './docs') {
    this.docsPath = docsPath;
  }

  async setupHooks(): Promise<void> {
    try {
      console.log(chalk.blue('🔧 Setting up git hooks for document index...'));

      // Check if we're in a git repository
      if (!existsSync('.git')) {
        console.log(chalk.yellow('⚠️ Not in a git repository, skipping hook setup'));
        return;
      }

      // Create pre-push hook
      await this.createPrePushHook();

      // Create post-commit hook
      await this.createPostCommitHook();

      console.log(chalk.green('✅ Git hooks installed successfully'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to setup git hooks:'), error);
      throw error;
    }
  }

  private async createPrePushHook(): Promise<void> {
    const hookPath = '.git/hooks/pre-push';
    const hookContent = `#!/bin/bash

# ScreenGraph Document Index Auto-Update Hook
echo "🔄 Updating document index before push..."

# Check if docs module exists
if [ -d "docs" ]; then
    cd docs
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing docs dependencies..."
        npm install
    fi
    
    # Update document index
    echo "📄 Updating document index..."
    npm run update
    
    # Add updated index to commit if it changed
    if [ -f "DOCUMENT_INDEX.md" ]; then
        git add DOCUMENT_INDEX.md
        echo "📄 Added updated document index to commit"
    fi
    
    cd ..
else
    echo "⚠️ Docs module not found, skipping document index update"
fi

# Normalize .gitignore deterministically for clear diffs across agents
if [ -f ".gitignore" ]; then
    echo "🧹 Normalizing .gitignore..."
    node ./scripts/tools/normalize-gitignore.js --fix

    # Stage if changed
    if ! git diff --quiet -- .gitignore; then
        git add .gitignore
        echo "🧹 Added normalized .gitignore to staging"
    else
        echo "ℹ️ .gitignore already normalized"
    fi
fi

echo "✅ Pre-push hook completed"
`;

    await this.writeHook(hookPath, hookContent);
  }

  private async createPostCommitHook(): Promise<void> {
    const hookPath = '.git/hooks/post-commit';
    const hookContent = `#!/bin/bash

# ScreenGraph Document Index Post-Commit Hook
echo "📄 Checking for documentation changes..."

# Check if any markdown files were modified
if git diff-tree --no-commit-id --name-only -r HEAD | grep -q '\\.md$'; then
    echo "📝 Markdown files detected in commit, updating document index..."
    
    # Check if docs module exists
    if [ -d "docs" ]; then
        cd docs
        
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            echo "📦 Installing docs dependencies..."
            npm install
        fi
        
        # Update document index
        echo "📄 Updating document index..."
        npm run update
        
        # Add updated index to staging
        if [ -f "DOCUMENT_INDEX.md" ]; then
            git add DOCUMENT_INDEX.md
            echo "📄 Added updated document index to staging"
        fi
        
        cd ..
    else
        echo "⚠️ Docs module not found, skipping document index update"
    fi
else
    echo "ℹ️ No markdown files in commit, skipping document index update"
fi

echo "✅ Post-commit hook completed"
`;

    await this.writeHook(hookPath, hookContent);
  }

  private async writeHook(hookPath: string, content: string): Promise<void> {
    try {
      // Write the hook file
      const fs = await import('fs/promises');
      await fs.writeFile(hookPath, content, 'utf-8');

      // Make it executable
      execSync(`chmod +x ${hookPath}`);

      console.log(chalk.green(`✅ Created hook: ${hookPath}`));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to create hook ${hookPath}:`), error);
      throw error;
    }
  }

  async removeHooks(): Promise<void> {
    try {
      console.log(chalk.blue('🗑️ Removing git hooks...'));

      const hooks = ['.git/hooks/pre-push', '.git/hooks/post-commit'];

      for (const hook of hooks) {
        if (existsSync(hook)) {
          execSync(`rm ${hook}`);
          console.log(chalk.green(`✅ Removed hook: ${hook}`));
        }
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to remove hooks:'), error);
      throw error;
    }
  }

  async checkHooks(): Promise<void> {
    try {
      console.log(chalk.blue('🔍 Checking git hooks status...'));

      const hooks = [
        { path: '.git/hooks/pre-push', name: 'Pre-push' },
        { path: '.git/hooks/post-commit', name: 'Post-commit' },
      ];

      for (const hook of hooks) {
        if (existsSync(hook.path)) {
          console.log(chalk.green(`✅ ${hook.name} hook: installed`));
        } else {
          console.log(chalk.yellow(`⚠️ ${hook.name} hook: not installed`));
        }
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to check hooks:'), error);
      throw error;
    }
  }
}
