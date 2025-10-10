# :management - Operational Management Tools

**Operational tooling for ScreenGraph infrastructure management.**

## Purpose

This module provides operational management tools for monitoring, health checks, and infrastructure management across ScreenGraph services.

## Sub-Modules

### `graphiti-management/`

Graphiti MCP connectivity management with automatic retry and recovery.

**Features:**
- Automatic retry (30s intervals, 4 attempts)
- Best-effort recovery (JSON file trigger)
- 2-minute cooldown after max retries
- CLI for monitoring and status checks

**Usage:**
```bash
# From root
npm run graphiti:monitor    # Start monitoring
npm run graphiti:status     # Check status

# From management/
npm run monitor
npm run status
```

## Architecture

**Module Boundary:** `:management`
- **Purpose:** Operational tooling and infrastructure management
- **Dependencies:** Node.js, Commander, Chalk
- **Consumers:** Root scripts, CI/CD pipelines

**Module Organization:**
```
management/
├── graphiti-management/
│   └── src/
│       ├── manager.ts      # Core retry/recovery logic
│       ├── cli.ts          # CLI commands
│       └── types.ts        # (future) Shared types
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
# Install dependencies
npm install

# Run monitor in dev mode
npm run dev

# Run tests
npm test
npm run test:watch
```

## Design Principles

- **Single Responsibility:** Only operational management concerns
- **Clean Architecture:** Infrastructure layer, no domain logic
- **Testable:** Unit tests for all management logic
- **Composable:** Easy to add new management tools

## Future Extensions

- Health dashboard
- Metrics collector
- Alert management
- Service orchestration

