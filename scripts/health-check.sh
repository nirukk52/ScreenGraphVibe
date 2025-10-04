#!/bin/bash

# Health Check Script for Screengraph
# Checks all regions and provides status dashboard

set -e

echo "🏥 Screengraph Health Check Dashboard"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Regions and names
REGIONS=("iad" "dfw" "bom")
REGION_NAMES=("US East (Virginia)" "US Central (Texas)" "India (Mumbai)")

# App names
AGENT_APP="screengraph-agent"
UI_APP="screengraph-ui"

# Function to check service health
check_service() {
    local url=$1
    local service_name=$2
    
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 $url || echo "000")
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 $url 2>/dev/null | cut -c1-4 || echo "N/A")
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✅ ${service_name}: OK (${response_time}s)${NC}"
        return 0
    else
        echo -e "${RED}❌ ${service_name}: FAILED (${status_code})${NC}"
        return 1
    fi
}

# Function to get detailed health info
get_health_details() {
    local url=$1
    local service_name=$2
    
    echo -e "${BLUE}📊 ${service_name} Details:${NC}"
    
    local health_response=$(curl -s --max-time 10 $url 2>/dev/null || echo '{"status":"error","message":"Connection failed"}')
    
    # Parse JSON response (basic parsing)
    local status=$(echo $health_response | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    local environment=$(echo $health_response | grep -o '"environment":"[^"]*"' | cut -d'"' -f4)
    local region=$(echo $health_response | grep -o '"region":"[^"]*"' | cut -d'"' -f4)
    local timestamp=$(echo $health_response | grep -o '"timestamp":"[^"]*"' | cut -d'"' -f4)
    
    echo "  Status: $status"
    echo "  Environment: $environment"
    echo "  Region: $region"
    echo "  Last Check: $timestamp"
    echo ""
}

# Main health check
echo "Checking all regions..."
echo ""

total_healthy=0
total_services=0

for i in "${!REGIONS[@]}"; do
    region="${REGIONS[$i]}"
    region_name="${REGION_NAMES[$i]}"
    
    echo -e "${BLUE}🌍 ${region_name} (${region})${NC}"
    echo "----------------------------------------"
    
    # Check Agent
    agent_url="https://${AGENT_APP}.fly.dev/healthz"
    if check_service $agent_url "Agent API"; then
        ((total_healthy++))
    fi
    ((total_services++))
    
    # Check UI
    ui_url="https://${UI_APP}.fly.dev"
    if check_service $ui_url "UI Dashboard"; then
        ((total_healthy++))
    fi
    ((total_services++))
    
    # Get detailed health info
    get_health_details $agent_url "Agent Health"
    
    echo ""
done

# Summary
echo "📈 Health Summary"
echo "================="
echo -e "Healthy Services: ${GREEN}${total_healthy}/${total_services}${NC}"

if [ $total_healthy -eq $total_services ]; then
    echo -e "${GREEN}🎉 All services are healthy!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some services are experiencing issues${NC}"
    exit 1
fi
