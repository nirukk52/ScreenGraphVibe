#!/bin/sh
set -euo pipefail

# Required env: TASK_NAME, THREAD_ID
if [ -z "${TASK_NAME:-}" ] || [ -z "${THREAD_ID:-}" ]; then
  echo "TASK_NAME and THREAD_ID env vars are required" >&2
  exit 1
fi

TASK_DIR="sessions/${TASK_NAME}_${THREAD_ID}"
FULL_DIR="${TASK_DIR}/fullFilePaths"
PATHS_FILE="${TASK_DIR}/paths.txt"
mkdir -p "$FULL_DIR"

# Stage all changes for this task commit
git add -A

# Capture staged files list
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR || true)

# Copy staged files into sessions directory and record unique paths
if [ -n "$STAGED_FILES" ]; then
  # preserve paths under fullFilePaths
  # shellcheck disable=SC2086
  for f in $STAGED_FILES; do
    if [ -f "$f" ]; then
      mkdir -p "${FULL_DIR}/$(dirname "$f")"
      cp "$f" "${FULL_DIR}/$f"
    fi
    echo "$f" >> "$PATHS_FILE"
  done
  sort -u "$PATHS_FILE" -o "$PATHS_FILE"
fi

# Build commit message
SUBJECT="${SUBJECT:-chore: task commit}"
TMP_MSG=$(mktemp)

{
  printf "%s\n\n" "$SUBJECT"
  if [ -n "$STAGED_FILES" ]; then
    printf "Files\n"
    # shellcheck disable=SC2086
    for f in $STAGED_FILES; do printf "- %s\n" "$f"; done
    printf "\n"
  fi
  [ -n "${GRAPHITI_CENTER_NODE:-}" ] && printf "center_node_uuid: %s\n" "$GRAPHITI_CENTER_NODE"
  [ -n "${GRAPHITI_EPISODES:-}" ] && printf "episode_id: %s\n" "$GRAPHITI_EPISODES"
  [ -n "${GRAPHITI_THREAD_URL:-}" ] && printf "thread_url: %s\n" "$GRAPHITI_THREAD_URL"
  if [ -f .mcp/og_message.txt ]; then
    printf "\n# Prompt\n# - "
    head -n 2 .mcp/og_message.txt | tr '\n' ' ' | sed 's/[[:space:]]\+/ /g'
    printf "\n"
  fi
} > "$TMP_MSG"

# Cap to 5000 chars
head -c 5000 "$TMP_MSG" > "${TMP_MSG}.capped"
mv "${TMP_MSG}.capped" "$TMP_MSG"

git commit -F "$TMP_MSG"
rm -f "$TMP_MSG"

echo "Committed task changes for ${TASK_NAME}_${THREAD_ID}" >&2

