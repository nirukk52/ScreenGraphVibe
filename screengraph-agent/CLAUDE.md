# CLAUDE.md – ScreenGraph Agent MVP

> **Purpose**: Authoritative context for AI assistants working on the ScreenGraph Agent.
> This is your primary reference for architecture, boundaries, and coding standards.

---

## 🎯 Project Overview

**ScreenGraph Agent** is an AI-driven mobile app crawler with **LLM decision-making at every iteration**. It automatically explores Android/iOS apps, builds ScreenGraphs (nodes = screens, edges = actions), and maintains deterministic state throughout.

**Core Technology**:

- **Agent Core**: Pure Python (framework-free, testable)
- **BFF**: FastAPI (composition root, HTTP layer)
- **LLM**: OpenAI/Anthropic (5 decision nodes, always-on)
- **Persistence**: PostgreSQL + S3/GCS (graph + assets)
- **Automation**: Appium (device control)

---

## 🏗️ Architecture: ASCII Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         BFF (FastAPI)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ Routes   │→ │ Usecases │→ │  deps.py │ (DI Composition)     │
│  └──────────┘  └──────────┘  └────┬─────┘                      │
└────────────────────────────────────┼──────────────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ↓                ↓                ↓
        ┌───────────────┐  ┌──────────────┐  ┌──────────────┐
        │   Adapters    │  │  Adapters    │  │  Adapters    │
        │   (Appium)    │  │    (LLM)     │  │ (Repo/S3)    │
        └───────┬───────┘  └──────┬───────┘  └──────┬───────┘
                │                 │                  │
                │ implements      │ implements       │ implements
                ↓                 ↓                  ↓
        ┌───────────────────────────────────────────────────────┐
        │                    Ports (Interfaces)                  │
        │  DriverPort │ LLMPort │ RepoPort │ FileStorePort       │
        └───────────────────────┬───────────────────────────────┘
                                │ used by
                                ↓
        ┌──────────────────────────────────────────────────────┐
        │              Orchestrator (17 Nodes)                  │
        │  EnsureDevice → ProvisionApp → LaunchOrAttach         │
        │  ↓                                                     │
        │  WaitIdle → Perceive → EnumerateActions               │
        │  ↓                                                     │
        │  ChooseAction [LLM] → Act → Verify [LLM]             │
        │  ↓                                                     │
        │  Persist → DetectProgress [LLM] → ShouldContinue [LLM]│
        │  ↓                                                     │
        │  SwitchPolicy [LLM] | RestartApp | Stop              │
        └───────────────────────┬──────────────────────────────┘
                                │ uses
                                ↓
        ┌──────────────────────────────────────────────────────┐
        │            Services (Stateless Helpers)               │
        │  SignatureService │ SalienceRanker │ PromptDiet       │
        └───────────────────────┬──────────────────────────────┘
                                │ uses
                                ↓
        ┌──────────────────────────────────────────────────────┐
        │              Domain (Pure Types & Rules)              │
        │  AgentState │ ScreenSignature │ UIElement │ UIAction  │
        │  Advice │ Counters │ Budgets │ StopReason             │
        └──────────────────────────────────────────────────────┘

Dependency Flow: Domain ← Services ← Orchestrator ← Usecases ← BFF
                           ↑            ↑
                        Ports      Adapters

NEVER REVERSE: Domain never imports ports/adapters
               Ports never import adapters
               Adapters never import other adapters (unless via ports)
```

---

## 🚨 25 Non-Negotiable Rules

### Architecture & Boundaries (Rules 1-5)

1. **Single Source of Truth**: All orchestrator nodes, services, and usecases accept & return `AgentState` only; no ad-hoc dicts or side-channel params.

2. **Immutability Ritual**: Every file that touches `AgentState` must state: "clone/replace only; never mutate in place; nested collections replaced whole."

3. **No Cross-Adapter Chatter**: Adapters never import each other; coordination only via ports injected by DI.

4. **Pure Domain**: Domain layer is import-free except for stdlib `typing`/`dataclasses`; it must import nothing from usecases/orchestrator/ports/adapters.

5. **Ports are Interfaces**: Ports define capabilities only (abstract classes); no implementations, no SDK imports.

### Naming & Structure (Rules 6-10)

6. **Docstring Header Keys**: Require this exact order everywhere:
   - Purpose
   - Responsibilities
   - Allowed Dependencies
   - Forbidden Dependencies
   - Inputs
   - Outputs/Effects
   - Invariants
   - TODOs
   - Telemetry
   - Error Mapping

7. **One Class Per Node File**: The filename matches ClassName exactly; no helpers defined in node files.

8. **Explicit "LLM Decision Plane" Tag**: Each of the five LLM nodes must include `DECISION_PLANE = True` constant (docstring only; no logic).

9. **Next Transitions**: Every node file explicitly lists `Next Transitions` and whether it's `LLM` or `Non-LLM`.

10. **No File Over 400 Lines**: Split when it grows. Nodes should be focused and single-purpose.

### Port Contracts (Rules 11-16)

11. **DriverPort**: Declare "tap, type, scroll, app_foreground, restart, bounds query; all with bounded timeouts and deterministic error enums."

12. **LLMPort**: `invoke(node_type, input_payload) -> StructuredOutput` with `model_id`, `tokens_in/out`, `cache_hit`, `latency_ms` surfaced for TelemetryPort.

13. **FileStorePort**: `put_blob` returns content-addressed ref (hash or URL); `get_ref_metadata` only; no `get_blob` in agent core.

14. **CachePort**: Opaque bytes payload keyed by `(node, model, signature, delta_hash, topK_hash, policy_capsule)`; TTL & version in metadata.

15. **BudgetPort**: Query+consume pattern; enforce per-loop and per-run caps; returns remaining quotas for logging.

16. **TelemetryPort**: Structured events: `event`, `run_id`, `node`, `phase`, `latency_ms`, `tokens_in`, `tokens_out`, `cache_hit`, `budget_remaining`, `errors`.

### Contracts & Versioning (Rules 17-18)

17. **Contracts Folder Rule**: DTOs/enums mirror domain shapes but are decoupled; every top-level DTO includes `version: semver` and `schema_id`.

18. **Back-Compat Pledge**: Never delete fields; only add with defaults; deprecations noted in docstrings.

### BFF & DI (Rules 19-20)

19. **Wiring Note Enhancement**: `deps.py` shows how to build adapters behind ports without importing SDKs; composition via factory functions; app lifespan opens/closes adapters; all env values read only in BFF.

20. **Route Discipline**: Routes call usecases only; usecases never import FastAPI; payloads converted at the edges via `/contracts`.

### Telemetry & Observability (Rules 21-22)

21. **Event Taxonomy**: Require `agent.session_started`, `agent.loop_start`, `agent.node_start/finish`, `agent.llm_invocation`, `agent.persist_delta`, `agent.stop`.

22. **Sampling & PII**: No screenshots or page_source in logs; only refs and hashes. Redact app IDs if marked sensitive.

### Error Handling (Rule 23)

23. **Unified Error Enums**: `device_offline`, `no_idle`, `ocr_failed`, `repo_unavailable`, `budget_exceeded`, `invalid_llm_output`, `no_progress`, `restart_exhausted`.

### Budgets & Cost (Rules 24-25)

24. **Loop Contract**: Each loop must record `tokens_in/out`, `cache_hit`, `budget_remaining`, and cumulative time; ShouldContinue can force Stop on cap breach.

25. **Top-K Cap**: SalienceRanker must cap elements (e.g., K<=12) to keep prompt size stable; justify in docstring.

---

## 📦 Module Boundaries

```
/src                          # Framework-free agent core
  /domain                     # Pure types (NO imports except stdlib)
  /ports                      # Interfaces (NO SDK imports)
  /orchestrator               # Node graph (imports ports, domain, services)
    /nodes                    # 17 nodes (one class per file)
    /policy                   # Routing rules & constants
  /services                   # Stateless helpers (imports domain only)
  /usecases                   # High-level orchestration (imports all src)
  /config                     # Typed config objects (NO env reads)
  /errors                     # Domain exceptions
  /test                       # Fake ports & factories

/adapters                     # SDK wrappers (ONLY place with SDK imports)
  /appium                     # Implements DriverPort
  /ocr                        # Implements OCRPort
  /repo                       # Implements RepoPort + FileStorePort
  /llm                        # Implements LLMPort
  /cache                      # Implements CachePort
  /budget                     # Implements BudgetPort
  /telemetry                  # Implements TelemetryPort
  /engine                     # (optional) Implements EnginePort

/bff                          # FastAPI composition root
  /routes                     # HTTP handlers (call usecases)
  main.py                     # App creation + lifespan
  deps.py                     # DI container (instantiate adapters)

/cli                          # Command-line interface (Typer)
/contracts                    # API DTOs (versioned, decoupled)
/ui                           # (future) Admin web interface
```

---

## 🔒 AgentState: Single Source of Truth

### Contract

```python
@dataclass(frozen=True)
class AgentState:
    """
    The canonical state object for the ScreenGraph Agent.

    IMMUTABILITY RITUAL:
    - Clone/replace only; never mutate in place
    - Nested collections replaced whole
    - Use `replace(state, field=new_value)` or `state.clone_with(field=new_value)`

    NO BLOBS INLINE:
    - Screenshots/page_sources stored via FileStorePort
    - Only refs (keys/hashes) in bundle

    MONOTONIC UPDATES:
    - timestamps.updated_at changes on every state return
    - counters never decrease
    """
    # Identity & Flow
    run_id: str
    app_id: str
    timestamps: Timestamps

    # Perception (refs only)
    signature: ScreenSignature
    previous_signature: Optional[ScreenSignature]
    bundle: Bundle  # refs to screenshot/page_source/ocr

    # Enumerated Actions
    enumerated_actions: List[EnumeratedAction]

    # Plan & Advice
    advice: Advice
    plan_cursor: int

    # Progress Accounting
    counters: Counters
    budgets: Budgets

    # Persistence & Caching
    cache: Dict[str, CacheEntry]
    persist_result: Optional[PersistResultSummary]

    # Lifecycle
    stop_reason: Optional[str]
```

### Node Contract

Every node must follow:

```python
class SomeNode(BaseNode):
    def run(self, state: AgentState) -> AgentState:
        """
        IMMUTABILITY: Never mutate state; return new instance.
        """
        # Read from state
        signature = state.signature
        counters = state.counters

        # Perform logic (via ports)
        result = self.some_port.some_method()

        # Return new state
        return replace(
            state,
            field=new_value,
            counters=replace(counters, steps_total=counters.steps_total + 1),
            timestamps=replace(state.timestamps, updated_at=now()),
        )
```

---

## 🧠 LLM Decision Plane (Always-On)

**5 LLM nodes invoked EVERY iteration:**

### 1. ChooseActionNode

- **DECISION_PLANE**: `True`
- **Purpose**: Select next action from enumerated candidates
- **Cache Key**: `(choose_action, model, signature, delta_hash, topK_hash, plan_cursor)`
- **Guardrails**: Validate action_index in bounds; reject unsafe actions
- **Fallback**: Random safe action if validation fails
- **Next Transitions**: → ActNode

### 2. VerifyNode

- **DECISION_PLANE**: `True`
- **Purpose**: Arbitrate whether expected change occurred
- **Cache Key**: `(verify, model, prev_sig, curr_sig, expected_postcondition)`
- **Guardrails**: Validate delta_type enum; confidence in [0.0, 1.0]
- **Fallback**: Heuristic delta check
- **Next Transitions**: → PersistNode

### 3. DetectProgressNode

- **DECISION_PLANE**: `True`
- **Purpose**: Label progress (MADE_PROGRESS, NO_PROGRESS, REGRESSED)
- **Cache Key**: `(detect_progress, model, signature, delta_hash, counters_hash)`
- **Guardrails**: Validate progress_flag enum
- **Fallback**: Heuristic signals (signature comparison, repo delta)
- **Next Transitions**: → ShouldContinueNode

### 4. ShouldContinueNode

- **DECISION_PLANE**: `True`
- **Purpose**: Propose next route (CONTINUE, SWITCH_POLICY, RESTART_APP, STOP)
- **Cache Key**: `(should_continue, model, counters_hash, budgets_hash, progress_flag)`
- **Guardrails**: Orchestrator enforces budget caps (can override LLM to STOP)
- **Fallback**: Budget-based routing
- **Next Transitions**: → PerceiveNode | SwitchPolicyNode | RestartAppNode | StopNode

### 5. SwitchPolicyNode

- **DECISION_PLANE**: `True`
- **Purpose**: Deterministically change exploration policy
- **Cache Key**: `(switch_policy, model, counters_hash, current_policy)`
- **Guardrails**: Validate new_policy enum; cooldown >= 0
- **Fallback**: Deterministic policy rotation
- **Next Transitions**: → PerceiveNode

### Cost Reduction Strategies

- **7-day cache TTL** (signature-based; long-lived)
- **Delta-first prompts** (only changes since previous screen)
- **Top-K elements** (cap at 12; not full hierarchy)
- **Budget enforcement** (override LLM to STOP if caps exceeded)
- **Token tracking** (tokens_in/out, cache_hit logged every call)

---

## 🎛️ Port Contracts (Precision)

### DriverPort

```python
class DriverPort(ABC):
    """
    Device automation capabilities.

    METHODS:
    - tap(x, y): Tap at normalized coords [0.0, 1.0]
    - type_text(text): Enter text into focused element
    - swipe(start_x, start_y, end_x, end_y, duration_ms): Swipe gesture
    - scroll(direction): Scroll up/down/left/right
    - press_back(): Navigate back
    - press_home(): Go to home screen
    - get_current_app(): Get foreground package
    - restart_app(package): Force stop + relaunch
    - get_page_source(): Capture UI hierarchy XML/JSON
    - get_screenshot(): Capture PNG bytes

    TIMEOUTS:
    - All methods have bounded timeouts (default 10s)
    - Configurable via adapter constructor

    ERROR ENUMS:
    - DeviceOfflineError: Device unreachable
    - AppCrashedError: App stopped unexpectedly
    - ActionTimeoutError: Operation exceeded timeout
    """
```

### LLMPort

```python
class LLMPort(ABC):
    """
    LLM decision-making with structured outputs.

    METHOD:
    - invoke(node_type: str, input_payload: dict) -> StructuredOutput

    STRUCTURED OUTPUT:
    @dataclass
    class StructuredOutput:
        result: dict  # Node-specific output (ChosenAction, VerificationResult, etc.)
        model_id: str
        tokens_in: int
        tokens_out: int
        cache_hit: bool
        latency_ms: int

    NODE TYPES:
    - "choose_action": Returns ChosenAction
    - "verify": Returns VerificationResult
    - "detect_progress": Returns ProgressAssessment
    - "should_continue": Returns RoutingDecision
    - "switch_policy": Returns PolicySwitch

    TELEMETRY:
    - Surface model_id, tokens, cache_hit, latency for every call
    - TelemetryPort logs these automatically
    """
```

### FileStorePort

```python
class FileStorePort(ABC):
    """
    Asset storage with content-addressed refs.

    METHODS:
    - put_blob(data: bytes, content_type: str) -> str
      Returns content-addressed ref (SHA256 hash or URL)

    - get_ref_metadata(ref: str) -> dict
      Returns {size_bytes, content_type, created_at}
      NO get_blob in agent core (only in adapters for debugging)

    - exists(ref: str) -> bool
    - delete(ref: str) -> bool

    - generate_key(run_id, category, screen_id, ext) -> str
      Deterministic key generation

    CONTENT-ADDRESSED:
    - put_blob returns hash-based key (immutable)
    - Same content → same ref (deduplication)
    """
```

### CachePort

```python
class CachePort(ABC):
    """
    Opaque prompt caching with composite keys.

    KEY STRUCTURE:
    (node_type, model, signature, delta_hash, topK_hash, policy_capsule)

    METHODS:
    - get(key: str) -> Optional[bytes]
    - set(key: str, value: bytes, ttl: int, metadata: dict)
    - invalidate(pattern: str) -> int
    - get_stats() -> dict

    METADATA:
    - version: Cache schema version
    - ttl: Time-to-live in seconds
    - created_at: Timestamp

    PAYLOAD:
    - Opaque bytes (JSON, pickle, msgpack)
    - Adapter handles serialization
    """
```

### BudgetPort

```python
class BudgetPort(ABC):
    """
    Query+consume pattern for budget enforcement.

    METHODS:
    - query_remaining(run_id: str) -> Usage
      Returns {steps_left, tokens_left, time_left_ms}

    - consume_step(run_id: str)
    - consume_tokens(run_id: str, tokens: int, cost_usd: float)
    - consume_time(run_id: str, elapsed_ms: int)

    - is_exceeded(run_id: str, budgets: Budgets) -> bool

    ENFORCEMENT:
    - Per-loop caps: tokens_per_loop, time_per_loop_ms
    - Per-run caps: max_steps, max_tokens, max_time_ms
    - ShouldContinue can force STOP if caps breached

    LOGGING:
    - Return remaining quotas for telemetry
    """
```

### TelemetryPort

```python
class TelemetryPort(ABC):
    """
    Structured event logging.

    EVENT TAXONOMY:
    - agent.session_started
    - agent.loop_start
    - agent.node_start
    - agent.node_finish
    - agent.llm_invocation
    - agent.persist_delta
    - agent.stop

    FIELDS:
    - event: str
    - run_id: str
    - node: str
    - phase: str (start | finish)
    - latency_ms: int
    - tokens_in: int
    - tokens_out: int
    - cache_hit: bool
    - budget_remaining: dict
    - errors: List[str]

    PII REDACTION:
    - No screenshots or page_source in logs
    - Only refs and hashes
    - Redact app IDs if marked sensitive
    """
```

---

## 📜 Contracts & Versioning

### DTO Structure

```python
@dataclass
class SessionRequest:
    """
    VERSIONING:
    - version: semver (e.g., "1.0.0")
    - schema_id: "session_request_v1"

    BACK-COMPAT:
    - Never delete fields
    - Only add with defaults
    - Deprecations noted in docstrings
    """
    version: str = "1.0.0"
    schema_id: str = "session_request_v1"

    app_id: str
    budgets: Optional[BudgetsDTO] = None
```

### Migration Strategy

1. Add new fields with `Optional` or defaults
2. Mark deprecated fields in docstring
3. Version bump: patch for additions, minor for deprecations
4. Never remove fields (maintain backward compatibility)

---

## 🔧 BFF & DI Wiring

### deps.py Pattern

```python
class Dependencies:
    """
    DI container for adapters and usecases.

    WIRING:
    1. Read config from env (only in BFF)
    2. Instantiate adapters (behind ports)
    3. Inject adapters into usecases
    4. Provide usecases to routes via Depends()

    NO SDK IMPORTS IN AGENT CORE:
    - All SDK imports in /adapters
    - deps.py composes adapters → ports → usecases
    """

    def __init__(self):
        # Read config from env (ONLY here)
        self.config = RuntimeConfig.from_env()

        # Adapters (not yet instantiated)
        self.driver_adapter = None
        self.llm_adapter = None
        # ...

    async def initialize(self):
        """
        Lifespan startup: Instantiate adapters, open connections.
        """
        self.driver_adapter = AppiumAdapter(self.config.device)
        self.llm_adapter = LLMAdapter(self.config.llm)
        self.repo_adapter = RepoAdapter(self.config.storage)
        # ...

        # Open connections
        await self.repo_adapter.connect()

    async def shutdown(self):
        """
        Lifespan shutdown: Close connections, cleanup.
        """
        await self.repo_adapter.disconnect()

    def get_iterate_usecase(self):
        """
        Factory: Build graph with injected adapters.
        """
        graph = build_graph(
            driver=self.driver_adapter,  # DriverPort
            llm=self.llm_adapter,        # LLMPort
            repo=self.repo_adapter,      # RepoPort
            # ...
        )
        return IterateOnceUsecase(graph=graph)
```

### Route Pattern

```python
@router.post("/sessions/{id}/iterate")
async def iterate_session(
    session_id: str,
    usecase: IterateOnceUsecase = Depends(deps.get_iterate_usecase),
):
    """
    ROUTE DISCIPLINE:
    - Call usecase only
    - Convert payloads via /contracts
    - No business logic
    - No direct adapter usage
    """
    # Load state from repo
    state = await load_state(session_id)

    # Call usecase
    new_state = await usecase.execute(state)

    # Persist updated state
    await save_state(session_id, new_state)

    # Convert to DTO
    return IterateResponseDTO.from_state(new_state)
```

---

## 📊 State & Identity Details

### IDs & Time

- **IDs are ULIDs**: Sortable, timestamped, unique
- **Timestamps are ISO-8601 UTC**: `2025-10-06T12:34:56.789Z`
- **Monotonic update required**: `updated_at` changes on every state return

### Reproducibility

**ScreenSignature must be deterministic**:

```python
def compute_signature(elements: List[UIElement], ocr_text: str) -> ScreenSignature:
    """
    DETERMINISM:
    - Same elements → same layout_hash
    - Same OCR text → same ocr_stems_hash
    - Quantize floats to 2 decimals
    - Sort elements by z-order/hierarchy
    - Normalize OCR text (lowercase, stem, remove stopwords)

    INPUTS (for stable hashing):
    - Element roles, bounds (quantized), hierarchy
    - OCR stems (normalized, sorted)

    OUTPUTS:
    - layout_hash: SHA256 of element structure
    - ocr_stems_hash: SHA256 of normalized text
    - hash: SHA256(layout_hash + ocr_stems_hash)
    """
```

---

## ⚠️ Error Taxonomy & Guardrails

### Unified Error Enums

```python
class StopReason(str, Enum):
    """Termination reasons."""
    SUCCESS = "success"
    BUDGET_EXHAUSTED = "budget_exhausted"
    CRASH = "crash"
    NO_PROGRESS = "no_progress"
    USER_CANCELLED = "user_cancelled"
    DEVICE_OFFLINE = "device_offline"
    APP_NOT_INSTALLED = "app_not_installed"
    RESTART_EXHAUSTED = "restart_exhausted"
    INVALID_LLM_OUTPUT = "invalid_llm_output"
    REPO_UNAVAILABLE = "repo_unavailable"
    OCR_FAILED = "ocr_failed"
    NO_IDLE = "no_idle"
```

### LLM Guardrails

```python
def validate_chosen_action(output: dict, state: AgentState) -> ChosenAction:
    """
    GUARDRAILS:
    1. Validate action_index in [0, len(enumerated_actions))
    2. Validate confidence in [0.0, 1.0]
    3. Reject destructive actions without high confidence (>0.8)

    FALLBACK:
    - If validation fails: return cached advice or deterministic heuristic
    - Log guardrail_violation=True
    """
    if not 0 <= output["action_index"] < len(state.enumerated_actions):
        log_guardrail_violation("action_index_out_of_bounds")
        return fallback_choose_action(state)

    if not 0.0 <= output["confidence"] <= 1.0:
        log_guardrail_violation("confidence_out_of_range")
        return fallback_choose_action(state)

    return ChosenAction(**output)
```

---

## 💰 Budgets & Cost Discipline

### Loop Contract

Every iteration must record:

```python
@dataclass
class LoopMetrics:
    tokens_in: int
    tokens_out: int
    cache_hit: bool
    budget_remaining: dict  # {steps_left, tokens_left, time_left_ms}
    elapsed_ms: int
    llm_calls: int
```

### ShouldContinue Enforcement

```python
def run(self, state: AgentState) -> AgentState:
    """
    BUDGET ENFORCEMENT:
    - Check BudgetPort.is_exceeded()
    - Override LLM to STOP if caps breached
    - Log budget_remaining for telemetry
    """
    usage = self.budget.query_remaining(state.run_id)

    if usage.steps_left <= 0 or usage.tokens_left <= 0:
        return replace(state, stop_reason="budget_exhausted")

    # Call LLM for routing decision
    decision = self.llm.should_continue(state)

    # Return with budget info
    return replace(state, advice=decision, budget_remaining=usage)
```

### Top-K Cap

```python
class SalienceRanker:
    """
    JUSTIFICATION:
    - K=12 keeps prompt size stable (~2K tokens)
    - Larger K increases costs without accuracy gains
    - Top-K elements are most salient (visibility, interactivity, size)

    CAP ENFORCEMENT:
    - SalienceRanker.rank_elements() returns max 12 elements
    - EnumerateActionsNode uses top-K for action generation
    """
    def __init__(self, top_k: int = 12):
        self.top_k = top_k
```

---

## 🚫 Non-Goals (Scope Control)

To prevent scope creep:

1. **No heuristics that infer intent from raw OCR text** at this stage
2. **No SDK imports outside `/adapters`**
3. **No persistence of blobs inside AgentState**
4. **No real-time streaming** (batch-mode only for MVP)
5. **No multi-device orchestration** (single device per run)
6. **No visual diff analysis** (signature-based only)

---

## ✅ Acceptance Checklist

Before marking a node/module complete:

### Node Files

- [ ] Docstring header follows exact order (Purpose → Responsibilities → ... → Error Mapping)
- [ ] `DECISION_PLANE = True` constant for LLM nodes (in docstring)
- [ ] `Next Transitions` explicitly listed
- [ ] `LLM or Non-LLM` explicitly stated
- [ ] One class per file (filename matches ClassName)
- [ ] Immutability ritual stated: "clone/replace only; never mutate"
- [ ] No file over 400 lines

### Port Files

- [ ] Abstract class with `@abstractmethod` decorators
- [ ] No SDK imports
- [ ] Return domain types
- [ ] Raise domain exceptions
- [ ] Docstring describes method contracts (timeouts, errors, etc.)

### Adapter Files

- [ ] Implements port interface
- [ ] SDK imports isolated here
- [ ] Error mapping to domain exceptions
- [ ] Retry logic with exponential backoff
- [ ] No cross-adapter imports (unless via ports)

### Service Files

- [ ] Stateless (no instance state)
- [ ] Pure functions (same input → same output)
- [ ] Imports domain types only (no ports/adapters)
- [ ] Docstring explains algorithms and invariants

### Usecase Files

- [ ] Coordinates across ports
- [ ] No business logic (delegates to nodes/services)
- [ ] Returns `AgentState` or domain types
- [ ] No FastAPI imports

### BFF Files

- [ ] `deps.py` shows adapter composition without SDK imports in agent core
- [ ] Routes call usecases only
- [ ] Payloads converted via `/contracts`
- [ ] Lifespan hooks open/close adapters
- [ ] All env reads only in BFF

### Config Files

- [ ] `.env.example` includes:
  - `TOKEN_BUDGET_PER_RUN`
  - `TOKEN_BUDGET_PER_LOOP`
  - `PROMPT_CACHE_TTL_S`
  - `TOPK_LIMIT`

### Graph File

- [ ] `graph.py` contains only comments (high-level wiring sketch)
- [ ] Invariant stated: "Five LLM nodes execute every loop"
- [ ] Node order documented
- [ ] Routing logic described

### Contract Files

- [ ] Every DTO includes `version` and `schema_id`
- [ ] Docstring notes back-compat rules
- [ ] No field deletions (only additions with defaults)

---

## 📝 Docstring Template

```python
"""
[FileName]: [Short Description]

PURPOSE:
--------
[What this module/class does and why it exists]

RESPONSIBILITIES:
-----------------
[Specific duties and scope]

ALLOWED DEPENDENCIES:
---------------------
- [List of allowed imports with justification]

FORBIDDEN DEPENDENCIES:
-----------------------
- NO [List of forbidden imports with rationale]

INPUTS:
-------
[What data/state this accepts]

OUTPUTS/EFFECTS:
----------------
[What it returns and side effects]

INVARIANTS:
-----------
[Rules that must always hold true]

NEXT TRANSITIONS:
-----------------
[For nodes only: which node(s) this routes to]

LLM OR NON-LLM:
---------------
[For nodes only: LLM (with DECISION_PLANE = True) or Non-LLM]

TELEMETRY:
----------
[Which events/metrics to log]

ERROR MAPPING:
--------------
[Which SDK errors map to which domain errors]

TODO:
-----
- [ ] [Specific implementation tasks]
"""
```

---

## 🎯 Quick Reference

### File Count Expectation

- **22 `__init__.py` files** (one per package)
- **17 node files** (one class per file)
- **8 port files** (one interface per file)
- **8 adapter packages** (one implementation per port)
- **5 service files** (stateless helpers)
- **3 usecase files** (high-level orchestration)

### Dependency Flow

```
Domain (no imports) ← Services ← Orchestrator ← Usecases ← BFF
                        ↑            ↑
                     Ports      Adapters
```

### LLM Always-On

```
Every loop: ChooseAction → Verify → DetectProgress → ShouldContinue
Optional: SwitchPolicy (when routed)
```

### Budget Enforcement

```
Per-loop: tokens_per_loop, time_per_loop_ms
Per-run: max_steps, max_tokens, max_time_ms
Override LLM to STOP if caps exceeded
```

### Top-K Cap

```
K = 12 (keeps prompt size ~2K tokens)
SalienceRanker enforces; EnumerateActions uses
```

---

**Last Updated**: 2025-10-06  
**Version**: 1.0.0  
**Maintained By**: AI Assistant (Claude) + Development Team

---

## 🌟 Remember

> "Clean architecture is not about perfectionism; it's about predictability.
> Every import, every dependency, every state mutation should be intentional and documented.
> When in doubt, favor immutability, interfaces, and isolation."

**Less go! 🚀**
