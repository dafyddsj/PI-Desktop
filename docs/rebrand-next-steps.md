# EXplore Agent: Rebrand Next Steps

Status: planning. Last updated 2026-09-30.

EXplore Agent is a new product built from a fork of PI-Desktop. The first pass
(branch `feat/explore-agent-dir`) separated the agent configuration from the
pi CLI, trimmed the inherited documentation and process, and pointed the
updater, in-app feedback, and remote-host downloads at this fork. The app
itself still ships under the PI-Desktop identity. This document lists what
remains and the decisions each step needs.

There are no existing users, so no step needs a migration, a compatibility
shim, or support for the old names.

## Naming

- The product name is **EXplore Agent**: capital E and capital X. Use it in UI
  copy, window titles, installers, menus, and docs.
- Machine identifiers stay lowercase. The config folders are already
  `~/.explore/agent` and `<workspace>/.explore/`; new identifiers should follow
  the same pattern (for example `explore-agent`).

## Already done

- The global pi config lives in `~/.explore/agent` and project config in
  `<workspace>/.explore/`. The bundled pi SDK's `CONFIG_DIR_NAME` is patched to
  `.explore` (`patches/@earendil-works__pi-coding-agent@0.87.1.patch`).
- The pi CLI session importer is removed.
- AGENTS.md, CLAUDE.md, and README are rewritten; upstream docs, site,
  translations, ADRs, and process workflows are removed.
- The updater feed, the Settings → Feedback link, and remote pi-host downloads
  use `dafyddsj/PI-Desktop` (`packages/shared/src/github-feedback.ts`,
  `apps/desktop/electron/main/updater.ts`, `apps/desktop/package.json`).

## Decisions needed first

| Decision | Options / notes |
|---|---|
| Final repository | Rename `dafyddsj/PI-Desktop` or create a new repo. The updater, Feedback, and remote-host downloads all derive from `GITHUB_REPO` plus `build.publish`. |
| App ID | Replace `net.aiuo.pi-desktop` with a reverse-DNS ID you control (for example `com.<your-domain>.explore-agent`). It sets the macOS bundle ID and the Windows AppUserModelID. |
| Desktop data folder | Currently `~/.pi-desktop` (and `~/.pi-desktop-dev`). Options: `~/.explore-agent`, or fold into `~/.explore/` (for example `~/.explore/app`) next to `~/.explore/agent`. |
| Package scope | `@pi-desktop/*` is used in 575 files. Renaming to `@explore-agent/*` is mechanical but large; it can wait if it isn't user-visible. |
| Plugin ecosystem | Keep pi-compatible plugins (`.piplug`, `pi-plugin` CLI, `pi.*` plugin IDs) or fork the format. Keeping it preserves compatibility with existing pi plugins. |
| Plugin marketplace | Run your own catalog, point at upstream's, or disable the marketplace until one exists. |
| Version line | Continue from `0.15.x` or restart (for example `0.1.0`). A restart also means resetting the in-app changelog. |
| Signing | An Apple Developer ID team and a Windows code-signing certificate for release builds. |

## Work items

### 1. App identity and packaging

- `apps/desktop/package.json`: `productName`, `appId`, `desktopName`,
  `executableName`, every `artifactName`, `description`, `homepage`, and
  `author` (still upstream's).
- `packages/shared/src/protocol.ts`: `APP_ID` mirrors the electron-builder
  `appId`; `apps/desktop/test/development-branding.test.mjs` pins the
  development variant (`net.aiuo.pi-desktop.dev`).
- Electron's `userData` folder is named after `productName`, so renaming the
  product also moves it.
- Root `package.json`: `name` (`pi-desktop`) and `description`.
- `apps/desktop/electron/main/data-paths.ts`: `INSTALLATION_DATA_DIR_NAME`
  and `DEVELOPMENT_DATA_DIR_NAME`, plus the `PI-Desktop Dev` userData name.
  Keep `crates/host-core/src/main.rs`, `crates/host-core/src/tools/ignore_rules.rs`,
  and `apps/pi-host/src/config.ts` in step (they also default to
  `.pi-desktop`).
- Host binary name `pi-desktop-host-core` (`crates/host-core/Cargo.toml`, the
  electron-builder `extraResources`, and the host resolvers).

### 2. User-visible strings

- `PI-Desktop` appears about 20 times in each locale catalog under
  `packages/i18n/src/locales/` (en, de, es, fr, ko, pt-BR, tr, zh-CN, zh-TW),
  and in about 90 non-test source files (window titles, menus, notifications,
  tray, dialogs, the feedback environment string).
- Decide whether to keep all nine UI locales. Every string change must be made
  in each one that ships.
- `packages/shared/src/changelog*.ts`: PI-Desktop release notes in every
  shipped locale. Replace with an EXplore Agent history.

### 3. Visual assets

- `apps/desktop/build/`: `icon.png`, `icon_1024.png`, `icon.icns`, `icon.ico`,
  `logo_dark.png`, `tray-icon-mac.png`, and the DMG background
  (`dmg-background*.png`, from `scripts/make-dmg-background.py`).
- `scripts/make-icon.py` regenerates the icon set from one canonical PNG.
- Renderer brand assets: `apps/desktop/src/assets/brand/logo-{dark,light}.png`
  and the home mascot (`apps/desktop/src/assets/home-mascot-*`), used by
  `BrandLogo.tsx` and `HomeMascotLogo.tsx`.

### 4. Services that still point upstream

- **Plugin marketplace** (`crates/host-core/src/plugins/marketplace.rs`,
  `marketplace/catalog.rs`, `resolve.rs`, `validation.rs`): the default
  catalog is `plugins.aiuo.net`, with mirrors on `AIUO-Net/pi-desktop-plugins`
  and `cnb.cool`. `packages/shared/src/types/settings.ts` has a `mirror`
  provider option for CNB.
- **Built-in plugins** (`apps/desktop/resources/plugins/pi.file-manager`,
  `pi.browser`): third-party upstream plugins published to the upstream plugin
  center; review their licenses and IDs.
- **Release pipeline** (`.github/workflows/release.yml`,
  `scripts/release-macos.sh` and the macOS signing scripts): hard-wired to
  upstream's Apple team `DUV63RKYTW` ("XingYu Liu"). Tag releases fail until
  that is replaced with your team and secrets. Tests pin it in
  `apps/desktop/test/ci-workflow.test.mjs`,
  `macos-release-lane.test.mjs`, and `macos-release-verification.test.mjs`.
  `apps/desktop/build/entitlements.mac.plist` mentions the same team.
- `docs/spec/06-delivery/06-release-runbook.md` describes the upstream release
  process and should be rewritten with the pipeline.

### 5. Internal identifiers (optional, low user impact)

- IPC channel prefix `pi-desktop/` (about 295 channels in
  `packages/shared/src/protocol.ts`).
- Environment variables prefixed `PI_DESKTOP_` (about 40 names, for example
  `PI_DESKTOP_DATA_DIR`, `PI_DESKTOP_HOST_BIN`, `PI_DESKTOP_DEV`).
- The `@pi-desktop/*` package scope.
- Test fixtures and E2E scripts that use upstream URLs as sample data (for
  example `markdown-link-destinations.test.mjs`); harmless, change at will.

### 6. Legal

- The repository is LGPL-3.0 (`LICENSE`). Keep the license and the PI-Desktop
  attribution in `README.md`; any distributed build must continue to meet the
  LGPL's source-availability terms.
- Check the licenses of the bundled plugins and resources
  (`apps/desktop/resources/`) before redistributing under the new name.

## Suggested order

1. Make the decisions above (repo, app ID, data folder, version line).
2. App identity, data folder, and user-visible strings in one pass (sections
   1 and 2), then the icons (section 3).
3. Marketplace and release pipeline (section 4) once the repo and signing
   accounts exist.
4. Internal identifiers (section 5) when convenient.

## Keep in mind

- When bumping the pinned pi packages, carry the `CONFIG_DIR_NAME` patch
  forward; `packages/agent-runtime/src/agent-dir.test.ts` fails if it is lost.
- Run `cargo fmt --check`, `cargo test -p host-core`, `cargo clippy`, the JS
  tests, and the relevant `pnpm test:e2e:*` suites after each pass (see
  AGENTS.md).
