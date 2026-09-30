# EXplore Agent

A local-first desktop workspace for AI agents, built on a fork of
[PI-Desktop](https://github.com/vastsa/PI-Desktop).

> **Current release line: 0.1.x (pre-release).** Rebrand status and remaining
> work: [`docs/rebrand-next-steps.md`](docs/rebrand-next-steps.md).

EXplore Agent keeps its agent configuration apart from a separately installed
pi CLI: global config lives in `~/.explore/agent` and per-project config in
`<workspace>/.explore/`. App data (sessions, logs, provider keys) lives in
`~/.explore/app`.

## Architecture

```text
Renderer (React) → Preload IPC → Electron Main → Rust host-core / Node agent sidecar → pi-ai / pi-agent-core
```

- **Renderer**: UI and interaction (`apps/desktop/src`)
- **Electron Main**: thin orchestrator (`apps/desktop/electron`)
- **Rust host-core**: persistence (SQLite), tools, and host state (`crates/host-core`)
- **Agent runtime**: bundled pi SDK sidecar (`packages/agent-runtime`)
- **Plugin SDK**: extension contract (`packages/plugin-sdk`)

See [`docs/spec/README.md`](docs/spec/README.md) for the specification set and
[`docs/plugin-development.md`](docs/plugin-development.md) for plugins.

## Development

Requirements: Node.js `>=22.19`, pnpm `>=10`, and a stable Rust toolchain.

```bash
pnpm install
cargo build -p host-core
pnpm build:js
pnpm dev
```

Validate:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

Agent working notes are in [`AGENTS.md`](AGENTS.md).

## License

EXplore Agent is a derivative of PI-Desktop and is distributed under the
GNU Lesser General Public License v3.0. See [`LICENSE`](LICENSE).
