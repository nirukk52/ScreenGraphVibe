# ScreenGraph Agent

Python FastAPI service for mobile automation using Appium. **All Python operations run in an isolated virtual environment.**

## 🐍 Python Environment

**Critical**: This project uses Python 3.13 with a local virtual environment (`venv/`). All Python operations - development, testing, and production - run inside this venv boundary.

### Quick Start

```bash
# One-time setup (from project root)
npm run agent:setup

# Or from agent directory
cd screengraph-agent
python3.13 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 🚀 Running the Agent

### Development Mode (with hot reload)

```bash
# From project root
npm run dev:agent

# Or manually
cd screengraph-agent
./start-dev.sh

# Or with npm script
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
# From project root
npm run start:agent

# Or manually
cd screengraph-agent
./start.sh

# Or with venv
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🧪 Testing

All test commands automatically activate venv:

```bash
# From project root
npm run test:agent              # All tests
npm run test:agent:unit         # Unit tests only
npm run test:agent:integration  # Integration tests only

# Or manually in agent directory
source venv/bin/activate
pytest                          # All tests
pytest -m unit                  # Unit tests
pytest -m integration           # Integration tests
pytest --watch                  # Watch mode
```

## 🛠️ Development Commands

All these commands use venv automatically:

```bash
npm run dev:agent           # Start dev server with hot reload
npm run start:agent         # Start production server
npm run test:agent          # Run all tests
npm run agent:setup         # Setup/recreate venv
npm run agent:shell         # Open shell in venv
npm run agent:pip           # Run pip in venv
npm run agent:python        # Run python in venv
```

## 📦 Dependencies

```bash
# Add new dependency
cd screengraph-agent
source venv/bin/activate
pip install package-name
pip freeze > requirements.txt
```

## 🐳 Docker

The Dockerfile uses venv as the boundary:

```bash
# Build
docker build -t screengraph-agent .

# Run
docker run -p 8000:8000 screengraph-agent
```

## 🔧 CI/CD

GitHub Actions workflow (`.github/workflows/test-agent.yml`) uses venv:

```yaml
- name: Create virtual environment
  run: python3.13 -m venv venv

- name: Run tests
  run: |
    source venv/bin/activate
    pytest tests/
```

## 📊 Architecture

```
screengraph-agent/
├── venv/                 # Python 3.13 virtual environment (gitignored)
├── src/                  # Source code
│   └── appium/          # Appium tools (80+ tools, 5000+ lines)
├── tests/               # pytest tests (50+ tests)
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── start.sh            # Production start script
├── start-dev.sh        # Development start script
├── Dockerfile          # Production Docker image
├── SETUP.md            # Detailed setup guide
└── README.md           # This file
```

## 🎯 Key Points

1. **Always use venv**: Never run Python commands outside venv
2. **Automated**: npm scripts auto-activate venv
3. **Isolated**: No system Python conflicts
4. **Python 3.13**: Guaranteed version across all environments
5. **Reproducible**: Same environment for dev, test, and prod

## 📚 More Information

- [SETUP.md](./SETUP.md) - Detailed setup and troubleshooting
- [Root package.json](../package.json) - All npm scripts
- [TEST_COMMANDS_DEMO.md](../TEST_COMMANDS_DEMO.md) - Testing reference

## 🚨 Troubleshooting

**venv not found:**
```bash
npm run agent:setup
```

**Import errors:**
```bash
cd screengraph-agent
source venv/bin/activate
pip install -r requirements.txt
```

**Wrong Python version:**
```bash
cd screengraph-agent
source venv/bin/activate
python --version  # Should show 3.13.x
```

---

**API Running**: http://localhost:8000  
**API Docs**: http://localhost:8000/docs  
**Health**: http://localhost:8000/health
