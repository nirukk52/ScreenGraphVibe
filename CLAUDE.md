# ScreenGraphVibe - AI Assistant Context

> **Purpose**: This file provides comprehensive context and instructions for AI assistants (Claude) working on the ScreenGraphVibe project. This is your primary reference for coding standards, architecture, and workflow.

---

## 🎯 Project Overview

**ScreenGraphVibe** is an AI-driven crawling and verification system for mobile and web apps. It automatically explores applications, captures UI states and actions as structured graphs (Screengraphs), and compares them against baselines.

**Core Technology Stack**:
- **Backend**: Fastify (TypeScript), Drizzle ORM, PostgreSQL/Supabase
- **Frontend**: Next.js 13+, React, Tailwind CSS
- **Mobile Automation**: Python + Appium (Android/iOS)
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **Infrastructure**: Fly.io (multi-region), Supabase
- **Logging**: Pino with OpenTelemetry
- **Documentation**: Auto-indexing with MCP Graphiti memory integration

---

## 🏗️ Architecture: Module Boundaries

The project uses **colon-prefixed module labels** for clear organization:

```
:data                 → Database layer (Drizzle ORM, schema, migrations)
:backend              → Fastify API server (port 3000)
:ui                   → Next.js React frontend (port 3001)
:screengraph-agent    → Python Appium tools (mobile automation)
:tests                → Comprehensive test suite (unit/integration/E2E)
:infra                → Infrastructure management (Fly.io + Supabase)
:logging              → Structured logging (Pino + OpenTelemetry)
:docs                 → Documentation indexing and management
```

**Dependency Flow** (NEVER reverse):
```
:ui → :backend → :data
         ↓
   :screengraph-agent
```

**Key Principle**: Domain → Infrastructure → UI (never reverse)

---

## ⚡ 25 Non-Negotiable Rules

These are your **life and soul**. Follow for every line of code:

### Type Safety (Rules 1-2)
1. **Use generated types only**. No implicit `any`. No widening types.
2. **Never edit schema or types in UI files**. Update contracts or adapters first.

### Constants & Enums (Rules 3-4)
3. **All string literals must come from enums/constants**.
4. **All switches on unions must be exhaustive** (no default clause).

### Validation & Safety (Rules 5-6)
5. **Validate every external input** and normalize unknowns.
6. **No mutation of shared state**; return new objects.

### Testing (Rule 7)
7. **Write or update at least one test for every logic branch added**.

### Schema Evolution (Rule 9)
9. **If backend adds a new field** → update schema → regenerate → map via adapter → test → commit.

### File & Function Size (Rules 10-11)
10. **No file over 400 lines**. Split when it grows.
11. **No function over 50 lines**. Extract helpers or private methods.

### Design Principles (Rules 12-14)
12. **Each class has one reason to change**. SRP (Single Responsibility Principle).
13. **No circular dependencies**. Use clear import boundaries (domain → infra → ui only, never reverse).
14. **Prefer composition over inheritance**. Inject dependencies, don't subclass.

### Module Organization (Rules 15-17)
15. **Use barrel files only at module boundaries**. Prevent deep import chaos.
16. **Separate type declarations** (`.types.ts`) from logic files.
17. **Public API surface per module**. Only expose what's meant for other modules.

### Code Quality (Rules 18-20)
18. **Max 3 nested blocks per function**. Flatten logic; early return over nesting.
19. **Document top of each module**: purpose, dependencies, public API.
20. **Use consistent naming**: noun for types, verb for functions, adjective for flags.

### Documentation & Testing (Rules 21-23)
21. **Document every architectural decision in DECISIONS.md**.
22. **Only E2E tests under :tests**. Rest are in their respective modules so future changes can be cleanly tested. Features should be cleanly dependent on each other so that can be individually tested. Refactor architecture so each `:ui/feature` (like `:ui/feature/screen/graph`, `:ui/feature/time/timingLogic`) can run and test independently. Each feature should have its own fixtures, mocks, and test scripts, while sharing only minimal utilities from `:ui/shared`. No cross-feature imports. CI should detect and run tests only for changed features.
23. **Shared mocks/utilities live in `:tests/_utils`**.

### Architecture (Rules 24-25)
24. **All code, files are modular inside a folder/package**.
25. **Use clean architecture principles always**.

---

## 🚨 Critical Workflow Instructions

### MCP Graphiti Memory System (MANDATORY)

**Before Starting ANY Task**:
1. ✅ **Search first**: Use `search_nodes` tool to look for relevant preferences and procedures
2. ✅ **Search facts**: Use `search_facts` tool for relationships and factual information
3. ✅ **Filter by entity type**: Specify "Preference" or "Procedure" for targeted results
4. ✅ **Review all matches**: Examine any preferences, procedures, or facts that match

**❌ If MCP Graphiti memory system fails or is unavailable**:
- **STOP all task execution and code writing immediately**
- **Do not proceed** with any operations that require memory access
- **Alert user immediately** if memory system is unavailable

**Always Save New Information**:
- Capture requirements immediately with `add_episode` (split long requirements into logical chunks)
- Document procedures clearly
- Record factual relationships
- Label with clear categories for better retrieval

**During Work**:
- Respect discovered preferences
- Follow procedures exactly (step by step)
- Apply relevant facts
- Stay consistent with previously identified preferences, procedures, and facts

---

## 📁 Module-Specific Guidelines

### :data (Database Layer)
- **Schema File**: `data/src/db/schema.ts` (NEVER edit directly from UI)
- **Migrations**: Auto-generated in `data/db/migrations/`
- **Types**: Generated from schema, imported by other modules
- **ORM**: Drizzle with PostgreSQL/Supabase

### :backend (Fastify API)
- **Entry**: `backend/src/index.ts`
- **Routes**: `backend/src/routes/` (health, graph endpoints)
- **Features**: `backend/src/features/` (modular feature organization)
- **Port**: 3000 (local), environment-based for production
- **Health Check**: `/healthz` endpoint with database connectivity

### :ui (Next.js Frontend)
- **Pages**: `ui/src/pages/` (Next.js routing)
- **Features**: `ui/src/features/` (feature-based components)
- **Components**: `ui/src/components/` (shared components)
- **Port**: 3001 (local)
- **API Client**: `ui/src/lib/` (generated from backend contracts)

### :screengraph-agent (Python Appium)
- **Main**: `screengraph-agent/main.py` (FastAPI app)
- **Appium Tools**: `screengraph-agent/src/appium/` (5000+ lines)
- **80+ Tool Metadata Entries**
- **6 Tool Categories**: Connection, Data Gathering, Actions, Device Management, App Management, Navigation
- **Platforms**: Android (UiAutomator2), iOS (XCUITest - placeholder)
- **Tests**: `screengraph-agent/tests/` (pytest with 50+ tests)

### :tests (Testing Suite)
- **Unit**: `tests/src/unit/` (module-specific)
- **Integration**: `tests/src/integration/` (cross-module)
- **E2E**: `tests/src/e2e/` (Playwright full-stack)
- **Fixtures**: `tests/src/fixtures/` (test data)
- **Mocks**: `tests/src/mocks/` (shared mocks)
- **Run All**: `npm test`
- **Run Unit**: `npm run test:unit --workspace=tests`
- **Run Integration**: `npm run test:integration --workspace=tests`
- **Run E2E**: `npm run test:e2e --workspace=tests`

### :docs (Documentation)
- **Auto-indexing**: `docs/src/scanner.ts` + `docs/src/indexer.ts`
- **Memory Integration**: `docs/src/memory.ts` (MCP Graphiti)
- **Git Hooks**: `docs/src/git-hooks.ts` (auto-update on commit/push)
- **Index**: `DOCUMENT_INDEX.md` (auto-generated)
- **Update**: `cd docs && npm run update`

---

## 🧪 Testing Strategy

### Test Philosophy
- **TDD Approach**: Write tests before implementing features
- **Real Infrastructure**: Prefer real databases over mocks
- **Independent Features**: Each feature should test independently
- **Test Location**: Unit/integration tests in module, only E2E in :tests

### Test Requirements
- **Every logic branch** must have at least one test
- **Every new feature** must include tests
- **Every bug fix** must include regression test
- **API changes** must update integration tests
- **UI changes** must update E2E tests

### Test Fixtures
- Feature-specific fixtures in feature directory
- Shared utilities in `:tests/_utils`
- No cross-feature imports

---

## 🔧 Common Commands

### Development
```bash
# Start everything (local)
./start.sh local

# Start backend only
npm run dev:backend

# Start UI only
npm run dev:ui

# Check status
./start.sh status

# Stop all
./stop.sh
```

### Testing
```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit --workspace=tests

# Run integration tests
npm run test:integration --workspace=tests

# Run E2E tests
npm run test:e2e --workspace=tests
```

### Database
```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Open studio
npm run db:studio
```

### Documentation
```bash
# Update documentation index
cd docs && npm run update

# Setup git hooks
cd docs && npm run setup-hooks

# Check memory status
cd docs && npm run status
```

### Deployment
```bash
# Deploy to production
./start.sh prod

# Health check
npm run health
```

---

## 🚫 Files to NEVER Auto-Edit

1. **Schema Files**: `data/src/db/schema.ts` - Update contracts first
2. **Generated Types**: Regenerate from source, don't edit directly
3. **README.md**: Human-facing documentation (update CLAUDE.md instead)
4. **Migration Files**: `data/db/migrations/*.sql` - Never edit after creation
5. **.env files**: Credentials and secrets

---

## 🎨 Code Style Guidelines

### TypeScript/JavaScript
- Use `const` by default, `let` only when reassignment needed
- Prefer arrow functions for callbacks
- Use template literals over string concatenation
- Destructure objects and arrays when readable
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### Python
- Follow PEP 8
- Type hints required for all function signatures
- Async/await for all Appium operations
- Comprehensive docstrings

### Naming Conventions
- **Types/Interfaces**: PascalCase nouns (`User`, `AppConfig`)
- **Functions**: camelCase verbs (`getUserData`, `fetchScreenshot`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- **Flags**: Adjectives/booleans (`isReady`, `hasError`, `canRetry`)
- **Files**: kebab-case (`user-service.ts`, `app-config.ts`)

---

## 📊 Current System Status

### Completed Features
- ✅ Health monitoring system (UI + API)
- ✅ Database connectivity checks
- ✅ Multi-region deployment (US East, US Central, India)
- ✅ Comprehensive testing suite (13+ tests passing)
- ✅ Documentation auto-indexing with MCP memory
- ✅ AppiumTools system (5000+ lines, 80+ tools, 50+ tests)
- ✅ Git hooks for documentation updates

### In Progress / Next Steps
- 🔄 Crawling engine (Appium integration)
- 🔄 Graph generation and storage
- 🔄 Baseline management
- 🔄 Advanced visualization (React Flow)
- 🔄 Queue processing (BullMQ)

---

## 🔍 When in Doubt

1. **Search MCP Graphiti memory first** (search_nodes, search_facts)
2. **Check DOCUMENT_INDEX.md** for relevant documentation
3. **Read the module's `.types.ts` file** for type contracts
4. **Look at existing tests** for usage examples
5. **Ask for clarification** rather than assume

---

## 🌐 URLs & Endpoints

### Local Development
- **Backend**: http://localhost:3000
- **Backend Health**: http://localhost:3000/healthz
- **UI**: http://localhost:3001
- **API Docs**: http://localhost:3000/docs

### Production (Fly.io)
- **Backend**: https://screengraph-backend.fly.dev
- **Backend Health**: https://screengraph-backend.fly.dev/healthz
- **UI**: https://screengraph-ui.fly.dev

---

## 📚 Quick Reference

### Documentation Locations
- **Main README**: `README.md` (human-focused)
- **This File**: `CLAUDE.md` (AI-focused)
- **Documentation Index**: `DOCUMENT_INDEX.md` (auto-generated)
- **Setup Guides**: `docs/setup/` (LOCAL_SETUP.md, PRODUCTION_SETUP.md, etc.)
- **Credentials**: `docs/CREDENTIALS.md` ⚠️ (DO NOT COMMIT)
- **Appium Summary**: `APPIUM_TOOLS_SUMMARY.md` (implementation details)

### Key Type Files
- **Backend Types**: `backend/src/types/index.ts`
- **Data Types**: `data/src/types/app-launch-config.ts`
- **UI Types**: `ui/src/types/index.ts`
- **Appium Types**: `screengraph-agent/src/appium/types.py`

### Test Files
- **Base Test**: `tests/src/fixtures/base.test.ts` (foundation)
- **Health Integration**: `tests/src/integration/health.integration.test.ts`
- **E2E Health**: `tests/src/e2e/health.e2e.test.ts`
- **Appium Tests**: `screengraph-agent/tests/` (pytest suite)

---

## ⚙️ Environment Variables

### Required Variables
```bash
# Database
POSTGRES_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Backend
AGENT_PORT=3000
AGENT_HOST=0.0.0.0

# UI
NEXT_PUBLIC_AGENT_URL=http://localhost:3000

# Environment
NODE_ENV=development|production
```

See `docs/CREDENTIALS.md` for complete reference.

---

## 🎯 Task Execution Mode

### No Code Only Talk Mode
When user says "ask mode" or indicates discussion only:
- Explain concepts without writing code
- Suggest approaches without implementation
- Answer questions without making changes
- Provide guidance without file edits

### Default: Implementation Mode
By default, implement changes rather than only suggesting them:
- Make the changes directly
- Update tests accordingly
- Ensure no broken imports
- Complete the full task

---

## 📝 Documentation Standards

### Module Documentation (Top of Each File)
```typescript
/**
 * @module ModuleName
 * @description Brief description of module purpose
 * @dependencies List of external dependencies
 * @publicAPI Exported functions, classes, types
 */
```

### Function Documentation
```typescript
/**
 * Descriptive function purpose
 * @param paramName - Description
 * @returns Description of return value
 * @throws ErrorType - When error occurs
 */
```

### Python Documentation
```python
"""
Module/function description.

Args:
    param_name: Description

Returns:
    Description of return value

Raises:
    ErrorType: When error occurs
"""
```

---

## 🔄 Incremental Development Philosophy

> "We get to the north star by incremental steps. Focus on the assigned task, not the entire project."

- Complete the specific task assigned
- Don't do extra work beyond what's requested
- Reference README.md for project vision (the "north star")
- Take incremental steps toward that vision
- Each task should be focused and completable

---

**Last Updated**: 2025-10-06
**Version**: 1.0.0
**Maintained By**: AI Assistant (Claude) + Human Team

