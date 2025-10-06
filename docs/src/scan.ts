#!/usr/bin/env node

import { DocumentScanner } from './scanner.js';
import { DocumentIndexer } from './indexer.js';
import { DocumentMemory } from './memory.js';
import { DOCS_CONSTANTS } from './config/constants.js';
import chalk from 'chalk';

async function main() {
  try {
    console.log(chalk.blue('🔍 ScreenGraph Documentation Scanner'));
    console.log(chalk.gray('Scanning for markdown files...'));
    
    // Scan documents
    const scanner = new DocumentScanner();
    const documents = await scanner.scanDocuments('.');
    
    console.log(chalk.green(`✅ Found ${documents.length} documents`));
    
    // Generate index
    const indexer = new DocumentIndexer({
      outputPath: DOCS_CONSTANTS.INDEX_FILE,
      format: 'markdown',
      includeToc: true,
      includeStats: true
    });
    
    const index = await indexer.generateIndex(documents);
    
    // Save to memory
    const memory = new DocumentMemory();
    await memory.saveDocumentIndex(index);
    
    console.log(chalk.green('📄 Generated document index'));
    console.log(chalk.blue(`📊 Categories: ${index.categories.length}`));
    console.log(chalk.blue(`📝 Total headlines: ${index.documents.reduce((sum, doc) => sum + doc.headlines.length, 0)}`));
    
  } catch (error) {
    console.error(chalk.red('❌ Scan failed:'), error);
    process.exit(1);
  }
}

main();
