# BFF.md – Backend for Frontend: DI and Routes

## Purpose

The **BFF (Backend for Frontend)** is a thin HTTP layer built with FastAPI. Its sole responsibility is **composition**: instantiate adapters, bind them to ports, inject into usecases, and expose routes.

**No business logic lives here.** All domain logic belongs in `/src`.

---

## Architecture

```
Routes → Usecases → Orchestrator → Ports → Adapters
  ↑                                           ↑
  └───────────── deps.py ─────────────────────┘
              (DI Container)
```

---

## File Structure

```
/bff
  /__init__.py            # Package marker
  /main.py                # FastAPI app creation + lifespan
  /deps.py                # DI container (composition root)
  /routes
    /__init__.py          # Routes package marker
    /sessions.py          # Session management routes
```

---

## deps.py: Composition Root

### Responsibilities

1. **Read config from env** (ONLY place env vars are read)
2. **Instantiate adapters** (behind port interfaces)
3. **Inject adapters into usecases** (via ports)
4. **Provide usecases to routes** (via FastAPI `Depends()`)

### Pattern

```python
class Dependencies:
    """
    DI container for adapters and usecases.
    
    WIRING:
    - Read config from env (only in BFF)
    - Instantiate adapters (AppiumAdapter, LLMAdapter, etc.)
    - Inject adapters into nodes via ports
    - Build orchestrator graph with injected ports
    - Provide usecases to routes
    
    LIFESPAN:
    - initialize(): Called on FastAPI startup
    - shutdown(): Called on FastAPI shutdown
    """
    
    def __init__(self):
        # Read config from env
        self.config = RuntimeConfig.from_env()
        
        # Adapters (not yet instantiated)
        self.driver = None
        self.llm = None
        self.repo = None
        self.filestore = None
        self.cache = None
        self.budget = None
        self.telemetry = None
        self.ocr = None
    
    async def initialize(self):
        """
        Lifespan startup: Instantiate adapters, open connections.
        """
        # Instantiate adapters with config
        self.driver = AppiumAdapter(
            url=self.config.device.appium_url,
            platform=self.config.device.platform,
            timeout_ms=self.config.device.timeout_ms,
        )
        
        self.llm = LLMAdapter(
            provider=self.config.llm.provider,
            model=self.config.llm.model,
            api_key=os.environ["LLM_API_KEY"],
            timeout_ms=self.config.llm.timeout_ms,
        )
        
        self.repo = RepoAdapter(
            db_url=self.config.storage.db_url,
        )
        
        self.filestore = FileStoreAdapter(
            storage_type=self.config.storage.storage_type,
            bucket=self.config.storage.bucket,
        )
        
        self.cache = CacheAdapter(
            cache_type=self.config.cache.cache_type,
            redis_url=self.config.cache.redis_url,
        )
        
        self.budget = BudgetAdapter()
        
        self.telemetry = TelemetryAdapter(
            log_level=os.environ.get("LOG_LEVEL", "INFO"),
        )
        
        self.ocr = OCRAdapter(
            engine=self.config.ocr.engine,
        )
        
        # Open connections
        await self.repo.connect()
        await self.cache.connect()
        
        print("✅ Adapters initialized")
    
    async def shutdown(self):
        """
        Lifespan shutdown: Close connections, cleanup.
        """
        await self.repo.disconnect()
        await self.cache.disconnect()
        
        print("✅ Adapters cleaned up")
    
    def build_graph(self):
        """
        Build orchestrator graph with injected ports.
        """
        return build_graph(
            driver=self.driver,          # DriverPort
            llm=self.llm,                # LLMPort
            repo=self.repo,              # RepoPort
            filestore=self.filestore,    # FileStorePort
            cache=self.cache,            # CachePort
            budget=self.budget,          # BudgetPort
            telemetry=self.telemetry,    # TelemetryPort
            ocr=self.ocr,                # OCRPort
        )
    
    def get_start_session_usecase(self):
        """Factory for StartSessionUsecase."""
        return StartSessionUsecase(
            repo=self.repo,
            telemetry=self.telemetry,
        )
    
    def get_iterate_usecase(self):
        """Factory for IterateOnceUsecase."""
        graph = self.build_graph()
        return IterateOnceUsecase(graph=graph)
    
    def get_finalize_usecase(self):
        """Factory for FinalizeRunUsecase."""
        return FinalizeRunUsecase(
            repo=self.repo,
            telemetry=self.telemetry,
        )
```

### Key Points

1. **No SDK imports in agent core**: All SDK imports in `/adapters`
2. **deps.py is the only place** that instantiates adapters
3. **Config read from env** only in deps.py (not in agent core)
4. **Lifespan hooks** manage adapter lifecycle

---

## main.py: FastAPI App

### Responsibilities

1. **Create FastAPI app**
2. **Register lifespan hooks** (startup/shutdown)
3. **Register routes**
4. **Add middleware** (CORS, logging, error handling)

### Pattern

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from .deps import Dependencies
from .routes import sessions

# Global deps instance
deps = Dependencies()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI.
    
    STARTUP:
    - Initialize adapters
    - Open connections
    
    SHUTDOWN:
    - Close connections
    - Cleanup resources
    """
    # Startup
    await deps.initialize()
    yield
    # Shutdown
    await deps.shutdown()


def create_app() -> FastAPI:
    """
    Create and configure FastAPI application.
    """
    app = FastAPI(
        title="ScreenGraph Agent API",
        version="0.1.0",
        lifespan=lifespan,
    )
    
    # Register routes
    app.include_router(sessions.router, prefix="/api")
    
    # Health check
    @app.get("/health")
    async def health():
        return {"status": "ok"}
    
    return app


# App instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## routes/sessions.py: HTTP Handlers

### Responsibilities

1. **Accept HTTP requests**
2. **Convert DTOs** (contracts) to domain types
3. **Call usecases**
4. **Convert domain types** back to DTOs
5. **Handle errors** (map to HTTP status codes)

### Route Discipline

- Routes call **usecases only**
- Usecases **never import FastAPI**
- Payloads converted at the edges via `/contracts`
- No business logic in routes

### Pattern

```python
from fastapi import APIRouter, Depends, HTTPException
from ..deps import Dependencies, deps
from ...contracts import (
    SessionRequest,
    SessionResponse,
    IterateRequest,
    IterateResponse,
    SummaryResponse,
)

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SessionResponse, status_code=201)
async def create_session(
    request: SessionRequest,
    usecase = Depends(lambda: deps.get_start_session_usecase()),
):
    """
    Create a new agent session.
    
    FLOW:
    1. Validate request (FastAPI does this automatically)
    2. Convert DTO → domain types
    3. Call usecase
    4. Convert domain → DTO
    5. Return response
    """
    try:
        # Convert DTO → domain
        budgets = request.to_budgets() if request.budgets else None
        
        # Call usecase
        state = await usecase.execute(
            run_id=request.run_id,
            app_id=request.app_id,
            budgets=budgets,
        )
        
        # Convert domain → DTO
        return SessionResponse.from_state(state)
    
    except Exception as e:
        # Map errors to HTTP status codes
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{session_id}/iterate", response_model=IterateResponse)
async def iterate_session(
    session_id: str,
    request: IterateRequest,
    usecase = Depends(lambda: deps.get_iterate_usecase()),
):
    """
    Execute one iteration of the agent loop.
    
    FLOW:
    1. Load current state from repo
    2. Call usecase with state
    3. Persist updated state
    4. Return summary
    """
    try:
        # Load state (via repo adapter)
        state = await load_state(session_id)
        
        # Call usecase
        new_state = await usecase.execute(state)
        
        # Persist updated state
        await save_state(session_id, new_state)
        
        # Convert domain → DTO
        return IterateResponse.from_state(new_state)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{session_id}/summary", response_model=SummaryResponse)
async def get_summary(
    session_id: str,
    usecase = Depends(lambda: deps.get_finalize_usecase()),
):
    """
    Get run summary for a session.
    
    FLOW:
    1. Load final state
    2. Call usecase
    3. Return summary
    """
    try:
        # Load state
        state = await load_state(session_id)
        
        # Call usecase
        summary = await usecase.execute(state)
        
        # Convert domain → DTO
        return SummaryResponse.from_dict(summary)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Error Handling

### Mapping Domain Errors to HTTP Status

| Domain Error | HTTP Status | Example |
|--------------|-------------|---------|
| `DeviceOfflineError` | 503 Service Unavailable | Device disconnected |
| `AppNotInstalledError` | 400 Bad Request | Package not found |
| `BudgetExceededError` | 429 Too Many Requests | Token limit hit |
| `PersistenceError` | 500 Internal Server Error | DB connection failed |
| `LLMTimeoutError` | 504 Gateway Timeout | LLM API timeout |
| `ValidationError` | 422 Unprocessable Entity | Invalid request |

### Error Response Format

```json
{
  "error": {
    "type": "device_offline",
    "message": "Device is unreachable",
    "details": {
      "device_id": "emulator-5554",
      "last_seen": "2025-10-06T12:34:56Z"
    }
  }
}
```

---

## Middleware

### CORS

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Request Logging

```python
import time
from fastapi import Request

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    print(f"{request.method} {request.url.path} - {response.status_code} ({duration:.2f}s)")
    return response
```

---

## Deployment

### Running Locally

```bash
# Development (auto-reload)
uvicorn bff.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn bff.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker

```dockerfile
FROM python:3.9

WORKDIR /app
COPY . /app

RUN pip install -r requirements.txt

CMD ["uvicorn", "bff.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Testing

### Testing Routes

Use FastAPI TestClient:

```python
from fastapi.testclient import TestClient
from bff.main import app

client = TestClient(app)

def test_create_session():
    response = client.post("/api/sessions", json={
        "run_id": "run-123",
        "app_id": "com.example.app",
    })
    assert response.status_code == 201
    assert response.json()["run_id"] == "run-123"
```

### Testing with Fake Adapters

```python
# Override deps with fake adapters
from bff.deps import deps
from src.test import FakeDriverPort, FakeLLMPort

deps.driver = FakeDriverPort()
deps.llm = FakeLLMPort()

# Now routes use fake adapters
response = client.post("/api/sessions/{id}/iterate")
```

---

## Best Practices

1. **Keep routes thin**: Only HTTP concerns (validation, serialization, errors)
2. **Usecases own logic**: All domain logic in usecases/nodes
3. **deps.py owns composition**: Only place where adapters are instantiated
4. **Lifespan hooks**: Manage adapter lifecycle (startup/shutdown)
5. **Error mapping**: Consistent domain error → HTTP status mapping
6. **Validation**: Use Pydantic for request/response validation
7. **Middleware**: Add logging, CORS, rate limiting
8. **Testing**: Use TestClient with fake adapters

---

## Next Steps

1. Implement all routes (sessions, health, metrics)
2. Add error handling middleware
3. Add rate limiting (per session, per IP)
4. Add authentication (API keys, JWT)
5. Add request validation (Pydantic)
6. Add OpenAPI documentation
7. Add metrics endpoint (Prometheus)
8. Deploy to production (Docker + Kubernetes)

