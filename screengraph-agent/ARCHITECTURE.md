# Architecture: Clean Design with LLM Decision Plane

## Core Principle

**Domain → Ports → Adapters → BFF**

The agent core (`/src`) is **framework-free** and **testable in isolation**. No SDKs, no I/O, no network calls.

## Layers

### 1. Domain (`/src/domain`)

**Pure types and rules. No I/O.**

- `AgentState`: Immutable state object
- `ScreenSignature`: Deterministic screen identity
- `UIElement`, `UIAction`: Screen interaction primitives
- `Advice`, `Counters`, `Budgets`: State components

**Rules:**
- Immutable (use `dataclasses.replace()`)
- Serializable (JSON-compatible)
- No runtime handles (drivers, models, connections)
- Assets by reference only

### 2. Ports (`/src/ports`)

**Capability interfaces. No implementations.**

- `DriverPort`: Device automation (Appium)
- `OCRPort`: Text extraction
- `RepoPort`: Graph persistence
- `FileStorePort`: Asset storage
- `LLMPort`: AI decision-making (5 methods)
- `CachePort`: Prompt/advice caching
- `BudgetPort`: Resource tracking
- `TelemetryPort`: Logging/metrics

**Rules:**
- Define methods only (abstract classes)
- No SDK imports
- Return domain types
- Raise domain exceptions

### 3. Services (`/src/services`)

**Stateless helpers. No I/O.**

- `SignatureService`: Compute signatures/deltas
- `SalienceRanker`: Rank elements (top-K)
- `PromptDiet`: Prune state for LLM inputs
- `AdviceReducer`: Normalize/dedupe advice
- `ProgressDetector`: Heuristic progress signals

**Rules:**
- Stateless (no instance state)
- Pure functions (same input → same output)
- No ports or adapters

### 4. Orchestrator (`/src/orchestrator`)

**Node graph and control flow.**

- **17 nodes** (each = one class, one responsibility)
- **5 LLM nodes** (always-on, every iteration)
- **graph.py**: Wires nodes into execution flow
- **policy/**: Routing rules and constants

**Rules:**
- Each node: `run(state: AgentState) -> AgentState`
- Nodes never raise exceptions (use `stop_reason`)
- Nodes inject ports (no adapters)
- LLM nodes call `LLMPort` (caching inside)

### 5. Usecases (`/src/usecases`)

**High-level orchestration.**

- `start_session`: Initialize run
- `iterate_once`: Execute one loop
- `finalize_run`: Cleanup and summary

**Rules:**
- Coordinate across ports
- No business logic (delegate to nodes/services)
- Return domain types

### 6. Adapters (`/adapters`)

**SDK wrappers. Implement ports.**

- `appium/`: Appium WebDriver
- `ocr/`: Tesseract/Google Vision
- `repo/`: Postgres + S3/GCS
- `llm/`: OpenAI/Anthropic
- `cache/`: Redis/in-memory
- `budget/`: In-memory counters
- `telemetry/`: Structlog/Prom/OTel
- `engine/`: (optional) DroidBot/Fastbot2

**Rules:**
- Implement port interfaces
- Translate SDK exceptions → domain errors
- Handle retries/timeouts
- Never call other adapters directly

### 7. BFF (`/bff`)

**FastAPI composition root.**

- `main.py`: App creation, lifespan hooks
- `deps.py`: DI container (instantiate adapters, bind to ports)
- `routes/`: HTTP handlers (call usecases)

**Rules:**
- No business logic
- Only BFF imports SDKs (via adapters)
- Inject dependencies via FastAPI `Depends()`

## Dependency Flow

```
Domain ← Services ← Orchestrator ← Usecases ← BFF
         ↑            ↑
       Ports      Adapters
```

**Never reverse:**
- Domain never imports ports/adapters
- Ports never import adapters
- Adapters never import other adapters (unless via ports)

## State Flow

```
Initial State → Node1 → Node2 → ... → Node17 → Final State
                 ↓       ↓              ↓
               Port1   Port2          PortN
                 ↓       ↓              ↓
             Adapter1 Adapter2      AdapterN
```

**Immutability:**
- Nodes return new `AgentState` (never mutate)
- Use `replace(state, field=value)` or `state.clone_with(field=value)`

## LLM Decision Plane

**5 LLM nodes, always-on:**

1. **ChooseAction**: Select next action
   - Cache key: `(choose_action, model, signature, delta, topK, plan)`
   - Fallback: Random safe action

2. **Verify**: Classify outcome
   - Cache key: `(verify, model, prev_sig, curr_sig, postcondition)`
   - Fallback: Heuristic delta check

3. **DetectProgress**: Label progress
   - Cache key: `(detect_progress, model, signature, delta, counters)`
   - Fallback: Heuristic signals

4. **ShouldContinue**: Propose route
   - Cache key: `(should_continue, model, counters, budgets, progress)`
   - Fallback: Budget-based routing

5. **SwitchPolicy**: Change policy
   - Cache key: `(switch_policy, model, counters, policy)`
   - Fallback: Deterministic policy rotation

**Cost Reduction:**
- 7-day cache TTL (signature-based)
- Delta-first prompts (only changes)
- Top-K elements (cap at 50)
- Budget enforcement (override LLM to STOP)

## Testing Strategy

**Unit Tests:**
- Use fake ports (no real SDKs)
- Test nodes in isolation
- Test services as pure functions

**Integration Tests:**
- Use real adapters (Testcontainers for DB/cache)
- Test usecases end-to-end

**E2E Tests:**
- Use real device (Appium)
- Test full agent loop

## Key Decisions

1. **Why immutable state?**
   - Reproducibility (same input → same output)
   - Easy debugging (state snapshots)
   - Thread-safe (no locks)

2. **Why ports?**
   - Testability (inject fakes)
   - Flexibility (swap implementations)
   - Clean boundaries (no SDK leakage)

3. **Why LLM always-on?**
   - Consistent decision quality
   - Caching makes it cost-effective
   - Simpler than conditional LLM

4. **Why delta-first prompts?**
   - Reduce token usage (10x savings)
   - Faster LLM responses
   - More focused decisions

5. **Why assets by reference?**
   - Lightweight state (serializable)
   - Efficient persistence
   - Scalable (no memory bloat)

## Next Steps

- [ ] Implement all 17 nodes
- [ ] Add prompt templates
- [ ] Add guardrails
- [ ] Add telemetry
- [ ] Add admin UI

