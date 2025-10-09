export const DOCS_CONSTANTS = {
  // File patterns
  MARKDOWN_PATTERNS: ['**/*.md', '**/*.MD'],
  EXCLUDE_PATTERNS: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/coverage/**',
    '**/playwright-report/**',
    '**/test-results/**',
    '**/*.log',
    '**/*.tmp',
    '**/package-lock.json',
    '**/yarn.lock',
    '**/pnpm-lock.yaml',
  ],

  // Output paths
  INDEX_FILE: 'DOCUMENT_INDEX.md',
  JSON_INDEX_FILE: 'document-index.json',

  // Headline patterns
  HEADLINE_REGEX: /^(#{1,6})\s+(.+)$/gm,
  TITLE_REGEX: /^#\s+(.+)$/m,
  DESCRIPTION_REGEX: /^#\s+.+\n\n(.+)$/m,

  // Categories
  CATEGORIES: {
    README: {
      name: 'Project Overview',
      description: 'Main project documentation and quick start guides',
      patterns: ['README.md', 'readme.md'],
    },
    SETUP: {
      name: 'Setup & Configuration',
      description: 'Environment setup, installation, and configuration guides',
      patterns: ['docs/setup/*.md', 'docs/*SETUP*.md', 'docs/*CONFIG*.md', 'docs/*ENV*.md'],
    },
    DEPLOYMENT: {
      name: 'Deployment & Infrastructure',
      description: 'Production deployment, infrastructure, and hosting guides',
      patterns: ['docs/setup/*DEPLOY*.md', 'docs/setup/*PROD*.md', 'docs/*INFRA*.md'],
    },
    TESTING: {
      name: 'Testing & Quality',
      description: 'Testing strategies, quality assurance, and debugging guides',
      patterns: ['docs/setup/*TEST*.md', 'docs/*DEBUG*.md', 'docs/*QA*.md'],
    },
    DEVELOPMENT: {
      name: 'Development Guidelines',
      description: 'Coding standards, development workflows, and best practices',
      patterns: ['CLAUDE.md', 'docs/*DEV*.md', 'docs/*GUIDE*.md'],
    },
    CREDENTIALS: {
      name: 'Credentials & Security',
      description: 'API keys, credentials, and security-related documentation',
      patterns: ['docs/*CRED*.md', 'docs/*SECRET*.md', 'docs/*KEY*.md'],
    },
    SCRIPTS: {
      name: 'Scripts & Automation',
      description: 'Automation scripts, deployment scripts, and utility guides',
      patterns: ['docs/setup/*SCRIPT*.md', 'docs/*AUTO*.md'],
    },
    ARCHITECTURE: {
      name: 'Architecture',
      description: 'System architecture, module boundaries, and design overviews',
      patterns: [
        'docs/*ARCHITECTURE*.md',
        '*ARCHITECTURE*.md',
        'docs/architecture/*.md',
        'docs/architecture/**/*.md',
        'architecture/*.md',
        'architecture/**/*.md',
      ],
    },
    DECISIONS: {
      name: 'Architecture Decisions (ADR)',
      description: 'Architecture Decision Records documenting key choices and trade-offs',
      patterns: [
        'docs/*DECISIONS*.md',
        'docs/*ADR*.md',
        'docs/decisions/*.md',
        'docs/decisions/**/*.md',
        'docs/adr/*.md',
        'docs/adr/**/*.md',
        '*DECISIONS*.md',
        '*ADR*.md',
        'decisions/*.md',
        'decisions/**/*.md',
        'adr/*.md',
        'adr/**/*.md',
      ],
    },
    SYSTEM_PATTERNS: {
      name: 'System Patterns',
      description: 'Reusable patterns across services, modules, and features',
      patterns: [
        'docs/*PATTERN*.md',
        'docs/system-patterns/*.md',
        'docs/system-patterns/**/*.md',
        '*PATTERN*.md',
        'system-patterns/*.md',
        'system-patterns/**/*.md',
      ],
    },
    TECH_DEBT: {
      name: 'Technical Debt',
      description: 'Known debt, trade-offs, remediation plans, and prioritization',
      patterns: [
        'docs/*TECH*DEBT*.md',
        'docs/*DEBT*.md',
        'docs/tech-debt/*.md',
        'docs/tech-debt/**/*.md',
        '*TECH*DEBT*.md',
        '*DEBT*.md',
        'tech-debt/*.md',
        'tech-debt/**/*.md',
      ],
    },
    WISHLIST: {
      name: 'Good-to-Haves / Wishlist',
      description: 'Future enhancements, nice-to-haves, and ideas backlog',
      patterns: [
        'docs/*GOOD*TO*HAVE*.md',
        'docs/*WISH*.md',
        'docs/wishlist/*.md',
        'docs/wishlist/**/*.md',
        '*GOOD*TO*HAVE*.md',
        '*WISH*.md',
        'wishlist/*.md',
        'wishlist/**/*.md',
      ],
    },
  },

  // Memory keys
  MEMORY_KEYS: {
    DOCUMENT_INDEX: 'document_index',
    LAST_SCAN: 'last_document_scan',
    SCAN_STATS: 'scan_statistics',
  },

  // Default options
  DEFAULT_SCAN_OPTIONS: {
    includePatterns: ['**/*.md'] as string[],
    excludePatterns: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.git/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/*.log',
      '**/*.tmp',
    ] as string[],
    maxDepth: 10,
    followSymlinks: false,
  },

  DEFAULT_INDEX_OPTIONS: {
    outputPath: 'DOCUMENT_INDEX.md',
    format: 'markdown' as const,
    includeToc: true,
    includeStats: true,
  },
} as const;
