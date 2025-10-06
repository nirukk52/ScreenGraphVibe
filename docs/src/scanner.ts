import { readFile, stat } from 'fs/promises';
import { join, relative, dirname } from 'path';
import { glob } from 'glob';
import { DOCS_CONSTANTS } from './config/constants.js';
import type { DocumentInfo, Headline, ScanOptions } from './types/index.js';

export class DocumentScanner {
  private options: ScanOptions;

  constructor(options: Partial<ScanOptions> = {}) {
    this.options = { ...DOCS_CONSTANTS.DEFAULT_SCAN_OPTIONS, ...options };
  }

  async scanDocuments(rootPath: string): Promise<DocumentInfo[]> {
    const documents: DocumentInfo[] = [];
    
    try {
      // Find all markdown files
      const files = await glob(this.options.includePatterns, {
        cwd: rootPath,
        ignore: this.options.excludePatterns,
        absolute: true,
        maxDepth: this.options.maxDepth
      });

      console.log(`Found ${files.length} markdown files`);

      // Process each file
      for (const filePath of files) {
        try {
          const docInfo = await this.processDocument(filePath, rootPath);
          if (docInfo) {
            documents.push(docInfo);
          }
        } catch (error) {
          console.warn(`Failed to process ${filePath}:`, error);
        }
      }

      return documents.sort((a, b) => a.path.localeCompare(b.path));
    } catch (error) {
      console.error('Error scanning documents:', error);
      throw error;
    }
  }

  private async processDocument(filePath: string, rootPath: string): Promise<DocumentInfo | null> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const stats = await stat(filePath);
      const relativePath = relative(rootPath, filePath);
      
      // Extract title and description
      const title = this.extractTitle(content);
      const description = this.extractDescription(content);
      const headlines = this.extractHeadlines(content);
      
      // Generate route (GitHub/local friendly)
      const route = this.generateRoute(relativePath);
      
      return {
        path: relativePath,
        title: title || this.generateTitleFromPath(relativePath),
        description: description || this.generateDescriptionFromContent(content),
        headlines,
        lastModified: stats.mtime,
        size: stats.size,
        route
      };
    } catch (error) {
      console.warn(`Failed to process document ${filePath}:`, error);
      return null;
    }
  }

  private extractTitle(content: string): string | null {
    const match = content.match(DOCS_CONSTANTS.TITLE_REGEX);
    return match ? match[1].trim() : null;
  }

  private extractDescription(content: string): string | null {
    const match = content.match(DOCS_CONSTANTS.DESCRIPTION_REGEX);
    return match ? match[1].trim() : null;
  }

  private extractHeadlines(content: string): Headline[] {
    const headlines: Headline[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const match = line.match(DOCS_CONSTANTS.HEADLINE_REGEX);
      if (match && match[1] && match[2]) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = this.generateId(text);
        
        headlines.push({
          level,
          text,
          id,
          line: index + 1
        });
      }
    });

    return headlines;
  }

  private generateId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private generateRoute(relativePath: string): string {
    // Convert to GitHub/local friendly route
    const route = relativePath
      .replace(/\\/g, '/')
      .replace(/\.md$/i, '');
    
    return `./${route}`;
  }

  private generateTitleFromPath(path: string): string {
    const filename = path.split('/').pop() || path;
    return filename
      .replace(/\.md$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private generateDescriptionFromContent(content: string): string {
    // Extract first paragraph or first few lines
    const lines = content.split('\n');
    let description = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        description = trimmed;
        break;
      }
    }
    
    // Limit to 150 characters
    if (description.length > 150) {
      description = description.substring(0, 147) + '...';
    }
    
    return description || 'No description available';
  }
}
