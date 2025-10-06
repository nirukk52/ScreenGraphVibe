"""
:screengraph - ScreenGraph API with AppiumTools integration
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import httpx
import logging
import asyncio
from datetime import datetime

# Import AppiumTools
from src.appium import (
    create_appium_tools, 
    create_driver_config, 
    create_execution_context,
    get_supported_platforms
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ScreenGraph API", version="0.1.0")

# Data model for app launch config from UI
class AppLaunchConfigRequest(BaseModel):
    app_launch_config_id: str
    run_id: str
    platform: str = "android"
    device_name: str
    platform_version: str
    app_package: Optional[str] = None
    app_activity: Optional[str] = None
    bundle_id: Optional[str] = None
    appium_server_url: str = "http://localhost:4723"

class ScreengraphGenerationResponse(BaseModel):
    success: bool
    message: str
    run_id: str
    app_launch_config_id: str
    platform: str
    tools_initialized: bool

@app.post("/screengraph/generate", response_model=ScreengraphGenerationResponse)
async def generate_screengraph(request: AppLaunchConfigRequest):
    """
    API endpoint that receives app launch config from UI after 'go' press on /setup.
    This endpoint will be called by :agent with the selected dropdown values.
    Now includes AppiumTools initialization and basic functionality.
    """
    try:
        logger.info(f"Received screengraph generation request for run {request.run_id}")
        
        # Validate platform
        if request.platform not in get_supported_platforms():
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported platform: {request.platform}. Supported: {get_supported_platforms()}"
            )
        
        # Create driver configuration
        driver_config = create_driver_config(
            server_url=request.appium_server_url,
            platform=request.platform,
            device_name=request.device_name,
            platform_version=request.platform_version,
            app_package=request.app_package,
            app_activity=request.app_activity,
            bundle_id=request.bundle_id
        )
        
        # Create execution context
        execution_context = create_execution_context(
            run_id=request.run_id,
            session_id=f"session_{request.run_id}",
            platform=request.platform,
            device_id=request.device_name
        )
        
        # Create AppiumTools instance
        tools = create_appium_tools(request.platform, driver_config, execution_context)
        
        # Initialize tools
        init_result = await tools.initialize(execution_context)
        tools_initialized = init_result.success
        
        if tools_initialized:
            logger.info(f"AppiumTools initialized successfully for {request.platform}")
            
            # TODO: This is where the actual screengraph generation logic would go
            # For now, we have the tools ready for use
            
            # Example: Take a screenshot to verify tools are working
            # screenshot_result = await tools.screenshot()
            # if screenshot_result.success:
            #     logger.info("Screenshot captured successfully")
            
        else:
            logger.warning(f"Failed to initialize AppiumTools: {init_result.error}")
        
        return ScreengraphGenerationResponse(
            success=True,
            message="Screengraph generation started with AppiumTools",
            run_id=request.run_id,
            app_launch_config_id=request.app_launch_config_id,
            platform=request.platform,
            tools_initialized=tools_initialized
        )
        
    except Exception as e:
        logger.error(f"Error processing screengraph request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "screengraph",
        "supported_platforms": get_supported_platforms(),
        "version": "0.1.0"
    }

@app.get("/platforms")
async def get_platforms():
    """Get supported platforms"""
    return {
        "supported_platforms": get_supported_platforms(),
        "platform_details": {
            "android": {
                "automation_name": "UiAutomator2",
                "capabilities": ["appPackage", "appActivity", "automationName"]
            },
            "ios": {
                "automation_name": "XCUITest", 
                "capabilities": ["bundleId", "automationName"]
            }
        }
    }

@app.post("/tools/test")
async def test_tools(request: AppLaunchConfigRequest):
    """
    Test endpoint to verify AppiumTools functionality
    """
    try:
        logger.info(f"Testing AppiumTools for run {request.run_id}")
        
        # Create driver configuration
        driver_config = create_driver_config(
            server_url=request.appium_server_url,
            platform=request.platform,
            device_name=request.device_name,
            platform_version=request.platform_version,
            app_package=request.app_package,
            app_activity=request.app_activity,
            bundle_id=request.bundle_id
        )
        
        # Create execution context
        execution_context = create_execution_context(
            run_id=request.run_id,
            session_id=f"test_session_{request.run_id}",
            platform=request.platform,
            device_id=request.device_name
        )
        
        # Create and test tools
        tools = create_appium_tools(request.platform, driver_config, execution_context)
        
        # Test initialization
        init_result = await tools.initialize(execution_context)
        
        if init_result.success:
            # Test connection (this will fail if Appium server is not running)
            connect_result = await tools.connect(driver_config)
            
            if connect_result.success:
                # Test basic functionality
                screenshot_result = await tools.screenshot()
                page_source_result = await tools.get_page_source()
                
                # Disconnect
                await tools.disconnect()
                
                return {
                    "success": True,
                    "message": "AppiumTools test completed successfully",
                    "results": {
                        "initialization": init_result.success,
                        "connection": connect_result.success,
                        "screenshot": screenshot_result.success,
                        "page_source": page_source_result.success
                    }
                }
            else:
                return {
                    "success": False,
                    "message": "AppiumTools test failed - could not connect to device",
                    "error": connect_result.error
                }
        else:
            return {
                "success": False,
                "message": "AppiumTools test failed - initialization error",
                "error": init_result.error
            }
            
    except Exception as e:
        logger.error(f"Error testing AppiumTools: {e}")
        return {
            "success": False,
            "message": f"AppiumTools test failed: {str(e)}",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)