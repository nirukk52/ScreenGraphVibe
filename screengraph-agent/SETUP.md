# ScreenGraph Agent Setup

## Python Virtual Environment Setup

This project uses **Python 3.13** with a local virtual environment to isolate dependencies.

### Initial Setup

```bash
# One-time setup (from project root)
npm run agent:setup

# Or manually:
cd screengraph-agent
python3.13 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Activating the Virtual Environment

```bash
# From screengraph-agent directory
source venv/bin/activate

# You should see (venv) in your terminal prompt
# (venv) user@machine:~/screengraph-agent$
```

### Running Tests

```bash
# From project root (venv activated automatically)
npm run test:agent              # All agent tests
npm run test:agent:unit         # Unit tests only
npm run test:agent:integration  # Integration tests only

# Or manually with venv
cd screengraph-agent
source venv/bin/activate
pytest                          # All tests
pytest tests/ -m unit           # Unit tests
pytest tests/ -m integration    # Integration tests
```

### Deactivating

```bash
deactivate
```

### Verifying Setup

```bash
# Check Python version in venv
cd screengraph-agent
source venv/bin/activate
python --version                # Should show Python 3.13.x
which python                    # Should show path to venv/bin/python
pytest --version                # Should show pytest version
```

### Adding New Dependencies

```bash
cd screengraph-agent
source venv/bin/activate
pip install package-name
pip freeze > requirements.txt   # Update requirements file
```

### Troubleshooting

**pytest not found:**
```bash
cd screengraph-agent
source venv/bin/activate
pip install pytest pytest-asyncio pytest-mock
```

**Import errors:**
Make sure all dependencies are installed:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

**Wrong Python version:**
```bash
rm -rf venv
python3.13 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### .gitignore

The `venv/` directory is already ignored in `.gitignore`. Never commit your virtual environment to git.

---

## IDE Configuration

### VS Code

Add to `.vscode/settings.json`:
```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/screengraph-agent/venv/bin/python",
  "python.terminal.activateEnvironment": true
}
```

### PyCharm

1. File → Settings → Project → Python Interpreter
2. Add Interpreter → Existing Environment
3. Select `screengraph-agent/venv/bin/python`

---

**Note**: Always activate the venv before running Python commands or tests!
