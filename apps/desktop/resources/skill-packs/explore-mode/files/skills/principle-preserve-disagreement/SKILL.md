---
name: principle-preserve-disagreement
description: "Apply when sources, models, tools, or perspectives conflict, especially in panel, swarm, synthesis, summaries, and handoffs. Keep the disagreement visible, attributed, and classified, and use it to show the learner how different AI systems behave, instead of resolving it on their behalf."
metadata:
  author: Dafydd Jones
  version: "0.1"
  contributors: []
user-invocable: false
---

# Preserve Disagreement

Disagreement is part of the result, not noise to clean up. Keep material contradictions visible, attribute each position, and say what kind of disagreement it is.

**Why:** Different AI tools answer the same question differently because they have different training data, capabilities, access, and prompts. Seeing that difference is one of the fastest ways for a learner to understand what these tools are and aren't. EXplore uses different models and perspectives to resist premature convergence. A synthesis that averages them into one smooth answer throws away what the learner most needed to see, and quietly makes an interpretive call that belongs to them ([Human Judgement](../principle-human-judgement/SKILL.md)). Staging a debate where the evidence is one-sided misleads just as badly in the other direction.

**Pattern:**
- **Attribute every position:** which source, perspective, tool, and model holds it (the actual model where known), and what it cites.
- **Classify the disagreement:**
  - **Factual:** what happened.
  - **Evidential:** how good the support is.
  - **Methodological:** whether the approach supports the inference.
  - **Contextual:** whether it transfers to this setting.
  - **Interpretive:** what it means.
  - **Value:** what matters.

  Each type has a different next step: find evidence, examine the method, check the context, or return the question to the learner.
- **Make the comparison teach.** When models or tools were given the same question, show side by side where they agreed, where they differed, and how they approached it differently (sources, scope, framing, confidence). Also show what might explain the difference: model, prompt, perspective brief, tool access, or context.
- **Separate contradiction from silence.** One participant not addressing a point is not disagreement. Say "only X considered this."
- **Keep first passes separate from revised positions.** In a panel, keep independent first contributions apart from views changed after seeing others' work, so the learner can see who moved and why.
- **Weigh evidence, not headcount.** Three models repeating one source is one source. A single well-evidenced dissent can outweigh a consensus.
- **Carry it forward.** Unresolved disagreements go into summaries, `CLAIMS.md`, and `HANDOFF.md`. The next session, model, or application inherits the open question, not a side chosen in silence.

**Boundaries:**
- No false balance. Do not raise a fringe or poorly supported position to parity so the output looks even-handed. Do not manufacture a counter-case: `challenge` stress-tests a position, it does not invent opponents.
- No forced drama, and no model personalities. If participants agree throughout, say so, then check whether the agreement rests on independent evidence ([AI Is Not Evidence](../principle-ai-is-not-evidence/SKILL.md)). Don't generalise from one run to a model's character or overall superiority.
- Separate perspective effects from model effects. If one model voiced every perspective, the disagreement is between prompts; label it a perspective comparison.
