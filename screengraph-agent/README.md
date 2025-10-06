# ScreenGraph AppiumTools

A unified interface for mobile app automation across Android and iOS platforms, designed for integration with LangGraph and the ScreenGraph system.

## Overview

ScreenGraph AppiumTools provides a comprehensive set of tools for mobile app automation, including:

- **Connection Management**: Driver initialization, context switching, and connection management
- **Data Gathering**: Screenshots, page source extraction, element information, and device data
- **User Actions**: Tapping, typing, swiping, scrolling, and gesture recognition
- **Device Management**: Orientation control, permissions, system interactions
- **App Management**: Installation, launching, closing, and app state management
- **Navigation**: Back button, home button, app switching, and navigation controls

## Architecture

The AppiumTools system is built with a modular architecture:

```
src/
├── types.py                    # Core types and enums
├── interfaces/                 # Abstract interfaces
│   ├── appium_tools.py        # Main AppiumTools interface
│   ├── connection_tools.py    # Connection management
│   ├── data_gathering_tools.py # Data collection
│   └── action_tools.py        # User interactions
├── implementations/           # Platform-specific implementations
│   ├── android_appium_tools.py # Android implementation
│   └── ios_appium_tools.py    # iOS implementation (placeholder)
├── factory.py                 # Factory functions
└── __init__.py               # Main module exports
```

## Features

### Platform Support
- **Android**: Full implementation using UiAutomator2
- **iOS**: Placeholder implementation for future development

### Tool Categories

#### Connection Tools
- Driver connection and disconnection
- Context switching (NATIVE_APP, WEBVIEW)
- Session management
- Implicit wait configuration

#### Data Gathering Tools
- Screenshot capture
- Page source extraction
- Element information retrieval
- Platform and device information
- Network and app state monitoring

#### Action Tools
- Element tapping and interaction
- Text input and clearing
- Swiping and scrolling
- Multi-touch gestures
- Keyboard management

#### Device Management Tools
- Orientation control
- Permission handling
- System settings access
- Device state management

#### App Management Tools
- App installation and uninstallation
- App launching and closing
- Deep link handling
- App state monitoring

#### Navigation Tools
- Back, home, and menu button simulation
- App switching
- Notification management
- Settings navigation

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Ensure Appium server is running:
```bash
# Install Appium globally
npm install -g appium

# Install platform-specific drivers
appium driver install uiautomator2  # For Android
appium driver install xcuitest      # For iOS

# Start Appium server
appium --port 4723
```

## Usage

### Basic Usage

```python
from screengraph import (
    create_appium_tools, 
    create_driver_config, 
    create_execution_context
)

# Create driver configuration
config = create_driver_config(
    server_url='http://localhost:4723',
    platform='android',
    device_name='emulator-5554',
    platform_version='11.0',
    app_package='com.example.app',
    app_activity='.MainActivity'
)

# Create execution context
context = create_execution_context(
    run_id='run_123',
    session_id='session_456',
    platform='android',
    device_id='emulator-5554'
)

# Create tools instance
tools = create_appium_tools('android', config, context)

# Initialize and use tools
await tools.initialize(context)
await tools.connect(config)

# Take a screenshot
screenshot_result = await tools.screenshot()
if screenshot_result.success:
    print("Screenshot captured successfully")

# Tap on an element
tap_result = await tools.tap_by_selector(
    SelectorType.ID, 
    "com.example.app:id/button"
)

# Disconnect
await tools.disconnect()
```

### API Integration

The AppiumTools are integrated with the ScreenGraph API:

```bash
# Test AppiumTools functionality
curl -X POST "http://localhost:8002/tools/test" \
  -H "Content-Type: application/json" \
  -d '{
    "app_launch_config_id": "config_123",
    "run_id": "run_456",
    "platform": "android",
    "device_name": "emulator-5554",
    "platform_version": "11.0",
    "app_package": "com.example.app",
    "app_activity": ".MainActivity",
    "appium_server_url": "http://localhost:4723"
  }'

# Get supported platforms
curl "http://localhost:8002/platforms"

# Health check
curl "http://localhost:8002/health"
```

## Configuration

### Android Configuration

```python
config = create_driver_config(
    server_url='http://localhost:4723',
    platform='android',
    device_name='emulator-5554',
    platform_version='11.0',
    app_package='com.example.app',
    app_activity='.MainActivity',
    automation_name='UiAutomator2',
    no_reset=True,
    full_reset=False
)
```

### iOS Configuration

```python
config = create_driver_config(
    server_url='http://localhost:4723',
    platform='ios',
    device_name='iPhone 14',
    platform_version='16.0',
    bundle_id='com.example.app',
    automation_name='XCUITest',
    no_reset=True
)
```

## Tool Categories and Methods

### Connection Tools
- `connect(config)` - Initialize driver connection
- `disconnect()` - Disconnect from driver
- `is_connected()` - Check connection status
- `set_implicit_wait(milliseconds)` - Set element wait timeout
- `get_contexts()` - List available contexts
- `set_context(name)` - Switch automation context

### Data Gathering Tools
- `screenshot()` - Capture full-screen screenshot
- `get_page_source()` - Get UI hierarchy XML
- `get_bounds_by_selector(type, selector)` - Get element bounds
- `get_elements_by_selector(type, selector)` - Get all matching elements
- `exists(type, selector)` - Check if element exists
- `wait_for(type, selector, timeout)` - Wait for element
- `find_text(text)` - Find element by text
- `get_platform_info()` - Get device information

### Action Tools
- `tap_by_selector(type, selector)` - Tap element
- `tap_at_coordinates(x, y)` - Tap at coordinates
- `tap_by_text(text)` - Tap element by text
- `type_text(type, selector, text)` - Type text into element
- `swipe(start_x, start_y, end_x, end_y)` - Swipe gesture
- `scroll(direction, distance)` - Scroll in direction
- `long_press_by_selector(type, selector)` - Long press element
- `hide_keyboard()` - Hide virtual keyboard

## Error Handling

All tool methods return a `ToolResult` object:

```python
result = await tools.screenshot()
if result.success:
    print(f"Screenshot data: {result.data}")
else:
    print(f"Error: {result.error}")
```

## Logging

The AppiumTools include comprehensive logging:

```python
# Enable/disable logging
await tools.set_logging_enabled(True)

# Get logs
logs_result = await tools.get_logs(level='info', limit=100)
if logs_result.success:
    for log in logs_result.data:
        print(f"{log.timestamp}: {log.message}")

# Clear logs
await tools.clear_logs()
```

## LangGraph Integration

The AppiumTools are designed for seamless integration with LangGraph:

```python
from langgraph import StateGraph
from screengraph import create_appium_tools

# Create tools instance
tools = create_appium_tools('android', config, context)

# Define LangGraph state
class AppiumState(TypedDict):
    tools: AppiumTools
    current_screen: str
    actions_taken: List[str]

# Create graph
graph = StateGraph(AppiumState)

# Add nodes that use AppiumTools
async def take_screenshot(state: AppiumState):
    result = await state["tools"].screenshot()
    if result.success:
        state["current_screen"] = result.data
    return state

graph.add_node("screenshot", take_screenshot)
```

## Testing

Run the test endpoint to verify AppiumTools functionality:

```bash
# Start the ScreenGraph API
python main.py

# Test in another terminal
curl -X POST "http://localhost:8002/tools/test" \
  -H "Content-Type: application/json" \
  -d '{
    "app_launch_config_id": "test_config",
    "run_id": "test_run",
    "platform": "android",
    "device_name": "emulator-5554",
    "platform_version": "11.0",
    "app_package": "com.android.settings",
    "app_activity": ".Settings"
  }'
```

## Development

### Adding New Tools

1. Add method to appropriate interface in `interfaces/`
2. Implement method in `implementations/android_appium_tools.py`
3. Add placeholder in `implementations/ios_appium_tools.py`
4. Update tool metadata in `get_tool_metadata()`

### Platform-Specific Features

- **Android**: Uses UiAutomator2 for element interaction
- **iOS**: Uses XCUITest (implementation pending)

## Troubleshooting

### Common Issues

1. **Connection Failed**: Ensure Appium server is running and device is connected
2. **Element Not Found**: Check selector type and value, ensure element is visible
3. **Timeout Errors**: Increase implicit wait or operation timeout
4. **Permission Denied**: Grant necessary permissions to the app

### Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Contributing

1. Follow the existing code structure and patterns
2. Add comprehensive error handling
3. Include logging for all operations
4. Update documentation for new features
5. Add tests for new functionality

## License

This project is part of the ScreenGraph system and follows the same licensing terms.