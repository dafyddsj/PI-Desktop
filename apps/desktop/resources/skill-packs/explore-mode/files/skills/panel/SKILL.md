---
name: panel
description: "Use for /panel or when the learner wants one question examined from several perspectives or by several models: 'get different views on X', 'compare how models answer this', 'panel this question'. Gives participants the same question, evidence, and rules with distinct perspective briefs, collects independent first passes (parallel agents, different models, or sequential handoffs between applications), and returns an attributed comparison of agreement, disagreement, and approach before any synthesis."
metadata:
  author: Dafydd Jones
  version: "0.1"
  contributors: []
---

# Panel

Put one question to several participants with different perspective briefs and, where possible, different models. Then show the learner, side by side, where they agree, where they disagree, and how they approached the question differently. The comparison is the point, for what it reveals about the topic and about how the models behave.

**Boundary:** Preserve attributable contributions and unresolved differences. Distinguish brief or prompt effects from model effects. Agreement is not evidence, and the panel is not a vote on the learner's conclusion ([AI Is Not Evidence](../principle-ai-is-not-evidence/SKILL.md), [Preserve Disagreement](../principle-preserve-disagreement/SKILL.md)).

## Start

Follow [Start every task](../explore-mode/SKILL.md#start-every-task). Establish what the panel is for:
- **Topic panel:** perspectives on a question, to deepen understanding.
- **Model comparison:** how different models handle the same question, to learn about the models themselves.

The purpose changes how the panel is set up.

## Steps

1. **Frame the question** and gather the shared evidence pack: the sources, the work-item context, and the applicable rules and restrictions.
2. **Choose the participants.** Usually three to five. Give each a perspective brief suited to the question, for example:
   - an evidence-and-method lens;
   - a sceptical lens;
   - a consequences lens;
   - an ethical and cultural lens;
   - a practitioner or context lens.

   Assign different models where the environment allows. Keep the panel as small as the purpose allows ([Purposeful Use](../principle-purposeful-use/SKILL.md)).
3. **For a model comparison,** control what you can. Give every participant the same question, the same brief, equivalent evidence, and equivalent tool access. Record what couldn't be controlled.
4. **Run the independent first passes.** Each participant gets the question, the evidence pack, the rules, and its brief, but not the other participants' work. Follow the [delegation contract](../explore-mode/SKILL.md#delegation). Choose the mode the environment supports:
   - parallel subagents on different models;
   - parallel subagents on one model;
   - sequential handoffs between applications, where the learner runs each participant in a different tool using the work item's handoff (see [Handoffs](../explore-mode/SKILL.md#handoffs-and-switching-providers));
   - one assistant taking each brief in turn.

   Each participant writes its own contribution file. Record the actual model for each contribution, or `unknown`.
5. **Build the comparison before any synthesis.** Present it side by side, labelled with each participant's brief and model:
   - **Agreement:** what they share, who shares it, what they cite, and whether they rely on the same underlying sources.
   - **Disagreement:** the specific point, each position, and its type: fact, evidence quality, assumption, context, interpretation, or values. Separate direct contradiction from silence.
   - **Different approaches:** differences in source choice, scope, framing, questions raised, qualifications, and stated confidence, with links to the contributions.
   - **Unresolved:** what evidence could distinguish the positions, and what the learner needs to investigate or decide.
6. **Explain the differences carefully.** Differences can come from the brief, the prompt, source access, tools, or prior context, not only from the model. If one model played every part, call the panel a perspective comparison. Don't infer hidden reasoning, stable model personalities, or general superiority from one run.
7. **Optional clarification round.** Run one bounded round in which participants see the others' contributions and respond. Keep revised positions separate from first passes, so the learner can see who moved and why.
8. **Synthesise, as the lead.** Combine the findings with [evidence-synthesis](../../playbooks/evidence-synthesis.md), keeping disagreements and attributions. The synthesis is research notes, not a verdict.
9. **Return the panel.** **Checkpoint:** ask what the learner concludes about the question, and what they noticed about how the models behaved ([Human Judgement](../principle-human-judgement/SKILL.md)).
10. **Record** the participants, briefs, models, execution mode, first passes, revisions, failures, and synthesis ([show-me-your-work](../../playbooks/show-me-your-work.md)).

## Output

- The side-by-side comparison (agreement, disagreement, approaches, unresolved), labelled with briefs and models.
- The synthesis.
- Links to each contribution.
- Execution details: the mode, the models, what was controlled, and any failures.
- Questions for the learner.

## Done when

- Every contribution is attributable.
- First passes were independent, or it's stated that they weren't.
- Agreements are checked for shared sources.
- Brief effects and model effects are distinguished.
- Disagreements survive the synthesis.
- The learner has been asked for their conclusion.
