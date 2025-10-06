#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { DocumentScanner } from './scanner.js';
import { DocumentIndexer } from './indexer.js';
import { DocumentMemory } from './memory.js';
import { DOCS_CONSTANTS } from './config/constants.js';

const program = new Command();

program
  .name('docs')
  .description('ScreenGraph Documentation Index Management System')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan all documentation files and generate index')
  .option('-r, --root <path>', 'Root directory to scan', '.')
  .option('-o, --output <path>', 'Output file path', DOCS_CONSTANTS.INDEX_FILE)
  .option('-f, --format <format>', 'Output format (markdown|json|html)', 'markdown')
  .option('--no-toc', 'Disable table of contents')
  .option('--no-stats', 'Disable statistics')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🔍 Scanning documentation files...'));
      
      const scanner = new DocumentScanner();
      const documents = await scanner.scanDocuments(options.root);
      
      console.log(chalk.green(`✅ Found ${documents.length} documents`));
      
      const indexer = new DocumentIndexer({
        outputPath: options.output,
        format: options.format as any,
        includeToc: options.toc,
        includeStats: options.stats
      });
      
      const index = await indexer.generateIndex(documents);
      
      console.log(chalk.green(`📄 Generated index: ${options.output}`));
      console.log(chalk.blue(`📊 Categories: ${index.categories.length}`));
      console.log(chalk.blue(`📝 Total headlines: ${index.documents.reduce((sum, doc) => sum + doc.headlines.length, 0)}`));
      
    } catch (error) {
      console.error(chalk.red('❌ Scan failed:'), error);
      process.exit(1);
    }
  });

program
  .command('update')
  .description('Update document index and save to memory')
  .option('-r, --root <path>', 'Root directory to scan', '.')
  .option('-o, --output <path>', 'Output file path', DOCS_CONSTANTS.INDEX_FILE)
  .option('--save-memory', 'Save to memory system', true)
  .action(async (options) => {
    try {
      console.log(chalk.blue('🔄 Updating document index...'));
      
      const scanner = new DocumentScanner();
      const documents = await scanner.scanDocuments(options.root);
      
      console.log(chalk.green(`✅ Found ${documents.length} documents`));
      
      const indexer = new DocumentIndexer({
        outputPath: options.output,
        format: 'markdown',
        includeToc: true,
        includeStats: true
      });
      
      const index = await indexer.generateIndex(documents);
      
      if (options.saveMemory) {
        const memory = new DocumentMemory();
        await memory.saveDocumentIndex(index);
        console.log(chalk.green('💾 Saved to memory system'));
      }
      
      console.log(chalk.green(`📄 Updated index: ${options.output}`));
      
    } catch (error) {
      console.error(chalk.red('❌ Update failed:'), error);
      process.exit(1);
    }
  });

program
  .command('search')
  .description('Search documents in memory')
  .argument('<query>', 'Search query')
  .action(async (query) => {
    try {
      console.log(chalk.blue(`🔍 Searching for: "${query}"`));
      
      const memory = new DocumentMemory();
      const results = await memory.searchDocuments(query);
      
      if (results.length === 0) {
        console.log(chalk.yellow('No results found'));
      } else {
        console.log(chalk.green(`Found ${results.length} results:`));
        results.forEach((result, index) => {
          console.log(chalk.blue(`${index + 1}. ${result.title}`));
          console.log(chalk.gray(`   ${result.description}`));
          console.log(chalk.gray(`   ${result.route}`));
        });
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Search failed:'), error);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show document index status')
  .action(async () => {
    try {
      console.log(chalk.blue('📊 Document Index Status'));
      
      const memory = new DocumentMemory();
      const lastScan = await memory.getLastScanInfo();
      
      if (lastScan) {
        console.log(chalk.green('✅ Memory system connected'));
        console.log(chalk.blue(`📅 Last scan: ${lastScan.lastScan?.toLocaleString() || 'Never'}`));
        console.log(chalk.blue(`📄 Total documents: ${lastScan.totalDocuments || 0}`));
        console.log(chalk.blue(`📂 Categories: ${lastScan.categories || 0}`));
        console.log(chalk.blue(`📝 Headlines: ${lastScan.totalHeadlines || 0}`));
      } else {
        console.log(chalk.yellow('⚠️ No scan information available'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Status check failed:'), error);
      process.exit(1);
    }
  });

program
  .command('clear')
  .description('Clear document memory')
  .action(async () => {
    try {
      console.log(chalk.yellow('🗑️ Clearing document memory...'));
      
      const memory = new DocumentMemory();
      await memory.clearMemory();
      
      console.log(chalk.green('✅ Memory cleared'));
      
    } catch (error) {
      console.error(chalk.red('❌ Clear failed:'), error);
      process.exit(1);
    }
  });

// Auto-run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}

export { DocumentScanner, DocumentIndexer, DocumentMemory };
