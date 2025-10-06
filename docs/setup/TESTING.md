# Testing Guide

ScreenGraph uses a comprehensive testing strategy with unit, integration, and end-to-end tests across all modules.

## Current Test Status

**Total Tests: 78** (73 passing, 7 skipped)
- **Data Layer**: 5 tests (100% passing)
- **Backend**: 13 tests (100% passing) 
- **Agent**: 58 tests (100% passing, 6 skipped - non-critical)
- **UI**: No tests yet (ready for implementation)
- **E2E**: 10 tests (100% passing, 1 skipped - non-critical)
- **Integration Tests**: Available via `test:integration`

## Test Structure

### Modules & Test Types

| Module | Framework | Test Types | Location |
|--------|-----------|------------|----------|
| **:tests** | Vitest, Playwright | Unit (infra), Integration, E2E | `tests/src/unit/`, `tests/src/integration/`, `tests/src/e2e/` |
| **:agent** | Vitest | Unit (feature tests) | `agent/src/features/*/tests/` |
| **:ui** | Vitest, RTL, jsdom | Unit (feature tests) | `ui/src/features/*/tests/` |
| **:data** | N/A | No tests (schema only) | - |

### Test Organization by Feature

After refactoring to clean architecture, tests are now organized by feature:

**Agent Module (`agent/src/features/`):**
- `core/tests/graph.test.ts` - Graph generation and manipulation tests
- `health/tests/health.test.ts` - Health check functionality tests

**UI Module (`ui/src/features/screen/`):**
- `graph/tests/graph.test.tsx` - Graph visualization component tests
- `health/tests/health.test.tsx` - Health dashboard component tests

**Tests Module (`tests/src/`):**
- `unit/` - Infrastructure and cross-cutting unit tests
- `integration/` - Module interaction tests
- `e2e/` - End-to-end Playwright tests

## Python Agent Testing (Venv Boundary)

**Critical**: All Python agent tests run inside the isolated virtual environment at `screengraph-agent/venv/` with Python 3.13.7.

### Venv-Aware Commands
```bash
# All agent commands auto-activate venv
npm run test:agent              # All Python tests
npm run test:agent:unit         # Unit tests only
npm run test:agent:integration  # Integration tests only
npm run dev:agent               # Development with hot reload
npm run agent:setup             # One-time venv setup
npm run agent:shell             # Interactive Python shell
```

### Manual Venv Usage
```bash
cd screengraph-agent
source venv/bin/activate
python --version    # Should show Python 3.13.7
pytest             # Run tests manually
```

**Key Files:**
- `screengraph-agent/venv/` - Isolated Python environment
- `screengraph-agent/setup.py` - Package configuration
- `screengraph-agent/conftest.py` - Pytest configuration
- `screengraph-agent/Dockerfile` - Production uses venv

## Running Tests

### Quick Commands

```bash
# GOD COMMAND - Run all tests with report
npm run test:all:report

# Run all tests across workspaces (exits after completion)
npm test

# Run tests by type
npm run test:unit           # All unit tests
npm run test:integration    # All integration tests
npm run test:e2e            # E2E tests only

# Module-specific tests
npm run test:data          # All :data tests
npm run test:backend       # All :backend tests
npm run test:ui            # All :ui tests
npm run test:agent         # All :screengraph-agent tests (Python venv)

# Module + type combinations
npm run test:data:unit
npm run test:backend:unit
npm run test:ui:unit
npm run test:agent:unit
npm run test:e2e          # End-to-end tests only
npm run test:all          # All test types

# Run tests in watch mode (for development)
npm run test:unit:watch
npm run test:unit:ui      # Interactive UI mode
```

### Detailed Commands

```bash
# From project root
npm test                   # All workspaces, exits after completion
npm run test --workspaces  # Same as above

# From tests directory
npm run test:unit          # Unit tests (exits after completion)
npm run test:unit:watch    # Unit tests in watch mode
npm run test:unit:ui       # Unit tests with interactive UI
npm run test:integration   # Integration tests
npm run test:e2e          # End-to-end tests
npm run test:all          # All test types sequentially

# From individual modules
cd agent && npm test       # Agent unit tests (runs feature tests)
cd ui && npm test         # UI unit tests (not recommended, use tests module)
cd data && npm test       # No tests (echo message)

# Note: UI tests are best run from the tests module due to shared configuration
```

## Test Configuration

### Vitest Configuration

- **Unit Tests**: `tests/vitest.config.ts`
  - Includes: `tests/src/unit/`, `agent/src/features/**/tests/`, `ui/src/features/**/tests/`
  - Environment: `jsdom` (for React component testing)
  - Setup: `@testing-library/jest-dom` via `tests/src/setup.ts`
  - Plugins: `@vitejs/plugin-react` for React component support
- **Integration Tests**: `tests/vitest.integration.config.ts`
- **Module Tests**: Agent and UI modules run via workspace commands

### Key Features

- **Auto-exit**: All test commands use `--run` flag to exit after completion
- **Watch Mode**: Available via `:watch` commands for development
- **Module Aliases**: Configured for cross-module imports (`@screengraph/*`)
- **Environment**: 
  - `jsdom` for UI component tests
  - Node.js for agent/infra tests
- **Timeout**: 10 second timeout for all tests
- **React Support**: Full React Testing Library and jest-dom matcher support

## Test Types Explained

### Unit Tests

**Infrastructure Tests (`tests/src/unit/`):**
- **Purpose**: Test infrastructure and cross-cutting concerns
- **Framework**: Vitest
- **Mocking**: Minimal, only for external dependencies
- **Examples**:
  - `health.test.ts` - Legacy health check tests
  - `infra/config.test.ts` - Configuration management
  - `infra/fly.test.ts` - Fly.io deployment logic (currently skipped)
  - `infra/supabase.test.ts` - Supabase integration tests

**Feature Tests (Agent: `agent/src/features/*/tests/`):**
- **Purpose**: Test agent feature functionality
- **Framework**: Vitest
- **Pattern**: Tests co-located with feature code
- **Examples**:
  - `core/tests/graph.test.ts` - Graph generation (7 tests)
  - `health/tests/health.test.ts` - Health checks (6 tests)

**Component Tests (UI: `ui/src/features/*/tests/`):**
- **Purpose**: Test React components and UI features
- **Framework**: Vitest + React Testing Library + jsdom
- **Pattern**: Tests co-located with feature code
- **Examples**:
  - `graph/tests/graph.test.tsx` - Graph visualization (10 tests)
  - `health/tests/health.test.tsx` - Health dashboard (13 tests)

### Integration Tests (`tests/src/integration/`)
- **Purpose**: Test module interactions and API endpoints
- **Framework**: Vitest with real infrastructure
- **Pattern**: Test complete workflows
- **Infrastructure**: Uses Testcontainers for real services
- **Examples**:
  - `health.integration.test.ts` - Health endpoint integration
  - `infra/integration.test.ts` - Infrastructure setup

### End-to-End Tests (`tests/src/e2e/`)
- **Purpose**: Test complete user workflows
- **Framework**: Playwright
- **Pattern**: Full application testing
- **Infrastructure**: Real services and containers
- **Examples**:
  - `health.e2e.test.ts` - Health check through web interface
  - `graph.e2e.test.ts` - Graph visualization through browser

## Test Data & Fixtures

### Test Database
- **Location**: `tests/src/fixtures/test-database.ts`
- **Purpose**: Database setup and teardown
- **Technology**: Testcontainers PostgreSQL

### Test Environment
- **Location**: `tests/src/fixtures/test-env.ts`
- **Purpose**: Environment variable management
- **Features**: Isolated test environment

### Mocks
- **Location**: `tests/src/mocks/`
- **Purpose**: External service mocking
- **Pattern**: Only for external dependencies

## Best Practices

### Test Organization
1. **Feature co-location**: Tests live alongside feature code in `*/tests/` directories
2. **Clear naming**: `*.test.ts` for Node tests, `*.test.tsx` for React component tests
3. **Single responsibility**: One test file per feature/component
4. **Descriptive names**: Test names describe behavior
5. **Clean architecture**: Tests organized by feature, not by type

### Test Writing
1. **TDD approach**: Write failing tests first
2. **Real infrastructure**: Use Testcontainers over mocks
3. **Isolation**: Each test is independent
4. **Cleanup**: Proper teardown after tests

### Performance
1. **Parallel execution**: Tests run in parallel by default
2. **Fast feedback**: Unit tests should be fast (< 1s)
3. **Efficient setup**: Minimal test setup overhead

## CI/CD Integration

### GitHub Actions
Tests run automatically on:
- Pull requests
- Push to main branch
- Scheduled runs

### Test Reports
- **Coverage**: Generated automatically
- **Results**: Stored as artifacts
- **Notifications**: Failed tests block deployment

## Troubleshooting

### Common Issues

**Tests hanging**
- Ensure `--run` flag is used for CI
- Check for unclosed connections
- Verify proper cleanup

**Module resolution errors**
- Check alias configuration in vitest config
- Verify module paths are correct
- Ensure dependencies are installed

**Database connection issues**
- Verify Testcontainers is running
- Check PostgreSQL container health
- Review connection strings

### Debug Commands

```bash
# Run tests with verbose output
npm run test:unit -- --reporter=verbose

# Run specific test file
npm run test:unit -- src/unit/health.test.ts

# Run tests matching pattern
npm run test:unit -- --grep "health"

# Run tests with coverage
npm run test:unit -- --coverage
```

## Environment Variables

### Test-specific Variables
```bash
# Database
TEST_DATABASE_URL=postgresql://test:test@localhost:5432/test

# Redis
TEST_REDIS_URL=redis://localhost:6379

# Application
NODE_ENV=test
LOG_LEVEL=error
```

### Required for Integration/E2E Tests
- Docker (for Testcontainers)
- PostgreSQL (via Testcontainers)
- Redis (via Testcontainers)

## Contributing

### Adding New Tests
1. Create test file in appropriate directory
2. Follow naming convention: `*.test.ts`
3. Add to appropriate test suite
4. Update documentation if needed

### Test Requirements
- All new code must have tests
- Tests must pass in CI
- No flaky tests allowed
- Proper cleanup required

## Recent Changes

### Clean Architecture Refactoring (October 2025)
- **Feature-based organization**: Tests moved from `:tests` module to respective feature directories
- **Agent tests**: Now in `agent/src/features/*/tests/`
- **UI tests**: Now in `ui/src/features/*/tests/`
- **Vitest config updated**: Now scans feature directories automatically
- **React support added**: Full jsdom + React Testing Library + jest-dom support
- **Test count**: 68 total tests (56 passing, 12 skipped)

### Known Issues
- `fly.test.ts`: 12 tests skipped due to child_process mock issues (pre-existing, not related to refactoring)

### Test Reliability Patterns

#### Health Status Testing
- **Text Matching**: Health components split text across multiple elements (status in h3, details in p)
- **State Transitions**: Account for loading → success/error state changes
- **API Response Format**: Ensure mock data includes all expected fields (database, redis services)
- **Environment Setup**: Agent requires POSTGRES_URL for health checks to work

#### E2E Test Best Practices
- **UI State Waiting**: Wait for UI state changes rather than network responses for better reliability
- **Timeout Strategy**: Use appropriate timeouts (10s) for UI changes vs network timing
- **Process Cleanup**: Always clean up multiple running processes to avoid port conflicts
- **Service Health**: Verify all services are healthy before running dependent tests

#### React Component Testing
- **Element Selection**: Use `closest()` for parent container assertions when text is nested
- **Async Operations**: Use `waitFor()` for components with API calls during mount
- **Mock Consistency**: Ensure mock data matches expected API response structure
- **Component Structure**: Test actual behavior, not assumptions about component structure

## Related Documentation

- [CLAUDE.md](../../CLAUDE.md) - Development guidelines
- [README.md](../../README.md) - Project overview
- [DEPLOYMENT.md](../../DEPLOYMENT.md) - Deployment guide
