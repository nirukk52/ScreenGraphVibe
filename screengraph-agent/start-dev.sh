#!/bin/bash
# Development start script for screengraph-agent
# Always runs in venv with hot reload

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🐍 Starting ScreenGraph Agent (Development Mode)${NC}"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ Virtual environment not found!${NC}"
    echo -e "${YELLOW}Run: npm run agent:setup${NC}"
    exit 1
fi

# Activate venv
echo -e "${GREEN}✓ Activating virtual environment...${NC}"
source venv/bin/activate

# Verify Python version
PYTHON_VERSION=$(python --version 2>&1)
echo -e "${GREEN}✓ Using: ${PYTHON_VERSION}${NC}"

# Check if dependencies are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Installing dependencies...${NC}"
    pip install -r requirements.txt
fi

echo -e "${GREEN}✓ All dependencies available${NC}"

# Start the server with hot reload
echo -e "${GREEN}🔥 Starting FastAPI server with hot reload on port 8000...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
uvicorn src.bff.main:app --reload --host 0.0.0.0 --port 8000
