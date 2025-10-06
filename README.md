# ScreenGraphVibe

**AI-driven crawling and verification system for mobile and web apps.**

Automatically explores applications, captures UI states and actions as structured graphs (Screengraphs), and compares them against own baselines and competetion apps.

[![Run Tests](https://img.shields.io/badge/▶️_Run_Tests-00D26A?style=for-the-badge&logo=playwright&logoColor=white)](https://github.com/priyankalalge/SAAS/VibeScreenGraph/ScreenGraphVibe/actions)
[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-FF6B6B?style=for-the-badge&logo=vercel&logoColor=white)](http://localhost:3001)

---

## 🌟 North Star Vision

ScreenGraphVibe aims to revolutionize mobile and web competation analysis:
To do this building a reliable screengraph of any app is crucial.

- **Intelligent Exploration**: Automatically discover and map all UI states and user flows
- **Visual Verification**: Capture and compare UI states against baselines with AI-powered analysis
- **Graph-Based Testing**: Represent app behavior as structured graphs (Screengraphs) for comprehensive coverage
- **Multi-Platform**: Support for both mobile (iOS/Android via Appium) and web applications
- **Baseline Comparison**: Detect UI regressions and unexpected behavior changes automatically
- **LangGraph Orchestration**: AI-driven test strategy and adaptive exploration

This is our long-term vision. We're building incrementally toward this goal with focused, testable features.

---

## 🚀 Project Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Python 3.9+ (for Appium agent)

### Quick Setup

```bash
# 1. Clone and install dependencies
git clone https://github.com/nirukk52/ScreenGraphVibe.git
cd ScreenGraphVibe
npm install

# 2. Setup environment variables
cp env.example .env.local
# Edit .env.local with your credentials (see docs/CREDENTIALS.md)

# 3. Setup database
npm run db:generate
npm run db:migrate

# 4. Start everything
./scripts/start.sh local
```

**✅ Done!** Services will be running at:
- 🔧 Backend API → http://localhost:3000
- 🎨 UI Dashboard → http://localhost:3001

**Stop services:** `./scripts/stop.sh`

---

## 🧪 Testing

### Quick Start

```bash
# Run all tests (GOD COMMAND)
npm run test:all

# Run all tests in all modules
npm test

# Run tests by type
npm run test:unit        # All unit tests
npm run test:integration # All integration tests
npm run test:e2e         # E2E tests only
```

### Module-Specific Testing

```bash
# Test individual modules
npm run test:data        # Data layer tests
npm run test:backend     # Backend API tests
npm run test:ui          # UI component tests
npm run test:agent       # Python agent tests

# Test specific type in module
npm run test:data:unit           # Data unit tests only
npm run test:backend:integration # Backend integration tests only
npm run test:ui:unit             # UI unit tests only
```

### Development Mode

```bash
# Watch mode for TDD
cd data && npm run test:watch
cd backend && npm run test:watch
cd ui && npm run test:watch
```

### Test Status

| Test Type | Status | Count |
|-----------|--------|-------|
| Unit Tests | ✅ Passing | 25+ tests |
| Integration Tests | ✅ Passing | 10+ tests |
| E2E Tests | ✅ Passing | 2 tests |
| Health Checks | ✅ Working | All Green |

**See [CLAUDE.md - Testing Commands Reference](./CLAUDE.md#testing-commands-reference) for complete command chart and CI strategy.**
## 📍 Current Project State

### ✅ Completed Features
- Health monitoring system (UI + API)
- Database connectivity checks
- Multi-region deployment infrastructure (US East, US Central, India)
- Comprehensive testing suite (Unit, Integration, E2E)
- Documentation auto-indexing with MCP Graphiti memory
- AppiumTools system (5000+ lines, 80+ tools, 50+ tests)
- Git hooks for documentation updates

### 🔄 In Progress / Next Steps
- Crawling engine (Appium integration)
- Graph generation and storage
- Baseline management
- Advanced visualization (React Flow)
- Queue processing (BullMQ)
- LangGraph orchestration layer

---

## 📚 Documentation

For detailed information about setup, architecture, deployment, and development, see:

### Core Documentation
- **[CLAUDE.md](./CLAUDE.md)** - Complete AI assistant context and coding standards
- **[DOCUMENT_INDEX.md](./DOCUMENT_INDEX.md)** - Auto-generated documentation index
- **[CREDENTIALS.md](./docs/CREDENTIALS.md)** - Environment variables and credentials

### Setup Guides
- **[Local Development Setup](./docs/setup/LOCAL_SETUP.md)** - Complete local development guide
- **[Production Setup](./docs/setup/PRODUCTION_SETUP.md)** - Production deployment guide
- **[Testing Guide](./docs/setup/TESTING.md)** - Comprehensive testing strategies
- **[Scripts Guide](./docs/setup/SCRIPTS_GUIDE.md)** - Environment-aware scripts guide
- **[Deployment Guide](./docs/setup/DEPLOYMENT.md)** - Quick deployment instructions
- **[Test Troubleshooting](./docs/setup/TEST_TROUBLESHOOTING.md)** - Debugging test issues

### Technical Documentation
For architecture, module structure, API details, and coding guidelines, refer to [CLAUDE.md](./CLAUDE.md).

---

## 🤝 Contributing

Please follow the coding standards and guidelines outlined in [CLAUDE.md](./CLAUDE.md) when contributing to this project.

---

**Built with ❤️ for better mobile and web app testing**
