#!/bin/bash

# Screengraph Deployment Script
# Deploys to US East, US Central, and India regions

set -e

echo "🚀 Starting Screengraph deployment..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Regions to deploy to
REGIONS=("iad" "dfw" "bom")
REGION_NAMES=("US East (Virginia)" "US Central (Texas)" "India (Mumbai)")

# App names
AGENT_APP="screengraph-agent"
UI_APP="screengraph-ui"

# Function to deploy to a region
deploy_to_region() {
    local region=$1
    local region_name=$2
    
    echo -e "${BLUE}📍 Deploying to ${region_name} (${region})...${NC}"
    
    # Deploy Agent
    echo "  🔧 Deploying Agent..."
    cd agent
    fly deploy --region $region --app $AGENT_APP
    cd ..
    
    # Deploy UI
    echo "  🎨 Deploying UI..."
    cd ui
    fly deploy --region $region --app $UI_APP
    cd ..
    
    echo -e "${GREEN}  ✅ Successfully deployed to ${region}${NC}"
}

# Function to check health
check_health() {
    local region=$1
    local region_name=$2
    
    echo -e "${YELLOW}  🏥 Checking health for ${region_name}...${NC}"
    
    # Check Agent health
    local agent_url="https://${AGENT_APP}.fly.dev/healthz"
    local agent_status=$(curl -s -o /dev/null -w "%{http_code}" $agent_url || echo "000")
    
    # Check UI health
    local ui_url="https://${UI_APP}.fly.dev"
    local ui_status=$(curl -s -o /dev/null -w "%{http_code}" $ui_url || echo "000")
    
    if [ "$agent_status" = "200" ] && [ "$ui_status" = "200" ]; then
        echo -e "${GREEN}  ✅ ${region_name}: All services healthy${NC}"
        return 0
    else
        echo -e "${RED}  ❌ ${region_name}: Agent(${agent_status}) UI(${ui_status})${NC}"
        return 1
    fi
}

# Main deployment process
echo "🔨 Building workspace..."
npm run build

echo ""
echo "🚀 Starting deployment to all regions..."
echo ""

# Deploy to each region
for i in "${!REGIONS[@]}"; do
    deploy_to_region "${REGIONS[$i]}" "${REGION_NAMES[$i]}"
    echo ""
done

echo "🏥 Health Check Summary"
echo "======================="

# Health check all regions
for i in "${!REGIONS[@]}"; do
    check_health "${REGIONS[$i]}" "${REGION_NAMES[$i]}"
done

echo ""
echo "🌐 Deployment Complete!"
echo "======================="
echo ""
echo "Dashboard URLs:"
echo "---------------"
echo "🇺🇸 US East (Virginia):"
echo "  Agent: https://screengraph-agent.fly.dev/healthz"
echo "  UI:    https://screengraph-ui.fly.dev"
echo ""
echo "🇺🇸 US Central (Texas):"
echo "  Agent: https://screengraph-agent.fly.dev/healthz"
echo "  UI:    https://screengraph-ui.fly.dev"
echo ""
echo "🇮🇳 India (Mumbai):"
echo "  Agent: https://screengraph-agent.fly.dev/healthz"
echo "  UI:    https://screengraph-ui.fly.dev"
echo ""
echo "📊 Monitoring:"
echo "  Fly Dashboard: https://fly.io/dashboard"
echo "  Agent Logs:    fly logs --app $AGENT_APP"
echo "  UI Logs:       fly logs --app $UI_APP"
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
