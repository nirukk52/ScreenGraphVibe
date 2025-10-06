# AGENT.md – Node Graph, Decision Plane, StateObject

## Node Graph Overview

The ScreenGraph Agent consists of **17 discrete nodes** organized into phases:

### 1. Setup Phase (4 nodes)
```
EnsureDevice → ProvisionApp → LaunchOrAttach → WaitIdle
```

### 2. Main Loop (8 nodes)
```
Perceive → EnumerateActions → ChooseAction [LLM] → Act
→ Verify [LLM] → Persist → DetectProgress [LLM] → ShouldContinue [LLM]
```

### 3. Policy Routing (1 node)
```
SwitchPolicy [LLM] (when triggered by ShouldContinue)
```

### 4. Recovery (2 nodes)
```
RecoverFromError (transient errors)
RestartApp (app crash, bounded restarts)
```

### 5. Termination (1 node)
```
Stop (final summary)
```

---

## Decision Plane (5 LLM Nodes)

**INVARIANT**: The five LLM nodes execute **every loop** (except SwitchPolicy, which is conditional).

### Node Execution Order

```
Loop N:
1. Perceive → [capture screen state]
2. EnumerateActions → [build action candidates]
3. ChooseAction [LLM] → [select action]
4. Act → [execute action]
5. Verify [LLM] → [classify outcome]
6. Persist → [save nodes/edges]
7. DetectProgress [LLM] → [label progress]
8. ShouldContinue [LLM] → [routing decision]
   ├─ CONTINUE → Loop N+1 (back to Perceive)
   ├─ SWITCH_POLICY → SwitchPolicy [LLM] → Loop N+1
   ├─ RESTART_APP → RestartApp → Loop N+1
   └─ STOP → Stop (terminate)
```

### LLM Node Details

| Node | Input | Output | Cache Key | Fallback |
|------|-------|--------|-----------|----------|
| **ChooseAction** | signature, delta, topK actions, plan | ChosenAction | `(choose_action, model, sig, delta, topK, plan)` | Random safe action |
| **Verify** | prev_sig, curr_sig, postcondition | VerificationResult | `(verify, model, prev_sig, curr_sig, postcond)` | Heuristic delta check |
| **DetectProgress** | sig, delta, counters, persist_result | ProgressAssessment | `(detect_progress, model, sig, delta, counters)` | Heuristic signals |
| **ShouldContinue** | counters, budgets, progress | RoutingDecision | `(should_continue, model, counters, budgets, prog)` | Budget-based routing |
| **SwitchPolicy** | counters, current_policy | PolicySwitch | `(switch_policy, model, counters, policy)` | Deterministic rotation |

---

## StateObject Spec

**AgentState** is the single source of truth flowing through all nodes.

### Core Principle

```python
# Every node follows this contract:
def run(self, state: AgentState) -> AgentState:
    # Read from state
    # Perform logic (via ports)
    # Return NEW state (immutable)
    return replace(state, updated_fields...)
```

### State Structure

```python
@dataclass(frozen=True)
class AgentState:
    # ===== IDENTITY & FLOW =====
    run_id: str              # ULID
    app_id: str              # com.example.app
    timestamps: Timestamps   # created_at, updated_at (ISO-8601 UTC)
    
    # ===== PERCEPTION (refs only, no blobs) =====
    signature: ScreenSignature
    previous_signature: Optional[ScreenSignature]
    bundle: Bundle  # refs to screenshot/page_source/ocr
    
    # ===== ENUMERATED ACTIONS =====
    enumerated_actions: List[EnumeratedAction]  # Feasible actions (max 50)
    
    # ===== PLAN & ADVICE =====
    advice: Advice          # LLM guidance, plan, confidence
    plan_cursor: int        # Index into advice.plan
    
    # ===== PROGRESS ACCOUNTING =====
    counters: Counters      # steps_total, screens_new, errors, llm_calls, etc.
    budgets: Budgets        # max_steps, max_tokens, max_time_ms, etc.
    
    # ===== PERSISTENCE & CACHING =====
    cache: Dict[str, CacheEntry]  # Signature → cached advice
    persist_result: Optional[PersistResultSummary]  # nodes/edges added
    
    # ===== LIFECYCLE =====
    stop_reason: Optional[str]  # success, budget_exhausted, crash, etc.
```

### Immutability Rules

1. **Never mutate in place**: Use `replace(state, field=value)` or `state.clone_with(field=value)`
2. **Nested collections replaced whole**: Update counters via `replace(state.counters, steps_total=...)`, then replace entire counters field
3. **Monotonic updates**: `timestamps.updated_at` changes on every return
4. **No blobs inline**: Screenshots/page_sources stored via FileStorePort, only refs in bundle

### Example: Updating State

```python
# ❌ WRONG (mutation)
state.counters.steps_total += 1  # NO!

# ✅ CORRECT (immutable)
new_counters = replace(state.counters, steps_total=state.counters.steps_total + 1)
new_state = replace(state, counters=new_counters)

# ✅ ALSO CORRECT (helper)
new_state = state.clone_with(
    counters=replace(state.counters, steps_total=state.counters.steps_total + 1)
)
```

---

## Caching Strategy

### Cache Keys

Every LLM node computes a composite cache key:

```python
def build_cache_key(node_type, state):
    return f"{node_type}:{model}:{sig}:{delta_hash}:{topK_hash}:{policy}"
```

**Components**:
- `node_type`: choose_action, verify, detect_progress, should_continue, switch_policy
- `model`: gpt-4, claude-sonnet-3.5, etc.
- `sig`: ScreenSignature.hash
- `delta_hash`: Hash of (prev_sig, curr_sig) delta
- `topK_hash`: Hash of top-K action candidates
- `policy`: Current exploration policy (breadth, depth, random, targeted)

### Cache Hit Flow

```
1. Node computes cache_key from state
2. Check CachePort.get(cache_key)
3. If hit → deserialize cached output, skip LLM call
4. If miss → call LLM, validate, cache via CachePort.set(cache_key, output, ttl)
5. Return output
```

### TTL Strategy

- **Prompt Cache**: 7 days (signature-based; long-lived)
- **Routing Cache**: 1 hour (dynamic decisions; shorter TTL)
- **Advice Store**: 7 days (per-signature advice)

---

## Budget Enforcement

### Two-Level Budgets

**Per-Loop**:
- `tokens_per_loop`: Max tokens for one iteration (default: 10K)
- `time_per_loop_ms`: Max time for one iteration (default: 60s)

**Per-Run**:
- `max_steps`: Total iterations (default: 50)
- `max_tokens`: Total LLM tokens (default: 100K)
- `max_time_ms`: Wall-clock time (default: 10 minutes)

### Enforcement Points

1. **BudgetPort** tracks usage (steps, tokens, time, cost)
2. **ShouldContinueNode** queries `BudgetPort.query_remaining()`
3. **Override LLM to STOP** if any cap exceeded
4. **Log budget_remaining** for telemetry

```python
# In ShouldContinueNode
usage = self.budget.query_remaining(state.run_id)

if usage.steps_left <= 0 or usage.tokens_left <= 0:
    # Override LLM decision
    return replace(state, stop_reason="budget_exhausted")

# Otherwise, proceed with LLM routing
decision = self.llm.should_continue(state)
return replace(state, advice=decision)
```

---

## Telemetry Integration

### Event Taxonomy

| Event | Phase | Fields |
|-------|-------|--------|
| `agent.session_started` | Startup | run_id, app_id, budgets |
| `agent.loop_start` | Loop Begin | run_id, loop_num, signature |
| `agent.node_start` | Node Begin | run_id, node, loop_num |
| `agent.node_finish` | Node End | run_id, node, latency_ms |
| `agent.llm_invocation` | LLM Call | run_id, node, model, tokens_in/out, cache_hit, latency_ms |
| `agent.persist_delta` | Persist | run_id, nodes_added, edges_added |
| `agent.stop` | Terminate | run_id, stop_reason, coverage_pct, tokens_total |

### PII Redaction

- **No screenshots in logs**: Only refs (SHA256 hashes)
- **No page_source in logs**: Only refs
- **Redact app IDs**: If marked sensitive in config

---

## Node Transition Table

| Node | Next (Success) | Next (Error) | LLM? |
|------|----------------|--------------|------|
| EnsureDevice | ProvisionApp | Stop | No |
| ProvisionApp | LaunchOrAttach | Stop | No |
| LaunchOrAttach | WaitIdle | RestartApp | No |
| WaitIdle | Perceive | Perceive | No |
| Perceive | EnumerateActions | RecoverFromError | No |
| EnumerateActions | ChooseAction | ShouldContinue | No |
| ChooseAction | Act | — | **Yes** |
| Act | Verify | RecoverFromError | No |
| Verify | Persist | Persist | **Yes** |
| Persist | DetectProgress | RecoverFromError | No |
| DetectProgress | ShouldContinue | — | **Yes** |
| ShouldContinue | Perceive / SwitchPolicy / RestartApp / Stop | — | **Yes** |
| SwitchPolicy | Perceive | — | **Yes** |
| RestartApp | WaitIdle | Stop | No |
| RecoverFromError | EnumerateActions / ChooseAction / RestartApp / Stop | — | No |
| Stop | (terminal) | — | No |

---

## Cost Reduction Summary

| Strategy | Savings | Implementation |
|----------|---------|----------------|
| **Prompt Caching** | 70-90% | 7-day TTL, signature-based keys |
| **Delta-First Prompts** | 80-90% | Only changes since previous screen |
| **Top-K Elements** | 50-70% | Cap at 12 elements (not full hierarchy) |
| **Budget Enforcement** | 100% (caps) | Override LLM to STOP on breach |
| **Guardrail Fallbacks** | Variable | Cached advice or heuristics on validation failure |

**Expected Cost**: ~$0.10-$0.50 per 50-step run (depending on cache hit rate)

---

## Next Steps

1. Implement all 17 nodes with docstrings following CLAUDE.md template
2. Add prompt templates for 5 LLM nodes
3. Implement caching logic in LLMAdapter
4. Add budget tracking in BudgetAdapter
5. Add telemetry events in TelemetryAdapter
6. Test end-to-end with fake ports
7. Integrate real adapters (Appium, OpenAI, Postgres)
8. Deploy to production with monitoring

