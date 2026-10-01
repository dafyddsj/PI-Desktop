import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  gitBlobSha,
  isSkillPackPath,
  parseSkillPackManifest,
  selectSkillPackFiles,
} from "../electron/main/skill-pack/pack-spec.ts";
import {
  SkillPackInvalidError,
  SkillPackNoReleaseError,
  downloadSkillPack,
  resolveSkillPackTarget,
} from "../electron/main/skill-pack/pack-source.ts";
import { createSkillPackStore } from "../electron/main/skill-pack/pack-store.ts";
import { loadSkillPackDocument, skillPackCatalog } from "../electron/main/skill-pack/pack-catalog.ts";
import { createSkillPackService, isSkillPackUpgrade } from "../electron/main/skill-pack/service.ts";

const API = "https://api.github.com/repos/dafyddsj/explore-mode";
const CDN = "https://cdn.jsdelivr.net/gh/dafyddsj/explore-mode";
const SHA_A = "a".repeat(40);
const SHA_B = "b".repeat(40);
const SHA_C = "c".repeat(40);

const encoder = new TextEncoder();
const FILES = {
  "skills/challenge/SKILL.md":
    '---\nname: challenge\ndescription: "Stress-test a position."\n---\n\n# Challenge\n\nSee [Critical thinking](../../playbooks/critical-thinking.md).\n',
  "skills/principle-human-judgement/SKILL.md": "---\nname: principle-human-judgement\n---\n\nThe learner decides.\n",
  "playbooks/critical-thinking.md": "# Critical thinking\n",
  ".claude-plugin/plugin.json": '{"name":"explore-mode"}\n',
};

function treeFor(files) {
  return Object.entries(files).map(([path, text]) => ({
    path,
    mode: "100644",
    type: "blob",
    sha: gitBlobSha(encoder.encode(text)),
    size: encoder.encode(text).byteLength,
  }));
}

function manifestFor(sha, { channel = "stable", committedAt = "2026-09-01T00:00:00Z", files = FILES } = {}) {
  return {
    schemaVersion: 1,
    repo: "dafyddsj/explore-mode",
    channel,
    ref: channel === "stable" ? "v0.1.0" : "main",
    sha,
    committedAt,
    ...(channel === "stable" ? { version: "0.1.0" } : {}),
    files: selectSkillPackFiles(treeFor(files)),
  };
}

function writeCopy(dir, manifest, files = FILES) {
  for (const [path, text] of Object.entries(files)) {
    const target = join(dir, "files", ...path.split("/"));
    mkdirSync(join(target, ".."), { recursive: true });
    writeFileSync(target, text);
  }
  writeFileSync(join(dir, "pack.json"), JSON.stringify(manifest));
}

function contentsFor(files = FILES) {
  return new Map(Object.entries(files).map(([path, text]) => [path, encoder.encode(text)]));
}

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "skill-pack-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const bundled = join(root, "bundled");
  const user = join(root, "user");
  return { root, bundled, user };
}

/** A GitHub + jsDelivr double: `commits` maps refs to [sha, date]. */
function fakeSource({ release, commits, files = FILES, tamper } = {}) {
  const calls = [];
  const request = async (url, kind, origin) => {
    calls.push(url);
    assert.equal(origin, "third-party");
    if (url === `${API}/releases/latest`) {
      if (!release) throw new Error("responded 404");
      return { tag_name: release };
    }
    const commit = /\/commits\/(.+)$/.exec(url);
    if (commit) {
      const hit = commits[decodeURIComponent(commit[1])];
      if (!hit) throw new Error("responded 404");
      return { sha: hit[0], commit: { committer: { date: hit[1] } } };
    }
    if (url.startsWith(`${API}/git/trees/`)) {
      return {
        tree: [...treeFor(files), { path: "skills", mode: "040000", type: "tree", sha: SHA_C }],
        truncated: false,
      };
    }
    if (url.startsWith(`${CDN}@`)) {
      assert.equal(kind, "text");
      const path = url.slice(url.indexOf("/", `${CDN}@`.length) + 1);
      const text = files[path];
      if (text === undefined) throw new Error("responded 404");
      return tamper?.(path, text) ?? text;
    }
    throw new Error(`unexpected request ${url}`);
  };
  return { request, calls };
}

test("pack paths are skills Markdown, playbooks, and the plugin manifest only", () => {
  for (const path of [
    "skills/challenge/SKILL.md",
    "skills/challenge/notes/extra.md",
    "playbooks/five-whys.md",
    ".claude-plugin/plugin.json",
  ]) {
    assert.ok(isSkillPackPath(path), path);
  }
  for (const path of [
    ".explore-workspace/workflows/search.md",
    "README.md",
    "skills/challenge/run.sh",
    "skills/Bad_Name/SKILL.md",
    "skills/../SKILL.md",
    "playbooks/.hidden.md",
    "skills/challenge/../../x.md",
  ]) {
    assert.ok(!isSkillPackPath(path), path);
  }
});

test("a symlink at a pack path refuses the whole tree", () => {
  assert.throws(
    () =>
      selectSkillPackFiles([
        ...treeFor(FILES),
        { path: "playbooks/link.md", mode: "120000", type: "blob", sha: SHA_C, size: 10 },
      ]),
    /not a regular file/,
  );
  assert.throws(() => selectSkillPackFiles(treeFor({ "playbooks/x.md": "x" })), /no skills/);
});

test("manifest parsing rejects malformed or escaping entries", () => {
  const manifest = manifestFor(SHA_A);
  assert.deepEqual(parseSkillPackManifest(JSON.parse(JSON.stringify(manifest))), manifest);
  assert.equal(parseSkillPackManifest({ ...manifest, sha: "main" }), null);
  assert.equal(
    parseSkillPackManifest({ ...manifest, files: [{ path: "../x.md", size: 1, blob: SHA_A }] }),
    null,
  );
});

test("the stable channel resolves the latest release, and reports none when absent", async () => {
  const { request } = fakeSource({
    release: "v0.2.0",
    commits: { "v0.2.0": [SHA_B, "2026-09-20T00:00:00Z"], main: [SHA_C, "2026-09-25T00:00:00Z"] },
  });
  assert.deepEqual(await resolveSkillPackTarget(request, "stable"), {
    channel: "stable",
    ref: "v0.2.0",
    version: "0.2.0",
    sha: SHA_B,
    committedAt: "2026-09-20T00:00:00Z",
  });
  assert.equal((await resolveSkillPackTarget(request, "beta")).sha, SHA_C);
  const empty = fakeSource({ commits: {} });
  await assert.rejects(resolveSkillPackTarget(empty.request, "stable"), SkillPackNoReleaseError);
});

test("downloads verify every file against its git blob id", async () => {
  const target = { channel: "beta", ref: "main", sha: SHA_B, committedAt: "2026-09-20T00:00:00Z" };
  const { request, calls } = fakeSource({ commits: {} });
  const { manifest, contents } = await downloadSkillPack(request, target);
  assert.equal(manifest.sha, SHA_B);
  assert.deepEqual([...contents.keys()].sort(), Object.keys(FILES).sort());
  assert.ok(calls.every((url) => !url.includes(".explore-workspace")));

  const tampered = fakeSource({
    commits: {},
    tamper: (path, text) => (path === "playbooks/critical-thinking.md" ? `${text}injected\n` : text),
  });
  await assert.rejects(downloadSkillPack(tampered.request, target), SkillPackInvalidError);
});

test("a byte-order mark dropped by the text decoder still verifies", async () => {
  const withBom = { ...FILES, "playbooks/critical-thinking.md": "﻿# Critical thinking\n" };
  const { request } = fakeSource({
    commits: {},
    files: withBom,
    tamper: (_path, text) => text.replace(/^﻿/, ""),
  });
  const target = { channel: "beta", ref: "main", sha: SHA_B, committedAt: "2026-09-20T00:00:00Z" };
  const { contents } = await downloadSkillPack(request, target);
  assert.equal(contents.get("playbooks/critical-thinking.md")[0], 0xef);
});

test("the store prefers a download only while it is not older than the bundle", (t) => {
  const { bundled, user } = fixture(t);
  writeCopy(bundled, manifestFor(SHA_A, { committedAt: "2026-09-01T00:00:00Z" }));
  const store = createSkillPackStore({ bundledDir: () => bundled, userDir: () => user });
  assert.equal(store.active().origin, "bundled");

  store.install(manifestFor(SHA_B, { committedAt: "2026-09-10T00:00:00Z" }), contentsFor());
  assert.equal(store.active().origin, "downloaded");
  assert.equal(store.active().manifest.sha, SHA_B);

  // An app update ships a newer bundle: it wins without a download.
  writeCopy(bundled, manifestFor(SHA_C, { committedAt: "2026-09-15T00:00:00Z" }));
  assert.equal(store.active().manifest.sha, SHA_C);

  // An older download chosen against this bundle (a channel switch) stays.
  store.install(manifestFor(SHA_A, { committedAt: "2026-09-01T00:00:00Z" }), contentsFor());
  assert.equal(store.active().manifest.sha, SHA_A);
  assert.equal(store.active().origin, "downloaded");

  store.revertToBundled();
  assert.equal(store.active().manifest.sha, SHA_C);
  assert.deepEqual(readdirSync(join(user, "versions")), []);
});

test("install keeps the active and previous downloads and nothing half-written", (t) => {
  const { bundled, user } = fixture(t);
  const store = createSkillPackStore({ bundledDir: () => bundled, userDir: () => user });
  store.install(manifestFor(SHA_A), contentsFor());
  store.install(manifestFor(SHA_B), contentsFor());
  store.install(manifestFor(SHA_C), contentsFor());
  assert.deepEqual(readdirSync(join(user, "versions")).sort(), [SHA_B, SHA_C]);

  const missing = contentsFor();
  missing.delete("playbooks/critical-thinking.md");
  assert.throws(() => store.install(manifestFor(SHA_A), missing), /missing downloaded file/);
  assert.deepEqual(readdirSync(join(user, "versions")).sort(), [SHA_B, SHA_C]);
  assert.equal(store.active().manifest.sha, SHA_C);
});

test("an unconfigured store serves the bundle and refuses installs", (t) => {
  const { bundled } = fixture(t);
  writeCopy(bundled, manifestFor(SHA_A));
  const store = createSkillPackStore({ bundledDir: () => bundled, userDir: () => null });
  assert.equal(store.active().manifest.sha, SHA_A);
  assert.throws(() => store.install(manifestFor(SHA_B), contentsFor()), /not configured/);
});

test("the catalog lists pack skills and the Skill tool serves linked documents", (t) => {
  const { bundled } = fixture(t);
  writeCopy(bundled, manifestFor(SHA_A));
  // A stray file beside the copy is not in the manifest and must stay invisible.
  mkdirSync(join(bundled, "files", "skills", "stray"), { recursive: true });
  writeFileSync(join(bundled, "files", "skills", "stray", "SKILL.md"), "---\nname: stray\n---\nx\n");
  const copy = createSkillPackStore({ bundledDir: () => bundled, userDir: () => null }).active();

  assert.deepEqual(skillPackCatalog(copy), [
    { id: "explore/challenge", name: "challenge", description: "Stress-test a position." },
    { id: "explore/principle-human-judgement", name: "principle-human-judgement" },
  ]);
  const skill = loadSkillPackDocument(copy, "explore/challenge");
  assert.match(skill.body, /^# Challenge/);
  assert.match(skill.guidance, /explore\/playbooks\/critical-thinking\.md/);
  assert.equal(
    loadSkillPackDocument(copy, "explore/../../playbooks/critical-thinking.md").id,
    "explore/playbooks/critical-thinking.md",
  );
  assert.equal(loadSkillPackDocument(copy, "pi-desktop/imagegen"), null);
  assert.throws(() => loadSkillPackDocument(copy, "explore/stray"), /no such skill/);
  assert.throws(() => loadSkillPackDocument(copy, "explore/../../../etc/passwd"), /no such document/);
});

test("a newer version is offered; a channel switch offers the channel's version", () => {
  const active = { manifest: manifestFor(SHA_A, { channel: "beta", committedAt: "2026-09-10T00:00:00Z" }) };
  const older = { channel: "beta", ref: "main", sha: SHA_B, committedAt: "2026-09-01T00:00:00Z" };
  const newer = { ...older, sha: SHA_C, committedAt: "2026-09-20T00:00:00Z" };
  assert.equal(isSkillPackUpgrade(newer, active, "beta"), true);
  assert.equal(isSkillPackUpgrade(older, active, "beta"), false);
  assert.equal(isSkillPackUpgrade({ ...older, sha: SHA_A }, active, "beta"), false);
  assert.equal(isSkillPackUpgrade({ ...older, channel: "stable" }, active, "stable"), true);
});

function serviceFixture(t, { devBuild = false, settings = {}, source } = {}) {
  const { bundled, user } = fixture(t);
  writeCopy(bundled, manifestFor(SHA_A, { committedAt: "2026-09-01T00:00:00Z" }));
  const store = createSkillPackStore({ bundledDir: () => bundled, userDir: () => user });
  const sent = [];
  const stored = { ...settings };
  const service = createSkillPackService({
    store,
    request: source.request,
    devBuild,
    readSettings: async () => ({ ...stored }),
    writeSettings: async (patch) => Object.assign(stored, patch),
    send: (channel, payload) => sent.push({ channel, payload }),
  });
  return { service, sent, stored, store };
}

test("a check announces a new release once, and installing it switches the active copy", async (t) => {
  const source = fakeSource({ release: "v0.2.0", commits: { "v0.2.0": [SHA_B, "2026-09-20T00:00:00Z"] } });
  const { service, sent, stored } = serviceFixture(t, { source });

  let state = await service.check(true);
  assert.equal(state.channel, "stable");
  assert.equal(state.available.sha, SHA_B);
  const notices = () => sent.filter((event) => event.channel.endsWith("updateNotice"));
  assert.equal(notices().length, 1);
  assert.equal(stored.skillPackLastNotifiedSha, SHA_B);
  await service.check(true);
  assert.equal(notices().length, 1, "a version is announced only once");

  state = await service.install();
  assert.equal(state.active.sha, SHA_B);
  assert.equal(state.active.origin, "downloaded");
  assert.equal(state.available, undefined);
  assert.equal(state.skills.length, 2);
});

test("release builds stay on the bundle when nothing is released; beta follows main", async (t) => {
  const source = fakeSource({ commits: { main: [SHA_C, "2026-09-25T00:00:00Z"] } });
  const { service, stored } = serviceFixture(t, { source });

  let state = await service.check(true);
  assert.equal(state.error, "no-release");
  assert.equal(state.available, undefined);
  assert.equal(state.active.origin, "bundled");

  state = await service.setBeta(true);
  assert.equal(stored.skillPackBeta, true);
  assert.equal(state.channel, "beta");
  assert.equal(state.available.sha, SHA_C);
});

test("development builds always follow main", async (t) => {
  const source = fakeSource({ commits: { main: [SHA_C, "2026-09-25T00:00:00Z"] } });
  const { service } = serviceFixture(t, { devBuild: true, source });
  const state = await service.check(false);
  assert.equal(state.channel, "beta");
  assert.equal(state.devBuild, true);
  assert.equal(state.available.ref, "main");
});

test("an unreachable source is reported without dropping the bundled skills", async (t) => {
  const source = {
    request: async () => {
      throw new Error("responded 404");
    },
  };
  const { service } = serviceFixture(t, { devBuild: true, source });
  const state = await service.check(true);
  assert.equal(state.error, "unreachable");
  assert.equal(state.status, "idle");
  assert.equal(state.skills.length, 2);
});

test("the vendored snapshot is a valid pack whose files match its manifest", async () => {
  const { readFileSync } = await import("node:fs");
  const dir = new URL("../resources/skill-packs/explore-mode/", import.meta.url);
  const manifest = parseSkillPackManifest(JSON.parse(readFileSync(new URL("pack.json", dir), "utf8")));
  assert.ok(manifest, "pack.json parses");
  for (const file of manifest.files) {
    const bytes = readFileSync(new URL(`files/${file.path}`, dir));
    assert.equal(gitBlobSha(bytes), file.blob, file.path);
  }
  const copy = { manifest, root: new URL("files", dir).pathname, origin: "bundled" };
  assert.ok(skillPackCatalog(copy).some((skill) => skill.id === "explore/explore-mode"));
});
