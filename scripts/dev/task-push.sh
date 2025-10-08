#!/bin/sh
set -euo pipefail

# Required env: TASK_NAME, THREAD_ID
if [ -z "${TASK_NAME:-}" ] || [ -z "${THREAD_ID:-}" ]; then
  echo "TASK_NAME and THREAD_ID env vars are required" >&2
  exit 1
fi

UPSTREAM_REF="${UPSTREAM_REF:-origin/main}"
BASE=$(git merge-base "$UPSTREAM_REF" HEAD)
COUNT=$(git rev-list --count "$BASE"..HEAD)

SESSION_KEY="${SESSION_KEY:-${TASK_NAME}}"
TASK_DIR="sessions/${SESSION_KEY}"
PATHS_FILE="${TASK_DIR}/paths.txt"
if [ ! -f "$PATHS_FILE" ]; then
  echo "Missing ${PATHS_FILE}. Use task-commit.sh to record paths for this task." >&2
  exit 1
fi

if [ "$COUNT" -gt 1 ]; then
  TMP=$(mktemp)
  SUBJ=$(git log -1 --pretty=%s)
  COMMITS=$(git log --pretty='- %s' "$BASE"..HEAD || true)
  STAT=$(git diff --stat "$BASE"..HEAD || true)

  {
    printf "%s\n\n" "$SUBJ"
    if [ -n "$COMMITS" ]; then
      printf "## Commits in this task\n%s\n\n" "$COMMITS"
    fi
    if [ -n "$STAT" ]; then
      printf "## Diff Summary\n%s\n\n" "$STAT"
    fi
    [ -n "${GRAPHITI_CENTER_NODE:-}" ] && printf "center_node_uuid: %s\n" "$GRAPHITI_CENTER_NODE"
    [ -n "${GRAPHITI_EPISODES:-}" ] && printf "episode_id: %s\n" "$GRAPHITI_EPISODES"
    [ -n "${GRAPHITI_THREAD_URL:-}" ] && printf "thread_url: %s\n" "$GRAPHITI_THREAD_URL"
    if [ -f .mcp/og_message.txt ]; then
      printf "\n# Prompt\n# - "
      head -n 2 .mcp/og_message.txt | tr '\n' ' ' | sed 's/[[:space:]]\+/ /g'
      printf "\n"
    fi
  } > "$TMP"

  # Cap to 5000 chars
  head -c 5000 "$TMP" > "${TMP}.capped"
  mv "${TMP}.capped" "$TMP"

  # Prepare filtered paths (exclude auto-generated docs and sessions)
  TMP_PATHS=$(mktemp)
  grep -v '^docs/DOCUMENT_INDEX\.md$' "$PATHS_FILE" | grep -v '^sessions/' > "$TMP_PATHS" || true

  # Reset index to base, keep working tree, stage only filtered paths
  git reset --mixed "$BASE"
  while IFS= read -r p; do
    [ -n "$p" ] || continue
    if [ -e "$p" ]; then git add "$p"; fi
  done < "$TMP_PATHS"
  rm -f "$TMP_PATHS"

  git commit -F "$TMP"
  rm -f "$TMP"
fi

git push --force-with-lease origin HEAD:main
echo "Pushed one-task squashed commit for ${SESSION_KEY}" >&2


