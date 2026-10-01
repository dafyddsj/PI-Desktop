---
name: show-me-your-work
description: "Use at material checkpoints (a consequential source or claim change, an explicit learner decision, a substantive AI contribution, a completed stage, a run's end, or a handoff) and whenever another playbook needs to record provenance. Defines EXplore's records and their formats: source register, claims, decisions, AI use, run records, handoffs, and releases. Records observable work, never hidden reasoning, and never certifies the trail."
metadata:
  author: Dafydd Jones
  version: "0.1"
  contributors: []
---

# Show Me Your Work

Keep a proportionate, honest record of what was found, what was claimed, who decided what, and what AI contributed, so the learner, their assessors, and EXplore's own evaluation can inspect the work. This playbook owns the record formats. Other playbooks write to them rather than inventing their own.

**Why:** A learner can only acknowledge AI use accurately, defend a claim, or pick up yesterday's work if the trail exists and tells the truth (**principle-transparency**). The trail also has limits. It records observable actions and stated reasons, not a model's hidden reasoning. It is not proof of integrity, and no agent reviews it automatically. The learner judges the work (**principle-human-judgement**).

## Where records live

Records belong to one work item: an assessment or project under `assessments/` or `projects/`. For general inquiry outside a work item, use the workspace root.

| Record | Location | Changes by |
| --- | --- | --- |
| Source register | `library/SOURCES.md` (shared), cited from each work item | Adding entries; correcting with dated notes |
| Claims | `<work-item>/provenance/CLAIMS.md` | Adding and updating entries; corrections noted |
| Decisions | `<work-item>/provenance/DECISIONS.md` | Adding entries; changes via superseding entries |
| AI use | `<work-item>/provenance/AI-USE.md` | Adding entries |
| Run records | `<work-item>/provenance/runs/<run-id>.md` | One file per run, finalised at the run's end |
| Handoff | `<work-item>/.explore/HANDOFF.md` | Replaced at each checkpoint; the current summary only |
| Releases | `<work-item>/provenance/releases/<release-id>.md` | One file per release, frozen once written |

## Shared rules

- **IDs.**
  - Sources: `S-001`.
  - Claims: `C-001`.
  - Decisions: `D-001`.
  - AI use: `A-001`.
  - Runs: `R-YYYYMMDD-HHMM-<short-slug>`.
  - Releases: `REL-001`.

  Reuse IDs and link to them rather than copying text between records. Before adding an entry, check whether one already exists for the same event.
- **Every entry states:** who recorded it (learner, assistant, delegated agent, or tool), when, which work item, and the related run, source, claim, or decision IDs.
- **Honest unknowns.** Write `unknown`, `not recorded`, or `pending learner decision` rather than guessing. Never invent a model name, usage figure, timestamp, or access claim.
- **Learner decisions are the learner's.** An AI suggestion becomes a decision only when the learner actually makes it. Silence is not consent.
- **Correct, don't rewrite.** Fix errors with a dated correction or a superseding entry. Never silently change who decided what.
- **Retrospective records are labelled** `retrospective`, with both the event time and the recording time.
- **Privacy.** Keep sensitive material out of records where a reference will do. Records may be redacted for privacy. Leave a minimal redaction notice where that is safe, and don't claim records are tamper-proof (**principle-protect-data**).
- **Proportion.** Record at checkpoints, not every turn. A quick explanation of a concept needs no record. A decision about the question, a new source behind a key claim, or a substantive AI contribution does.

## Formats

Use readable Markdown. The fields below are the minimum; add others only when they serve a real need.

### Source register entry (`library/SOURCES.md`)

```markdown
### S-012
- Citation: Author, A. A., & Author, B. B. (Year). Title. *Venue, vol*(issue), pages.
- Link: https://doi.org/…
- Type: peer-reviewed empirical study | review | policy | grey literature | vendor | news | commentary | AI output
- Access: full text read | abstract only | not accessed | paywalled | not found — YYYY-MM-DD
- Read by: assistant (model if known) | learner-confirmed | nobody yet
- Verification: see claim entries (verify-sources)
- Limits: population, setting, date, method, or funding notes that affect use
- Added: YYYY-MM-DD, by <actor>, run <run-id>
```

### Claim entry (`CLAIMS.md`)

```markdown
### C-007: <the claim, in one sentence>
- Type: empirical | predictive | normative | interpretive | personal observation
- Status: well supported | supported | tentative | speculative | contested | unknown
- Evidence: S-012 p. 4 (verified); S-015 §3 (partial); S-020 (contradicts)
- Disagreement: <who differs and why, or "none found">
- Uncertainty: <basis and limits of confidence>
- Recorded: YYYY-MM-DD, by <actor>, run <run-id>
```

### Decision entry (`DECISIONS.md`)

```markdown
### D-004: <the decision, as a short title>
- Status: decided | pending learner decision | superseded by D-009
- Question: <what was being decided>
- Options considered: <brief list>
- Evidence: C-003, S-012
- Rationale: <the learner's stated reason, in their words where given>
- Decided by: learner | <named person or authority>
- Consequences and limits: <what this commits to or rules out>
- Recorded: YYYY-MM-DD, by <actor>, run <run-id>
```

### AI-use entry (`AI-USE.md`)

```markdown
### A-015
- Date: YYYY-MM-DD
- Tool and runtime: <host application>; model: <actual model, or unknown>
- Execution: single assistant | sequential perspectives | subagents | multi-model | cross-provider handoff
- Workflow and playbook: <e.g. research; verify-sources>
- Purpose: <what the learner asked for>
- Contribution: <what the AI actually produced or did, factually>
- Verification: <what was checked, how, and by whom>
- Learner response: accepted | modified | rejected | not expressed
- Outputs: <file paths or record IDs>
```

### Run record (`runs/<run-id>.md`)

```markdown
# R-20261001-0930-agentic-ai-scan
- Work item: <id>
- Started / ended: <timestamps>
- Runtime and models: <host, model per contribution, or unknown>
- Workflow, playbooks, and delegated tasks: <list>
- Rules in force: <policy files with version or hash>
- Inputs: <question, files, sources provided>

## Actions
<observable steps: searches run, sources read, agents dispatched, with results>

## Outputs
<files written and records added: S-, C-, D-, A- IDs>

## Failures and limits
<failed tools or workers, inaccessible sources, skipped steps, partial results>

## Links
Handoff updated: yes | no. Decisions pending: D-…
```

### Handoff (`.explore/HANDOFF.md`)

```markdown
# Handoff: <work item>
- Last updated: <timestamp>, originating run <run-id>, by <actor>
- Application and model: <as known, or unknown>
- Scope: <work item, or workspace-level>
- Goal and current stage: <question; playbook; where we are>
- Done so far: <brief, with links to records>
- Rules in force: <policy files>
- Learner decisions: <D- links; pending ones flagged>
- Next requested step: <what the learner asked for next>
- Cautions: <limits, stale sources, data restrictions to carry forward>

## Current conclusions
<!-- For an independent second view, read this section only after forming your own view from the question, rules, and sources. -->
- Findings: <current findings and their status, with C- links>
- Open questions and disagreements: <C- and D- links>
```

The handoff is working context, not authority. The arriving assistant checks the rules, the linked records, and the important claims before continuing, and treats a stale or unscoped handoff with suspicion.

### Release record (`releases/<release-id>.md`)

```markdown
# REL-001: <what was released>
- Date and released by: <learner>
- Outputs: <paths with content hashes>
- Versions: EXplore plugin <x.y.z>; app <x.y.z or n/a>; template <x.y.z>
- Rules in force: <policy files with version or hash>
- Outstanding limitations: <known gaps, unresolved disagreements>
- Learner's release decision: <as the learner actually stated it>
```

## What this playbook never does

- Request, reconstruct, or store a model's hidden chain-of-thought.
- Write a rationale after the fact and present it as contemporaneous.
- Dispatch a reviewer, score the trail, or sign work off. Format checks, such as missing fields or broken IDs, are fine. Judging the work is the learner's.
- Export records beyond the work item without the learner selecting them.

## Attribution

Inspired by pstack's `show-me-your-work` skill (pstack-claude revision `eefcfaf`, MIT licence, © 2026 Lauren Tan and Michael Denyer). This version adopts its rules that evidence is a pointer rather than prose and that history is superseded rather than rewritten. It uses academic record types instead of a single decision log, and deliberately omits the upstream automatic cross-model review of the trail.

## Related

**verify-sources**, **evidence-synthesis**, **principle-transparency**, **principle-protect-data**, `preflight`.
