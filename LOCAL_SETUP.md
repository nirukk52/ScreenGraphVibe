# ScreenGraph Local Development Setup

Complete guide for running ScreenGraph locally.

---

## Prerequisites

- **Node.js** 20+ and npm
- **Supabase account** (for database)
- **Upstash account** (for Redis - optional for basic testing)
- **Git** installed

---

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/nirukk52/ScreenGraphVibe.git
cd ScreenGraphVibe

# Install dependencies
npm install
```

---

## Step 2: Environment Configuration

### Create `.env.local` in the root directory:

```bash
cat > .env.local << 'EOF'
# ScreenGraph Environment Configuration
# DO NOT COMMIT THIS FILE TO GIT

# Environment
NODE_ENV=development

# Database Configuration
POSTGRES_URL=postgresql://postgres:ranchordas@db.cfmywntdiygatvagqucn.supabase.co:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://cfmywntdiygatvagqucn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmbXl3bnRkaXlnYXR2YWdxdWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MDUyOTIsImV4cCI6MjA3NTE4MTI5Mn0.kUxPhV54B0soRLKdHDcLS3fDoxGyExsTQ4Rh5yeqvEA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmbXl3bnRkaXlnYXR2YWdxdWNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTYwNTI5MiwiZXhwIjoyMDc1MTgxMjkyfQ.Lcf8uqBCGjQ-2Q1rQ8N2CnVVkVV8IggfHnit1f91SU0

# Redis Configuration
REDIS_URL=https://great-oriole-19031.upstash.io

# Agent Configuration
AGENT_PORT=3000
AGENT_HOST=0.0.0.0
LOG_LEVEL=info

# UI Configuration
NEXT_PUBLIC_AGENT_URL=http://localhost:3000

# Fly.io
FLY_APP_NAME=screengraph
FLY_REGION=iad

# Storage
STORAGE_BUCKET=screengraph-assets
EOF
```

---

## Step 3: Build All Services

```bash
# Build everything
npm run build
```

---

## Step 4: Run Services

### Option A: Run All Services (Recommended)

Open **3 separate terminal windows**:

#### Terminal 1 - Agent (Backend API)
```bash
cd agent
npm run dev
```

✅ **Agent will run on**: http://localhost:3000  
✅ **Health check**: http://localhost:3000/healthz  
✅ **API docs**: http://localhost:3000/docs

#### Terminal 2 - UI (Frontend)
```bash
cd ui
npm run dev
```

✅ **UI will run on**: http://localhost:3001

#### Terminal 3 - Watch for changes (optional)
```bash
# If you want to run tests
npm test
```

### Option B: Run Services Individually

```bash
# Just the agent
cd agent && npm run dev

# Just the UI
cd ui && npm run dev
```

---

## Step 5: Verify Everything Works

### Test the Agent Health Endpoint

```bash
curl http://localhost:3000/healthz | jq '.'
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "All services operational",
  "timestamp": "2025-10-04T21:40:00.000Z",
  "requestId": "...",
  "region": "local",
  "environment": "development",
  "services": {
    "database": "healthy"
  }
}
```

### Open the UI

Visit http://localhost:3001 in your browser.

You should see:
- ✅ **System Healthy** badge (green)
- ✅ Database status: healthy
- ✅ No errors

---

## Common Issues & Solutions

### Issue: "Database not configured" error

**Solution:** Make sure `.env.local` exists in the root directory and contains `POSTGRES_URL`.

```bash
# Check if env file exists
cat .env.local | grep POSTGRES_URL
```

### Issue: "Cannot find module 'dotenv'"

**Solution:** Install dependencies:
```bash
npm install
cd agent && npm install
cd ../ui && npm install
```

### Issue: Port 3000 already in use

**Solution:** Kill the existing process:
```bash
lsof -ti:3000 | xargs kill -9
```

### Issue: UI shows "Failed to connect to agent"

**Solution:**
1. Make sure agent is running on port 3000
2. Check that `NEXT_PUBLIC_AGENT_URL=http://localhost:3000` is in `.env.local`
3. Restart the UI: `cd ui && npm run dev`

### Issue: Agent crashes with "pino-pretty" error

**Solution:** This should only happen in production. In dev mode, pino-pretty is available. If it still fails:
```bash
cd agent
npm install pino-pretty --save-dev
```

---

## Development Workflow

### Making Changes

1. **Edit agent code** → Agent hot-reloads automatically (tsx watch)
2. **Edit UI code** → UI hot-reloads automatically (Next.js Fast Refresh)
3. **Edit types** → Rebuild: `npm run build`

### Testing

```bash
# Run all tests
npm test

# Run specific test suite
cd tests && npm test

# Run with coverage
npm run test:coverage
```

### Linting

```bash
# Lint everything
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

---

## Project Structure

```
ScreenGraphVibe/
├── agent/          # Backend API (Fastify + Node.js)
│   ├── src/
│   │   ├── index.ts           # Main entry point
│   │   ├── routes/            # API routes
│   │   └── config/            # Configuration
│   └── package.json
│
├── ui/             # Frontend (Next.js + React)
│   ├── src/
│   │   ├── pages/             # Next.js pages
│   │   ├── components/        # React components
│   │   └── lib/               # API client
│   └── package.json
│
├── data/           # Database schema (Drizzle ORM)
├── tests/          # Test suites
├── infra/          # Deployment configs
└── .env.local      # Local environment variables (create this)
```

---

## Quick Commands Reference

```bash
# Install everything
npm install

# Build everything
npm run build

# Run agent
cd agent && npm run dev

# Run UI
cd ui && npm run dev

# Run tests
npm test

# Check health
curl http://localhost:3000/healthz

# View agent logs
cd agent && npm run dev | grep -i error
```

---

## Next Steps

- Read [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for deployment instructions
- Check [CREDENTIALS.md](./CREDENTIALS.md) for all API keys and credentials
- Review [CLAUDE.md](./CLAUDE.md) for development guidelines

---

## Getting Help

If you encounter issues:

1. Check the logs in the terminal where the service is running
2. Verify `.env.local` has all required variables
3. Make sure all services are running (agent on 3000, UI on 3001)
4. Try restarting services with `pkill -f "tsx watch" && cd agent && npm run dev`

**Happy coding! 🚀**

