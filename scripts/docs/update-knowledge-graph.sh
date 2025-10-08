#!/bin/bash

# ScreenGraph Knowledge Graph Update Script
# This script captures current project state, facts, procedures, and preferences
# and updates the MCP knowledge graph with rich context from coding sessions

echo "🧠 Updating MCP Knowledge Graph with Facts, Procedures & Preferences..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "screengraph-agent" ]; then
    echo "❌ Error: Must be run from project root directory"
    exit 1
fi

# Create temporary files to capture different types of information
PROJECT_STATE_FILE=$(mktemp)
FACTS_FILE=$(mktemp)
PROCEDURES_FILE=$(mktemp)
PREFERENCES_FILE=$(mktemp)
PROJECT_ROOT=$(pwd)

# Capture current project state
echo "📊 Capturing project state..."

# Get git information
GIT_BRANCH=$(git branch --show-current)
GIT_COMMIT=$(git rev-parse HEAD)
GIT_COMMIT_SHORT=$(git rev-parse --short HEAD)
LAST_COMMIT_MSG=$(git log -1 --pretty=%B)

# Get project status
if [ -f "CURRENT_PROJECT_STATUS.md" ]; then
    PROJECT_STATUS=$(cat CURRENT_PROJECT_STATUS.md)
else
    PROJECT_STATUS="Project status file not found"
fi

# Get recent changes
RECENT_CHANGES=$(git diff --name-only HEAD~1 2>/dev/null || echo "No previous commit to compare")

# Get current test status (skip to avoid blocking pre-push hook)
TEST_STATUS="⏭️ Skipped to avoid blocking pre-push hook"

# Get system health (skip to avoid blocking pre-push hook)
HEALTH_STATUS="⏭️ Skipped to avoid blocking pre-push hook"

# Capture Facts Discovered During Development
echo "🔍 Capturing facts discovered during development..."

cat > "$FACTS_FILE" << EOF
# Facts Discovered During ScreenGraphVibe Development

## Architecture Facts
- **Module Boundaries**: Colon-prefixed labels (:data, :backend, :ui, :screengraph-agent, :tests, :infra, :logging) provide clear organization
- **Dependency Flow**: :ui → :backend → :data, :screengraph-agent → :data (never reverse)
- **Python Venv Boundary**: All Python operations must run inside screengraph-agent/venv/ (Python 3.13)
- **Testing Strategy**: Unit/integration tests in modules, only E2E tests in :tests module
- **File Size Limits**: No file over 400 lines, no function over 50 lines

## Technical Facts
- **Database**: Drizzle ORM with PostgreSQL/Supabase, auto-generated migrations
- **Backend**: Fastify server on port 3000 with 10+ endpoints
- **Frontend**: Next.js 13+ with FSD architecture, port 3001
- **Agent**: 80+ Appium tools, 5000+ lines of Python code
- **Testing**: 37+ tests across unit, integration, and E2E
- **Deployment**: Multi-region Fly.io (US East, US Central, India)

## Development Facts
- **Git Hooks**: Pre-push hook updates project status and knowledge graph
- **Documentation**: Auto-indexing system with DOCUMENT_INDEX.md
- **Health Monitoring**: Comprehensive health checks across all services
- **Environment**: Node.js, Python 3.13, Docker containerization

EOF

# Capture Procedures Established
echo "📋 Capturing procedures established..."

cat > "$PROCEDURES_FILE" << EOF
# Procedures Established for ScreenGraphVibe Development

## Development Workflow Procedures
1. **Before Starting Any Task**: Search MCP Graphiti memory for relevant preferences and procedures
2. **Code Changes**: Follow 25 non-negotiable rules for every line of code
3. **Testing**: Write or update at least one test for every logic branch added
4. **File Organization**: Use barrel files only at module boundaries
5. **Type Safety**: Use generated types only, never edit schema/types in UI files

## Git Workflow Procedures
1. **Pre-Push Hook**: Automatically updates project status, knowledge graph, and documentation
2. **Commit Messages**: Use conventional commit format
3. **Branch Strategy**: Main branch for production, feature branches for development
4. **Documentation**: Auto-update DOCUMENT_INDEX.md on every push

## Testing Procedures
1. **Module Testing**: Run tests in respective modules (not centralized)
2. **E2E Testing**: Only E2E tests in :tests module
3. **Test Location**: Unit/integration tests in feature directories
4. **CI Strategy**: Run tests only for changed modules

## Python Development Procedures
1. **Venv Activation**: Always activate venv before Python operations
2. **Dependencies**: Use requirements.txt for package management
3. **Testing**: Use pytest with 50+ tests in screengraph-agent/tests/
4. **Appium Tools**: 80+ tools across 6 categories (Connection, Data Gathering, Actions, Device Management, App Management, Navigation)

## Documentation Procedures
1. **Auto-Indexing**: Update DOCUMENT_INDEX.md on every push
2. **Cleanup**: Remove temporary documentation files automatically
3. **Essential Docs**: Keep CLAUDE.md, README.md, CURRENT_PROJECT_STATUS.md
4. **Knowledge Graph**: Update MCP knowledge graph with facts, procedures, preferences

EOF

# Discover and capture all .md files with facts, procedures, rules, preferences
echo "📚 Discovering markdown files with development context..."

# Find all .md files in the project (excluding node_modules, .git, venv, dist, etc.)
MD_FILES=$(find . -name "*.md" \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./screengraph-agent/venv/*" \
  -not -path "./*/dist/*" \
  -not -path "./*/.venv/*" \
  -not -path "./*/.pytest_cache/*" \
  -not -path "./*/node_modules/*" \
  -not -path "./*/__pycache__/*" \
  -not -path "./*/test-results/*" \
  -not -path "./*/playwright-report/*" \
  -not -path "./*/logs/*" \
  | sort)

# Create a comprehensive markdown content file
MD_CONTENT_FILE=$(mktemp)

echo "📄 Found $(echo "$MD_FILES" | wc -l) markdown files"

cat > "$MD_CONTENT_FILE" << EOF
# All Markdown Files with Development Context

**Discovery Timestamp:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Total Files Found:** $(echo "$MD_FILES" | wc -l)

EOF

# Process each markdown file
for md_file in $MD_FILES; do
    if [ -f "$md_file" ]; then
        echo "  📄 Processing: $md_file"
        
        # Get file size and modification time
        FILE_SIZE=$(wc -c < "$md_file")
        FILE_MODIFIED=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$md_file" 2>/dev/null || stat -c "%y" "$md_file" 2>/dev/null | cut -d' ' -f1-2)
        
        cat >> "$MD_CONTENT_FILE" << EOF

---

## File: $md_file
**Size:** $FILE_SIZE bytes
**Modified:** $FILE_MODIFIED

\`\`\`markdown
$(cat "$md_file")
\`\`\`

EOF
    fi
done

echo "✅ Markdown files processed and content captured"

# Capture User Preferences
echo "⚙️ Capturing user preferences..."

cat > "$PREFERENCES_FILE" << EOF
# User Preferences for ScreenGraphVibe Development

## Coding Preferences
- **Incremental Development**: Focus on assigned task, not entire project
- **No Extra Work**: Never do more than what is asked
- **Ask Mode**: When user says "ask mode", explain concepts without writing code
- **Implementation Mode**: By default, implement changes rather than only suggesting

## Architecture Preferences
- **Clean Architecture**: Always use clean architecture principles
- **Modular Design**: All code and files are modular inside folders/packages
- **Single Responsibility**: Each class has one reason to change (SRP)
- **Composition over Inheritance**: Inject dependencies, don't subclass

## Testing Preferences
- **TDD Approach**: Write tests before implementing features
- **Real Infrastructure**: Prefer real databases over mocks
- **Independent Features**: Each feature should test independently
- **Test Coverage**: Every logic branch must have at least one test

## Documentation Preferences
- **Auto-Generated**: Prefer automated documentation updates
- **Essential Only**: Keep only essential documentation files
- **Knowledge Graph**: Always update MCP knowledge graph with new information
- **Context Preservation**: Capture facts, procedures, and preferences from sessions

## Development Environment Preferences
- **Python 3.13**: Use Python 3.13 in virtual environment
- **Node.js**: Use latest stable Node.js version
- **Docker**: Containerize all services
- **Multi-Region**: Deploy to multiple regions (US East, US Central, India)

## Code Quality Preferences
- **Type Safety**: Use generated types only, no implicit any
- **Validation**: Validate every external input
- **Immutability**: No mutation of shared state
- **Exhaustive Switches**: All switches on unions must be exhaustive
- **Constants**: All string literals must come from enums/constants

EOF

# Create comprehensive project state summary
cat > "$PROJECT_STATE_FILE" << EOF
# ScreenGraphVibe Project State Update

**Timestamp:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Git Branch:** $GIT_BRANCH
**Git Commit:** $GIT_COMMIT_SHORT ($GIT_COMMIT)
**Last Commit Message:** $LAST_COMMIT_MSG

## Project Status
$PROJECT_STATUS

## Recent Changes
$RECENT_CHANGES

## Test Status
$TEST_STATUS

## System Health
$HEALTH_STATUS

## Module Status
- **Backend:** $(if [ -d "backend" ]; then echo "✅ Present"; else echo "❌ Missing"; fi)
- **UI:** $(if [ -d "ui" ]; then echo "✅ Present"; else echo "❌ Missing"; fi)
- **Data:** $(if [ -d "data" ]; then echo "✅ Present"; else echo "❌ Missing"; fi)
- **Agent:** $(if [ -d "screengraph-agent" ]; then echo "✅ Present"; else echo "❌ Missing"; fi)
- **Tests:** $(if [ -d "tests" ]; then echo "✅ Present"; else echo "❌ Missing"; fi)
- **Docs:** $(if [ -d "docs" ]; then echo "✅ Present"; else echo "❌ Missing"; fi)

## Key Files Status
- **CLAUDE.md:** $(if [ -f "CLAUDE.md" ]; then echo "✅ Present"; else echo "❌ Missing"; fi)
- **README.md:** $(if [ -f "README.md" ]; then echo "✅ Present"; else echo "❌ Missing"; fi)
- **Current Status:** $(if [ -f "CURRENT_PROJECT_STATUS.md" ]; then echo "✅ Present"; else echo "❌ Missing"; fi)
- **Document Index:** $(if [ -f "docs/DOCUMENT_INDEX.md" ]; then echo "✅ Present"; else echo "❌ Missing"; fi)

## Environment
- **Node Version:** $(node --version 2>/dev/null || echo "Node not available")
- **NPM Version:** $(npm --version 2>/dev/null || echo "NPM not available")
- **Python Version:** $(python3 --version 2>/dev/null || echo "Python not available")
- **OS:** $(uname -s) $(uname -r)

EOF

echo "📝 Project state captured in temporary files"

# Display summary of captured information
echo ""
echo "📊 Knowledge Graph Update Summary:"
echo "  📄 Project State: $PROJECT_STATE_FILE"
echo "  🔍 Facts Discovered: $FACTS_FILE"
echo "  📋 Procedures Established: $PROCEDURES_FILE"
echo "  ⚙️ User Preferences: $PREFERENCES_FILE"
echo "  📚 All Markdown Files: $MD_CONTENT_FILE"

# Note: The actual MCP knowledge graph update will be handled by the AI assistant
# This script prepares the data for the update with rich context
echo ""
echo "✅ Knowledge graph update data prepared with:"
echo "  • Current project state and git information"
echo "  • Facts discovered during development"
echo "  • Procedures established for workflows"
echo "  • User preferences for coding and architecture"
echo "  • ALL markdown files with development context (facts, procedures, rules, preferences)"
echo ""
echo "🤖 AI Assistant Instructions:"
echo "  Use the MCP Graphiti tools to add this information to the knowledge graph:"
echo "  - add_episode with source='text' for each file content"
echo "  - Use group_id='screengraph-vibe'"
echo "  - Label appropriately as facts, procedures, preferences, or development context"
echo "  - The markdown content file contains ALL .md files with rich development context"
echo "  - This is your memory - rely on it to achieve goals and maintain consistency"

# Keep files for AI assistant to process
echo "📁 Temporary files preserved for AI processing:"
echo "  Project State: $PROJECT_STATE_FILE"
echo "  Facts: $FACTS_FILE"
echo "  Procedures: $PROCEDURES_FILE"
echo "  Preferences: $PREFERENCES_FILE"
echo "  All Markdown Files: $MD_CONTENT_FILE"

echo ""
echo "🧠 Knowledge graph update preparation completed"