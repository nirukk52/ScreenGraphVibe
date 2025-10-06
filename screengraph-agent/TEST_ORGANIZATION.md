# Test Organization

This document describes the test structure for the ScreenGraph Agent.

---

## 🎯 Test Location Strategy

### **Rule**: Tests are co-located with the code they test

```
src/
├── agent/
│   ├── domain/
│   ├── ports/
│   ├── orchestrator/
│   └── test/              # ← Unit tests for agent core
│       ├── __init__.py
│       ├── conftest.py    # Fake ports, test fixtures
│       ├── test_domain/
│       ├── test_services/
│       └── test_orchestrator/
│
└── adapters/
    ├── appium/
    │   ├── adapter.py
    │   └── tests/         # ← Integration tests for appium
    │       ├── __init__.py
    │       ├── conftest.py
    │       └── test_*.py
    │
    ├── llm/
    │   └── tests/         # ← Integration tests for LLM
    │
    └── repo/
        └── tests/         # ← Integration tests for repo

tests/
└── e2e/                   # ← End-to-end tests (full system)
    ├── __init__.py
    ├── conftest.py
    └── test_*.py
```

---

## 🧪 Test Types

### 1. **Unit Tests** → `src/agent/test/`

**Purpose**: Test agent core in isolation  
**Dependencies**: Fake ports (no real SDKs)  
**Speed**: Fast (< 1s per test)  
**Run**: `pytest src/agent/test/`

**Example**:
```python
# src/agent/test/test_orchestrator/test_ensure_device.py
from src.agent.orchestrator.nodes import EnsureDeviceNode
from src.agent.test.fakes import FakeDriverPort

def test_ensure_device_success():
    driver = FakeDriverPort(is_ready=True)
    node = EnsureDeviceNode(driver=driver)
    state = create_initial_state()
    
    result = node.run(state)
    
    assert result.device_ready is True
```

---

### 2. **Integration Tests** → `src/adapters/*/tests/`

**Purpose**: Test adapters with real SDKs  
**Dependencies**: Real Appium, databases, APIs  
**Speed**: Slower (1-10s per test)  
**Run**: `pytest src/adapters/appium/tests/`

**Example**:
```python
# src/adapters/appium/tests/test_adapter.py
import pytest
from src.adapters.appium import AppiumAdapter

@pytest.mark.integration
async def test_tap_real_device(appium_adapter):
    # Uses real Appium connection
    await appium_adapter.tap(0.5, 0.5)
    
    # Verify tap occurred
    assert await appium_adapter.get_current_app() == "com.example.app"
```

---

### 3. **E2E Tests** → `tests/e2e/`

**Purpose**: Test full system end-to-end  
**Dependencies**: All adapters, real device, database  
**Speed**: Very slow (10-60s per test)  
**Run**: `pytest tests/e2e/`

**Example**:
```python
# tests/e2e/test_crawl_session.py
import pytest

@pytest.mark.e2e
async def test_full_crawl_session(api_client, android_device):
    # Start session
    response = await api_client.post("/sessions", json={
        "app_id": "com.example.app",
        "budgets": {"max_steps": 10}
    })
    session_id = response.json()["session_id"]
    
    # Iterate
    for _ in range(10):
        await api_client.post(f"/sessions/{session_id}/iterate")
    
    # Verify graph created
    summary = await api_client.get(f"/sessions/{session_id}/summary")
    assert summary.json()["screens_visited"] > 0
```

---

## 📋 Test Commands

### Run All Tests
```bash
pytest
```

### Run by Location
```bash
# Agent core unit tests
pytest src/agent/test/

# Appium integration tests
pytest src/adapters/appium/tests/

# All adapter tests
pytest src/adapters/

# E2E tests only
pytest tests/e2e/
```

### Run by Marker
```bash
# Unit tests only (fast)
pytest -m unit

# Integration tests only
pytest -m integration

# E2E tests only
pytest -m e2e

# Skip slow tests
pytest -m "not slow"
```

### Run with Coverage
```bash
# All tests with coverage
pytest --cov=src/agent --cov=src/adapters --cov-report=html

# Specific adapter coverage
pytest src/adapters/appium/tests/ --cov=src.adapters.appium
```

### Run Changed Tests (CI)
```bash
# Detect changed files and run relevant tests
pytest --testmon

# Or manually scope:
pytest src/adapters/appium/tests/  # If appium adapter changed
pytest src/agent/test/             # If agent core changed
```

---

## 🔧 Scoped Fixtures

Each test area has its own `conftest.py`:

### `src/agent/test/conftest.py`
```python
"""Fake ports for unit testing."""
import pytest
from src.agent.test.fakes import (
    FakeDriverPort,
    FakeLLMPort,
    FakeRepoPort,
)

@pytest.fixture
def fake_driver():
    return FakeDriverPort()

@pytest.fixture
def fake_llm():
    return FakeLLMPort()

@pytest.fixture
def initial_state():
    return create_test_state()
```

### `src/adapters/appium/tests/conftest.py`
```python
"""Real Appium fixtures for integration testing."""
import pytest
from src.adapters.appium import AppiumAdapter

@pytest.fixture
async def appium_adapter():
    adapter = AppiumAdapter(
        hub_url="http://localhost:4723",
        platform="android",
    )
    await adapter.connect()
    yield adapter
    await adapter.disconnect()

@pytest.fixture(scope="session")
def android_emulator():
    # Start emulator with Testcontainers
    pass
```

### `tests/e2e/conftest.py`
```python
"""E2E fixtures."""
import pytest
from fastapi.testclient import TestClient
from src.bff.main import app

@pytest.fixture
def api_client():
    return TestClient(app)

@pytest.fixture
def full_system():
    # Setup database, start services, etc.
    pass
```

---

## 🚫 What NOT to Do

1. **Don't put adapter tests in `src/agent/test/`**  
   → Adapter tests should be in `src/adapters/*/tests/`

2. **Don't put unit tests in `tests/`**  
   → Root `tests/` is for E2E only

3. **Don't create root-level `conftest.py`**  
   → Causes fixture pollution across test suites

4. **Don't mix unit and integration tests**  
   → Keep them separate for CI optimization

5. **Don't hardcode device IDs**  
   → Use fixtures and environment variables

---

## 📊 CI Strategy

```yaml
# .github/workflows/test.yml
jobs:
  test-agent:
    name: Agent Unit Tests
    run: pytest src/agent/test/ -m unit
    
  test-appium:
    name: Appium Integration Tests
    if: contains(github.event.modified, 'src/adapters/appium')
    run: pytest src/adapters/appium/tests/ -m integration
    
  test-llm:
    name: LLM Integration Tests
    if: contains(github.event.modified, 'src/adapters/llm')
    run: pytest src/adapters/llm/tests/ -m integration
    
  test-e2e:
    name: E2E Tests
    needs: [test-agent, test-appium, test-llm]
    run: pytest tests/e2e/ -m e2e
```

---

## ✅ Benefits of This Structure

1. **Fast CI**: Run only tests for changed code
2. **Clear Ownership**: Each module owns its tests
3. **No Pollution**: Scoped fixtures per area
4. **Easy Navigation**: Tests next to code
5. **Parallel Execution**: Test suites are independent

---

## 🎯 Summary

| Test Type | Location | Dependencies | Speed | Run Command |
|-----------|----------|--------------|-------|-------------|
| **Unit** | `src/agent/test/` | Fake ports | Fast | `pytest src/agent/test/` |
| **Integration** | `src/adapters/*/tests/` | Real SDKs | Medium | `pytest src/adapters/` |
| **E2E** | `tests/e2e/` | Full system | Slow | `pytest tests/e2e/` |

**Golden Rule**: Tests live with the code they test. Unit tests for core, integration tests for adapters, E2E tests at root.

