import { writeFile } from 'fs/promises';
import { join } from 'path';
import { DOCS_CONSTANTS } from './config/constants.js';
import type { DocumentInfo, DocumentIndex, CategoryInfo, IndexOptions } from './types/index.js';

export class DocumentIndexer {
  private options: IndexOptions;

  constructor(options: Partial<IndexOptions> = {}) {
    this.options = { ...DOCS_CONSTANTS.DEFAULT_INDEX_OPTIONS, ...options };
  }

  async generateIndex(documents: DocumentInfo[], outputPath?: string): Promise<DocumentIndex> {
    const categories = this.categorizeDocuments(documents);

    const index: DocumentIndex = {
      generatedAt: new Date(),
      totalDocuments: documents.length,
      documents,
      categories,
    };

    const finalOutputPath = outputPath || this.options.outputPath;

    switch (this.options.format) {
      case 'markdown':
        await this.generateMarkdownIndex(index, finalOutputPath);
        break;
      case 'json':
        await this.generateJsonIndex(index, finalOutputPath);
        break;
      case 'html':
        await this.generateHtmlIndex(index, finalOutputPath);
        break;
    }

    return index;
  }

  private categorizeDocuments(documents: DocumentInfo[]): CategoryInfo[] {
    const categories: CategoryInfo[] = [];

    for (const [categoryKey, categoryConfig] of Object.entries(DOCS_CONSTANTS.CATEGORIES)) {
      const categoryDocs = documents.filter((doc) =>
        categoryConfig.patterns.some((pattern) => this.matchesPattern(doc.path, pattern)),
      );

      if (categoryDocs.length > 0) {
        categories.push({
          name: categoryConfig.name,
          documents: categoryDocs,
          description: categoryConfig.description,
        });
      }
    }

    // Add uncategorized documents
    const categorizedPaths = new Set(
      categories.flatMap((cat) => cat.documents.map((doc) => doc.path)),
    );

    const uncategorized = documents.filter((doc) => !categorizedPaths.has(doc.path));

    if (uncategorized.length > 0) {
      categories.push({
        name: 'Other Documentation',
        documents: uncategorized,
        description: 'Additional documentation files',
      });
    }

    return categories;
  }

  private matchesPattern(path: string, pattern: string): boolean {
    // Simple pattern matching (can be enhanced with glob patterns)
    const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.').toLowerCase());
    return regex.test(path.toLowerCase());
  }

  private async generateMarkdownIndex(index: DocumentIndex, outputPath: string): Promise<void> {
    let content = `# ScreenGraph Documentation Index

> **Auto-generated on ${index.generatedAt.toISOString()}**  
> **Total Documents: ${index.totalDocuments}**

This is the comprehensive index of all documentation in the ScreenGraph project. Each document includes its title, description, and direct links to sections.

---

`;

    if (this.options.includeToc) {
      content += this.generateTableOfContents(index);
      content += '\n---\n\n';
    }

    // Generate content for each category
    for (const category of index.categories) {
      content += this.generateCategorySection(category);
    }

    if (this.options.includeStats) {
      content += this.generateStatistics(index);
    }

    await writeFile(outputPath, content, 'utf-8');
    console.log(`📄 Generated markdown index: ${outputPath}`);
  }

  private generateTableOfContents(index: DocumentIndex): string {
    let toc = '## 📚 Table of Contents\n\n';

    for (const category of index.categories) {
      toc += `### ${category.name}\n`;
      for (const doc of category.documents) {
        toc += `- [${doc.title}](${doc.route}) - ${doc.description}\n`;
      }
      toc += '\n';
    }

    return toc;
  }

  private generateCategorySection(category: CategoryInfo): string {
    let content = `## ${category.name}\n\n`;
    content += `*${category.description}*\n\n`;

    for (const doc of category.documents) {
      content += `### 📄 [${doc.title}](${doc.route})\n\n`;
      content += `**Description:** ${doc.description}\n\n`;
      content += `**Path:** \`${doc.path}\`\n`;
      content += `**Last Modified:** ${doc.lastModified.toLocaleDateString()}\n`;
      content += `**Size:** ${this.formatFileSize(doc.size)}\n\n`;

      if (doc.headlines.length > 0) {
        content += `**Sections:**\n`;
        for (const headline of doc.headlines) {
          const indent = '  '.repeat(headline.level - 1);
          const link = `${doc.route}#${headline.id}`;
          content += `${indent}- [${headline.text}](${link})\n`;
        }
        content += '\n';
      }

      content += '---\n\n';
    }

    return content;
  }

  private generateStatistics(index: DocumentIndex): string {
    const totalSize = index.documents.reduce((sum, doc) => sum + doc.size, 0);
    const avgSize = Math.round(totalSize / index.documents.length);

    const headlinesCount = index.documents.reduce((sum, doc) => sum + doc.headlines.length, 0);

    return `## 📊 Statistics

- **Total Documents:** ${index.totalDocuments}
- **Total Categories:** ${index.categories.length}
- **Total Headlines:** ${headlinesCount}
- **Average Document Size:** ${this.formatFileSize(avgSize)}
- **Total Size:** ${this.formatFileSize(totalSize)}
- **Generated:** ${index.generatedAt.toLocaleString()}

---
`;
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  private async generateJsonIndex(index: DocumentIndex, outputPath: string): Promise<void> {
    const jsonContent = JSON.stringify(index, null, 2);
    await writeFile(outputPath, jsonContent, 'utf-8');
    console.log(`📄 Generated JSON index: ${outputPath}`);
  }

  private async generateHtmlIndex(index: DocumentIndex, outputPath: string): Promise<void> {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ScreenGraph Documentation Index</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .category { margin-bottom: 40px; }
        .document { background: #fff; border: 1px solid #e1e5e9; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .headlines { margin-top: 15px; }
        .headline { margin-left: 20px; margin-bottom: 5px; }
        .stats { background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>ScreenGraph Documentation Index</h1>
        <p>Generated on ${index.generatedAt.toISOString()}</p>
        <p>Total Documents: ${index.totalDocuments}</p>
    </div>
`;

    for (const category of index.categories) {
      html += `    <div class="category">
        <h2>${category.name}</h2>
        <p><em>${category.description}</em></p>
`;

      for (const doc of category.documents) {
        html += `        <div class="document">
            <h3><a href="${doc.route}">${doc.title}</a></h3>
            <p><strong>Description:</strong> ${doc.description}</p>
            <p><strong>Path:</strong> <code>${doc.path}</code></p>
            <p><strong>Last Modified:</strong> ${doc.lastModified.toLocaleDateString()}</p>
            <p><strong>Size:</strong> ${this.formatFileSize(doc.size)}</p>
`;

        if (doc.headlines.length > 0) {
          html += `            <div class="headlines">
                <h4>Sections:</h4>
`;
          for (const headline of doc.headlines) {
            const indent = '                '.repeat(headline.level - 1);
            const link = `${doc.route}#${headline.id}`;
            html += `${indent}<div class="headline"><a href="${link}">${headline.text}</a></div>
`;
          }
          html += `            </div>
`;
        }

        html += `        </div>
`;
      }

      html += `    </div>
`;
    }

    if (this.options.includeStats) {
      const totalSize = index.documents.reduce((sum, doc) => sum + doc.size, 0);
      const avgSize = Math.round(totalSize / index.documents.length);
      const headlinesCount = index.documents.reduce((sum, doc) => sum + doc.headlines.length, 0);

      html += `    <div class="stats">
        <h2>Statistics</h2>
        <ul>
            <li>Total Documents: ${index.totalDocuments}</li>
            <li>Total Categories: ${index.categories.length}</li>
            <li>Total Headlines: ${headlinesCount}</li>
            <li>Average Document Size: ${this.formatFileSize(avgSize)}</li>
            <li>Total Size: ${this.formatFileSize(totalSize)}</li>
        </ul>
    </div>
`;
    }

    html += `</body>
</html>`;

    await writeFile(outputPath, html, 'utf-8');
    console.log(`📄 Generated HTML index: ${outputPath}`);
  }
}
