# ADR 0312: Keep the bundled pi agent directory apart from the pi CLI

- Status: Accepted
- Date: 2026-09-30
- Decision: D637
- Amends: ADR 0254 (native session root), ADR 0037 / ADR 0024 and 7.0.1 of
  the agent runtime spec (global instruction, prompt, and system-prompt paths)

## Context

PI-Desktop bundles its own pinned pi SDK in the agent sidecar, but the SDK and
several Desktop modules resolved the global agent directory as `~/.pi/agent`,
the same directory a separately installed pi CLI owns. Native Pi sessions,
their `auth.json` / `models.json`, SDK settings and trust decisions, global
prompts, `AGENTS.md`, and `SYSTEM.md` were therefore shared with the CLI. A
user could not keep different logins or models in PI-Desktop without changing
the CLI's configuration, and an exported `PI_CODING_AGENT_DIR` for the CLI
leaked into the sidecar.

## Decision

1. PI-Desktop's global agent directory is `~/.explore/agent`, defined once in
   `packages/agent-runtime/src/agent-dir.ts` and mirrored for host-core config
   sync in `crates/host-core/src/config_sync/domains_capture.rs`.
2. The sidecar's first import pins `PI_CODING_AGENT_DIR` to that directory,
   overwriting any inherited value, before any pi module evaluates. The pi SDK
   resolves some paths at module load (its `bin/` tool cache), so setting it
   later is insufficient.
3. Native Pi sessions (ADR 0254) discover, continue, and fork sessions under
   `~/.explore/agent/sessions` with that directory's auth, models, settings,
   and trust store. Pi CLI sessions are no longer listed live.
4. The explicit one-shot importers keep reading `~/.pi` because copying from
   the pi CLI is their purpose. Nothing is migrated automatically; D007 stands.
5. Workspace-level `<workspace>/.pi/` folders are out of scope and unchanged.

## Consequences

- PI-Desktop and a pi CLI installation keep independent credentials, models,
  settings, prompts, and global instructions.
- Existing users' global `~/.pi/agent/AGENTS.md`, prompts, and
  `SYSTEM.md` / `APPEND_SYSTEM.md` stop applying until they are recreated under
  `~/.explore/agent`. Native CLI sessions stop appearing; the Pi session
  importer can still copy them into Desktop transcripts.
- Desktop sessions, SQLite, and Desktop provider secrets in `~/.pi-desktop`
  are unaffected.
- Processes the agent spawns inherit `PI_CODING_AGENT_DIR`, so a pi CLI run
  from an agent tool call uses `~/.explore/agent` rather than `~/.pi/agent`.
