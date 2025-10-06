#!/bin/bash

# ScreenGraph Environment-Aware Startup Script
# Automatically detects and starts the appropriate environment

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default to local if no argument provided
ENVIRONMENT=${1:-local}

echo -e "${BLUE}🚀 Starting ScreenGraph${NC}"
echo -e "${BLUE}📋 Environment: ${ENVIRONMENT}${NC}\n"

# Function to detect environment
detect_environment() {
    # Check if we're in a production-like environment
    if [ "$NODE_ENV" = "production" ] || [ -n "$FLY_APP_NAME" ]; then
        echo "production"
    elif [ -f ".env.local" ] && grep -q "NODE_ENV=development" .env.local; then
        echo "local"
    else
        echo "unknown"
    fi
}

# Auto-detect if no environment specified and not explicitly set
if [ "$ENVIRONMENT" = "auto" ]; then
    ENVIRONMENT=$(detect_environment)
    echo -e "${YELLOW}🔍 Auto-detected environment: ${ENVIRONMENT}${NC}\n"
fi

case $ENVIRONMENT in
    "local"|"dev"|"development")
        echo -e "${GREEN}🏠 Starting LOCAL development environment${NC}\n"
        
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

        # Start Backend in background
        echo -e "${BLUE}🔧 Starting Backend (Backend API) on port 3000...${NC}"
        cd backend
        npm run dev > ../logs/backend.log 2>&1 &
        BACKEND_PID=$!
        cd ..

        # Wait for backend to start
        echo -e "${YELLOW}⏳ Waiting for Backend to start...${NC}"
        sleep 5

        # Check if backend is running
        if curl -s http://localhost:3000/healthz > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend started successfully${NC}"
        else
            echo -e "${RED}❌ Backend failed to start${NC}"
            echo -e "${YELLOW}📝 Check logs/backend.log for errors${NC}"
            kill $BACKEND_PID 2>/dev/null || true
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
        echo -e "${GREEN}✅ ScreenGraph LOCAL environment is running!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

        echo -e "${BLUE}📍 Services:${NC}"
        echo -e "   Backend API:  ${GREEN}http://localhost:3000${NC}"
        echo -e "   Health Check: ${GREEN}http://localhost:3000/healthz${NC}"
        echo -e "   API Docs:     ${GREEN}http://localhost:3000/docs${NC}"
        echo -e "   UI:           ${GREEN}http://localhost:3001${NC}\n"

        echo -e "${BLUE}📝 Logs:${NC}"
        echo -e "   Backend: ${YELLOW}tail -f logs/backend.log${NC}"
        echo -e "   UI:      ${YELLOW}tail -f logs/ui.log${NC}\n"

        echo -e "${BLUE}🛑 To stop:${NC}"
        echo -e "   ${YELLOW}./stop.sh${NC}"
        echo -e "   Or press ${YELLOW}Ctrl+C${NC} and run: ${YELLOW}pkill -f \"tsx watch\" && pkill -f \"next dev\"${NC}\n"

        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

        # Save PIDs to file for stop script
        mkdir -p logs
        echo "$BACKEND_PID" > logs/backend.pid
        echo "$UI_PID" > logs/ui.pid

        # Test the health endpoint
        echo -e "\n${BLUE}🏥 Testing health endpoint...${NC}"
        sleep 2
        curl -s http://localhost:3000/healthz | jq '.' || echo -e "${YELLOW}(jq not installed, showing raw JSON)${NC}" && curl -s http://localhost:3000/healthz

        echo -e "\n${GREEN}🎉 All services are ready! Open ${BLUE}http://localhost:3001${GREEN} in your browser${NC}\n"

        # Keep script running and show logs
        echo -e "${YELLOW}📊 Showing backend logs (Ctrl+C to exit):${NC}\n"
        tail -f logs/backend.log
        ;;
        
    "prod"|"production")
        echo -e "${GREEN}☁️  Starting PRODUCTION environment (Fly.io)${NC}\n"
        
        # Check if flyctl is installed
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

        echo -e "${GREEN}✅ flyctl authenticated${NC}\n"

        # Deploy backend
        echo -e "${BLUE}🚀 Deploying Backend to Fly.io...${NC}"
        cd backend
        flyctl deploy
        cd ..

        # Deploy UI
        echo -e "${BLUE}🚀 Deploying UI to Fly.io...${NC}"
        cd ui
        flyctl deploy
        cd ..

        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✅ ScreenGraph PRODUCTION deployment complete!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

        echo -e "${BLUE}📍 Production URLs:${NC}"
        echo -e "   Backend API:  ${GREEN}https://screengraph-backend.fly.dev${NC}"
        echo -e "   Health Check: ${GREEN}https://screengraph-backend.fly.dev/healthz${NC}"
        echo -e "   API Docs:     ${GREEN}https://screengraph-backend.fly.dev/docs${NC}"
        echo -e "   UI:           ${GREEN}https://screengraph-ui.fly.dev${NC}\n"

        echo -e "${BLUE}🛑 To manage:${NC}"
        echo -e "   Status: ${YELLOW}flyctl status --app screengraph-backend${NC}"
        echo -e "   Logs:   ${YELLOW}flyctl logs --app screengraph-backend${NC}\n"
        ;;
        
    "status")
        echo -e "${BLUE}📊 Checking ScreenGraph status...${NC}\n"
        
        # Check local services
        echo -e "${YELLOW}🏠 Local Environment:${NC}"
        if curl -s http://localhost:3000/healthz > /dev/null 2>&1; then
            echo -e "   Backend: ${GREEN}✅ Running${NC} (http://localhost:3000)"
            curl -s http://localhost:3000/healthz | jq -r '.message' 2>/dev/null || true
        else
            echo -e "   Backend: ${RED}❌ Not running${NC}"
        fi
        
        if curl -s http://localhost:3001 > /dev/null 2>&1; then
            echo -e "   UI:      ${GREEN}✅ Running${NC} (http://localhost:3001)"
        else
            echo -e "   UI:      ${RED}❌ Not running${NC}"
        fi
        
        echo ""
        
        # Check production services
        echo -e "${YELLOW}☁️  Production Environment:${NC}"
        if command -v flyctl &> /dev/null && flyctl auth whoami &> /dev/null; then
            if curl -s https://screengraph-backend.fly.dev/healthz > /dev/null 2>&1; then
                echo -e "   Backend: ${GREEN}✅ Running${NC} (https://screengraph-backend.fly.dev)"
                curl -s https://screengraph-backend.fly.dev/healthz | jq -r '.message' 2>/dev/null || true
            else
                echo -e "   Backend: ${RED}❌ Not running or unreachable${NC}"
            fi
            
            if curl -s https://screengraph-ui.fly.dev > /dev/null 2>&1; then
                echo -e "   UI:      ${GREEN}✅ Running${NC} (https://screengraph-ui.fly.dev)"
            else
                echo -e "   UI:      ${RED}❌ Not running or unreachable${NC}"
            fi
        else
            echo -e "   Production: ${YELLOW}⚠️  flyctl not configured${NC}"
        fi
        ;;
        
    *)
        echo -e "${RED}❌ Unknown environment: ${ENVIRONMENT}${NC}\n"
        echo -e "${YELLOW}Usage:${NC}"
        echo -e "   ${GREEN}./start.sh${NC}           # Start local development"
        echo -e "   ${GREEN}./start.sh local${NC}     # Start local development"
        echo -e "   ${GREEN}./start.sh prod${NC}      # Deploy to production"
        echo -e "   ${GREEN}./start.sh status${NC}    # Check status of both environments"
        echo -e "   ${GREEN}./start.sh auto${NC}      # Auto-detect environment"
        echo -e ""
        echo -e "${YELLOW}Available environments:${NC}"
        echo -e "   ${GREEN}local/dev/development${NC} - Start local development servers"
        echo -e "   ${GREEN}prod/production${NC}       - Deploy to Fly.io"
        echo -e "   ${GREEN}status${NC}                - Check status of all environments"
        echo -e "   ${GREEN}auto${NC}                  - Auto-detect environment from context"
        exit 1
        ;;
esac
