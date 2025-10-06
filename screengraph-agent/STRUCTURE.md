# Project Structure

This document describes the canonical directory structure for the ScreenGraph Agent.

## 🎯 Top-Level Organization

```
screengraph-agent/
├── src/                      # ALL source code lives here
│   ├── agent/                # Framework-free agent core
│   ├── adapters/             # SDK wrappers
│   ├── bff/                  # FastAPI composition root
│   ├── cli/                  # Command-line interface
│   ├── contracts/            # API DTOs
│   └── ui/                   # (future) Admin web interface
├── tests/                    # (deprecated, use src/agent/test and src/adapters/*/tests)
├── docs/                     # Documentation
├── venv/                     # Python virtual environment
├── pyproject.toml            # Modern Python packaging
├── .env.example              # Environment variables template
├── CLAUDE.md                 # AI assistant context (25 rules)
├── ARCHITECTURE.md           # Clean architecture guide
├── ADAPTERS.md               # Adapter responsibilities
├── AGENT.md                  # Node graph and decision plane
├── BFF.md                    # DI and routes
├── MIGRATION.md              # Migration guide
└── README.md                 # Project overview
```

## 📦 src/ Directory Structure

```
src/
├── __init__.py               # Package marker
│
├── agent/                    # Framework-free core (NO SDKs)
│   ├── __init__.py
│   ├── domain/               # Pure types (NO imports except stdlib)
│   │   ├── __init__.py
│   │   ├── state.py          # AgentState (single source of truth)
│   │   ├── screen_signature.py
│   │   ├── ui_element.py
│   │   ├── ui_action.py
│   │   ├── advice.py
│   │   ├── bundles.py
│   │   ├── budgets.py
│   │   ├── counters.py
│   │   ├── progress_flag.py
│   │   └── stop_reason.py
│   │
│   ├── ports/                # Interfaces (NO SDK imports)
│   │   ├── __init__.py
│   │   ├── driver_port.py
│   │   ├── ocr_port.py
│   │   ├── repo_port.py
│   │   ├── filestore_port.py
│   │   ├── llm_port.py
│   │   ├── cache_port.py
│   │   ├── budget_port.py
│   │   └── telemetry_port.py
│   │
│   ├── orchestrator/         # Node graph
│   │   ├── __init__.py
│   │   ├── graph.py          # Node wiring (comments only)
│   │   ├── nodes/            # 17 nodes (one class per file)
│   │   │   ├── __init__.py
│   │   │   ├── base_node.py
│   │   │   ├── ensure_device.py
│   │   │   ├── provision_app.py
│   │   │   ├── launch_or_attach.py
│   │   │   ├── wait_idle.py
│   │   │   ├── perceive.py
│   │   │   ├── enumerate_actions.py
│   │   │   ├── choose_action.py      # [LLM]
│   │   │   ├── act.py
│   │   │   ├── verify.py             # [LLM]
│   │   │   ├── persist.py
│   │   │   ├── detect_progress.py    # [LLM]
│   │   │   ├── should_continue.py    # [LLM]
│   │   │   ├── switch_policy.py      # [LLM]
│   │   │   ├── restart_app.py
│   │   │   ├── recover_from_error.py
│   │   │   └── stop.py
│   │   └── policy/           # Routing rules
│   │       ├── __init__.py
│   │       ├── routing_rules.py
│   │       └── constants.py
│   │
│   ├── services/             # Stateless helpers
│   │   ├── __init__.py
│   │   ├── signature_service.py
│   │   ├── salience_ranker.py
│   │   ├── prompt_diet.py
│   │   ├── advice_reducer.py
│   │   └── progress_detector.py
│   │
│   ├── usecases/             # High-level orchestration
│   │   ├── __init__.py
│   │   ├── start_session.py
│   │   ├── iterate_once.py
│   │   └── finalize_run.py
│   │
│   ├── config/               # Typed config objects
│   │   ├── __init__.py
│   │   └── runtime_config.py
│   │
│   ├── errors/               # Domain exceptions
│   │   ├── __init__.py
│   │   └── error_types.py
│   │
│   └── test/                 # Unit tests (scoped conftest.py)
│       ├── __init__.py
│       └── conftest.py
│
├── adapters/                 # SDK wrappers (ONLY place with SDK imports)
│   ├── __init__.py
│   ├── appium/               # Implements DriverPort
│   │   ├── __init__.py
│   │   ├── conftest.py       # Scoped for appium tests
│   │   └── tests/
│   ├── ocr/                  # Implements OCRPort
│   │   └── __init__.py
│   ├── repo/                 # Implements RepoPort + FileStorePort
│   │   └── __init__.py
│   ├── llm/                  # Implements LLMPort
│   │   └── __init__.py
│   ├── cache/                # Implements CachePort
│   │   └── __init__.py
│   ├── budget/               # Implements BudgetPort
│   │   └── __init__.py
│   ├── telemetry/            # Implements TelemetryPort
│   │   └── __init__.py
│   └── engine/               # (optional) Implements EnginePort
│       └── __init__.py
│
├── bff/                      # FastAPI composition root
│   ├── __init__.py
│   ├── main.py               # App creation + lifespan
│   ├── deps.py               # DI container
│   └── routes/
│       ├── __init__.py
│       └── sessions.py       # HTTP handlers
│
├── cli/                      # Command-line interface
│   ├── __init__.py
│   └── app.py                # Typer commands
│
├── contracts/                # API DTOs (versioned)
│   └── __init__.py
│
└── ui/                       # (future) Admin web interface
    └── README.md
```

## 🔑 Key Principles

### 1. Everything Under src/

**All Python code lives under `src/`**. This provides:
- Clean namespace separation
- Easy packaging (setuptools `src/` layout)
- Clear distinction between source and auxiliary files

### 2. Import Paths

```python
# From agent core
from src.agent.domain import AgentState
from src.agent.ports import DriverPort

# From adapters
from src.adapters.appium import AppiumAdapter
from src.adapters.llm import LLMAdapter

# From BFF
from src.bff.main import app
from src.bff.deps import Dependencies

# From CLI
from src.cli.app import main
```

### 3. Test Locations

- **Unit tests**: `src/agent/test/` (uses fake ports)
- **Adapter tests**: `src/adapters/*/tests/` (uses real SDKs)
- **Integration tests**: `src/adapters/*/tests/` (with Testcontainers)
- **E2E tests**: (future) `tests/e2e/` (full system)

### 4. Scoped conftest.py

- `src/agent/test/conftest.py` - Fake ports for agent unit tests
- `src/adapters/appium/conftest.py` - Appium fixtures
- `src/adapters/repo/conftest.py` - Database fixtures
- etc.

**No root-level conftest.py** (avoids test pollution)

## 📋 Verification Commands

```bash
# Verify structure
ls -la src/

# Check imports resolve
python -c "from src.agent.domain import AgentState; print('✅ Imports work')"

# Run tests
pytest src/agent/test         # Unit tests
pytest src/adapters           # Integration tests
pytest                        # All tests

# Check for __init__.py
find src -type d -exec test -e {}/__init__.py \; -print || echo "Missing __init__.py"
```

## 🚫 What NOT to Do

1. **Don't put code at root level** (except config files)
2. **Don't create parallel src/ structures** (e.g., `agent/` and `src/agent/`)
3. **Don't use relative imports** that go above `src/`
4. **Don't put tests at root level** (use `src/*/test/` or `src/*/tests/`)
5. **Don't create root-level conftest.py** (scope to test directories)

## ✅ Migration Checklist

- [x] All code under `src/`
- [x] `src/agent/` (was `agent/` at root)
- [x] `src/adapters/` (was `adapters/` at root)
- [x] `src/bff/` (was `bff/` at root)
- [x] `src/cli/` (was `cli/` at root)
- [x] `src/contracts/` (was `contracts/` at root)
- [x] `src/ui/` (placeholder)
- [x] All `__init__.py` files present
- [x] Scoped `conftest.py` files
- [x] `pyproject.toml` updated with correct paths
- [ ] Old `src/appium` code moved to `src/adapters/appium`
- [ ] Old `main.py` moved to `src/bff/main.py`
- [ ] All imports updated
- [ ] Tests passing

## 📚 References

- See `CLAUDE.md` for architecture rules
- See `MIGRATION.md` for migration steps
- See `pyproject.toml` for package configuration

