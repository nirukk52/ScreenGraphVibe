# ScreenGraph

AI-driven crawling and verification system for mobile and web apps. Automatically explores applications, captures UI states and actions as structured graphs (Screengraphs), and compares them against baselines.

[![Run Tests](https://img.shields.io/badge/▶️_Run_Tests-00D26A?style=for-the-badge&logo=playwright&logoColor=white)](https://github.com/priyankalalge/SAAS/VibeScreenGraph/ScreenGraphVibe/actions)
[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-FF6B6B?style=for-the-badge&logo=vercel&logoColor=white)](http://localhost:3001)

## 🚀 Quick Start

Get up and running in 3 steps:

```bash
# 1. Install dependencies
npm install
```
[![▶️ Quick Install](https://img.shields.io/badge/▶️_Install-4CAF50?style=for-the-badge&logo=npm&logoColor=white)](javascript:void(0))

```bash
# 2. Setup environment
cp .env.example .env
cp agent/.env.example agent/.env
cp ui/.env.example ui/.env.local
```
[![▶️ Quick Setup](https://img.shields.io/badge/▶️_Setup-FF9800?style=for-the-badge&logo=dotenv&logoColor=white)](javascript:void(0))

```bash
# 3. Start development servers
npm run dev
```
[![▶️ Quick Start](https://img.shields.io/badge/▶️_Start-2196F3?style=for-the-badge&logo=concurrently&logoColor=white)](javascript:void(0))

**🎉 You're ready!** Visit [http://localhost:3001](http://localhost:3001) to see the health dashboard.

## 📊 Test Status

| Test Type | Status | Badge |
|-----------|--------|-------|
| Unit Tests | ✅ Passing | [![Unit Tests](https://img.shields.io/badge/Unit_Tests-8_tests_passing-4CAF50?style=flat-square&logo=vitest&logoColor=white)](javascript:void(0)) |
| Integration Tests | ✅ Passing | [![Integration Tests](https://img.shields.io/badge/Integration_Tests-2_tests_passing-4CAF50?style=flat-square&logo=vitest&logoColor=white)](javascript:void(0)) |
| E2E Tests | ✅ Passing | [![E2E Tests](https://img.shields.io/badge/E2E_Tests-3_tests_passing-4CAF50?style=flat-square&logo=playwright&logoColor=white)](javascript:void(0)) |
| Health Checks | ✅ Working | [![Health Checks](https://img.shields.io/badge/Health_Checks-All_Green-4CAF50?style=flat-square&logo=heart&logoColor=white)](javascript:void(0)) |

## Architecture

The system is organized into modules using colon-prefixed labels:

- **:data** - Database layer with Drizzle ORM, PostgreSQL, and Supabase
- **:agent** - Fastify API server with LangGraph orchestration  
- **:ui** - Next.js React application for visualization
- **:infra** - Infrastructure management (Fly.io + Supabase)
- **:tests** - Comprehensive testing suite with Vitest and Playwright
- **:logging** - Structured logging with Pino and OpenTelemetry

## 🚀 Deployment (Fly.io + Supabase)

### Prerequisites

- [Fly.io CLI](https://fly.io/docs/getting-started/installing-flyctl/) installed
- [Supabase](https://supabase.com) project created
- Environment variables configured

### Environment Variables

Copy the example environment file and configure:

```bash
cp env.example .env.local
```

**Required variables:**

```bash
# Environment
NODE_ENV=production

# Database (Supabase)
POSTGRES_URL=postgresql://postgres:[password]@[host]:[port]/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Redis (for queues)
REDIS_URL=redis://localhost:6379

# Agent Configuration
AGENT_PORT=3000
AGENT_HOST=0.0.0.0

# UI Configuration
NEXT_PUBLIC_AGENT_URL=https://screengraph.fly.dev

# Logging
LOG_LEVEL=info

# Fly.io Configuration
FLY_APP_NAME=screengraph
FLY_REGION=iad

# Storage
STORAGE_BUCKET=screengraph-assets
```

### Setup Fly.io

```bash
# Login to Fly.io
fly auth login

# Create app (one-time setup)
fly apps create screengraph

# Set secrets
fly secrets set \
  POSTGRES_URL="postgresql://postgres:[password]@[host]:[port]/postgres" \
  SUPABASE_URL="https://your-project.supabase.co" \
  SUPABASE_ANON_KEY="your_supabase_anon_key_here" \
  SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key_here" \
  REDIS_URL="redis://localhost:6379" \
  --app screengraph
```

### Deploy

**Single command deployment to US + India:**

```bash
npm run deploy
```

This command will:
1. ✅ Validate environment configuration
2. 🔨 Build all workspace modules
3. 🚀 Deploy to 3 regions: US East, US Central, India
4. 🏥 Run health checks across all regions
5. 📊 Report deployment status with URLs

**Health monitoring:**

```bash
# Check health across all regions
npm run health
```

**Manual deployment:**

```bash
# Deploy agent to specific region
cd agent && fly deploy --region iad --app screengraph-agent

# Deploy UI to specific region  
cd ui && fly deploy --region iad --app screengraph-ui
```

### Health Monitoring

After deployment, check health across regions:

```bash
# Check health endpoint
curl https://screengraph.fly.dev/healthz

# View logs
fly logs --app screengraph

# Check deployment status
fly status --app screengraph
```

**Expected health response:**
```json
{
  "status": "ok",
  "message": "All services operational",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "uuid-here",
  "region": "iad",
  "environment": "production",
  "services": {
    "database": "healthy"
  }
}
```

### Regions

The app deploys to 3 strategic regions for optimal performance:

- **iad** - US East (Virginia) - Primary US region
- **dfw** - US Central (Texas) - Secondary US region  
- **bom** - Asia Pacific (Mumbai) - India region

### Dashboard & Status URLs

**🌐 Live Dashboards:**

🇺🇸 **US East (Virginia) - Primary**
- **UI Dashboard**: https://screengraph-ui.fly.dev
- **Agent Health**: https://screengraph-agent.fly.dev/healthz
- **API Docs**: https://screengraph-agent.fly.dev/docs

🇺🇸 **US Central (Texas)**
- **UI Dashboard**: https://screengraph-ui.fly.dev  
- **Agent Health**: https://screengraph-agent.fly.dev/healthz

🇮🇳 **India (Mumbai)**
- **UI Dashboard**: https://screengraph-ui.fly.dev
- **Agent Health**: https://screengraph-agent.fly.dev/healthz

**📊 Monitoring & Management:**

- **Fly.io Dashboard**: https://fly.io/dashboard
- **Agent Logs**: `fly logs --app screengraph-agent`
- **UI Logs**: `fly logs --app screengraph-ui`
- **Health Check**: `npm run health`

### Storage (Supabase)

Configure storage buckets in Supabase:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('screengraph-assets', 'screengraph-assets', false);

-- Set up RLS policies
CREATE POLICY "Users can upload assets" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'screengraph-assets');

CREATE POLICY "Users can view own assets" ON storage.objects
FOR SELECT USING (bucket_id = 'screengraph-assets');
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis (optional, for queues)

### Installation

```bash
# Install dependencies for all modules
npm install
```
[![▶️ Install All](https://img.shields.io/badge/▶️_Install_All-4CAF50?style=for-the-badge&logo=npm&logoColor=white)](javascript:void(0))

```bash
# Install dependencies for each module
npm install --workspace=data
npm install --workspace=agent
npm install --workspace=ui
npm install --workspace=tests
npm install --workspace=logging
```
[![▶️ Install Data](https://img.shields.io/badge/▶️_Data-2196F3?style=for-the-badge&logo=postgresql&logoColor=white)](javascript:void(0))
[![▶️ Install Agent](https://img.shields.io/badge/▶️_Agent-FF9800?style=for-the-badge&logo=node.js&logoColor=white)](javascript:void(0))
[![▶️ Install UI](https://img.shields.io/badge/▶️_UI-61DAFB?style=for-the-badge&logo=react&logoColor=white)](javascript:void(0))
[![▶️ Install Tests](https://img.shields.io/badge/▶️_Tests-4CAF50?style=for-the-badge&logo=vitest&logoColor=white)](javascript:void(0))
[![▶️ Install Logging](https://img.shields.io/badge/▶️_Logging-9C27B0?style=for-the-badge&logo=elastic&logoColor=white)](javascript:void(0))

### Environment Setup

Create environment files:

```bash
# Root .env
cp .env.example .env
```
[![▶️ Setup Root](https://img.shields.io/badge/▶️_Setup_Root-FF5722?style=for-the-badge&logo=dotenv&logoColor=white)](javascript:void(0))

```bash
# Agent .env
cp agent/.env.example agent/.env
```
[![▶️ Setup Agent](https://img.shields.io/badge/▶️_Setup_Agent-FF9800?style=for-the-badge&logo=node.js&logoColor=white)](javascript:void(0))

```bash
# UI .env.local
cp ui/.env.example ui/.env.local
```
[![▶️ Setup UI](https://img.shields.io/badge/▶️_Setup_UI-61DAFB?style=for-the-badge&logo=react&logoColor=white)](javascript:void(0))

### Database Setup

```bash
# Generate database migrations
npm run db:generate
```
[![▶️ Generate Migrations](https://img.shields.io/badge/▶️_Generate-2196F3?style=for-the-badge&logo=postgresql&logoColor=white)](javascript:void(0))

```bash
# Run migrations
npm run db:migrate
```
[![▶️ Run Migrations](https://img.shields.io/badge/▶️_Migrate-4CAF50?style=for-the-badge&logo=drizzle&logoColor=white)](javascript:void(0))

```bash
# Open database studio (optional)
npm run db:studio
```
[![▶️ Database Studio](https://img.shields.io/badge/▶️_Studio-FF9800?style=for-the-badge&logo=drizzle&logoColor=white)](javascript:void(0))

## Running the Application

### Development Mode

Start all services in development mode:

```bash
# Start agent and UI concurrently
npm run dev
```
[![▶️ Start All](https://img.shields.io/badge/▶️_Start_All-4CAF50?style=for-the-badge&logo=concurrently&logoColor=white)](javascript:void(0))

Or start services individually:

```bash
# Start agent server (port 3000)
npm run dev:agent
```
[![▶️ Start Agent](https://img.shields.io/badge/▶️_Agent_Server-FF9800?style=for-the-badge&logo=fastify&logoColor=white)](javascript:void(0))

```bash
# Start UI server (port 3001) 
npm run dev:ui
```
[![▶️ Start UI](https://img.shields.io/badge/▶️_UI_Server-61DAFB?style=for-the-badge&logo=next.js&logoColor=white)](javascript:void(0))

### Production Mode

```bash
# Build all modules
npm run build
```
[![▶️ Build All](https://img.shields.io/badge/▶️_Build_All-2196F3?style=for-the-badge&logo=typescript&logoColor=white)](javascript:void(0))

```bash
# Start production servers
cd agent && npm start
cd ui && npm start
```
[![▶️ Start Production](https://img.shields.io/badge/▶️_Production-4CAF50?style=for-the-badge&logo=node.js&logoColor=white)](javascript:void(0))

## Testing

### Run All Tests

```bash
npm test
```
[![▶️ Run All Tests](https://img.shields.io/badge/▶️_Run_All_Tests-4CAF50?style=for-the-badge&logo=vitest&logoColor=white)](javascript:void(0))

### Run Specific Test Types

```bash
# Unit tests only
npm run test:unit --workspace=tests
```
[![▶️ Unit Tests](https://img.shields.io/badge/▶️_Unit_Tests-2196F3?style=for-the-badge&logo=vitest&logoColor=white)](javascript:void(0))

```bash
# Integration tests
npm run test:integration --workspace=tests
```
[![▶️ Integration Tests](https://img.shields.io/badge/▶️_Integration_Tests-FF9800?style=for-the-badge&logo=vitest&logoColor=white)](javascript:void(0))

```bash
# End-to-end tests
npm run test:e2e --workspace=tests
```
[![▶️ E2E Tests](https://img.shields.io/badge/▶️_E2E_Tests-9C27B0?style=for-the-badge&logo=playwright&logoColor=white)](javascript:void(0))

### Base Test

The foundation test that all other tests extend from:

```bash
npm run test:unit --workspace=tests -- src/fixtures/base.test.ts
```
[![▶️ Base Test](https://img.shields.io/badge/▶️_Base_Test-4CAF50?style=for-the-badge&logo=vitest&logoColor=white)](javascript:void(0))

This test ensures the testing framework is working correctly and should always pass.

## Health Check System

The system includes a comprehensive health check that displays database connectivity status:

### UI Health Dashboard

Visit `http://localhost:3001` to see the health dashboard with:

- **System Health Status** - Overall system health indicator (green/red)
- **Database Status** - PostgreSQL connection status
- **Agent Service Status** - Fastify API server status
- **Auto-refresh** - Health checks every 30 seconds
- **Manual Refresh** - Click refresh button for immediate check

### API Health Endpoint

```bash
# Check agent health
curl http://localhost:3000/healthz
```
[![▶️ Check Health](https://img.shields.io/badge/▶️_Check_Health-4CAF50?style=for-the-badge&logo=curl&logoColor=white)](javascript:void(0))

**Expected response when healthy:**
```json
{
  "status": "healthy",
  "message": "All services operational",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "healthy"
  }
}
```

## API Documentation

When the agent is running, visit:
- **API Docs**: `http://localhost:3000/docs` [![▶️ Open API Docs](https://img.shields.io/badge/▶️_Open_API_Docs-2196F3?style=for-the-badge&logo=swagger&logoColor=white)](http://localhost:3000/docs)
- **Agent Status**: `http://localhost:3000/` [![▶️ Agent Status](https://img.shields.io/badge/▶️_Agent_Status-FF9800?style=for-the-badge&logo=fastify&logoColor=white)](http://localhost:3000/)

## Project Structure

```
ScreenGraphVibe/
├── data/                 # :data module
│   ├── src/
│   │   ├── db/          # Database schema and migrations
│   │   └── config/      # Database configuration
├── agent/               # :agent module  
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── types/       # TypeScript interfaces
│   │   └── config/      # Agent configuration
├── ui/                  # :ui module
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Next.js pages
│   │   └── lib/         # API client utilities
├── tests/               # :tests module
│   ├── src/
│   │   ├── unit/        # Unit tests
│   │   ├── integration/ # Integration tests
│   │   ├── e2e/         # End-to-end tests
│   │   └── fixtures/    # Test fixtures
└── logging/             # :logging module
    └── src/             # Structured logging utilities
```

## Key Features

- **Health Monitoring** - Real-time system health dashboard
- **Database Health** - PostgreSQL connection monitoring
- **API Health** - Fastify server status checking
- **Auto-refresh** - Continuous health monitoring
- **Responsive UI** - Modern React interface with Tailwind CSS
- **Comprehensive Testing** - Unit, integration, and E2E tests
- **Structured Logging** - Pino-based logging with context

## Development Guidelines

- **TDD Approach** - Write tests before implementing features
- **Health Check First** - Ensure database connectivity before other operations
- **Modular Design** - Each module has clear responsibilities
- **Type Safety** - Full TypeScript coverage
- **Real Infrastructure** - Prefer real databases over mocks in tests

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Check connection string in `.env` files
3. Verify database exists and is accessible
4. Run `npm run db:studio` to inspect database

### Agent Won't Start

1. Check if port 3000 is available
2. Verify all dependencies are installed
3. Check agent logs for specific errors
4. Ensure database is accessible

### UI Won't Load

1. Check if port 3001 is available  
2. Verify agent is running on port 3000
3. Check browser console for errors
4. Verify API client configuration

### Tests Failing

1. Run base test first: `npm run test:unit --workspace=tests -- src/fixtures/base.test.ts`
   [![▶️ Run Base Test](https://img.shields.io/badge/▶️_Run_Base_Test-4CAF50?style=for-the-badge&logo=vitest&logoColor=white)](javascript:void(0))
2. Ensure database is accessible for integration tests
3. Check that both agent and UI are running for E2E tests
   [![▶️ Start Services](https://img.shields.io/badge/▶️_Start_Services-2196F3?style=for-the-badge&logo=concurrently&logoColor=white)](javascript:void(0))
4. Review test logs for specific failures

### Quick Fixes

```bash
# Kill any running processes
pkill -f "tsx watch" && pkill -f "next dev"
```
[![▶️ Kill Processes](https://img.shields.io/badge/▶️_Kill_Processes-FF5722?style=for-the-badge&logo=terminal&logoColor=white)](javascript:void(0))

```bash
# Reset and restart everything
npm install && npm run dev
```
[![▶️ Reset & Restart](https://img.shields.io/badge/▶️_Reset_&_Restart-4CAF50?style=for-the-badge&logo=refresh&logoColor=white)](javascript:void(0))

## Next Steps

This scaffolding provides the foundation for the ScreenGraph system. The next development phases will include:

1. **Crawling Engine** - Appium integration for app exploration
2. **Graph Generation** - Screengraph creation and storage
3. **Baseline Management** - Expected state comparison
4. **Advanced Visualization** - React Flow graph rendering
5. **Queue Processing** - BullMQ job orchestration