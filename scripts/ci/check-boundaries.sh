#!/usr/bin/env bash
set -euo pipefail

# CI script to enforce strict module boundaries
# Fails if backend imports from data internals

echo "🔍 Checking module boundaries..."

VIOLATIONS=0

# Check: backend must NOT import from data/src/** (only @screengraph/data public API)
if grep -r "from '@screengraph/data/src" backend/src 2>/dev/null; then
  echo "❌ VIOLATION: Backend imports from data/src/** (use @screengraph/data public API only)"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

if grep -r 'from ".*data/src' backend/src 2>/dev/null; then
  echo "❌ VIOLATION: Backend imports from data/src/** via relative path"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check: backend must NOT import db or schema symbols from data
if grep -rE "import \{[^}]*(db|appLaunchConfigs|schema)[^}]*\} from '@screengraph/data'" backend/src 2>/dev/null; then
  echo "❌ VIOLATION: Backend imports internal symbols (db, schema, tables) from @screengraph/data"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check: UI must NOT import from backend internals (only types from backend/types)
if grep -r "from '@screengraph/backend/src" ui/src 2>/dev/null; then
  echo "❌ VIOLATION: UI imports from backend/src/** (use @screengraph/backend/types only)"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

if [ $VIOLATIONS -gt 0 ]; then
  echo ""
  echo "❌ Found $VIOLATIONS module boundary violation(s)"
  echo "📖 See CLAUDE.md → Strict Module Boundaries Enforcement"
  exit 1
fi

echo "✅ Module boundaries clean (no violations found)"
exit 0

