# Parallel Work Assignment — 2025-10-10

> **⚠️ ARCHIVED**: This document captured the initial planning session and is kept for historical reference and retro analysis. **Operational tracking** is now in GitHub Issues with dependency metadata. See `.github/workflows/unblock-issues.yml` for automation.

## 🎯 Sequential Work Order & Parallel Tracks

### Phase 1: Foundation (Sequential - MUST DO FIRST)
**⚠️ BLOCKING - Complete before starting other work**

| Issue | Owner | Task | Why Sequential |
|-------|-------|------|----------------|
| **#15** | Ian | Evaluate current state vs last retro | Defines scope for all other work |
| **#23** | Ian | Evaluate screenshot failures/gaps | Defines acceptance criteria for Playwright work |

**Estimated Time**: 1-2 hours  
**Outputs**: Scope document, risk register, acceptance criteria

---

### Phase 2: Parallel Tracks (Can Work Simultaneously)

#### Track A: Management Setup (Ian + Rino)
**Dependencies**: Issue #15 complete

| Issue | Owner | Task | Can Parallel? |
|-------|-------|------|---------------|
| **#16** | Rino | Audit uncommitted code & create handling plan | ✅ Yes (independent) |
| **#17** | Ian | Document branching strategy (git-flow variant) | ✅ Yes (independent) |
| **#18** | Ian | Define clear work assignment matrix | ⚠️ After #17 |
| **#19** | Ian | Assign devs to issues & set up board views | ⚠️ After #18 |
| **#20** | Rino | Create management dashboard views (by status/assignee/module) | ✅ Yes (independent) |
| **#21** | Rino | Document CI/CD + workflows (comprehensive runbook) | ✅ Yes (independent) |

**Estimated Time**: 2-4 hours per person  
**Can Start**: After #15 done

---

#### Track B: Playwright Infrastructure (Rino + Jacob)
**Dependencies**: Issue #23 complete

| Issue | Owner | Task | Can Parallel? |
|-------|-------|------|---------------|
| **#24** | Rino | Install dependencies (playwright-extra, wait-on, concurrently, ts-node) | ✅ Yes (independent) |
| **#25** | Jacob | Extend /healthz to cover SSE and all critical deps | ✅ Yes (independent) |
| **#26** | Rino | Create robust Playwright startup scripts with health checks | ⚠️ After #24, #25 |
| **#27** | Rino | Write parameterized screenshot capture spec (from issue/PR description) | ⚠️ After #24 |
| **#28** | Jacob | Create pr-artifacts module structure | ✅ Yes (independent) |
| **#29** | Jacob | Implement local screenshot capture script (capture.graph.screenshot.ts) | ⚠️ After #24, #28 |
| **#30** | Rino | Build CI workflow for screenshot generation & commit | ⚠️ After #26, #29 |
| **#31** | Jacob | Test local screenshot flow end-to-end | ⚠️ After #29 |
| **#32** | Jacob | Test CI screenshot workflow on sample PR | ⚠️ After #30 |

**Estimated Time**: 3-5 hours per person  
**Can Start**: After #23 done

---

### Phase 3: Verification & Closure (Sequential - MUST DO LAST)

| Issue | Owner | Task | Why Last |
|-------|-------|------|----------|
| **#34** | Jacob | Verify screenshots visible in GitHub PR | Final integration test |
| **#22** | Jacob | Write retro: Management & Branching milestone | Captures learnings |
| **#33** | Jacob | Write retro: Playwright Screenshot Flow milestone | Captures learnings |

**Estimated Time**: 1-2 hours  
**Outputs**: Verified system + 2 retro documents

---

## 📊 Parallelization Summary

### Maximum Parallel Work (After Phase 1)
```
        ┌──────────────────────────────────────┐
        │      PHASE 1 (Sequential)            │
        │  #15 (Ian)  →  #23 (Ian)             │
        └──────────────────────────────────────┘
                        ↓
        ┌──────────────────────────────────────┐
        │      PHASE 2 (3 Parallel Tracks)     │
        ├──────────────────────────────────────┤
        │  Track A: Ian                        │
        │    #17 → #18 → #19                   │
        │                                       │
        │  Track B: Rino                       │
        │    #16, #20, #21, #24, #27 → #26 → #30│
        │                                       │
        │  Track C: Jacob                      │
        │    #25, #28 → #29 → #31 → #32        │
        └──────────────────────────────────────┘
                        ↓
        ┌──────────────────────────────────────┐
        │      PHASE 3 (Sequential)            │
        │  #34 (Jacob) → #22 (Jacob) → #33 (Jacob)│
        └──────────────────────────────────────┘
```

---

## 👥 Work Assignment by Developer

### Ian Botts (CTO) — Strategic & Decisions
**Issues**: 15, 17, 18, 19, 23  
**Estimated**: 3-4 hours total

**Sequential Order**:
1. **#15** - Evaluate current state (FIRST, BLOCKING)
2. **#23** - Evaluate screenshot failures (FIRST for Milestone 3)
3. **#17** - Document branching strategy
4. **#18** - Define work assignment matrix
5. **#19** - Assign devs & board views

---

### Rino (Senior Engineer) — Delivery Lead
**Issues**: 16, 20, 21, 24, 26, 27, 30  
**Estimated**: 5-7 hours total

**Can Start Parallel** (after #15):
- **#16** - Audit uncommitted code
- **#20** - Dashboard views
- **#21** - CI/CD docs
- **#24** - Install deps (after #23)

**Sequential After**:
- **#27** → after #24
- **#26** → after #24, #25
- **#30** → after #26, #29

---

### Jacob (Backend Engineer) — Implementation
**Issues**: 22, 25, 28, 29, 31, 32, 33, 34  
**Estimated**: 4-6 hours total

**Can Start Parallel** (after #15, #23):
- **#25** - Extend /healthz
- **#28** - pr-artifacts structure

**Sequential After**:
- **#29** → after #24, #28
- **#31** → after #29
- **#32** → after #30
- **#34** → after #32
- **#22** → LAST (retro)
- **#33** → LAST (retro)

---

## 📍 Where to Track This

### Option 1: GitHub Project Board (RECOMMENDED)
**Location**: https://github.com/nirukk52/ScreenGraphVibe/projects  
Create project "poc" with views:
- **By Status**: To Do → In Progress → Review → Done
- **By Phase**: Phase 1 (Blocking) → Phase 2 (Parallel) → Phase 3 (Closure)
- **By Assignee**: Ian → Rino → Jacob
- **By Milestone**: Milestone 2 → Milestone 3

**Benefits**:
- Visual Kanban board
- Real-time progress tracking
- Auto-updates from PR/issue events
- Integrated with GitHub workflow

### Option 2: This Document + Daily Standups
**Location**: `management/work-plan/2025-10-10-parallel-work-assignment.md`  
**Update**: Each engineer comments on their assigned issues with status

**Benefits**:
- Simple, no setup
- Version controlled
- Can reference in PRs

### Option 3: Graphiti Knowledge Graph
**Location**: MCP Graphiti (`screengraph-vibe` group)  
**Track**: Work progress as episodes with edges to issues

**Benefits**:
- AI-readable memory
- Tracks dependencies automatically
- Supports future planning

---

## 🚀 Recommended Workflow

### Day Start (Morning)
1. **Ian**: Complete #15 and #23 (1-2 hours)
2. **Standup**: Ian shares scope & acceptance criteria
3. **All**: Start parallel tracks

### Mid-Day (Afternoon)
1. **Ian**: #17 → #18 → #19 (management setup)
2. **Rino**: #16, #20, #21, #24, #27 (infra + docs)
3. **Jacob**: #25, #28, #29 (health + artifacts)

### Day End (Evening)
1. **Rino**: #26 → #30 (CI workflow)
2. **Jacob**: #31 → #32 (testing)
3. **All**: Merge PRs as ready

### Next Day (Closure)
1. **Jacob**: #34 (verify)
2. **Jacob**: #22, #33 (retros)
3. **All**: Review retros, plan next sprint

---

## 🔄 Worktree Strategy

### Create 3 Worktrees for Parallel Work

```bash
# Ian's worktree (Management & Branching)
git worktree add ../ScreenGraphVibe-ian feature/mgmt-branching-2025-10-10
cd ../ScreenGraphVibe-ian && cursor .

# Rino's worktree (Playwright Infrastructure)
git worktree add ../ScreenGraphVibe-rino feature/playwright-infra-2025-10-10
cd ../ScreenGraphVibe-rino && cursor .

# Jacob's worktree (Health & Artifacts)
git worktree add ../ScreenGraphVibe-jacob feature/health-artifacts-2025-10-10
cd ../ScreenGraphVibe-jacob && cursor .
```

### Branch Naming Convention
- `feature/mgmt-branching-2025-10-10` (Ian)
- `feature/playwright-infra-2025-10-10` (Rino)
- `feature/health-artifacts-2025-10-10` (Jacob)

Each worktree works independently, merges to `main` as tasks complete.

---

## 📋 Critical Path Analysis

### Longest Path (Critical):
**#15** → **#23** → **#24** → **#26** → **#30** → **#32** → **#34** → **#33**  
**Total**: ~7-9 hours (assuming sequential)

### Optimized with Parallelization:
- Phase 1: 1-2 hours (Ian solo)
- Phase 2: 3-5 hours (3 people parallel)
- Phase 3: 1-2 hours (Jacob solo)

**Total Wall Time**: ~5-9 hours (vs 15+ hours sequential)

---

**Created**: 2025-10-10  
**Owner**: Ian Botts (CTO)  
**Status**: Active Plan  
**Next Update**: After Phase 1 complete

