export interface DocumentInfo {
  path: string;
  title: string;
  description: string;
  headlines: Headline[];
  lastModified: Date;
  size: number;
  route: string;
}

export interface Headline {
  level: number;
  text: string;
  id: string;
  line: number;
}

export interface DocumentIndex {
  generatedAt: Date;
  totalDocuments: number;
  documents: DocumentInfo[];
  categories: CategoryInfo[];
}

export interface CategoryInfo {
  name: string;
  documents: DocumentInfo[];
  description: string;
}

export interface ScanOptions {
  includePatterns: string[];
  excludePatterns: string[];
  maxDepth: number;
  followSymlinks: boolean;
}

export interface IndexOptions {
  outputPath: string;
  format: 'markdown' | 'json' | 'html';
  includeToc: boolean;
  includeStats: boolean;
}
