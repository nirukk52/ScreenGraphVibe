# Adapters: SDK Wrappers and External Integration

## Purpose

Adapters are the **only layer** that imports SDKs and talks to external systems. They implement port interfaces and translate between SDK types and domain types.

## Adapter Rules

1. **Implement ports**: One-to-one or one-to-many mapping
2. **Translate errors**: SDK exceptions → domain errors
3. **Handle retries**: Transient failures with exponential backoff
4. **No adapter→adapter**: Coordination via ports only
5. **No business logic**: Pure translation and error handling

## Adapter Catalog

### AppiumAdapter (`/adapters/appium`)

**Implements**: `DriverPort`

**SDK**: `appium-python-client`, Selenium WebDriver

**Methods**:
- `is_device_ready()` → Check device connectivity
- `install_app()` → Install APK
- `launch_app()` → Open app
- `get_page_source()` → Capture UI hierarchy (XML)
- `get_screenshot()` → Capture PNG
- `tap()`, `swipe()`, `type_text()` → Actions
- `press_back()`, `press_home()` → Navigation

**Error Mapping**:
- `NoSuchElementException` → `ElementNotFoundError`
- `TimeoutException` → `ActionTimeoutError`
- `WebDriverException` → `DeviceOfflineError` (with retry)

**Retries**: 3 attempts with exponential backoff (100ms, 200ms, 400ms)

---

### OCRAdapter (`/adapters/ocr`)

**Implements**: `OCRPort`

**SDK**: `pytesseract`, `google-cloud-vision`, or `easyocr`

**Methods**:
- `extract_text(image_bytes)` → `OCRResult` (full text + regions)
- `extract_text_regions(image_bytes)` → `List[TextRegion]` (with bounds)

**Caching**: By image hash (SHA256)

**Options**:
- **Tesseract**: Local, free, fast, lower accuracy
- **Google Vision**: Cloud, paid, slower, higher accuracy
- **EasyOCR**: Local, free, moderate speed/accuracy

---

### RepoAdapter (`/adapters/repo`)

**Implements**: `RepoPort`, `FileStorePort`

**SDKs**: `psycopg2`/`SQLAlchemy` (DB), `boto3`/`google-cloud-storage` (storage)

**Methods** (RepoPort):
- `upsert_node(signature, metadata)` → Idempotent node insert
- `upsert_edge(from, to, action, metadata)` → Idempotent edge insert
- `get_node(signature)` → Retrieve node
- `get_neighbors(signature)` → List adjacent nodes
- `get_exploration_stats(run_id)` → Summary stats

**Methods** (FileStorePort):
- `put(key, data, content_type)` → Store asset
- `get(key)` → Retrieve asset
- `delete(key)` → Remove asset
- `exists(key)` → Check existence
- `generate_key(run_id, category, screen_id, ext)` → Key builder

**Schema**:
```sql
CREATE TABLE nodes (
  signature TEXT PRIMARY KEY,
  app_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE edges (
  id UUID PRIMARY KEY,
  from_signature TEXT REFERENCES nodes(signature),
  to_signature TEXT REFERENCES nodes(signature),
  action JSONB,
  metadata JSONB,
  created_at TIMESTAMP
);
```

**Storage Paths**:
- `runs/{run_id}/screenshots/{screen_id}.png`
- `runs/{run_id}/page_sources/{screen_id}.xml`
- `runs/{run_id}/rationales/{node_type}_{screen_id}.json`

---

### LLMAdapter (`/adapters/llm`)

**Implements**: `LLMPort`

**SDKs**: `openai`, `anthropic`, or `langchain`

**Methods** (one per LLM node):
- `choose_action(state)` → `ChosenAction`
- `verify_action(state)` → `VerificationResult`
- `detect_progress(state)` → `ProgressAssessment`
- `should_continue(state)` → `RoutingDecision`
- `switch_policy(state)` → `PolicySwitch`

**Prompt Templates**: One per method, uses `PromptDiet` for pruning

**Output Parsers**: Parse LLM JSON/text → structured domain types

**Guardrails**:
- Validate action indices (in bounds)
- Validate confidence scores ([0.0, 1.0])
- Reject unsafe actions (low confidence)
- Fallback to heuristics on validation failure

**Cost Tracking**: Count tokens, estimate USD via `BudgetPort`

---

### CacheAdapter (`/adapters/cache`)

**Implements**: `CachePort`

**SDKs**: `redis`, `diskcache`, or `cachetools`

**Methods**:
- `get_prompt_cache(key)` → Retrieve cached LLM output
- `set_prompt_cache(key, value, ttl)` → Store LLM output
- `get_advice(signature)` → Retrieve advice
- `set_advice(signature, advice, ttl)` → Store advice
- `invalidate(pattern)` → Clear cache
- `get_stats()` → Cache hit/miss rates

**Key Structure**:
- Prompt: `{node_type}:{model}:{signature}:{delta_hash}:{topK_hash}`
- Advice: `advice:{signature}`

**TTL**: 7 days (prompt), 7 days (advice), 1 hour (routing)

**Options**:
- **In-memory**: Fast, ephemeral (`cachetools`, `lru_cache`)
- **Redis**: Fast, distributed, persistent
- **DiskCache**: Moderate speed, persistent, local

---

### BudgetAdapter (`/adapters/budget`)

**Implements**: `BudgetPort`

**SDK**: None (in-memory counters)

**Methods**:
- `track_step(run_id)` → Increment step counter
- `track_tokens(run_id, tokens, cost)` → Track LLM usage
- `track_error(run_id)` → Increment error counter
- `get_usage(run_id)` → Current usage
- `is_budget_exceeded(run_id, budgets)` → Check limits
- `reset(run_id)` → Clear counters

**Thread Safety**: Use `threading.Lock`

---

### TelemetryAdapter (`/adapters/telemetry`)

**Implements**: `TelemetryPort`

**SDKs**: `structlog`, `prometheus_client`, `opentelemetry`

**Methods**:
- `log(level, message, context)` → Structured log
- `metric(name, value, tags)` → Emit metric
- `trace_start(span_name, context)` → Start trace span
- `trace_end(span_id, status, context)` → End trace span

**Log Format**: JSON with timestamp, level, message, run_id, node_type, etc.

**Metrics**:
- Counters: `steps_total`, `errors_total`, `llm_calls_total`
- Gauges: `budget_remaining_pct`, `cache_hit_rate`
- Histograms: `llm_latency_ms`, `action_duration_ms`

**Traces**: Span per node, span per LLM call

---

### EngineAdapter (`/adapters/engine`) (Optional)

**Implements**: `EnginePort` (to be defined)

**SDKs**: DroidBot, Fastbot2 (future)

**Purpose**: Integrate external exploration engines for action hints

**Strategy**: Use engine hints alongside LLM decisions, merge into `enumerated_actions`

---

## Error Handling

### Error Taxonomy

**Transient** (retry):
- Network timeouts
- Rate limits
- Appium session lost (temporary)

**Permanent** (fail fast):
- Device offline
- App not installed
- Invalid credentials
- Budget exceeded

### Retry Strategy

```python
@retry(max_attempts=3, backoff=[100, 200, 400])
def transient_operation():
    try:
        # SDK call
    except TransientError:
        raise  # Retry
    except PermanentError:
        raise DomainError  # Fail fast
```

### Error Mapping

| SDK Exception | Domain Error |
|---------------|--------------|
| `NoSuchElementException` | `ElementNotFoundError` |
| `TimeoutException` | `ActionTimeoutError` |
| `WebDriverException` | `DeviceOfflineError` |
| `InvalidSessionIdException` | `DeviceOfflineError` |
| `openai.Timeout` | `LLMTimeoutError` |
| `openai.APIError` | `LLMError` |

---

## Configuration

Adapters receive config from BFF (`RuntimeConfig`):

```python
# In deps.py
config = RuntimeConfig.from_env()

driver_adapter = AppiumAdapter(
    url=config.device.appium_url,
    platform=config.device.platform,
    timeout_ms=config.device.timeout_ms,
)

llm_adapter = LLMAdapter(
    provider=config.llm.provider,
    model=config.llm.model,
    api_key=os.environ[config.llm.api_key_ref],
    timeout_ms=config.llm.timeout_ms,
)
```

**No env var reads in adapters** (injected by BFF).

---

## Testing

**Unit Tests** (fake ports):
```python
fake_driver = FakeDriverPort()
node = EnsureDeviceNode(driver=fake_driver, telemetry=fake_telemetry)
state = node.run(initial_state)
assert state.stop_reason is None
```

**Integration Tests** (real adapters):
```python
real_driver = AppiumAdapter(config.device)
real_repo = RepoAdapter(config.storage)
# Use Testcontainers for DB/Redis
```

---

## Next Steps

- [ ] Implement all adapters
- [ ] Add retry logic
- [ ] Add connection pooling (DB)
- [ ] Add telemetry spans
- [ ] Add adapter health checks

