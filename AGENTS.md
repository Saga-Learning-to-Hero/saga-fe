<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SAGA business specification maintenance

`docs/SAGA_BUSINESS_REQUIREMENTS_AND_COVERAGE.md` is the canonical product business specification kept in the frontend repository for reporting and cross-repository audits.

Whenever a change adds, changes, or removes business behavior, public API/DTO fields, roles or permissions, domain states/enums, canonical data ownership, contribution rules, graph nodes/edges, report metrics, or user-facing workflows, update that document in the same changeset.

The target business scope must remain complete even when implementation is missing. Update implementation coverage separately and do not mark a requirement `DONE` from endpoint existence alone; verify the full Backend-to-Frontend-to-UI path and tests.
