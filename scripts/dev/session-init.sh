#!/bin/sh
set -euo pipefail

# Usage:
#   source scripts/dev/session-init.sh "TASK_NAME" "THREAD_ID" "CENTER_NODE(optional)" "THREAD_URL(optional)"
# Effect:
#   Prints export commands so when sourced, your shell gets TASK_NAME/THREAD_ID and optional KG vars.

TASK_NAME="${1:-task}"
THREAD_ID="${2:-$(date +%Y%m%d-%H%M%S)}"
GRAPHITI_CENTER_NODE="${3:-}"
GRAPHITI_THREAD_URL="${4:-}"

echo "export TASK_NAME='$TASK_NAME'"
echo "export THREAD_ID='$THREAD_ID'"
[ -n "$GRAPHITI_CENTER_NODE" ] && echo "export GRAPHITI_CENTER_NODE='$GRAPHITI_CENTER_NODE'"
[ -n "$GRAPHITI_THREAD_URL" ] && echo "export GRAPHITI_THREAD_URL='$GRAPHITI_THREAD_URL'"

