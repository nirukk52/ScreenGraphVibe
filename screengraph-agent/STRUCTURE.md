# ScreenGraph-Agent Directory Structure

## Overview
All AppiumTools code has been organized into the `appium` subdirectory for better modularity and organization.

## Directory Structure

```
screengraph-agent/
├── main.py                         # FastAPI application entry point
├── requirements.txt                 # Python dependencies
├── pytest.ini                       # Pytest configuration
├── README.md                        # Main documentation
├── Dockerfile                       # Docker configuration
│
├── src/
│   └── appium/                     # All Appium-related code
│       ├── __init__.py             # Package exports
│       ├── types.py                # Python type definitions
│       ├── types.ts                # TypeScript type definitions
│       ├── config.py               # Configuration constants
│       ├── factory.py              # Factory functions
│       │
│       ├── interfaces/             # Tool interfaces (ABCs)
│       │   ├── appium_tools.py    # Main AppiumTools interface
│       │   ├── connection_tools.py
│       │   ├── data_gathering_tools.py
│       │   ├── action_tools.py
│       │   ├── device_management_tools.py
│       │   ├── app_management_tools.py
│       │   └── navigation_tools.py
│       │
│       └── implementations/        # Platform implementations
│           ├── android_appium_tools.py  # Android implementation (2144 lines)
│           └── ios_appium_tools.py      # iOS placeholder (1025 lines)
│
└── tests/
    └── appium/                     # All Appium-related tests
        ├── __init__.py
        ├── requirements-test.txt   # Test dependencies
        ├── test_types.py          # Type system tests
        ├── test_config.py         # Configuration tests
        ├── test_factory.py        # Factory function tests
        └── test_android_tools.py  # Android implementation tests
```

## Import Paths

### From main.py or other modules:
```python
from src.appium import (
    create_appium_tools,
    create_driver_config,
    create_execution_context,
    get_supported_platforms
)
```

### From test files:
```python
from screengraph_agent.src.appium.types import (
    ToolResult, ToolMetadata, ToolCategory, Bounds
)
from screengraph_agent.src.appium.factory import create_appium_tools
from screengraph_agent.src.appium.implementations.android_appium_tools import AndroidAppiumTools
```

## Key Features

1. **Modular Organization**: All Appium code is contained within the `appium` subdirectory
2. **Clear Separation**: Interfaces, implementations, types, and config are well-organized
3. **Easy Testing**: Test files mirror the source structure
4. **Clean Imports**: Single import point through `src.appium`

## Running Tests

```bash
# From screengraph-agent directory
pytest tests/appium/

# Run specific test file
pytest tests/appium/test_types.py

# Run with coverage
pytest tests/appium/ --cov=src/appium --cov-report=html
```

## Adding New Tools

1. Add interface methods to appropriate interface file in `src/appium/interfaces/`
2. Implement methods in `src/appium/implementations/android_appium_tools.py`
3. Add tests in `tests/appium/test_android_tools.py`
4. Update tool metadata in `get_tool_metadata()` method

## Related Documentation

- Main README: `README.md`
- Implementation Summary: `../APPIUM_TOOLS_SUMMARY.md`
- Configuration Reference: `src/appium/config.py`
- Type Reference: `src/appium/types.py`
