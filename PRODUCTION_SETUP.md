# ScreenGraph Production Setup & Deployment

Complete guide for deploying ScreenGraph to Fly.io production environment.

---

## Prerequisites

- **Fly.io account** with credit card added (trial has 5-minute runtime limit)
- **Supabase production project** (already configured)
- **Upstash Redis** (already configured)
- **Fly CLI** installed: `brew install flyctl`

---

## Architecture Overview

ScreenGraph consists of two services:

1. **Agent** (`screengraph-agent`) - Backend API on port 3000
2. **UI** (`screengraph-ui`) - Frontend on port 3000 (internal)

Both deployed to:
- **Primary Region**: `iad` (US East - Virginia)
- **Platform**: Fly.io

---

## Step 1: Authenticate with Fly.io

```bash
# Login to Fly.io
flyctl auth login
```

This will open your browser for authentication.

---

## Step 2: Verify Apps Exist

```bash
# List your Fly.io apps
flyctl apps list
```

You should see:
- `screengraph-agent`
- `screengraph-ui`

If they don't exist, create them:

```bash
# Create agent app
flyctl apps create screengraph-agent

# Create UI app
flyctl apps create screengraph-ui
```

---

## Step 3: Configure Secrets

### Agent Secrets

```bash
flyctl secrets set --app screengraph-agent \
  POSTGRES_URL="postgresql://postgres.cfmywntdiygatvagqucn:ranchordas@aws-1-us-east-2.pooler.supabase.com:6543/postgres" \
  SUPABASE_URL="https://cfmywntdiygatvagqucn.supabase.co" \
  SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmbXl3bnRkaXlnYXR2YWdxdWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MDUyOTIsImV4cCI6MjA3NTE4MTI5Mn0.kUxPhV54B0soRLKdHDcLS3fDoxGyExsTQ4Rh5yeqvEA" \
  SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmbXl3bnRkaXlnYXR2YWdxdWNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTYwNTI5MiwiZXhwIjoyMDc1MTgxMjkyfQ.Lcf8uqBCGjQ-2Q1rQ8N2CnVVkVV8IggfHnit1f91SU0" \
  REDIS_URL="https://great-oriole-19031.upstash.io"
```

### UI Secrets

```bash
flyctl secrets set --app screengraph-ui \
  NEXT_PUBLIC_AGENT_URL="https://screengraph-agent.fly.dev" \
  NEXT_PUBLIC_SUPABASE_URL="https://cfmywntdiygatvagqucn.supabase.co" \
  NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmbXl3bnRkaXlnYXR2YWdxdWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MDUyOTIsImV4cCI6MjA3NTE4MTI5Mn0.kUxPhV54B0soRLKdHDcLS3fDoxGyExsTQ4Rh5yeqvEA"
```

---

## Step 4: Deploy Services

### Deploy Agent

```bash
cd agent
flyctl deploy
```

**Wait for deployment to complete** (usually 2-3 minutes).

### Deploy UI

```bash
cd ../ui
flyctl deploy
```

---

## Step 5: Verify Deployment

### Check Agent Status

```bash
# Check app status
flyctl status --app screengraph-agent

# Check logs
flyctl logs --app screengraph-agent
```

**Expected output:**
```
PROCESS ID              VERSION REGION STATE   CHECKS
app     286e124b6ee4d8 4       iad    started 1 total, 1 passing
```

### Test Agent Health Endpoint

```bash
curl https://screengraph-agent.fly.dev/healthz | jq '.'
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "All services operational",
  "timestamp": "2025-10-04T21:40:00.000Z",
  "requestId": "...",
  "region": "iad",
  "environment": "production",
  "services": {
    "database": "healthy"
  }
}
```

### Check UI Status

```bash
# Check app status
flyctl status --app screengraph-ui

# Open in browser
flyctl open --app screengraph-ui
```

---

## Production URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Agent API** | https://screengraph-agent.fly.dev | Backend API |
| **Agent Health** | https://screengraph-agent.fly.dev/healthz | Health check endpoint |
| **Agent Docs** | https://screengraph-agent.fly.dev/docs | Swagger API documentation |
| **UI** | https://screengraph-ui.fly.dev | Frontend application |
| **Fly Dashboard** | https://fly.io/dashboard | Manage deployments |

---

## Monitoring & Debugging

### View Logs

```bash
# Agent logs (live stream)
flyctl logs --app screengraph-agent

# UI logs
flyctl logs --app screengraph-ui

# Specific machine logs
flyctl logs --app screengraph-agent --machine 286e124b6ee4d8
```

### Check Machine Status

```bash
# List all machines
flyctl machine list --app screengraph-agent

# Get machine details
flyctl machine status 286e124b6ee4d8
```

### SSH into Machine

```bash
# SSH into agent
flyctl ssh console --app screengraph-agent

# Once inside:
ps aux | grep node
env | grep POSTGRES
curl http://localhost:3000/healthz
```

### Restart Machine

```bash
# Restart agent
flyctl machine restart --app screengraph-agent

# Or restart specific machine
flyctl machine restart 286e124b6ee4d8
```

---

## Scaling

### Horizontal Scaling (More Machines)

```bash
# Scale agent to 2 machines
flyctl scale count 2 --app screengraph-agent

# Scale to multiple regions
flyctl scale count 2 --region iad,dfw --app screengraph-agent
```

### Vertical Scaling (More Resources)

```bash
# Scale to 1GB RAM
flyctl scale memory 1024 --app screengraph-agent

# Scale to 2 CPUs
flyctl scale vm shared-cpu-2x --app screengraph-agent
```

---

## Continuous Deployment

### Option 1: Manual Deployment

```bash
# Pull latest code
git pull origin main

# Deploy agent
cd agent && flyctl deploy

# Deploy UI
cd ../ui && flyctl deploy
```

### Option 2: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  deploy-agent:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        working-directory: ./agent
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

  deploy-ui:
    runs-on: ubuntu-latest
    needs: deploy-agent
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        working-directory: ./ui
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Add `FLY_API_TOKEN` to GitHub repository secrets.

---

## Rollback

### Rollback to Previous Version

```bash
# List releases
flyctl releases --app screengraph-agent

# Rollback to previous release
flyctl releases rollback --app screengraph-agent
```

---

## Cost Management

### Current Configuration

| Resource | Agent | UI | Monthly Cost (est.) |
|----------|-------|-----|---------------------|
| **RAM** | 256MB | 512MB | $0 (free tier) |
| **CPU** | Shared 1x | Shared 1x | $0 (free tier) |
| **Storage** | None | None | $0 |
| **Traffic** | ~1GB | ~5GB | $0 (within free tier) |

**Total:** ~$0-5/month (depending on usage)

### Add Credit Card

**Important:** Trial accounts stop machines after 5 minutes!

Add your credit card at: https://fly.io/trial

After adding:
```bash
# Restart machines
flyctl machine start --app screengraph-agent
flyctl machine start --app screengraph-ui
```

---

## Troubleshooting

### Issue: "Machine stopped after 5 minutes"

**Cause:** Trial account limitation  
**Solution:** Add credit card at https://fly.io/trial

### Issue: "Health check failing"

```bash
# Check logs
flyctl logs --app screengraph-agent | grep error

# SSH and test locally
flyctl ssh console --app screengraph-agent
curl http://localhost:3000/healthz
```

### Issue: "Environment variables not loading"

```bash
# List current secrets
flyctl secrets list --app screengraph-agent

# Verify secrets are set
flyctl ssh console --app screengraph-agent
env | grep POSTGRES_URL
```

### Issue: "Deployment failed"

```bash
# Check build logs
flyctl logs --app screengraph-agent

# Try deploying with verbose logging
flyctl deploy --verbose
```

### Issue: "Database connection error"

```bash
# Test database from production
flyctl ssh console --app screengraph-agent

# Inside machine:
apk add postgresql-client
psql "postgresql://postgres.cfmywntdiygatvagqucn:ranchordas@aws-1-us-east-2.pooler.supabase.com:6543/postgres"
```

---

## Security Best Practices

1. **Never commit secrets** - Use Fly secrets only
2. **Use RLS policies** - Supabase Row Level Security
3. **HTTPS only** - Fly.io provides automatic SSL
4. **Rotate keys regularly** - Update secrets every 90 days
5. **Monitor logs** - Set up alerts for errors

---

## Backup & Recovery

### Database Backups

Supabase automatically backs up your database daily. To restore:

1. Go to Supabase dashboard
2. Settings → Backups
3. Choose backup and restore

### Code Backups

Code is backed up in Git. To recover:

```bash
git checkout <commit-hash>
flyctl deploy
```

---

## Performance Optimization

### Enable CDN (for UI)

```bash
# Add to ui/fly.toml
[http_service]
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
```

### Database Connection Pooling

Already configured! Using Supabase pooler:
```
postgresql://postgres.cfmywntdiygatvagqucn:ranchordas@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

### Redis Caching

Configure in agent for faster responses:
```typescript
// Cache health checks for 10 seconds
const cachedHealth = await redis.get('health');
if (cachedHealth) return cachedHealth;
```

---

## Quick Commands Reference

```bash
# Deploy everything
cd agent && flyctl deploy && cd ../ui && flyctl deploy

# Check status
flyctl status --app screengraph-agent
flyctl status --app screengraph-ui

# View logs
flyctl logs --app screengraph-agent
flyctl logs --app screengraph-ui

# Restart services
flyctl machine restart --app screengraph-agent
flyctl machine restart --app screengraph-ui

# Test production
curl https://screengraph-agent.fly.dev/healthz
curl https://screengraph-ui.fly.dev
```

---

## Support

- **Fly.io Docs**: https://fly.io/docs
- **Fly.io Community**: https://community.fly.io
- **Supabase Docs**: https://supabase.com/docs
- **Project Issues**: https://github.com/nirukk52/ScreenGraphVibe/issues

---

**Deployment complete! 🚀 Your app is live!**

