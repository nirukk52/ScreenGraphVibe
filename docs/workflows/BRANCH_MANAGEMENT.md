# Branch Management Workflow

> **🚨 CRITICAL HARD RULE**: This workflow MUST be followed before writing any code.

---

## Mandatory Pre-Code Checklist

Before starting ANY task that involves code changes, the AI assistant MUST:

### 1. ✅ Check Current Branch
```bash
git branch --show-current
```

### 2. ✅ Verify Branch is Appropriate
- ❌ **NEVER code on**: `main`, `master`, `production`, `develop`
- ✅ **Always use**: Feature branch with proper naming

### 3. ✅ Create New Branch (if needed)

**Branch Naming Convention**:
```bash
# Feature work
git checkout -b feature/description-of-task

# Bug fixes
git checkout -b fix/bug-description

# Maintenance/chores
git checkout -b chore/maintenance-task

# Documentation
git checkout -b docs/documentation-update

# Refactoring
git checkout -b refactor/what-is-being-refactored
```

### 4. ✅ Push Branch to Remote IMMEDIATELY
```bash
git push -u origin branch-name
```

**Why push empty branch first?**
- Creates remote backup immediately
- Enables collaboration
- Prevents lost work
- Makes branch visible in GitHub UI

### 5. ✅ ONLY THEN Start Coding

---

## AI Assistant Workflow

**At the start of EVERY interaction involving code**:

1. **Check branch first**:
   ```
   Currently on branch: [branch-name]
   ✅ Appropriate for coding
   ```

2. **If wrong branch detected**:
   ```
   ⚠️ Currently on: main
   ❌ Cannot code on main branch
   
   Creating feature branch:
   → git checkout -b feature/task-description
   → git push -u origin feature/task-description
   ✅ Ready to proceed
   ```

3. **If branch name unclear**:
   - Ask user for clarification on branch name
   - Suggest appropriate name based on task
   - Get confirmation before creating

---

## Branch Naming Examples

| Task Description | Branch Name |
|------------------|-------------|
| Add SSE graph events | `feature/sse-graph-events` |
| Fix health check timeout | `fix/health-check-timeout` |
| Update documentation | `docs/update-architecture-docs` |
| Refactor graph types | `refactor/graph-types` |
| Remove MCP proxy | `chore/remove-mcp-proxy` |
| Add user authentication | `feature/user-auth` |
| Fix memory leak | `fix/memory-leak` |

---

## Enforcement

This is a **HARD RULE**. The AI assistant will:

- ❌ **NEVER** write code without checking branch first
- ❌ **NEVER** write code on main/master/production
- ✅ **ALWAYS** create feature branch if needed
- ✅ **ALWAYS** push branch to remote before coding
- ✅ **ALWAYS** inform user of branch status

---

## Where This Rule Lives

1. **MCP Graphiti Memory**: Stored as procedure in knowledge graph
2. **CLAUDE.md**: Added to "Critical Workflow Instructions"
3. **This Document**: Detailed reference and examples
4. **AI Personas**: Included in persona instructions (optional)

---

**Last Updated**: 2025-10-10  
**Status**: MANDATORY - No exceptions

