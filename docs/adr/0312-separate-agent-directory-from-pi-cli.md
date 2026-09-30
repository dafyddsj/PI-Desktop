# ADR 0312: Keep PI-Desktop's pi config directories apart from the pi CLI

- Status: Accepted
- Date: 2026-09-30
- Decision: D637
- Amends: ADR 0254 (native session root), ADR 0037 / ADR 0024 and 7.0.1 of
  the agent runtime spec (global instruction, prompt, and system-prompt
  paths), ADR 0053 / D189 / D198 (plan and goal artifact directory)

## Context

PI-Desktop bundles its own pinned pi SDK in the agent sidecar, but the SDK and
several Desktop modules used pi's `.pi` directory name, the same one a
separately installed pi CLI owns:

- globally, `~/.pi/agent`: native Pi sessions, their `auth.json` /
  `models.json`, SDK settings and trust decisions, global prompts,
  `AGENTS.md`, and `SYSTEM.md`;
- per project, `<workspace>/.pi/`: prompt templates, `SYSTEM.md` /
  `APPEND_SYSTEM.md`, extensions, SDK project settings/skills/themes, and the
  host-written plan and goal artifacts.

A user could not keep different logins, models, or project configuration in
PI-Desktop without changing the CLI's, and an exported `PI_CODING_AGENT_DIR`
for the CLI leaked into the sidecar.

## Decision

1. PI-Desktop's pi config directory name is `.explore`: `~/.explore/agent`
   globally and `<workspace>/.explore/` per project. It is defined once in
   `packages/agent-runtime/src/agent-dir.ts` and mirrored in host-core config
   sync and plan artifacts.
2. The bundled SDK's `CONFIG_DIR_NAME` is patched to `.explore` in
   `patches/@earendil-works__pi-coding-agent@0.87.1.patch`, so every SDK
   path (resource loader, settings, skills, prompts, extensions, trust) agrees.
   It is fixed rather than read from `piConfig` because the bundled sidecar
   resolves a different `package.json` than development does.
3. The sidecar's first import pins `PI_CODING_AGENT_DIR` to
   `~/.explore/agent`, overwriting any inherited value, before any pi module
   evaluates. The SDK resolves some paths at module load (its `bin/` tool
   cache), so setting it later is insufficient.
4. Native Pi sessions (ADR 0254) discover, continue, and fork sessions under
   `~/.explore/agent/sessions` with that directory's auth, models, settings,
   and trust store. Pi CLI sessions are no longer listed live.
5. Host-core writes new plan and goal artifacts under
   `<workspace>/.explore/<kind>/`. Stored `.pi/<kind>/<name>.md` paths from
   before this decision keep resolving and verifying there; no other root is
   accepted.
6. The explicit one-shot importers keep reading `~/.pi` because copying from
   the pi CLI is their purpose. Nothing is migrated automatically; D007 stands.

## Consequences

- PI-Desktop and a pi CLI installation keep independent credentials, models,
  settings, prompts, instructions, extensions, and project configuration.
- Existing users' global `~/.pi/agent/AGENTS.md`, prompts, and
  `SYSTEM.md` / `APPEND_SYSTEM.md`, and projects' `.pi/prompts`,
  `.pi/SYSTEM.md` / `.pi/APPEND_SYSTEM.md`, and `.pi/extensions` stop applying
  until they are recreated under `.explore`. Native CLI sessions stop
  appearing.
- Pending and historical plan/goal proposals keep working; only new artifacts
  move to `.explore/`. No schema or data migration is required.
- Desktop sessions, SQLite, and Desktop provider secrets in `~/.pi-desktop`
  are unaffected.
- Processes the agent spawns inherit `PI_CODING_AGENT_DIR`, so a pi CLI run
  from an agent tool call uses `~/.explore/agent` rather than `~/.pi/agent`.
- The patched `CONFIG_DIR_NAME` must be carried forward whenever the pinned
  `@earendil-works/pi-coding-agent` version changes.
