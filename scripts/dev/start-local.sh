#!/bin/bash

# ScreenGraph Local Development Startup Script
# This script starts all services needed for local development

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting ScreenGraph Local Development${NC}\n"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ Error: .env.local not found${NC}"
    echo -e "${YELLOW}📝 Please create .env.local first. See LOCAL_SETUP.md for instructions.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed${NC}"
    echo -e "${YELLOW}📝 Install Node.js 20+ from https://nodejs.org${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment file found${NC}"
echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}\n"

# Kill any existing processes
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
pkill -f "tsx watch" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${RED}❌ Port $port is already in use${NC}"
        echo -e "${YELLOW}📝 Kill the process with: lsof -ti:$port | xargs kill -9${NC}"
        exit 1
    fi
}

# Check if ports are available
echo -e "${YELLOW}🔍 Checking ports...${NC}"
check_port 3000
check_port 3001

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Start Agent in background
echo -e "${BLUE}🔧 Starting Agent (Backend API) on port 3000...${NC}"
cd agent
npm run dev > ../logs/agent.log 2>&1 &
AGENT_PID=$!
cd ..

# Wait for agent to start
echo -e "${YELLOW}⏳ Waiting for Agent to start...${NC}"
sleep 5

# Check if agent is running
if curl -s http://localhost:3000/healthz > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Agent started successfully${NC}"
else
    echo -e "${RED}❌ Agent failed to start${NC}"
    echo -e "${YELLOW}📝 Check logs/agent.log for errors${NC}"
    kill $AGENT_PID 2>/dev/null || true
    exit 1
fi

# Start UI in background
echo -e "${BLUE}🎨 Starting UI (Frontend) on port 3001...${NC}"
cd ui
npm run dev > ../logs/ui.log 2>&1 &
UI_PID=$!
cd ..

# Wait for UI to start
echo -e "${YELLOW}⏳ Waiting for UI to start...${NC}"
sleep 5

# Check if UI is running
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ UI started successfully${NC}\n"
else
    echo -e "${YELLOW}⚠️  UI is still starting (this is normal)${NC}\n"
fi

# Display status
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ ScreenGraph is running!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BLUE}📍 Services:${NC}"
echo -e "   Agent API:    ${GREEN}http://localhost:3000${NC}"
echo -e "   Health Check: ${GREEN}http://localhost:3000/healthz${NC}"
echo -e "   API Docs:     ${GREEN}http://localhost:3000/docs${NC}"
echo -e "   UI:           ${GREEN}http://localhost:3001${NC}\n"

echo -e "${BLUE}📝 Logs:${NC}"
echo -e "   Agent: ${YELLOW}tail -f logs/agent.log${NC}"
echo -e "   UI:    ${YELLOW}tail -f logs/ui.log${NC}\n"

echo -e "${BLUE}🛑 To stop:${NC}"
echo -e "   ${YELLOW}./stop-local.sh${NC}"
echo -e "   Or press ${YELLOW}Ctrl+C${NC} and run: ${YELLOW}pkill -f \"tsx watch\" && pkill -f \"next dev\"${NC}\n"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Save PIDs to file for stop script
mkdir -p logs
echo "$AGENT_PID" > logs/agent.pid
echo "$UI_PID" > logs/ui.pid

# Test the health endpoint
echo -e "\n${BLUE}🏥 Testing health endpoint...${NC}"
sleep 2
curl -s http://localhost:3000/healthz | jq '.' || echo -e "${YELLOW}(jq not installed, showing raw JSON)${NC}" && curl -s http://localhost:3000/healthz

echo -e "\n${GREEN}🎉 All services are ready! Open ${BLUE}http://localhost:3001${GREEN} in your browser${NC}\n"

# Keep script running and show logs
echo -e "${YELLOW}📊 Showing agent logs (Ctrl+C to exit):${NC}\n"
tail -f logs/agent.log

