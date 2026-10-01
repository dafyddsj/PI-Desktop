---
name: setup
description: "Use for /setup or when the learner wants to start using EXplore in a folder, check an existing EXplore workspace, or add an assessment or project: 'set up EXplore here', 'add my next assessment', 'check my workspace'. Creates the workspace structure and starter files only where they are absent, never overwrites the learner's content, registers work items, and reports missing rules, briefs, or records in plain language."
metadata:
  author: Dafydd Jones
  version: "0.1"
  contributors: []
---

# Setup

Create, check, or extend an EXplore workspace: a folder that holds the learner's programme of work, with each assessment or project kept as a separate work item. Everything created belongs to the learner.

**Boundary:** Create files only where they are absent. Never overwrite, move, or delete the learner's content. Make no changes outside the chosen folder, don't install software, and never write credentials. When a dedicated EXplore installer is available, it can do the same job. This skill is the route for hosts that work directly in a folder.

## Choose the operation

- **Create:** the folder has no `.explore/` directory.
- **Add a work item:** the workspace exists, and the learner wants a new assessment or project.
- **Check:** the learner asks whether the workspace is set up correctly, or something seems wrong.

Confirm the folder before writing anything. Show what will be created, and wait for the learner's go-ahead.

## Create

1. **Ask only what's needed, in plain language:**
   - Is this a whole programme or a single piece of work?
   - The programme or course names (optional).
   - The first work items: a short ID such as `fa1-agentic-ai`, a title, a type (assessment or project), and the course.

   Everything else can be filled in later.
2. **Create what's absent:**

   ```text
   EXPLORE.md                 what EXplore is for here and how to start
   AGENTS.md                  shared entry instructions (EXplore section in a managed block)
   AI-POLICY.md               workspace AI-use defaults
   MY-BOUNDARIES.md           the learner's own limits
   .explore/config.yaml       work-item registry and settings
   programme/                 programme overview, handbook, policies, resources
   courses/<course>/          COURSE.md, AI-POLICY.md, materials/, notes/
   library/SOURCES.md         shared source register
   library/files/             legitimately retained source files
   notes/                     cross-course ideas
   assessments/ or projects/  one folder per work item (see below)
   ```

   If `AGENTS.md` already exists, add EXplore's section inside clearly marked `<!-- EXplore:start -->` and `<!-- EXplore:end -->` lines, leaving the rest untouched.
3. **Create each work item:**

   ```text
   <work-item>/
     WORK.md                  ID, title, type, course, purpose, deadline, status
     BRIEF.md, RUBRIC.md      to hold or link the official documents
     AI-POLICY.md             local rules that override inherited defaults
     MY-BOUNDARIES.md         optional personal limits for this item
     .explore/HANDOFF.md      current state for this item only
     sources/ notes/ drafts/ reflections/ outputs/
     provenance/              AI-USE.md, DECISIONS.md, CLAIMS.md, runs/, releases/
   ```

   Register the item in `.explore/config.yaml`. Record formats follow [show-me-your-work](../../playbooks/show-me-your-work.md).
4. **Seed the starter files.** Explain their purpose, but don't pre-fill rules:
   - **`EXPLORE.md`:**
     - what EXplore may help with: exploring questions, finding and evaluating evidence, applying thinking methods, challenging assumptions, considering perspectives, and reflecting;
     - what it must not do: fabricate evidence, conceal uncertainty, decide the learner's position, write their reflections, or bypass their assessment rules;
     - what stays with the learner: interpretation, judgement, authorship, source selection, and meeting requirements.
   - **`AI-POLICY.md` templates:** say that local rules override inherited ones only for the matters they address, and that an empty file changes nothing. Leave the rules for the learner to paste in or link from official sources. Never invent a policy ([Follow Applicable Rules](../principle-follow-applicable-rules/SKILL.md)).
   - **`WORK.md`:** fill it in from the learner's answers only.
5. **Keep private things private.** If the folder is under version control, suggest ignoring private runtime state (`.runtime/`) and any credentials files. Explain that reflections and drafts are the learner's, to share or not.
6. **Report** what was created, what was already present and left alone, and the next steps: add the brief and rubric, paste in the course's AI rules, then start with `/explore-mode` or a workflow.

## Add a work item

Ask for the ID, title, type, and course. Check that the ID is unique. Create the work-item structure above, register it, and report back. Nothing in other work items changes.

## Check

Report in plain language, without changing anything unless the learner asks:
- the work items found, with their courses;
- which briefs, rubrics, and AI-policy files are present, empty, or missing;
- rules that appear to conflict ([Stop When Unclear](../principle-stop-when-unclear/SKILL.md));
- handoffs that look stale or unscoped;
- records with broken IDs or missing fields;
- files EXplore expected but didn't find.

Never describe the workspace as academically approved or compliant.

## Done when

- The learner confirmed the folder and the plan.
- Only absent files were created.
- Existing content is untouched.
- Work items are registered.
- The learner knows what to fill in next.
