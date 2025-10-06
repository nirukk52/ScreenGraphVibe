# Testing Guide

ScreenGraph uses a comprehensive testing strategy with unit, integration, and end-to-end tests across all modules.

## Test Structure

### Modules & Test Types

| Module | Framework | Test Types | Location |
|--------|-----------|------------|----------|
| **:tests** | Vitest, Playwright | Unit, Integration, E2E | `tests/src/` |
| **:agent** | Vitest | Unit | `agent/src/` |
| **:ui** | Vitest, RTL | Unit | `ui/src/` |
| **:data** | N/A | No tests (schema only) | - |

## Running Tests

### Quick Commands

```bash
# Run all tests across workspaces (exits after completion)
npm test

# Run specific test types from tests module
cd tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
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
cd agent && npm test       # Agent unit tests
cd ui && npm test         # UI unit tests
cd data && npm test       # No tests (echo message)
```

## Test Configuration

### Vitest Configuration

- **Unit Tests**: `tests/vitest.config.ts`
- **Integration Tests**: `tests/vitest.integration.config.ts`
- **Module Tests**: Each module has its own vitest config

### Key Features

- **Auto-exit**: All test commands use `--run` flag to exit after completion
- **Watch Mode**: Available via `:watch` commands for development
- **Module Aliases**: Configured for cross-module imports
- **Environment**: Node.js environment for all tests
- **Timeout**: 10 second timeout for all tests

## Test Types Explained

### Unit Tests (`tests/src/unit/`)
- **Purpose**: Test individual functions and classes in isolation
- **Framework**: Vitest
- **Pattern**: One test file per source file
- **Mocking**: Minimal, only for external dependencies
- **Examples**:
  - `health.test.ts` - Health check functionality
  - `infra/config.test.ts` - Configuration management
  - `infra/fly.test.ts` - Fly.io deployment logic

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
1. **Mirror structure**: Tests mirror source code structure
2. **Clear naming**: `*.test.ts` for test files
3. **Single responsibility**: One test file per source file
4. **Descriptive names**: Test names describe behavior

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

## Related Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guidelines
- [README.md](./README.md) - Project overview
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
