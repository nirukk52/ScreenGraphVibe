# Issue Creation Workflow with Dependencies

## 🎯 Overview

GitHub provides **native relationship support** for issues. Use this workflow to create issues with proper dependencies and automated unblocking.

---

## 📝 Creating Issues (GitHub UI - Recommended)

### Step 1: Create Milestone (One-time)
1. Go to: `https://github.com/nirukk52/ScreenGraphVibe/milestones`
2. Click "New milestone"
3. Name: `Feature Name — YYYY-MM-DD`
4. Note the milestone number (e.g., `2`)

### Step 2: Create Issue with Dependencies
1. Go to: `https://github.com/nirukk52/ScreenGraphVibe/issues/new`
2. Fill in:
   - **Title**: Clear, actionable task
   - **Description**: Task details
   - **Milestone**: Select from dropdown
   - **Assignee**: Select developer
   - **Labels**: 
     - `agent: Ian` / `agent: Rino` / `agent: Jacob`
     - `status: blocked` (if has blockers) or `status: ready`
     - `phase: 1-blocking` / `phase: 2-parallel` / `phase: 3-closure`

### Step 3: Add Relationships (GitHub Native UI)
1. In the issue sidebar, find **"Relationships"** section
2. Click **"Mark as blocked by"**
3. Enter blocker issue numbers (e.g., `#15, #23`)
4. GitHub automatically creates bidirectional links
5. Optional: Add **"Blocks"** relationships

### Step 4: Add Metadata to Body (Optional but Recommended)
```markdown
## Dependencies
- **Blocked by**: #15, #23
- **Blocks**: #26, #30

## Metadata
- **Estimate**: 2 hours
- **Phase**: 2-Parallel
```

This provides fallback parsing for the automation workflow.

---

## 🤖 Automated Unblocking (GitHub Actions)

**Workflow**: `.github/workflows/unblock-issues.yml`

### How it Works
1. **Trigger**: When PR is merged or issue is closed
2. **Parse**: Extract closed issue numbers from PR body (`Closes #15`)
3. **Search**: Find all open issues with relationships to closed issue
4. **Check**: Verify if ALL blockers are resolved
5. **Unblock**: 
   - Post comment tagging assignee
   - Update label: `status: blocked` → `status: ready`
6. **Partial**: If some blockers remain, post progress update

### Example Flow
```
PR #42 merged → Closes #15
  ↓
Workflow detects #15 closed
  ↓
Finds issues with "blocked by #15":
  - #17 (also blocked by #16 - still open) ❌
  - #23 (only blocked by #15) ✅
  ↓
Issue #23:
  - Comment: "✅ Unblocked! @rino ready to work on"
  - Label: status: ready
  ↓
Issue #17:
  - Comment: "⏸️ Partially unblocked. Still waiting on #16"
  - Label: status: blocked (unchanged)
```

---

## 👥 AI-Assisted Issue Creation

### Workflow with Claude/AI
1. **Plan**: Discuss feature plan with AI
2. **You**: Create milestones manually in GitHub UI
3. **You**: Provide milestone numbers to AI (e.g., "Use milestone 2")
4. **AI**: Creates issues via MCP GitHub tools with:
   - Title, body, milestone
   - Labels (agent, status, phase)
   - Assignees
5. **You**: Add relationships in GitHub UI (native "Relationships" section)
6. **Automation**: Handles unblocking on merge

### Why Manual Relationships?
- GitHub's native UI is cleaner and more reliable
- Bidirectional links auto-created
- Visual dependency graph generated
- Less error-prone than parsing body text

---

## 📊 Tracking Progress

### GitHub Project Board (Recommended)
1. Create project: `https://github.com/nirukk52/ScreenGraphVibe/projects/new`
2. Add views:
   - **By Status**: Blocked → Ready → In Progress → Review → Done
   - **By Phase**: 1-Blocking → 2-Parallel → 3-Closure
   - **By Assignee**: Ian → Rino → Jacob
3. Enable automation:
   - When issue labeled `status: ready` → Move to "Ready" column
   - When PR linked → Move to "In Progress"
   - When PR merged → Move to "Done"

### Labels for Status Tracking
| Label | Meaning | Auto-updated? |
|-------|---------|---------------|
| `status: blocked` | Has unresolved dependencies | ✅ Yes (on merge) |
| `status: ready` | All dependencies resolved, can start | ✅ Yes (on merge) |
| `status: in-progress` | Developer actively working | ❌ Manual |
| `status: review` | PR open, awaiting review | ❌ Manual |
| `status: done` | Issue closed | ✅ Auto (on close) |

---

## 🚀 Complete Example

### Scenario: Create Issue #26 (depends on #24, #25)

**Step 1: Create in GitHub UI**
- Title: "Create robust Playwright startup scripts"
- Body:
  ```markdown
  Create scripts that:
  - Start backend + UI with health checks
  - Wait for services to be ready
  - Handle failures gracefully
  
  ## Dependencies
  - **Blocked by**: #24 (Install deps), #25 (Extend /healthz)
  
  ## Metadata
  - **Estimate**: 2 hours
  - **Phase**: 2-Parallel
  ```
- Milestone: `3` (Playwright Screenshot Flow)
- Assignee: `rino`
- Labels: `agent: Rino`, `status: blocked`, `phase: 2-parallel`

**Step 2: Add Relationships (Sidebar)**
- Click "Mark as blocked by"
- Enter: `#24, #25`
- GitHub creates bidirectional links

**Step 3: Work Happens**
- PR closes #24 → Workflow posts: "⏸️ #26 still waiting on #25"
- PR closes #25 → Workflow posts: "✅ #26 unblocked! @rino ready to work"
- Label auto-updated: `status: ready`

**Step 4: Developer Notified**
- Rino sees GitHub notification
- Checks project board → #26 in "Ready" column
- Starts work

---

## 🔧 Troubleshooting

### Issue not unblocking after merge?
1. Check PR body has `Closes #X` syntax
2. Verify relationships added in GitHub UI (sidebar)
3. Check workflow logs: `Actions` → `Unblock Dependent Issues`
4. Ensure `SG_BOT_TOKEN` has `issues: write` permission

### Want to manually unblock?
1. Remove `status: blocked` label
2. Add `status: ready` label
3. Comment to notify assignee

---

## 📚 References

- [GitHub: Issue Dependencies](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-issue-dependencies)
- [GitHub: Sub-Issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/browsing-sub-issues)
- [GitHub Actions: github-script](https://github.com/actions/github-script)

---

**Last Updated**: 2025-10-10  
**Owner**: Ian Botts (CTO)

