# @screengraph/persona-management

Purpose: Backend logic for managing `.mcp/personas/*.json` files, including schema, adapters, and utilities.

## Module Boundaries

- Reads/writes persona JSON files
- Validates with Zod schemas
- Provides adapters for backend routes
- No UI code here (UI lives in `:ui/features/management/persona-management`)

## Scripts

```bash
npm run build      # Compile TypeScript
npm run dev        # Watch mode
npm test           # Run unit tests
npm run test:watch # Watch tests
```

## Structure

```
src/
├── schemas/       # Zod schemas for persona validation
├── adapters/      # File I/O adapters
├── types/         # TypeScript types
└── index.ts       # Public API
```

