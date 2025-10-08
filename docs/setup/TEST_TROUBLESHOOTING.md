# Test Troubleshooting Guide

This document captures common test issues and their solutions encountered during ScreenGraph development.

## Health Status Test Issues

### Problem: Tests looking for "All systems operational" but component shows "Healthy"

**Symptoms:**

- Unit tests fail with "Unable to find element with text: All systems operational"
- Component actually displays "Healthy" in h3 and "All services operational" in separate p element

**Root Cause:**

- Text is split across multiple DOM elements
- Test expectations don't match actual component structure

**Solution:**

```typescript
// Instead of:
expect(screen.getByText('All systems operational')).toBeInTheDocument();

// Use:
expect(screen.getByText('Healthy')).toBeInTheDocument();
expect(screen.getByText('All services operational')).toBeInTheDocument();
```

### Problem: HealthIndicator shows "Checking..." but test expects "Checking system health..."

**Symptoms:**

- Graph page test fails looking for "Checking system health..."
- Component actually shows "Checking..."

**Solution:**

```typescript
// Update test expectation:
expect(screen.getByText('Checking...')).toBeInTheDocument();
```

## E2E Test Issues

### Problem: Health status test times out waiting for network response

**Symptoms:**

- Test fails with "Test timeout of 30000ms exceeded"
- UI shows "Checking..." indefinitely

**Root Cause:**

- Agent not starting properly due to missing environment variables
- Health response missing required fields

**Solution:**

1. **Add environment variables to test script:**

```bash
POSTGRES_URL=postgresql://localhost:5432/test NODE_ENV=test npx tsx watch src/index.ts
```

2. **Fix health response format:**

```typescript
services: {
  database: dbHealth.status,
  redis: 'healthy', // Add missing field
}
```

3. **Use UI state waiting instead of network response:**

```typescript
// Instead of:
await page.waitForResponse((r) => r.url().includes('/healthz'));

// Use:
await expect(status).toHaveText(/healthy|unhealthy/i, { timeout: 10000 });
```

### Problem: Multiple agent processes causing port conflicts

**Symptoms:**

- Services fail to start
- "Address already in use" errors

**Solution:**

```bash
# Clean up all processes
pkill -f "tsx.*src/index.ts" && pkill -f "next dev"

# Wait before restart
sleep 3
```

## Component Testing Issues

### Problem: React warnings about unwrapped state updates

**Symptoms:**

- Warnings: "An update to HealthIndicator inside a test was not wrapped in act(...)"

**Root Cause:**

- Components make API calls during mount
- State updates happen asynchronously

**Solution:**

- Use `waitFor()` for async operations
- Consider mocking API calls for unit tests
- Warnings are usually non-blocking

### Problem: DOM prop warnings in React Flow tests

**Symptoms:**

- Warnings: "React does not recognize the `nodeTypes` prop on a DOM element"

**Root Cause:**

- React Flow props being passed to DOM elements in test environment

**Solution:**

- These are typically non-blocking warnings
- Consider using proper React Flow test utilities if needed

## Environment Issues

### Problem: Agent health check fails with "Database not configured"

**Symptoms:**

- Health endpoint returns error
- UI shows "Agent unavailable"

**Root Cause:**

- Missing POSTGRES_URL environment variable

**Solution:**

```bash
# Set required environment variable
export POSTGRES_URL=postgresql://localhost:5432/test
```

### Problem: CORS errors in browser tests

**Symptoms:**

- Network requests fail
- "Failed to fetch" errors

**Root Cause:**

- Agent not running or CORS not configured

**Solution:**

1. Verify agent is running: `curl http://localhost:3000/healthz`
2. Check CORS configuration in agent
3. Ensure UI is connecting to correct agent URL

## Best Practices

1. **Test Actual Behavior**: Update tests to match component behavior, not assumptions
2. **Environment Setup**: Always set required environment variables in test scripts
3. **Process Management**: Clean up processes between test runs
4. **UI State Testing**: Wait for UI changes rather than network events for reliability
5. **Mock Consistency**: Ensure mock data matches expected API response format
6. **Element Structure**: Understand component DOM structure when writing assertions

## Quick Debugging Checklist

- [ ] All required environment variables set?
- [ ] Services running and responding to health checks?
- [ ] No port conflicts from previous runs?
- [ ] Test expectations match actual component text?
- [ ] Mock data includes all expected fields?
- [ ] Proper async handling with waitFor()?
