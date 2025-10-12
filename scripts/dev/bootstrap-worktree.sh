#!/usr/bin/env bash
set -euo pipefail

# ScreenGraphVibe multi-worktree bootstrapper
# Performs idempotent setup so any new worktree "just works".

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

log() {
  printf "\033[1;96m[worktree]\033[0m %s\n" "$*"
}

read_ports() {
  # Defaults
  BACKEND_PORT=3000
  UI_PORT=3001
  AGENT_API_PORT=8000
  if [[ -f "$ROOT_DIR/.worktree-ports" ]]; then
    # shellcheck disable=SC1090
    source "$ROOT_DIR/.worktree-ports"
  fi
  export BACKEND_PORT UI_PORT AGENT_API_PORT
  log "Ports resolved → backend:${BACKEND_PORT} ui:${UI_PORT} agent:${AGENT_API_PORT}"
}

copy_env_if_missing() {
  local dir="$1"
  if [[ -f "$dir/.env" ]]; then
    return 0
  fi
  if [[ -f "$dir/.env.example" ]]; then
    log "Creating $dir/.env from .env.example"
    cp "$dir/.env.example" "$dir/.env"
  fi
}

setup_all_env_files() {
  log "Setting up .env files from templates"
  copy_env_if_missing "$ROOT_DIR"
  copy_env_if_missing "$ROOT_DIR/backend"
  copy_env_if_missing "$ROOT_DIR/ui"
  log "Environment files ready (edit with your credentials)"
}

install_deps() {
  log "Installing dependencies (root + workspaces)"
  npm install
}

ensure_agent_venv() {
  if [[ -d "screengraph-agent/venv" && -x "screengraph-agent/venv/bin/activate" ]]; then
    return 0
  fi
  log "Setting up agent venv (Python 3.13)"
  npm run agent:setup
}

run_migrations() {
  log "Running database migrations (if configured)"
  npm run db:migrate || log "Migrations skipped/failed (non-blocking)"
}

start_dev() {
  log "Starting dev processes with per-worktree ports"
  read_ports
  npx concurrently \
    "cd backend && npm run dev" \
    "cd ui && next dev -p ${UI_PORT}" \
    "cd screengraph-agent && source venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port ${AGENT_API_PORT}"
}

bootstrap_only() {
  install_deps
  setup_all_env_files
  ensure_agent_venv
  run_migrations
  log "Bootstrap complete"
}

case "${1:-bootstrap}" in
  bootstrap)
    bootstrap_only
    ;;
  start)
    start_dev
    ;;
  all)
    bootstrap_only
    start_dev
    ;;
  *)
    echo "Usage: $0 [bootstrap|start|all]" >&2
    exit 2
    ;;
esac


