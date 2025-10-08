# ScreenGraph Scripts Guide

Complete guide to the environment-aware start/stop scripts.

---

## Overview

ScreenGraph includes intelligent scripts that automatically detect your environment and handle both local development and production deployment.

---

## Scripts Available

### `start.sh` - Smart Environment Detection

The main script that auto-detects your environment and starts services accordingly.

```bash
# Auto-detect environment (defaults to local)
./start.sh

# Explicit local development
./start.sh local

# Deploy to production
./start.sh prod

# Check what's currently running
./start.sh status
```

### `stop.sh` - Stop All Services

Stops all running services regardless of environment.

```bash
# Stop everything
./stop.sh
```

---

## Environment Detection Logic

The `start.sh` script uses this detection order:

1. **Command Argument** - `./start.sh local` or `./start.sh prod`
2. **NODE_ENV** - Checks `NODE_ENV=production` environment variable
3. **FLY_APP_NAME** - Checks if running on Fly.io
4. **.env.local** - Looks for `NODE_ENV=development` in local env file
5. **Localhost Test** - Tries to connect to localhost:3000
6. **Default** - Falls back to local development

---

## Local Development Mode

When running locally, the script:

```bash
./start.sh local
```

**What it does:**

1. ✅ Checks for `.env.local` file
2. ✅ Verifies Node.js is installed
3. ✅ Checks if ports 3000 and 3001 are available
4. ✅ Starts agent in development mode (`npm run dev`)
5. ✅ Starts UI in development mode (`npm run dev`)
6. ✅ Runs both services in background with logging

**Services started:**

- **Agent**: http://localhost:3000 (Fastify API)
- **UI**: http://localhost:3001 (Next.js frontend)

**Logs available:**

```bash
# View agent logs
tail -f /tmp/agent-dev.log

# View UI logs
tail -f /tmp/ui-dev.log
```

---

## Production Mode

When deploying to production:

```bash
./start.sh prod
```

**What it does:**

1. ✅ Checks Fly.io CLI is installed and authenticated
2. ✅ Verifies apps exist (`screengraph-agent`, `screengraph-ui`)
3. ✅ Deploys agent to Fly.io
4. ✅ Waits for agent deployment to complete
5. ✅ Deploys UI to Fly.io
6. ✅ Runs health checks on both services

**Services deployed:**

- **Agent**: https://screengraph-agent.fly.dev
- **UI**: https://screengraph-ui.fly.dev

**Health checks:**

```bash
# Check agent health
curl https://screengraph-agent.fly.dev/healthz

# Check UI
curl https://screengraph-ui.fly.dev
```

---

## Status Checking

Check what's currently running:

```bash
./start.sh status
```

**What it shows:**

- Environment detection results
- Running processes (agent, UI)
- Port usage (3000, 3001)
- Health status
- Log file locations

**Example output:**

```
🔍 Environment Detection:
   Command: local
   NODE_ENV: undefined
   FLY_APP_NAME: undefined
   .env.local: found
   Localhost test: available
   → Environment: LOCAL

📊 Service Status:
   Agent: ✅ Running (PID 12345) - http://localhost:3000
   UI: ✅ Running (PID 12346) - http://localhost:3001

📝 Logs:
   Agent: /tmp/agent-dev.log
   UI: /tmp/ui-dev.log
```

---

## Troubleshooting

### Issue: "Command not found: ./start.sh"

**Solution:** Make script executable:

```bash
chmod +x start.sh stop.sh
```

### Issue: "Environment detection failed"

**Solution:** Run with explicit environment:

```bash
./start.sh local  # Force local
./start.sh prod   # Force production
```

### Issue: "Port 3000 already in use"

**Solution:** Stop existing services first:

```bash
./stop.sh
./start.sh local
```

### Issue: "Fly.io deployment failed"

**Solution:** Check authentication and app existence:

```bash
flyctl auth login
flyctl apps list
```

### Issue: "Services won't start"

**Solution:** Check logs and dependencies:

```bash
# Check logs
tail -f /tmp/agent-dev.log
tail -f /tmp/ui-dev.log

# Check dependencies
npm install
```

---

## Advanced Usage

### Custom Environment Variables

Set environment variables before running:

```bash
# Force production mode
NODE_ENV=production ./start.sh

# Custom Fly app name
FLY_APP_NAME=my-custom-app ./start.sh prod
```

### Background vs Foreground

By default, services run in background. To run in foreground:

```bash
# Local development in foreground
cd agent && npm run dev  # Terminal 1
cd ui && npm run dev     # Terminal 2
```

### Log Management

```bash
# View live logs
tail -f /tmp/agent-dev.log /tmp/ui-dev.log

# Clear logs
rm /tmp/agent-dev.log /tmp/ui-dev.log

# Archive logs
mv /tmp/agent-dev.log /tmp/agent-dev.log.backup
```

---

## Integration with CI/CD

### GitHub Actions

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Deploy to production
        run: ./start.sh prod
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

### Local Testing

```bash
# Test production deployment locally
NODE_ENV=production ./start.sh

# Test with different configurations
FLY_APP_NAME=test-app ./start.sh prod
```

---

## Script Configuration

### Environment Variables

The scripts respect these environment variables:

```bash
# Force environment
NODE_ENV=development|production

# Fly.io configuration
FLY_APP_NAME=screengraph-agent
FLY_REGION=iad

# Port configuration
AGENT_PORT=3000
UI_PORT=3001

# Log configuration
LOG_LEVEL=info|debug|error
```

### Customization

To customize the scripts:

1. **Modify environment detection** - Edit the `detect_environment()` function
2. **Add new services** - Extend the `start_local()` and `start_production()` functions
3. **Change ports** - Update the port variables at the top of the script
4. **Custom health checks** - Modify the `check_health()` function

---

## Best Practices

### Development Workflow

1. **Start development**: `./start.sh local`
2. **Make changes**: Edit code, services auto-reload
3. **Check status**: `./start.sh status`
4. **Stop when done**: `./stop.sh`

### Production Workflow

1. **Test locally**: `./start.sh local` and verify
2. **Deploy**: `./start.sh prod`
3. **Verify**: Check health endpoints
4. **Monitor**: Use Fly.io dashboard and logs

### Debugging

1. **Check status**: `./start.sh status`
2. **View logs**: `tail -f /tmp/*.log`
3. **Test endpoints**: `curl http://localhost:3000/healthz`
4. **Restart if needed**: `./stop.sh && ./start.sh local`

---

## Quick Reference

| Command             | Purpose                 | Environment |
| ------------------- | ----------------------- | ----------- |
| `./start.sh`        | Auto-detect and start   | Auto        |
| `./start.sh local`  | Start local development | Local       |
| `./start.sh prod`   | Deploy to production    | Production  |
| `./start.sh status` | Check running services  | Any         |
| `./stop.sh`         | Stop all services       | Any         |

---

**Happy scripting! 🚀**
