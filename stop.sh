#!/bin/bash

# ScreenGraph Environment-Aware Stop Script
# Stops the appropriate environment based on what's running

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default to auto-detect
ENVIRONMENT=${1:-auto}

echo -e "${BLUE}🛑 Stopping ScreenGraph${NC}"

# Auto-detect what's running
if [ "$ENVIRONMENT" = "auto" ]; then
    if curl -s http://localhost:3000/healthz > /dev/null 2>&1; then
        ENVIRONMENT="local"
        echo -e "${YELLOW}🔍 Auto-detected: Local development environment${NC}\n"
    else
        echo -e "${YELLOW}⚠️  No local services detected${NC}"
        echo -e "${YELLOW}💡 Use './stop.sh local' to force stop local services${NC}"
        echo -e "${YELLOW}💡 Use './stop.sh prod' to manage production services${NC}\n"
        exit 0
    fi
fi

case $ENVIRONMENT in
    "local"|"dev"|"development")
        echo -e "${GREEN}🏠 Stopping LOCAL development services...${NC}\n"

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

        echo -e "\n${GREEN}✅ Local development services stopped${NC}\n"
        ;;
        
    "prod"|"production")
        echo -e "${GREEN}☁️  Managing PRODUCTION services...${NC}\n"
        
        # Check if flyctl is available
        if ! command -v flyctl &> /dev/null; then
            echo -e "${RED}❌ Error: flyctl is not installed${NC}"
            echo -e "${YELLOW}📝 Install with: brew install flyctl${NC}"
            exit 1
        fi

        # Check if logged in to Fly.io
        if ! flyctl auth whoami &> /dev/null; then
            echo -e "${RED}❌ Error: Not logged in to Fly.io${NC}"
            echo -e "${YELLOW}📝 Login with: flyctl auth login${NC}"
            exit 1
        fi

        # Show production status
        echo -e "${BLUE}📊 Production Status:${NC}"
        flyctl status --app screengraph-agent 2>/dev/null || echo -e "${YELLOW}   Agent: Not available${NC}"
        flyctl status --app screengraph-ui 2>/dev/null || echo -e "${YELLOW}   UI: Not available${NC}"
        
        echo -e "\n${YELLOW}💡 Production services can't be 'stopped' - they're managed by Fly.io${NC}"
        echo -e "${YELLOW}💡 To scale down: flyctl scale count 0 --app screengraph-agent${NC}"
        echo -e "${YELLOW}💡 To view logs: flyctl logs --app screengraph-agent${NC}"
        echo -e "${YELLOW}💡 To restart: flyctl machine restart --app screengraph-agent${NC}\n"
        ;;
        
    "all")
        echo -e "${GREEN}🔄 Stopping ALL environments...${NC}\n"
        
        # Stop local
        echo -e "${BLUE}🏠 Stopping local services...${NC}"
        ./stop.sh local
        
        # Show production status
        echo -e "\n${BLUE}☁️  Production services:${NC}"
        ./stop.sh prod
        ;;
        
    *)
        echo -e "${RED}❌ Unknown environment: ${ENVIRONMENT}${NC}\n"
        echo -e "${YELLOW}Usage:${NC}"
        echo -e "   ${GREEN}./stop.sh${NC}           # Auto-detect and stop"
        echo -e "   ${GREEN}./stop.sh local${NC}     # Stop local development"
        echo -e "   ${GREEN}./stop.sh prod${NC}      # Show production status"
        echo -e "   ${GREEN}./stop.sh all${NC}       # Stop local + show production"
        echo -e ""
        echo -e "${YELLOW}Available environments:${NC}"
        echo -e "   ${GREEN}local/dev/development${NC} - Stop local development servers"
        echo -e "   ${GREEN}prod/production${NC}       - Show production service info"
        echo -e "   ${GREEN}all${NC}                   - Stop local + show production"
        echo -e "   ${GREEN}auto${NC}                  - Auto-detect what to stop"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ Stop operation complete${NC}\n"
