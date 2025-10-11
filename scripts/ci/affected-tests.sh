#!/usr/bin/env bash
set -euo pipefail

# Determine changed paths and run only affected workspace tests.

CHANGED_FILES=$(git diff --name-only origin/main...HEAD)

run_ui=false
run_backend=false
run_data=false
run_agent=false
run_tests=false

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  if [[ "$file" == ui/* ]]; then run_ui=true; fi
  if [[ "$file" == backend/* ]]; then run_backend=true; fi
  if [[ "$file" == data/* ]]; then run_data=true; fi
  if [[ "$file" == screengraph-agent/* ]]; then run_agent=true; fi
  if [[ "$file" == tests/* ]]; then run_tests=true; fi
  if [[ "$file" == management/persona-management/* ]]; then run_backend=true; run_ui=true; fi
done <<< "$CHANGED_FILES"

if $run_data; then npm run test:data; fi
if $run_backend; then npm run test:backend; fi
if $run_ui; then npm run test:ui; fi
if $run_agent; then npm run test:agent; fi

# Always run e2e if any of the above triggered, or if tests/ changed
if $run_data || $run_backend || $run_ui || $run_agent || $run_tests; then
  npm run test:e2e
fi

echo "Affected tests completed."


