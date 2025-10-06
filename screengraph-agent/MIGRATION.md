# Migration Guide: Legacy Structure → Clean Architecture

This document tracks the migration from the old structure to the new clean architecture.

## ✅ Completed

1. **Created clean architecture scaffold**
   - `/agent` (was `/src`) - framework-free core
   - `/adapters` - SDK wrappers
   - `/bff` - FastAPI composition root
   - `/cli` - command-line interface
   - `/contracts` - API DTOs

2. **Created comprehensive documentation**
   - `CLAUDE.md` - AI assistant context (25 rules)
   - `ARCHITECTURE.md` - Clean architecture principles
   - `ADAPTERS.md` - Adapter responsibilities
   - `AGENT.md` - Node graph and decision plane
   - `BFF.md` - DI and routes
   - `.env.example` - Environment variables

3. **Modernized packaging**
   - `pyproject.toml` - Replaces setup.py + requirements.txt
   - PEP 621 compliant
   - Dev/test/cli/docs extras defined
   - Tool configurations (pytest, black, ruff, mypy)

4. **Scoped test configuration**
   - `agent/test/conftest.py` - Core unit tests
   - `adapters/appium/conftest.py` - Appium integration tests

## 🚧 TODO

### 1. Move Existing Code

**Priority: HIGH**

```bash
# Move old Appium code to new location
# If src/appium still exists from old structure:
# mv old_src/appium/* src/adapters/appium/
# rm -rf old_src/appium

# Move main.py to BFF (if at root)
# mv main.py src/bff/main.py

# Remove legacy packaging
rm setup.py
# Keep requirements.txt temporarily for reference
# Later: rm requirements.txt
```

### 2. Update Imports

**Priority: HIGH**

After moving code, update all imports:

```python
# Old
from old_structure.appium import AppiumTools

# New (all under src/)
from src.adapters.appium import AppiumAdapter
from src.agent.domain import AgentState
from src.bff.main import app
```

Search and replace (if needed):
```bash
# Update any old import paths
find src -type f -name "*.py" -exec sed -i '' 's/from agent\./from src.agent./g' {} +
find src -type f -name "*.py" -exec sed -i '' 's/from adapters\./from src.adapters./g' {} +
```

### 3. Implement Adapters

**Priority: MEDIUM**

For each adapter:
1. Implement port interface
2. Wrap SDK
3. Add error mapping
4. Add retries
5. Write integration tests

Order:
1. `adapters/telemetry` (needed by all)
2. `adapters/budget` (simple, in-memory)
3. `adapters/cache` (simple, in-memory first)
4. `adapters/appium` (migrate existing code)
5. `adapters/repo` (PostgreSQL)
6. `adapters/llm` (OpenAI/Anthropic)
7. `adapters/ocr` (Tesseract)

### 4. Implement Nodes

**Priority: MEDIUM**

Implement nodes one at a time, starting with non-LLM:

1. `base_node.py` (foundation)
2. `ensure_device.py`
3. `provision_app.py`
4. `launch_or_attach.py`
5. `wait_idle.py`
6. `perceive.py`
7. `enumerate_actions.py`
8. `act.py`
9. `persist.py`
10. `restart_app.py`
11. `recover_from_error.py`
12. `stop.py`

Then LLM nodes:
13. `choose_action.py` [LLM]
14. `verify.py` [LLM]
15. `detect_progress.py` [LLM]
16. `should_continue.py` [LLM]
17. `switch_policy.py` [LLM]

### 5. Implement Services

**Priority: MEDIUM**

1. `signature_service.py` - Deterministic signatures
2. `salience_ranker.py` - Top-K ranking
3. `prompt_diet.py` - State pruning
4. `advice_reducer.py` - Advice merging
5. `progress_detector.py` - Heuristic signals

### 6. Implement Usecases

**Priority: MEDIUM**

1. `start_session.py`
2. `iterate_once.py`
3. `finalize_run.py`

### 7. Implement BFF

**Priority: MEDIUM**

1. `deps.py` - DI container
2. `main.py` - FastAPI app
3. `routes/sessions.py` - HTTP handlers

### 8. Testing

**Priority: HIGH**

1. Unit tests (with fake ports)
2. Integration tests (with real adapters)
3. E2E tests (with real device)

### 9. CI/CD

**Priority: LOW**

1. GitHub Actions workflows
2. Docker images
3. Deployment scripts

## 📋 Verification Checklist

After migration, verify:

- [ ] All imports resolve
- [ ] All tests pass
- [ ] No circular dependencies
- [ ] Domain layer has no SDK imports
- [ ] Ports have no SDK imports
- [ ] Adapters properly implement ports
- [ ] BFF properly composes adapters
- [ ] CLI works end-to-end
- [ ] Documentation is up to date

## 🔧 Commands

### Install Dependencies

```bash
# Install core + dev dependencies
pip install -e ".[dev]"

# Install all extras
pip install -e ".[all]"
```

### Run Tests

```bash
# Unit tests only
pytest -m unit

# Integration tests
pytest -m integration

# All tests
pytest

# With coverage
pytest --cov=agent --cov=adapters --cov-report=html
```

### Code Quality

```bash
# Format code
black .
isort .

# Lint
ruff check .

# Type check
mypy agent adapters bff
```

### Run Agent

```bash
# Via CLI
python -m cli.app run --app-id com.example.app

# Via BFF
uvicorn bff.main:app --reload
```

## 📚 References

- See `CLAUDE.md` for architecture rules
- See `ARCHITECTURE.md` for layer responsibilities
- See `ADAPTERS.md` for adapter patterns
- See `AGENT.md` for node graph details
- See `BFF.md` for DI patterns

