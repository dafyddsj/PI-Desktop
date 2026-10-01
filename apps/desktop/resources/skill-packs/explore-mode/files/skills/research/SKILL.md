---
name: research
description: "Use for /research or when the learner wants to investigate a question in depth: 'research X', 'what does the evidence say about Y', 'look into Z for my assessment'. Frames a scoped question, plans an approach, gathers and verifies evidence (with parallel and independent searching where available), synthesises it, challenges the result, and returns research notes with coverage limits and decisions for the learner."
metadata:
  author: Dafydd Jones
  version: "0.1"
  contributors: []
---

# Research

Investigate a scoped question through an explicit approach: gather evidence, evaluate it, analyse and synthesise it, and challenge the result. The output is research notes the learner can judge and build on, not an essay.

**Boundary:** Record coverage and access limits. Never imply an exhaustive review. Compose other workflows where they help. Don't write prose for the learner's submission ([Learner Authorship](../principle-learner-authorship/SKILL.md)).

## Start

Follow [Start every task](../explore-mode/SKILL.md#start-every-task): the goal, the work item, and the rules. If continuing earlier research, read the handoff and check what it builds on.

## Steps

1. **Frame the question.** If it's broad, vague, or loaded, use [question-framing](../../playbooks/question-framing.md). **Checkpoint:** the learner confirms the question and scope.
2. **Plan the approach.** Set out:
   - the sub-questions;
   - the kinds of evidence each needs;
   - where to look;
   - which methods apply;
   - the bounds: time, searches, and delegated tasks.

   Write the plan to the work item's `notes/`. For a substantial inquiry, share the plan before running it.
3. **Gather evidence.** Run [search](../search/SKILL.md) per sub-question.
   - **Delegate:** where the environment allows, search sub-questions in parallel.
   - **Delegate for independence:** give one agent, or another model where available, the same question, constraints, and rules but not the findings so far. Ask it to look beyond the initial framing: adjacent fields, alternative terms, contrasting cases, less obvious sources, and the context behind consequential claims.
4. **Verify what carries weight.** Apply [verify-sources](../../playbooks/verify-sources.md) to every source a key claim will rest on. Trace consequential claims to their origin.
   - **Delegate:** batches of sources can be verified in parallel. The lead spot-checks the results.
5. **Analyse and synthesise.** Build the evidence picture with [evidence-synthesis](../../playbooks/evidence-synthesis.md). Add [systems-thinking](../../playbooks/systems-thinking.md) or [second-order-thinking](../../playbooks/second-order-thinking.md) where the question calls for them. Compare the independent search with the main one. Differences in what each found are findings in themselves.
6. **Challenge the result.** Stress-test the key conclusions with the [challenge](../challenge/SKILL.md) method.
   - **Delegate:** a separate agent, ideally on a different model, gives the most independent challenge.
7. **Check the method.** Do the question, approach, evidence, and inference line up? Would the conclusions follow for the population and context the learner cares about?
8. **Check people and culture.** Who is affected, whose perspectives and sources are missing, and do any data or cultural restrictions apply ([Cultural Awareness](../principle-cultural-awareness/SKILL.md), [Protect Data](../principle-protect-data/SKILL.md))?
9. **Return research notes.** **Checkpoint:** the learner decides what the findings mean and what happens next.
10. **Record.** Update the sources, claims, and AI-use records, write a run record, and update the handoff if the work will continue ([show-me-your-work](../../playbooks/show-me-your-work.md)).

## Output

Research notes in the work item's `notes/`:
- the question and approach;
- findings, each with a status and its sources;
- disagreements;
- gaps, and the coverage of the search (what was searched and what couldn't be reached);
- how the work was executed, and the models used where known;
- questions and decisions for the learner.

## Done when

- The question and plan are recorded.
- Key claims rest on verified sources, or are marked unverified.
- Coverage limits are stated.
- A challenge has been applied.
- Disagreements are preserved.
- The learner has the decisions that are theirs.
- The records are updated.
