# :docs - ScreenGraph Documentation Index System

A fully runnable module for maintaining a comprehensive index of all documentation in the ScreenGraph project. Automatically scans, categorizes, and indexes all markdown files with intelligent routing and memory integration.

## 🚀 Quick Start

```bash
# Install dependencies
cd docs
npm install

# Scan and generate index
npm run scan

# Update index and save to memory
npm run update

# Search documents
npm run search "health check"

# Check status
npm run status
```

## 📋 Features

- **🔍 Auto-scanning**: Automatically finds all markdown files in the project
- **📂 Smart categorization**: Groups documents by type (Setup, Testing, Deployment, etc.)
- **🔗 Intelligent routing**: Generates GitHub/local friendly links
- **📊 Rich metadata**: Extracts titles, descriptions, headlines, and statistics
- **💾 Memory integration**: Saves to MCP Graphiti memory system
- **🔄 Auto-update**: Git hooks for automatic index updates on push
- **🎨 Multiple formats**: Markdown, JSON, and HTML output
- **📱 Responsive**: Works on GitHub, locally, and in CI/CD

## 🏗️ Architecture

```
docs/
├── src/
│   ├── scanner.ts          # Document scanning and parsing
│   ├── indexer.ts          # Index generation and formatting
│   ├── memory.ts           # Memory system integration
│   ├── git-hooks.ts        # Git hook management
│   ├── index.ts            # CLI interface
│   ├── scan.ts             # Scan command
│   ├── update.ts           # Update command
│   ├── types/              # TypeScript interfaces
│   └── config/             # Constants and configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 📖 Usage

### Command Line Interface

```bash
# Scan documents and generate index
npm run scan

# Update index and save to memory
npm run update

# Search documents
npm run search "query"

# Check system status
npm run status

# Clear memory
npm run clear
```

### Programmatic Usage

```typescript
import { DocumentScanner, DocumentIndexer, DocumentMemory } from './src/index.js';

// Scan documents
const scanner = new DocumentScanner();
const documents = await scanner.scanDocuments('.');

// Generate index
const indexer = new DocumentIndexer({
  outputPath: 'DOCUMENT_INDEX.md',
  format: 'markdown',
  includeToc: true,
  includeStats: true
});
const index = await indexer.generateIndex(documents);

// Save to memory
const memory = new DocumentMemory();
await memory.saveDocumentIndex(index);
```

## 📂 Document Categories

The system automatically categorizes documents into:

- **📋 Project Overview**: README files and main documentation
- **⚙️ Setup & Configuration**: Environment setup, installation guides
- **🚀 Deployment & Infrastructure**: Production deployment, hosting guides
- **🧪 Testing & Quality**: Testing strategies, debugging guides
- **💻 Development Guidelines**: Coding standards, best practices
- **🔐 Credentials & Security**: API keys, security documentation
- **🤖 Scripts & Automation**: Automation scripts, utility guides

## 🔗 Generated Links

The system generates intelligent links that work:

- **GitHub**: `./README.md` → `https://github.com/user/repo/blob/main/README.md`
- **Local**: `./README.md` → `file:///path/to/README.md`
- **Sections**: `./README.md#quick-start` → Direct section links

## 💾 Memory Integration

Integrates with MCP Graphiti memory system to:

- Store document metadata
- Track scan statistics
- Enable document search
- Maintain index history

## 🔄 Auto-Update System

### Git Hooks

Automatically updates the document index when:

- **Pre-push**: Updates index before pushing changes
- **Post-commit**: Updates index after committing markdown changes

### Setup Hooks

```bash
# Install git hooks
npm run setup-hooks

# Check hook status
npm run check-hooks

# Remove hooks
npm run remove-hooks
```

## 📊 Output Formats

### Markdown Index

```markdown
# ScreenGraph Documentation Index

> Auto-generated on 2024-01-15T10:30:00.000Z
> Total Documents: 11

## 📚 Table of Contents

### Project Overview
- [README](./README.md) - AI-driven crawling and verification system
- [CLAUDE](./CLAUDE.md) - Development guidelines and architecture

### Setup & Configuration
- [LOCAL_SETUP](./LOCAL_SETUP.md) - Complete local development guide
- [PRODUCTION_SETUP](./PRODUCTION_SETUP.md) - Production deployment guide
```

### JSON Index

```json
{
  "generatedAt": "2024-01-15T10:30:00.000Z",
  "totalDocuments": 11,
  "documents": [
    {
      "path": "README.md",
      "title": "ScreenGraph",
      "description": "AI-driven crawling and verification system",
      "headlines": [...],
      "lastModified": "2024-01-15T10:00:00.000Z",
      "size": 15420,
      "route": "./README.md"
    }
  ],
  "categories": [...]
}
```

## 🛠️ Configuration

### Scan Options

```typescript
const scanner = new DocumentScanner({
  includePatterns: ['**/*.md', '**/*.MD'],
  excludePatterns: ['node_modules/**', 'dist/**'],
  maxDepth: 10,
  followSymlinks: false
});
```

### Index Options

```typescript
const indexer = new DocumentIndexer({
  outputPath: 'DOCUMENT_INDEX.md',
  format: 'markdown', // 'markdown' | 'json' | 'html'
  includeToc: true,
  includeStats: true
});
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test
npm test -- scanner.test.ts
```

## 📈 Statistics

The system tracks:

- Total documents
- Categories count
- Headlines count
- File sizes
- Last modified dates
- Scan timestamps

## 🔧 Development

### Adding New Categories

Edit `src/config/constants.ts`:

```typescript
CATEGORIES: {
  'NEW_CATEGORY': {
    name: 'New Category',
    description: 'Description of new category',
    patterns: ['*NEW*.md', '*CATEGORY*.md']
  }
}
```

### Custom Patterns

Add custom file patterns:

```typescript
const scanner = new DocumentScanner({
  includePatterns: ['**/*.md', '**/*.rst', '**/*.txt'],
  excludePatterns: ['**/temp/**', '**/cache/**']
});
```

## 🚀 Integration

### CI/CD Pipeline

```yaml
# .github/workflows/docs.yml
- name: Update Documentation Index
  run: |
    cd docs
    npm install
    npm run update
    git add DOCUMENT_INDEX.md
    git commit -m "docs: update document index"
```

### Package.json Scripts

```json
{
  "scripts": {
    "docs:scan": "cd docs && npm run scan",
    "docs:update": "cd docs && npm run update",
    "docs:search": "cd docs && npm run search"
  }
}
```

## 📝 Best Practices

1. **Keep documents organized**: Use clear naming conventions
2. **Update index regularly**: Run `npm run update` after changes
3. **Use descriptive titles**: Help with categorization
4. **Include descriptions**: First paragraph should describe the document
5. **Use proper headings**: Structure documents with clear hierarchy

## 🐛 Troubleshooting

### Common Issues

**Scan fails with "Cannot find module"**
```bash
cd docs
npm install
```

**Memory integration fails**
```bash
# Check if MCP Graphiti is running
npm run status
```

**Git hooks not working**
```bash
# Reinstall hooks
npm run setup-hooks
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=docs:* npm run scan
```

## 📚 Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Development guidelines
- [README.md](../README.md) - Project overview
- [TESTING.md](../TESTING.md) - Testing strategies

---

**Happy documenting! 📚✨**
