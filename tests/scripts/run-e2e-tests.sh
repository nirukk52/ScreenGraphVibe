#!/bin/bash

# Exit on any error
set -e

echo "Starting E2E test setup..."

# Kill any existing processes
pkill -f "tsx watch" || true
pkill -f "next dev" || true

# Start agent in background
echo "Starting agent..."
cd ../agent
NODE_ENV=test npx tsx watch src/index.ts &
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

# Run Playwright tests
echo "Running Playwright tests..."
cd ../tests
npx playwright test --config=playwright-e2e.config.ts

# Cleanup
echo "Cleaning up..."
kill $AGENT_PID $UI_PID 2>/dev/null || true

echo "E2E tests completed!"
