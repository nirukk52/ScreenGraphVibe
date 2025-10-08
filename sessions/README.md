# :sessions

Simple folder for maintaining MCP knowledge graph search logs.

## Format

Each log entry follows this format (one line each):

```
S: Search
F: Fact (discovery/verified truth)
P: Procedure (actionable guidance)
```

## Example

```
S drizzle-int-tests | Drizzle ORM integration test database connection | src=web | conf=0.80
F drizzle-sql-object | TypeError getSQL ⇒ raw string used, not drizzle sql`` | src=docs | conf=0.92
P drizzle-tests-sql | Use drizzle sql`` in tests; avoid raw SQL strings | src=team-notes | conf=0.90

S drizzle-memory-db | In-memory sqlite setup for drizzle integration tests | src=examples | conf=0.78
F drizzle-seed-error | Missing seed data causes null user rows | src=stack | conf=0.85
P drizzle-seed-fix | Preload test DB with seed.sql before each run | src=local | conf=0.88
```

## Usage

- Filename should be the task name
- New file created for every task/session
- Files cleared on git commit
- For debugging/understanding purposes only

## File Structure

```
sessions/
├── task-name-YYYY-MM-DDTHH-mm-ss.md
├── another-task-YYYY-MM-DDTHH-mm-ss.md
└── README.md
```
