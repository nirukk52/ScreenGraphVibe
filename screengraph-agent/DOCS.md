# Documentation Policy

## 📚 Essential Documentation Only

To keep the repository clean, we maintain only **essential documentation** in the codebase:

### ✅ Kept in Repository

1. **CLAUDE.md** - AI assistant context (25 rules, architecture, patterns)
2. **README.md** - User-facing project documentation
3. **DOCUMENT_INDEX.md** - Auto-generated index with references

### 🗑️ Auto-Cleaned on Push

All other documentation files are **automatically indexed and deleted** before push:

- ARCHITECTURE.md
- ADAPTERS.md
- AGENT.md
- BFF.md
- MIGRATION.md
- STRUCTURE.md
- TEST_ORGANIZATION.md
- SCAFFOLD_COMPLETE.md
- IMPORT_HEALTH.md
- IMPORT_VERIFICATION.md
- session-summary.md

**Why?** These are helpful during development but create noise in version control.

### 📖 How It Works

1. **During Development**: Create any docs you need for context
2. **Before Push**: Pre-push hook automatically:
   - Indexes important content → `DOCUMENT_INDEX.md`
   - Deletes temporary docs
   - Commits cleanup
   - Pushes clean codebase

### 🔍 Finding Deleted Content

All indexed content is searchable in:

- `docs/DOCUMENT_INDEX.md` - Full text index
- **Graphiti Memory** - Semantic search of all documentation
- **Git History** - Previous commits retain full docs

### 🛠️ For AI Assistants

When scaffolding or documenting:

1. Create detailed docs as needed (ARCHITECTURE.md, etc.)
2. Don't worry about cleanup - git hooks handle it
3. Important content is preserved in DOCUMENT_INDEX.md
4. CLAUDE.md and README.md are permanent

### 📝 Updating Documentation

```bash
# Create temporary docs during development
echo "..." > ARCHITECTURE.md

# Push (auto-cleanup happens)
git push

# Check indexed content
cat docs/DOCUMENT_INDEX.md
```

---

**Policy**: Keep repository minimal, preserve knowledge in index and memory.
