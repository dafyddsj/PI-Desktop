# Built-in skill pack

EXplore Agent ships the skills of
[`dafyddsj/explore-mode`](https://github.com/dafyddsj/explore-mode) as built-in
skills, next to the two documents in `apps/desktop/resources/skills`. The pack
is upstream content: each build bundles a snapshot of it, and the app can move to a
newer upstream version without an app release.

## Unit of content

The pack is a repository tree, not a set of loose skills. Skills link to each
other (`../principle-x/SKILL.md`) and to shared playbooks
(`../../playbooks/x.md`), so a copy keeps every file at its repository path.
A copy holds only:

- `skills/<id>/**/*.md`, where `<id>` matches `[a-z0-9][a-z0-9-]{0,63}`
- `playbooks/**/*.md`
- `.claude-plugin/plugin.json`

Workspace templates, tooling, and dotfiles stay out. Caps: 256 files, 128 KiB
per file (a document can enter a prompt), 4 MiB per copy. A symlink or
submodule at a pack path refuses the whole tree. The rules live in
`apps/desktop/electron/main/skill-pack/pack-spec.ts` and are shared by the
vendoring script and the updater.

Every copy is `pack.json` (repo, channel, ref, commit, committer date, release
version, and each file's path, size, and git blob id) beside a `files/` tree.

## Copies and which one is used

- **Bundled**: `apps/desktop/resources/skill-packs/explore-mode`, committed to
  this repository and packaged to `<resources>/skill-packs`. Refresh it with
  `pnpm skill-pack:vendor` (head of `main`) or
  `pnpm skill-pack:vendor --ref <tag>` (a release). The script fetches with the
  local git credentials, so it works while the upstream repository is private.
  Release builds should vendor a release tag.
- **Downloaded**: `<app data>/skill-packs/explore-mode/versions/<sha>`
  (`~/.explore/app` or `~/.explore/app-dev`, so development and release builds
  never share one), with `active.json` naming the installed commit and the
  bundled commit it was installed against.

A download is used while it is at least as new (committer date) as the bundled
copy, or while the bundle is the one it was installed against. An app update
that ships a newer bundle therefore moves the user forward without a download,
and an explicit older choice (leaving beta for a release) stays until the
bundle changes. Downloads are written to a staging directory and renamed into
place; the active and previous downloads are kept, older ones pruned. "Use
bundled version" deletes the pointer and every download.

## Channels and updates

- Development builds follow `main` (the beta channel), always.
- Release builds follow the latest GitHub release (`releases/latest`, which
  skips drafts and prereleases). The `skillPackBeta` setting opts a release
  build into `main`.

The main process checks 20 seconds after the first window opens and then every
24 hours. Updates are offered, never applied unattended: a check that finds a
newer version for the current channel (or the channel's version after a channel
switch) pushes `skillPackUpdateNotice` once per commit, recorded in
`skillPackLastNotifiedSha`, and the renderer shows a toast. The user installs
from Settings › Skills.

A check costs two unauthenticated GitHub API calls (release, then its commit;
one for `main`). An install lists the commit's tree from the GitHub API and
fetches each pack file from jsDelivr at that exact commit; every file must
match its git blob id or nothing is installed. All requests go through the
main-process public-network client with the third-party (public-only) policy.

Check failures are reported as `no-release` (the stable channel has nothing
published), `unreachable` (GitHub or the CDN refused or could not be reached,
which is also how a private repository answers), or `invalid` (files failed
verification). None of them affects the copy in use.

## Catalog and the `Skill` tool

Pack skills join the built-in catalog as `explore/<skill dir>` on every session
launch, read from the active copy's manifest (never a directory listing).
The `Skill` tool serves `explore/<skill>` and also any other pack Markdown file
as `explore/<path from the pack root>`, so the model follows the pack's
relative links without an outside-workspace file grant. A leading `../` run in
such an id is dropped; anything that is not a pack path is refused. Each pack
document carries a guidance line saying how to map its links to ids.

A changed catalog changes the skill catalog digest, so the next prompt starts a
fresh runtime; bodies are read at call time.

## Settings and IPC

Settings › Skills shows a Built-in group: the version in use and where it came
from, the channel, an install button when an update is offered, "Use bundled
version" after a download, the beta switch (fixed on in development builds),
and the pack's skills. Channels are listed in
[01-ipc-protocol.md](01-ipc-protocol.md).
