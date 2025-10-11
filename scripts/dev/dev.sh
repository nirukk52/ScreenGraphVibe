#!/usr/bin/env bash
set -euo pipefail

# Wrapper for `npm run dev` that respects per-worktree ports

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

log() {
  printf "\033[1;94m[dev]\033[0m %s\n" "$*"
}

# Defaults
BACKEND_PORT=3000
UI_PORT=3001
AGENT_API_PORT=8000

if [[ -f "$ROOT_DIR/.worktree-ports" ]]; then
  # shellcheck disable=SC1090
  source "$ROOT_DIR/.worktree-ports"
fi

export BACKEND_PORT UI_PORT AGENT_API_PORT
export AGENT_PORT="$BACKEND_PORT" AGENT_HOST="0.0.0.0"

log "Ports → backend:${BACKEND_PORT} ui:${UI_PORT} agent:${AGENT_API_PORT}"

CMD_BACKEND="cd backend && npm run dev"
CMD_UI="cd ui && next dev -p ${UI_PORT}"
CMD_AGENT="cd screengraph-agent && source venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port ${AGENT_API_PORT}"

if [[ "${DRY_RUN:-}" == "1" ]]; then
  echo "$CMD_BACKEND"
  echo "$CMD_UI"
  echo "$CMD_AGENT"
  exit 0
fi

npx concurrently "$CMD_BACKEND" "$CMD_UI" "$CMD_AGENT"


