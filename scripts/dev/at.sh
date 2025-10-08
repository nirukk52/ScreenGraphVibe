#!/bin/sh
set -euo pipefail

SESS_FILE=".git/.sg-session.env"

load_session() {
  if [ -f "$SESS_FILE" ]; then
    # shellcheck disable=SC1090
    . "$SESS_FILE"
  else
    echo "No active session. Run: git @ init <TASK_NAME> <THREAD_ID> [CENTER_NODE] [THREAD_URL]" >&2
    exit 1
  fi
}

cmd="${1:-}"; shift || true

case "${cmd}" in
  init)
    TASK_NAME="${1:-task}"; THREAD_ID="${2:-$(date +%Y%m%d-%H%M%S)}"
    CENTER_NODE="${3:-}"; THREAD_URL="${4:-}"
    mkdir -p .git
    printf "export TASK_NAME='%s'\n" "$TASK_NAME" > "$SESS_FILE"
    printf "export THREAD_ID='%s'\n" "$THREAD_ID" >> "$SESS_FILE"
    printf "export SESSION_KEY='%s'\n" "$TASK_NAME" >> "$SESS_FILE"
    [ -n "$CENTER_NODE" ] && printf "export GRAPHITI_CENTER_NODE='%s'\n" "$CENTER_NODE" >> "$SESS_FILE"
    [ -n "$THREAD_URL" ] && printf "export GRAPHITI_THREAD_URL='%s'\n" "$THREAD_URL" >> "$SESS_FILE"
    echo "Session set: ${TASK_NAME}" >&2
    ;;
  show)
    load_session
    echo "TASK_NAME=$TASK_NAME"
    echo "THREAD_ID=$THREAD_ID"
    echo "SESSION_KEY=${SESSION_KEY:-}"
    echo "GRAPHITI_CENTER_NODE=${GRAPHITI_CENTER_NODE:-}"
    echo "GRAPHITI_THREAD_URL=${GRAPHITI_THREAD_URL:-}"
    ;;
  commit)
    load_session
    SUBJECT="${1:-chore: task commit}"
    TASK_NAME="$TASK_NAME" THREAD_ID="$THREAD_ID" SESSION_KEY="${SESSION_KEY:-$TASK_NAME}" SUBJECT="$SUBJECT" \
    GRAPHITI_CENTER_NODE="${GRAPHITI_CENTER_NODE:-}" GRAPHITI_EPISODES="${GRAPHITI_EPISODES:-}" GRAPHITI_THREAD_URL="${GRAPHITI_THREAD_URL:-}" \
      npm run task:commit
    ;;
  push)
    load_session
    TASK_NAME="$TASK_NAME" THREAD_ID="$THREAD_ID" SESSION_KEY="${SESSION_KEY:-$TASK_NAME}" \
    GRAPHITI_CENTER_NODE="${GRAPHITI_CENTER_NODE:-}" GRAPHITI_EPISODES="${GRAPHITI_EPISODES:-}" GRAPHITI_THREAD_URL="${GRAPHITI_THREAD_URL:-}" \
      npm run task:push
    ;;
  *)
    cat >&2 <<HELP
Usage: git @ <command>
Commands:
  init <TASK_NAME> <THREAD_ID> [CENTER_NODE] [THREAD_URL]  Set current session
  show                                                     Show current session
  commit [SUBJECT]                                         Commit with session
  push                                                     Push with session
HELP
    exit 1
    ;;
esac

