#!/bin/bash

# ScreenGraph Local Development Stop Script

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Stopping ScreenGraph services...${NC}\n"

# Stop processes using PIDs if available
if [ -f "logs/agent.pid" ]; then
    AGENT_PID=$(cat logs/agent.pid)
    kill $AGENT_PID 2>/dev/null && echo -e "${GREEN}✅ Agent stopped (PID: $AGENT_PID)${NC}" || echo -e "${YELLOW}⚠️  Agent process not found${NC}"
    rm logs/agent.pid
fi

if [ -f "logs/ui.pid" ]; then
    UI_PID=$(cat logs/ui.pid)
    kill $UI_PID 2>/dev/null && echo -e "${GREEN}✅ UI stopped (PID: $UI_PID)${NC}" || echo -e "${YELLOW}⚠️  UI process not found${NC}"
    rm logs/ui.pid
fi

# Kill any remaining processes
echo -e "\n${YELLOW}🧹 Cleaning up any remaining processes...${NC}"
pkill -f "tsx watch" && echo -e "${GREEN}✅ Stopped tsx watch processes${NC}" || true
pkill -f "next dev" && echo -e "${GREEN}✅ Stopped Next.js dev server${NC}" || true

# Check ports
sleep 2
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}⚠️  Port 3000 still in use${NC}"
    echo -e "${YELLOW}   Run: lsof -ti:3000 | xargs kill -9${NC}"
else
    echo -e "${GREEN}✅ Port 3000 is free${NC}"
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}⚠️  Port 3001 still in use${NC}"
    echo -e "${YELLOW}   Run: lsof -ti:3001 | xargs kill -9${NC}"
else
    echo -e "${GREEN}✅ Port 3001 is free${NC}"
fi

echo -e "\n${GREEN}✅ All services stopped${NC}\n"

