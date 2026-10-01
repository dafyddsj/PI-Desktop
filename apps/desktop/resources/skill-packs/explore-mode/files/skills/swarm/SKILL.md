---
name: swarm
description: "Use for /swarm or when a question is large enough to split: 'cover all of these areas', 'investigate these ten tools', 'research this across several angles at once'. Decomposes the question into bounded work packages with dependencies, dispatches independent packages in parallel (or sequentially, clearly labelled, where parallel work isn't available), collects results with failures made explicit, and integrates them into one research result without hiding contradictions or gaps."
metadata:
  author: Dafydd Jones
  version: "0.1"
  contributors: []
---

# Swarm

Split one big question into bounded parts, work the independent parts in parallel, and integrate the results into a single coherent picture. The defining feature is decomposition and parallel work. The workers don't need different models.

**Boundary:** Respect dependencies and resource limits. Expose missing or failed work, and keep source attribution and uncertainty in the combined result.

## Start

Follow [Start every task](../explore-mode/SKILL.md#start-every-task). Check that a swarm is warranted: the question is genuinely divisible and too large for one pass ([Purposeful Use](../principle-purposeful-use/SKILL.md)). State what "done" means and what the integrated result will look like.

## Steps

1. **Decompose.** Define the work packages. Each has:
   - a bounded sub-question or slice;
   - its scope;
   - the output expected;
   - how it will be checked;
   - its dependencies on other packages.

   Aim for packages that don't overlap. Where they must overlap, say so.
2. **Set the bounds:** the number of packages and workers, time, and usage where the environment allows. Share the plan with the learner if it's large.
3. **Write the briefs.** Each follows the [delegation contract](../explore-mode/SKILL.md#delegation): work item, goal, slice, scope, rules and restrictions, starting sources, output file, output format, and stop condition. Ask each package to report sources with access status, findings with locators, uncertainty, and a completion status: `complete`, `partial`, or `blocked`, with a reason.
4. **Dispatch.** Send independent packages in parallel as subagents, where the environment supports them. Send dependent packages after their prerequisites finish, passing on the outputs they need. If parallel work isn't available, run the packages in sequence and label the result a sequential decomposition, not a swarm.
5. **Collect.** Check every package. A `partial` or `blocked` result, or a result missing its sources, is retried once where sensible and otherwise recorded as a gap. A gap never counts as coverage.
6. **Verify.** Spot-check consequential claims from each package against their sources ([verify-sources](../../playbooks/verify-sources.md)). Worker reports are leads ([AI Is Not Evidence](../principle-ai-is-not-evidence/SKILL.md)).
7. **Integrate.** Combine the packages with [evidence-synthesis](../../playbooks/evidence-synthesis.md):
   - merge duplicate sources;
   - check for dependence between packages that look like independent support;
   - reconcile overlaps;
   - keep contradictions visible ([Preserve Disagreement](../principle-preserve-disagreement/SKILL.md)).

   The lead alone writes the integrated result and updates shared records.
8. **Return.** **Checkpoint:** the learner receives the integrated result and a package status table, and decides what matters and what to pursue.
9. **Record** the decomposition, dispatch mode, models, package results, failures, and integration ([show-me-your-work](../../playbooks/show-me-your-work.md)).

## Output

- Integrated research notes, with findings by status, sources, disagreements, and gaps.
- A package table: package, status, output file, and model where known.
- The execution mode: parallel or sequential.
- Decisions for the learner.

## Done when

- Every package is accounted for, including failures.
- Consequential claims are spot-checked.
- Duplicates and dependent sources are reconciled.
- Contradictions and gaps are visible.
- The execution mode is labelled honestly.
