---
name: evidence-synthesis
description: "Use when several sources, studies, agents, or models bear on the same question, in research, analyse, compare, panel, or swarm. Builds an evidence matrix, checks whether sources are independent, weighs quality and fit, assigns each claim a status, and preserves contradictions and gaps. Produces research notes and evidence maps, not submission prose."
metadata:
  author: Dafydd Jones
  version: "0.1"
  contributors: []
---

# Evidence Synthesis

Work out what the body of evidence supports together: which claims are established, which are tentative, which are contested, and what is missing. The result is a map for the learner's judgement, not a verdict and not an essay.

**Why:** One strong study, ten articles repeating it, and three models summarising those articles can look like overwhelming support. They are one piece of evidence. Real bodies of evidence disagree for reasons: different methods, populations, definitions, and dates. A synthesis that averages them into one smooth answer hides exactly what the learner needs to judge (**principle-preserve-disagreement**).

## When to use

- Any time two or more sources bear on the same question.
- Integrating delegated contributions in `panel` or `swarm`.
- Before the learner draws a conclusion from "the literature".

This is not a formal systematic review or meta-analysis. If the learner's assessment requires one, say so, and point to the relevant reporting standard, such as PRISMA, and its methods.

## Method

1. **Fix the question and boundaries.** State the question from **question-framing**, which sources are in scope, and how they were found. Search coverage limits everything that follows.
2. **Inventory the sources.** Only verified or explicitly flagged sources go in (**verify-sources**). For each, note:
   - its ID and type;
   - its method;
   - its population and setting;
   - its date;
   - its access status (read in full, abstract only, or not accessed).
3. **Extract findings.** For each source, record the specific finding relevant to each sub-question, with a locator and its conditions and limits.
4. **Check independence.** Group sources that share authors, data, funders, or an originating study, or that cite each other in a loop. Treat a dependent chain as one line of evidence. Treat model or agent agreement the same way (**principle-ai-is-not-evidence**).
5. **Build the evidence matrix.** Rows are claims or sub-questions; columns are sources or independent lines of evidence. Each cell says supports, contradicts, qualifies, or silent, with a locator.
6. **Weigh, don't count.** For each claim, consider:
   - consistency across independent lines;
   - method quality for the claim type;
   - directness;
   - sample and context fit, including who was studied (**principle-cultural-awareness**);
   - recency;
   - conflicts of interest.
7. **Assign each claim a status, in words:**

   | Status | Meaning |
   | --- | --- |
   | Well supported | Several independent, direct, good-quality lines agree |
   | Supported | Converging indirect evidence, or one strong direct line |
   | Tentative | A reasonable reading with thin or indirect support |
   | Speculative | Plausible, but other explanations fit as well |
   | Contested | Credible evidence points different ways |
   | Unknown | Searched for and not found; say what was searched |

   Keep interpretation separate from what the sources state.
8. **Explain the disagreements.** For contested claims, say what might account for the difference: method, population, setting, definitions, time, or values. Say what evidence could resolve it.
9. **Map the gaps:** populations, settings, periods, or perspectives with no evidence; sources that couldn't be accessed; search limits.
10. **Write research notes.** List claims with their status, sources, locators, disagreements, and gaps, and update `CLAIMS.md`. The learner decides what the synthesis means for their argument.

## Output

An evidence matrix, a claim-status list, disagreements with possible explanations, and a gaps list. Label it clearly as working research notes.

## Watch for

- Vote-counting, or treating the most-cited source as the most correct.
- Including sources nobody read.
- Merging findings that use incompatible definitions of the same term.
- Letting the best-written source dominate.
- Favouring the learner's, or the model's, prior view.
- Presenting a tidy consensus the evidence doesn't have.

## Attribution

The claim-status tiers adapt the confidence framework in pstack's `why` skill (`references/epistemics.md`, pstack-claude revision `eefcfaf`, MIT licence, © 2026 Lauren Tan and Michael Denyer), rewritten for research evidence.

## Related

**critical-thinking**, **systems-thinking**, **principle-preserve-uncertainty**, `research`, `analyse`, `compare`, `panel`, `swarm`.
