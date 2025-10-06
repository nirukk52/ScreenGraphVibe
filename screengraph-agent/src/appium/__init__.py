"""
ScreenGraph AppiumTools

This module provides a unified interface for mobile app automation across platforms.
It includes Android and iOS implementations using Appium, designed for integration with LangGraph.

Main Components:
- AppiumTools: Main interface combining all tool categories
- AndroidAppiumTools: Android-specific implementation
- IOSAppiumTools: iOS-specific implementation (placeholder)
- Factory functions for creating tool instances

Usage:
    from screengraph import create_appium_tools, create_driver_config, create_execution_context
    
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
    
    # Use the tools
    await tools.connect(config)
    screenshot_result = await tools.screenshot()
    await tools.disconnect()
"""

from .types import (
    ToolResult, SelectorType, Bounds, DeviceOrientation, PlatformInfo,
    ScreenSize, AutomationContext, SystemPermission, AppInfo, DeepLinkInfo,
    ToolExecutionContext, BatchOperationResult, ToolMetadata, ToolCategory,
    ToolErrorType, ToolError
)

from .interfaces.appium_tools import AppiumTools, ToolHealthStatus, ToolUsageStats, ToolLogEntry
from .interfaces.connection_tools import ConnectionTools, DriverConfig, DriverSessionInfo
from .interfaces.data_gathering_tools import DataGatheringTools, ElementInfo, AppStateInfo, NetworkInfo, LogEntry
from .interfaces.action_tools import ActionTools, SwipeDirection, ScrollDirection, TouchGesture

from .implementations.android_appium_tools import AndroidAppiumTools
from .implementations.ios_appium_tools import IOSAppiumTools

from .factory import (
    create_appium_tools,
    create_android_tools,
    create_ios_tools,
    create_driver_config,
    create_execution_context,
    get_supported_platforms,
    validate_platform
)

# Version information
__version__ = "0.1.0"
__author__ = "ScreenGraph Team"
__description__ = "Unified mobile app automation tools for Android and iOS"

# Export main classes and functions
__all__ = [
    # Types
    'ToolResult', 'SelectorType', 'Bounds', 'DeviceOrientation', 'PlatformInfo',
    'ScreenSize', 'AutomationContext', 'SystemPermission', 'AppInfo', 'DeepLinkInfo',
    'ToolExecutionContext', 'BatchOperationResult', 'ToolMetadata', 'ToolCategory',
    'ToolErrorType', 'ToolError',
    
    # Interfaces
    'AppiumTools', 'ToolHealthStatus', 'ToolUsageStats', 'ToolLogEntry',
    'ConnectionTools', 'DriverConfig', 'DriverSessionInfo',
    'DataGatheringTools', 'ElementInfo', 'AppStateInfo', 'NetworkInfo', 'LogEntry',
    'ActionTools', 'SwipeDirection', 'ScrollDirection', 'TouchGesture',
    
    # Implementations
    'AndroidAppiumTools', 'IOSAppiumTools',
    
    # Factory functions
    'create_appium_tools', 'create_android_tools', 'create_ios_tools',
    'create_driver_config', 'create_execution_context',
    'get_supported_platforms', 'validate_platform',
    
    # Version info
    '__version__', '__author__', '__description__'
]