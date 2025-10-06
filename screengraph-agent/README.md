# ScreenGraph Agent MVP

**AI-driven mobile app crawler with LLM decision-making at every step.**

## Overview

ScreenGraph Agent automatically explores Android/iOS apps, builds ScreenGraphs (nodes = screens, edges = actions), and verifies exploration against baselines.

### Core Principles

- **Clean Architecture**: Domain → Ports → Adapters → BFF
- **LLM Always-On**: 5 LLM decision nodes invoked every iteration
- **Deterministic Signatures**: Screen states identified by stable hashes
- **Delta-First Prompts**: LLM sees only changes, not full hierarchy
- **Assets by Reference**: No blobs in state; FileStore for heavy data
- **Caching + Budgets**: Prompt caching and token budgets reduce costs

## Architecture

```
/src                          # Framework-free agent core
  /domain                     # Pure types and rules
  /ports                      # Capability interfaces (no SDKs)
  /orchestrator               # Node graph and control flow
    /nodes                    # 17 discrete execution steps
    /policy                   # Routing rules and constants
  /services                   # Stateless domain logic
  /usecases                   # High-level orchestration
  /config                     # Typed configuration
  /errors                     # Domain exceptions
  /test                       # Fake ports and factories

/adapters                     # SDK wrappers (implements ports)
  /appium                     # Device automation
  /ocr                        # Text extraction
  /repo                       # Graph persistence + file storage
  /llm                        # AI decision-making
  /cache                      # Prompt/advice caching
  /budget                     # Resource tracking
  /telemetry                  # Observability
  /engine                     # (optional) DroidBot/Fastbot2

/bff                          # FastAPI composition root
  /routes                     # HTTP handlers
  main.py                     # App entrypoint
  deps.py                     # DI container

/cli                          # Command-line interface
/contracts                    # API DTOs
/ui                           # (future) Admin web interface
```

## LLM Decision Plane (Always-On)

**5 LLM nodes invoked every iteration:**

1. **ChooseAction**: Select next action from candidates
2. **Verify**: Classify action outcome (delta type)
3. **DetectProgress**: Label progress (made/no/regressed)
4. **ShouldContinue**: Propose route (continue/switch/restart/stop)
5. **SwitchPolicy**: Change exploration policy (when triggered)

**Cost Reduction:**
- Prompt caching (7-day TTL)
- Delta-first prompts (only changes)
- Top-K elements (not full hierarchy)
- Budget enforcement (token caps)

## State Object

All nodes consume and produce `AgentState`:

```python
@dataclass(frozen=True)
class AgentState:
    # Identity
    run_id: str
    app_id: str
    
    # Perception (refs only, no blobs)
    signature: ScreenSignature
    previous_signature: ScreenSignature | None
    bundle: Bundle  # refs to screenshot/page_source
    
    # Planning
    enumerated_actions: List[EnumeratedAction]
    advice: Advice
    plan_cursor: int
    
    # Progress
    counters: Counters
    budgets: Budgets
    
    # Persistence
    persist_result: PersistResultSummary | None
    stop_reason: str | None
    
    # Lifecycle
    timestamps: Timestamps
```

**Immutability**: Nodes return new states (never mutate in place).

## Node Graph

**Setup Phase:**
1. EnsureDevice → ProvisionApp → LaunchOrAttach → WaitIdle

**Main Loop:**
2. Perceive → EnumerateActions → ChooseAction [LLM] → Act
3. Verify [LLM] → Persist → DetectProgress [LLM] → ShouldContinue [LLM]

**Policy Routing:**
4. ShouldContinue → Perceive (continue) | SwitchPolicy [LLM] | RestartApp | Stop

**Recovery:**
5. RecoverFromError (transient errors)
6. RestartApp (app crash, bounded)

**Termination:**
7. Stop (final summary)

## Getting Started

### Prerequisites

- Python 3.9+
- Appium server running (http://localhost:4723)
- PostgreSQL or Supabase (for graph storage)
- LLM API key (OpenAI, Anthropic, etc.)
- (Optional) Redis for caching

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Setup config
cp .env.example .env
# Edit .env with your credentials

# Run via CLI
python -m cli.app run --app-id com.example.app --max-steps 50

# Or via BFF (FastAPI)
python -m bff.main
# Then: POST http://localhost:8000/sessions
```

### Configuration

See `.env.example` for all configuration options:
- `APPIUM_URL`: Appium server endpoint
- `LLM_PROVIDER`: openai | anthropic | local
- `DB_URL`: PostgreSQL connection string
- `STORAGE_TYPE`: s3 | gcs | local
- `CACHE_TYPE`: memory | redis

## Testing

Unit tests use fake ports (no real SDKs):

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html
```

## Documentation

- **ARCHITECTURE.md**: Clean architecture principles
- **ADAPTERS.md**: Adapter responsibilities and rules
- **AGENT.md**: Node graph, decision plane, StateObject
- **BFF.md**: DI and routes overview

## Roadmap

- [ ] Implement all 17 nodes
- [ ] Integrate Appium/LLM adapters
- [ ] Add prompt templates and guardrails
- [ ] Add cache warming strategies
- [ ] Add admin web UI
- [ ] Add baseline comparison
- [ ] Add distributed tracing

## License

MIT
