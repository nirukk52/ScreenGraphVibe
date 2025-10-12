#!/usr/bin/env bash
set -euo pipefail

# Create a new git worktree with envs cloned and unique ports assigned
# Usage: scripts/dev/create-worktree.sh <slug> [--branch <branch>] [--offset <num>]

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

log() {
  printf "\033[1;95m[worktree:create]\033[0m %s\n" "$*"
}

die() {
  echo "Error: $*" >&2
  exit 1
}

if [[ ${1:-} == "" ]]; then
  die "slug is required. Example: design-setup | persona-dashboard | pr-ci"
fi

SLUG="$1"; shift || true
BRANCH=""
OFFSET=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
      BRANCH="$2"; shift 2 ;;
    --offset)
      OFFSET="$2"; shift 2 ;;
    *)
      die "Unknown arg: $1" ;;
  esac
done

if [[ -z "$BRANCH" ]]; then
  case "$SLUG" in
    *design*) BRANCH="chore/${SLUG}" ;;
    *persona*) BRANCH="feature/${SLUG}" ;;
    *pr-ci*|*prci*|*ci*) BRANCH="chore/${SLUG}" ;;
    *) BRANCH="feature/${SLUG}" ;;
  esac
fi

if [[ -z "$OFFSET" ]]; then
  case "$SLUG" in
    *design*) OFFSET=0 ;;
    *persona*) OFFSET=10 ;;
    *pr-ci*|*prci*|*ci*) OFFSET=20 ;;
    *) OFFSET=30 ;;
  esac
fi

TARGET_DIR="${ROOT_DIR}/../ScreenGraphVibe-${SLUG}"
BACKEND_PORT=$((3000 + OFFSET))
UI_PORT=$((3001 + OFFSET))
AGENT_API_PORT=$((8000 + OFFSET))

log "Creating worktree at: ${TARGET_DIR} (branch: ${BRANCH})"
git worktree add "${TARGET_DIR}" -b "${BRANCH}"

copy_env() {
  local src_dir="$1"; local dst_dir="$2"
  if [[ -f "${src_dir}/.env" ]]; then
    cp "${src_dir}/.env" "${dst_dir}/.env"
  elif [[ -f "${src_dir}/env.example" ]]; then
    cp "${src_dir}/env.example" "${dst_dir}/.env"
  fi
}

set_kv() {
  local file="$1"; local key="$2"; local value="$3"
  mkdir -p "$(dirname "$file")"
  touch "$file"
  if grep -qE "^${key}=" "$file"; then
    # macOS-compatible sed -i
    sed -i '' "s#^${key}=.*#${key}=${value//#/\\#}#" "$file"
  else
    printf "%s=%s\n" "$key" "$value" >> "$file"
  fi
}

# Copy direnv config if present so new worktree auto-loads envs
if [[ -f "${ROOT_DIR}/.envrc" ]]; then
  cp "${ROOT_DIR}/.envrc" "${TARGET_DIR}/.envrc"
fi

# Clone envs
copy_env "$ROOT_DIR" "$TARGET_DIR"
copy_env "$ROOT_DIR/backend" "$TARGET_DIR/backend"
copy_env "$ROOT_DIR/ui" "$TARGET_DIR/ui"

# Assign unique ports
set_kv "$TARGET_DIR/.env" "AGENT_PORT" "$BACKEND_PORT"
set_kv "$TARGET_DIR/.env" "AGENT_HOST" "0.0.0.0"
set_kv "$TARGET_DIR/backend/.env" "AGENT_PORT" "$BACKEND_PORT"
set_kv "$TARGET_DIR/backend/.env" "AGENT_HOST" "0.0.0.0"
set_kv "$TARGET_DIR/ui/.env" "NEXT_PUBLIC_AGENT_URL" "http://localhost:${BACKEND_PORT}"
set_kv "$TARGET_DIR/ui/.env" "NEXT_PUBLIC_APP_URL" "http://localhost:${UI_PORT}"

# Save a local descriptor for bootstrap
cat > "$TARGET_DIR/.worktree-ports" <<EOF
BACKEND_PORT=${BACKEND_PORT}
UI_PORT=${UI_PORT}
AGENT_API_PORT=${AGENT_API_PORT}
EOF

log "Worktree created. Ports => backend:${BACKEND_PORT} ui:${UI_PORT} agent:${AGENT_API_PORT}"
log "Next: cd ${TARGET_DIR} && npm run worktree:bootstrap && npm run worktree:start"

#!/usr/bin/env bash
set -euo pipefail

# Create a new git worktree with envs cloned and unique ports assigned
# Usage: scripts/dev/create-worktree.sh <slug> [--branch <branch>] [--offset <num>]

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

log() {
  printf "\033[1;95m[worktree:create]\033[0m %s\n" "$*"
}

die() {
  echo "Error: $*" >&2
  exit 1
}

if [[ ${1:-} == "" ]]; then
  die "slug is required. Example: design-setup | persona-dashboard | pr-ci"
fi

SLUG="$1"; shift || true
BRANCH=""
OFFSET=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
      BRANCH="$2"; shift 2 ;;
    --offset)
      OFFSET="$2"; shift 2 ;;
    *)
      die "Unknown arg: $1" ;;
  esac
done

if [[ -z "$BRANCH" ]]; then
  case "$SLUG" in
    *design*) BRANCH="chore/${SLUG}" ;;
    *persona*) BRANCH="feature/${SLUG}" ;;
    *pr-ci*|*prci*|*ci*) BRANCH="chore/${SLUG}" ;;
    *) BRANCH="feature/${SLUG}" ;;
  esac
fi

if [[ -z "$OFFSET" ]]; then
  case "$SLUG" in
    *design*) OFFSET=0 ;;
    *persona*) OFFSET=10 ;;
    *pr-ci*|*prci*|*ci*) OFFSET=20 ;;
    *) OFFSET=30 ;;
  esac
fi

TARGET_DIR="${ROOT_DIR}/../ScreenGraphVibe-${SLUG}"
BACKEND_PORT=$((3000 + OFFSET))
UI_PORT=$((3001 + OFFSET))
AGENT_API_PORT=$((8000 + OFFSET))

log "Creating worktree at: ${TARGET_DIR} (branch: ${BRANCH})"
git worktree add "${TARGET_DIR}" -b "${BRANCH}"

copy_env() {
  local src_dir="$1"; local dst_dir="$2"
  if [[ -f "${src_dir}/.env" ]]; then
    cp "${src_dir}/.env" "${dst_dir}/.env"
  elif [[ -f "${src_dir}/env.example" ]]; then
    cp "${src_dir}/env.example" "${dst_dir}/.env"
  fi
}

set_kv() {
  local file="$1"; local key="$2"; local value="$3"
  touch "$file"
  if grep -qE "^${key}=" "$file"; then
    # macOS-compatible sed -i
    sed -i '' "s#^${key}=.*#${key}=${value//#/\\#}#" "$file"
  else
    printf "%s=%s\n" "$key" "$value" >> "$file"
  fi
}

# Clone envs
copy_env "$ROOT_DIR" "$TARGET_DIR"
copy_env "$ROOT_DIR/backend" "$TARGET_DIR/backend"
copy_env "$ROOT_DIR/ui" "$TARGET_DIR/ui"

# Assign unique ports
set_kv "$TARGET_DIR/.env" "AGENT_PORT" "$BACKEND_PORT"
set_kv "$TARGET_DIR/backend/.env" "AGENT_PORT" "$BACKEND_PORT"
set_kv "$TARGET_DIR/backend/.env" "AGENT_HOST" "0.0.0.0"
set_kv "$TARGET_DIR/ui/.env" "NEXT_PUBLIC_AGENT_URL" "http://localhost:${BACKEND_PORT}"
set_kv "$TARGET_DIR/ui/.env" "NEXT_PUBLIC_APP_URL" "http://localhost:${UI_PORT}"

# Save a local descriptor for bootstrap
cat > "$TARGET_DIR/.worktree-ports" <<EOF
BACKEND_PORT=${BACKEND_PORT}
UI_PORT=${UI_PORT}
AGENT_API_PORT=${AGENT_API_PORT}
EOF

log "Worktree created. Ports => backend:${BACKEND_PORT} ui:${UI_PORT} agent:${AGENT_API_PORT}"
log "Next step: cd ${TARGET_DIR} && npm run worktree:bootstrap && npm run worktree:start"


