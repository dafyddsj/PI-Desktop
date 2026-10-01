---
name: summarise
description: "Use for /summarise or when the learner wants material condensed: 'summarise this paper', 'give me the key points', 'what does this report say'. Produces a faithful, purpose-appropriate summary that keeps attribution, qualifications, and disagreements, separates summary from commentary, and never implies unread material was reviewed. Long material can be split across parallel agents with locators."
metadata:
  author: Dafydd Jones
  version: "0.1"
  contributors: []
---

# Summarise

Condense material faithfully for a purpose. Keep who said what, how confidently, and under what conditions. Add nothing the source doesn't say.

**Boundary:** Preserve attribution, qualifications, and disagreements. Don't introduce unsupported claims, and don't imply unread material was reviewed.

## Start

Follow [Start every task](../explore-mode/SKILL.md#start-every-task). Establish the purpose (notes for the learner, a briefing, a comparison), the audience, and the length. Confirm what material is being summarised and that it is actually accessible. A title or abstract is not the source ([AI Is Not Evidence](../principle-ai-is-not-evidence/SKILL.md)). Check that the material may be processed this way ([Protect Data](../principle-protect-data/SKILL.md)).

## Steps

1. **Read the whole thing.** If it's too long for one pass, split it into sections.
   - **Delegate:** where the environment allows, give each section to a separate agent with the same purpose and format. Each returns key points with locators. The lead integrates the sections and checks that nothing contradicts across them.

   If only part was read, say which part.
2. **Extract** the main claims, the evidence behind them, the methods, the qualifications and limits, and any disagreements or alternative views the source itself presents.
3. **Keep proportion.** Give the summary the source's emphasis, not the most interesting or most agreeable part.
4. **Write the summary.** Attribute throughout ("the authors argue", "the report estimates"). Hedges and scope conditions survive ([Preserve Uncertainty](../principle-preserve-uncertainty/SKILL.md)). Use locators for key points.
5. **Separate commentary.** Put any evaluation (strengths, weaknesses, relevance to the learner's question) in its own clearly labelled section, or leave it out.
6. **Check faithfulness.** Every sentence should trace to a locator. Remove anything that doesn't. Note what was omitted and why.
7. **Record.** If the summary will be relied on, update the source's access status and add material claims ([show-me-your-work](../../playbooks/show-me-your-work.md)).

## Output

A summary with attribution and locators, an optional labelled commentary section, a note on anything omitted or unread, and a record of any delegation. Summaries are working notes. Material from them used in submitted work must be in the learner's own words and cited ([Learner Authorship](../principle-learner-authorship/SKILL.md)).

## Done when

- Every sentence is traceable.
- Hedges and disagreements survive.
- Summary and commentary are separate.
- Unread parts are declared.
