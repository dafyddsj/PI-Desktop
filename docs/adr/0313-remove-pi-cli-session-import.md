# ADR 0313: Remove the pi CLI session importer

- Status: Accepted
- Date: 2026-09-30
- Decision: D638
- Related: ADR 0312 / D637 (separate pi config directories), ADR 0254

## Context

Settings → Import → Sessions scanned `~/.pi/agent/sessions` and flattened pi
CLI sessions into Desktop transcripts, alongside the Claude Code, OpenCode,
and Codex importers. D637 made PI-Desktop's pi configuration independent of a
separately installed pi CLI; keeping a pi CLI session importer contradicts that
separation, and the product no longer wants to pull pi CLI history in.

## Decision

1. Remove the pi session importer (`apps/desktop/electron/main/importers/pi.ts`)
   and the `pi` value from the session import source contract
   (`ExternalSource`, the `session/importRun` source allowlist, and the
   renderer's `ImportSource`). A `pi` candidate is rejected as an unknown
   import source.
2. Session import offers Claude Code, OpenCode, and Codex.
3. The Pi model-config importer (ADR 0179) is unchanged and still reads
   `~/.pi/agent/models.json` when the user explicitly scans for it.

## Consequences

- Sessions already imported from pi remain ordinary Desktop sessions; their
  stored `import-pi-*` ids and `sessions.source = 'pi'` values are kept and
  read unchanged. No migration is needed.
- Host-core still recognizes the `import-pi-` id prefix when attributing a
  source, so any re-materialized legacy session keeps its origin.
- The `settings.importSourcePi` catalog entry stays because the model-config
  importer still uses it.
