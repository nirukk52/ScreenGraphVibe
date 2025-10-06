#!/bin/bash

# Exit on any error
set -e

# Function to cleanup processes
cleanup() {
  echo "Cleaning up processes..."
  # Kill specific processes by PID
  if [ ! -z "$AGENT_PID" ]; then
    kill $AGENT_PID 2>/dev/null || true
    wait $AGENT_PID 2>/dev/null || true
  fi
  if [ ! -z "$UI_PID" ]; then
    kill $UI_PID 2>/dev/null || true
    wait $UI_PID 2>/dev/null || true
  fi
  
  # Kill any remaining processes
  pkill -f "tsx watch" 2>/dev/null || true
  pkill -f "next dev" 2>/dev/null || true
  pkill -f "playwright" 2>/dev/null || true
  
  echo "Cleanup completed!"
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

echo "Starting E2E test setup..."

# Kill any existing processes first
cleanup

# Start agent in background
echo "Starting agent..."
cd ../agent
POSTGRES_URL=postgresql://localhost:5432/test NODE_ENV=test npx tsx watch src/index.ts &
AGENT_PID=$!

# Wait for agent to start
echo "Waiting for agent to start..."
sleep 5

# Check if agent is healthy
for i in {1..10}; do
  if curl -f http://localhost:3000/healthz > /dev/null 2>&1; then
    echo "Agent is healthy!"
    break
  fi
  echo "Waiting for agent... attempt $i"
  sleep 2
done

# Start UI in background
echo "Starting UI..."
cd ../ui
NODE_ENV=test npx next dev -p 3001 &
UI_PID=$!

# Wait for UI to start
echo "Waiting for UI to start..."
sleep 5

# Check if UI is accessible
for i in {1..10}; do
  if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo "UI is accessible!"
    break
  fi
  echo "Waiting for UI... attempt $i"
  sleep 2
done

# Run Playwright tests with timeout
echo "Running Playwright tests..."
cd ../tests
timeout 300 npx playwright test --config=playwright-e2e.config.ts || {
  echo "Playwright tests timed out or failed!"
  exit 1
}

# Serve the report briefly and then quit
echo "Serving HTML report for 10 seconds..."
npx playwright show-report --port 9323 &
REPORT_PID=$!

# Wait 10 seconds for user to view report
sleep 10

# Kill the report server
kill $REPORT_PID 2>/dev/null || true

echo "E2E tests completed successfully!"
exit 0
