#!/bin/bash
echo "Testing pre-push hook behavior..."
echo ""
echo "Current temporary docs:"
ls -1 screengraph-agent/*.md 2>/dev/null | grep -v "CLAUDE.md\|README.md" || echo "  (none)"
echo ""
echo "This hook will:"
echo "  1. Index all docs to DOCUMENT_INDEX.md"
echo "  2. Delete temporary docs (keep CLAUDE.md, README.md)"
echo "  3. Create cleanup commit"
echo ""
read -p "Test the hook? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    .git/hooks/pre-push
fi
