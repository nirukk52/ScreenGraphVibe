## Summary

- What changed and why?

## Changes

- [ ] Removed local `:mcp` proxy; rely on Cursor MCP Graphiti tools
- [ ] Updated docs and scripts to reference Cursor MCP only

## MCP Graphiti

- Group ID: `screengraph-vibe`
- Access path: Cursor → Tools → Graphiti (search_nodes, search_facts, add_episode)
- Note: Ensure Cursor MCP Graphiti is connected before running memory operations

## Testing

- Commands run:
  - `npm run test:all`
- Results:

## Screenshots / Evidence (optional)

## Checklist

- [ ] Follows 25 rules (type safety, validation, no mutation, exhaustive unions, etc.)
- [ ] No schema/types edited in UI; contracts unchanged
- [ ] Files < 150 lines; functions < 75 lines
- [ ] Docs updated where applicable
- [ ] No references to local `:mcp` remain

## Links

- CLAUDE guidelines: `CLAUDE.md`
- Docs index: `docs/DOCUMENT_INDEX.md`


