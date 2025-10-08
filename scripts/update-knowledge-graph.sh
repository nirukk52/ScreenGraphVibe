#!/bin/bash

# ScreenGraph Knowledge Graph Update Script
# Updates the MCP Graphiti knowledge graph with current project state

set -e

echo "🧠 Updating MCP Knowledge Graph..."

# Check if docs module exists
if [ ! -d "docs" ]; then
    echo "❌ Error: docs module not found"
    exit 1
fi

# Navigate to docs module
cd docs

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing docs dependencies..."
    npm install
fi

# Update document index and save to memory
echo "📄 Updating document index and saving to knowledge graph..."
npm run update

# Check if update was successful
if [ $? -eq 0 ]; then
    echo "✅ Knowledge graph updated successfully"
    
    # Show status
    echo "📊 Knowledge graph status:"
    npm run status
    
    exit 0
else
    echo "❌ Failed to update knowledge graph"
    exit 1
fi
