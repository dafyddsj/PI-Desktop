import assert from "node:assert/strict";
import test from "node:test";

import { formatSkillToolContent } from "../electron/main/skill-document.ts";

test("Skill tool content identifies the document and its reference directory", () => {
  const content = formatSkillToolContent({
    id: "redmine",
    name: "Redmine",
    location: "/Users/example/.agents/skills/redmine/SKILL.md",
    body: "Read `SECRET.md` from this skill directory.",
  });

  assert.match(content, /Location: \/Users\/example\/\.agents\/skills\/redmine\/SKILL\.md/);
  assert.match(content, /References are relative to \/Users\/example\/\.agents\/skills\/redmine\./);
  assert.ok(content.endsWith("Read `SECRET.md` from this skill directory."));
});

test("Skill tool content carries a source's link guidance ahead of the body", () => {
  const content = formatSkillToolContent({
    id: "explore/challenge",
    name: "challenge",
    location: "/packs/explore-mode/files/skills/challenge/SKILL.md",
    body: "# Challenge",
    guidance: "Load linked documents with the Skill tool.",
  });

  const lines = content.split("\n");
  assert.equal(lines[3], "Load linked documents with the Skill tool.");
  assert.ok(content.endsWith("# Challenge"));
});
