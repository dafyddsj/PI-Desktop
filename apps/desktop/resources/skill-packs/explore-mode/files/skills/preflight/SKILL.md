---
name: preflight
description: "Use for /preflight or when the learner wants final checks before submitting or publishing: 'check this against the brief', 'is anything missing', 'run my final checks'. Builds a checklist from the selected work item's explicit requirements plus EXplore's evidence, disclosure, data, and cultural checks, runs each check (in parallel where available), and reports pass, fail, or unknown with evidence and remaining actions. No overall sign-off and no automatic submission."
metadata:
  author: Dafydd Jones
  version: "0.1"
  contributors: []
---

# Preflight

Support the learner's final checks. List what the work must satisfy, check each item, and report what passed, what failed, and what couldn't be determined, with evidence. The learner decides whether it's ready.

**Boundary:** Report pass, fail, or unknown for each check, with evidence and remaining actions. There is no overall AI sign-off, no claim of institutional approval, and no automatic submission or publication ([Human Judgement](../principle-human-judgement/SKILL.md)).

## Start

Follow [Start every task](../explore-mode/SKILL.md#start-every-task). Check only the selected work item unless the learner explicitly asks for more. Gather its brief, rubric, format and submission requirements, due date, applicable AI rules, and records.

## Steps

1. **Build the checklist.** Take every explicit requirement from the brief, rubric, and rules, and note where each comes from. Add EXplore's checks:
   - **References:** every in-text citation has a reference and the reverse; details are complete; nothing is marked `not found`.
   - **Claims:** consequential claims rest on verified sources; claims resting on unverified or partial sources are flagged ([verify-sources](../../playbooks/verify-sources.md)).
   - **AI-use disclosure:** an acknowledgement is present where required, in the required form, and consistent with `AI-USE.md` ([Transparency](../principle-transparency/SKILL.md)).
   - **Data and privacy:** no personal, confidential, or restricted material appears without a basis; permissions are recorded ([Protect Data](../principle-protect-data/SKILL.md)).
   - **Cultural material:** restricted knowledge or community data is handled as agreed ([Cultural Awareness](../principle-cultural-awareness/SKILL.md)).
   - **Open items:** unresolved disagreements, `pending learner decision` entries, and known limitations.
   - **Artefacts:** required files, links, word count, formatting, and accessibility (for example, text alternatives for visuals).
2. **Run the checks.**
   - **Delegate:** where the environment allows, run independent checks in parallel, such as citation checking, link checking, and requirement matching. Give each check the requirement, the material, and the evidence needed.
   - Mechanical checks, such as word counts or broken links, can use tools directly.
3. **Report each check:** the check, its source, the result (`pass`, `fail`, or `unknown`), the evidence, and the remaining action. Use `unknown` when a check can't be determined. Don't guess a pass.
4. **Return the report,** with failures first, then unknowns, then passes. **Checkpoint:** the learner decides what to fix and whether to submit. Record the preflight in the run record ([show-me-your-work](../../playbooks/show-me-your-work.md)).

## Output

A checklist table: check, source, result, evidence, and action. Include a short list of the remaining actions. There is no overall readiness statement.

## Done when

- Every explicit requirement is checked or marked `unknown`.
- EXplore's checks are run.
- Every result has evidence.
- The scope was limited to the selected work item.
- No sign-off is given.
