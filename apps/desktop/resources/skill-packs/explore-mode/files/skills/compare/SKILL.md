---
name: compare
description: "Use for /compare or when the learner wants options weighed: 'compare X and Y', 'which approach is better for Z', 'pros and cons of these tools or policies'. Establishes criteria and weights with the learner, gathers evidence per option (in parallel where available), builds an evidence-backed comparison with unknowns shown, and demonstrates how the answer changes under different criteria. No arbitrary scores and no universal winner."
metadata:
  author: Dafydd Jones
  version: "0.1"
  contributors: []
---

# Compare

Compare technologies, approaches, policies, cases, or methods against criteria the learner chooses. Show the evidence, the trade-offs, the contextual differences, and the unknowns, and make visible how the answer depends on what matters to the learner.

**Boundary:** The learner chooses the criteria, their weighting, and the conclusion. Avoid arbitrary scores, false equivalence, and an unsupported universal winner.

## Start

Follow [Start every task](../explore-mode/SKILL.md#start-every-task). Identify the options, the purpose of the comparison (a decision, an assessment, understanding), and the context it applies to: who, where, and when.

## Steps

1. **Fix the options.** Make sure they are comparable. Split or merge options that aren't like-for-like, and say whether a "do nothing" or non-AI option belongs in the set ([Purposeful Use](../principle-purposeful-use/SKILL.md)).
2. **Agree the criteria.** Propose candidate criteria from the purpose and the literature, including ones the learner may not have considered: equity, access, data, culture, environmental cost. **Checkpoint:** the learner chooses the criteria and their relative importance.
3. **Gather evidence per option and criterion.**
   - **Delegate:** where the environment allows, give each option to a separate agent with the same criteria, evidence rules, and output format, so the options get even-handed treatment.
   - Verify what carries weight ([verify-sources](../../playbooks/verify-sources.md)).
4. **Build the comparison matrix.** Rows are criteria and columns are options. Each cell gives the evidence and its status, or says `unknown`. Don't fill gaps with guesses. Note context dependence: for whom, where, and under what conditions each cell holds ([Cultural Awareness](../principle-cultural-awareness/SKILL.md)).
5. **Describe the trade-offs.** Say what you gain and lose by choosing each option, in words rather than points.
6. **Show the sensitivity.** Show how the preferred option changes under different weightings or criteria. If one option wins across all reasonable weightings, say so. If not, say what the choice depends on.
7. **Return the comparison.** **Checkpoint:** the learner draws the conclusion. If they ask for a view, give it as "under your criteria…", labelled as the assistant's reading ([Human Judgement](../principle-human-judgement/SKILL.md)).

## Output

- The options and the learner's criteria and weights.
- An evidence matrix with statuses and unknowns.
- Trade-offs.
- A sensitivity note.
- How the work was executed.
- Decisions for the learner.

## Done when

- The criteria are the learner's.
- Every cell has evidence or an explicit `unknown`.
- Unknowns are not hidden behind scores.
- The effect of different criteria is shown.
- No universal winner is declared.
