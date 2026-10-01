---
name: critical-thinking
description: "Use when examining a claim, argument, source, or AI output, including the learner's own reasoning and EXplore's. Clarifies the claim, maps premises and hidden assumptions, inspects support, tests the inference against alternatives, finds what would change the conclusion, and calibrates confidence, then returns the judgement to the learner."
metadata:
  author: Dafydd Jones
  version: "0.1"
  contributors: []
---

# Critical Thinking

Take a claim apart carefully enough to see what holds it up. Clarify what is being said, expose what it assumes, inspect the support, test whether the conclusion follows, and say what would change it. Then hand the judgement back.

**Why:** AI output and much published writing arrive fluent and confident whether or not they are sound. Critical thinking is how the learner stays the one who decides what to believe (**principle-human-judgement**). It is not contrarianism. Doubting everything equally is as uncritical as believing everything.

## When to use

- A claim is about to be accepted, cited, or built on, especially a consequential or surprising one.
- The learner asks "is this right?", "does this argument work?", or "what's wrong with this?".
- As the method underneath `challenge`, `interrogate`, `analyse`, and `review`.
- On EXplore's own outputs, including syntheses and panel conclusions.

## Method

1. **Clarify the claim.** Restate it precisely. What exactly is asserted: all, most, or some; always or sometimes; here or everywhere? Name the claim type: empirical, predictive, normative, interpretive, or personal observation. Define terms that carry weight.
2. **Map the argument.** List the stated premises and the conclusion, then the unstated assumptions that must be true for the conclusion to follow. An argument map or a simple list is enough.
3. **Inspect the support.** For each premise, what evidence is offered, what is its source status, and is it relevant, sufficient, and representative (**verify-sources**)? Separate evidence from illustration: one vivid case is an example, not a pattern.
4. **Examine the inference.** Does the conclusion follow from the premises? Explain the gap in plain words rather than naming a fallacy. Common gaps:
   - correlation presented as causation;
   - a narrow sample generalised to everyone;
   - an anecdote treated as a trend;
   - authority or popularity standing in for evidence;
   - two options presented when there are more;
   - a chain of "this leads to that" steps with no support for each link.
5. **Generate alternatives.** What other explanations or interpretations fit the same evidence? What counter-evidence exists? State the strongest version of the opposing view, not the weakest.
6. **Find the cruxes.** Which one or two assumptions or pieces of evidence, if they turned out differently, would change the conclusion? These are where further inquiry pays off.
7. **Calibrate.** How strongly does the conclusion hold, for whom, and under what conditions (**principle-preserve-uncertainty**)?
8. **Return the judgement.** Report what is well supported, what isn't, and what remains open. The learner decides what they conclude.

## Output

A claim analysis for each claim examined:
- the claim, restated, and its type;
- premises and hidden assumptions;
- support and gaps in the support;
- inference problems;
- alternative explanations;
- cruxes;
- a calibrated assessment;
- open questions for the learner.

## Watch for

- Reflexive opposition, or disagreeing to look rigorous.
- Labelling fallacies without explaining the actual problem.
- False balance: treating all views as equally credible regardless of evidence.
- Critiquing the person rather than the claim.
- Applying scrutiny only to claims the learner, or the model, dislikes.

## Related

**evidence-synthesis**, **systems-thinking**, **second-order-thinking**, **reflexive-thinking**, `challenge`, `interrogate`.
