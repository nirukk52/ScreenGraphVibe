# ScreenGraphVibe MCP Module

Purpose: Lightweight MCP proxy server to connect local tools to a running Graphiti service using a JSON connection config.

## Config

- File: `src/config/mcp-config.json`
- Fields:
  - `graphiti.url`: Base URL for Graphiti (e.g., http://localhost:8765)
  - `graphiti.groupId`: Group ID (default: screengraph-vibe)
  - `graphiti.apiKey`: Optional bearer token
  - `graphiti.timeoutMs`: Request timeout in milliseconds
  - `server.host` / `server.port`: Bind address for MCP server

## Endpoints

- `GET /healthz` → `{ ok: true, graphiti: string }`
- `POST /proxy` → forwards to Graphiti
  - Body: `{ path: string, method?: 'GET'|'POST', body?: any }`

## Scripts

- `npm run dev` → tsx watch `src/index.ts`
- `npm run build` → compile to `dist/`
- `npm start` → run compiled server

## Usage

```bash
# Start in watch mode
cd mcp && npm run dev

# Health check
curl http://127.0.0.1:4888/healthz

# Proxy example (POST)
curl -X POST http://127.0.0.1:4888/proxy \
  -H 'Content-Type: application/json' \
  -d '{"path":"/mcp/search/nodes","body":{"query":"auth", "group_ids":["screengraph-vibe"]}}'
```
