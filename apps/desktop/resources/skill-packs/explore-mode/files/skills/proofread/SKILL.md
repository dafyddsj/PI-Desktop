---
name: proofread
description: "Use for /proofread or when the learner asks for spelling, grammar, punctuation, or consistency checks on their own writing: 'proofread this', 'check my grammar', 'fix typos'. Checks what's permitted first, then returns located mechanical corrections with reasons, kept separate from optional substantive comments. Preserves the learner's voice and variety of English, and never silently rewrites. Long documents can be split across parallel agents that share a style sheet."
metadata:
  author: Dafydd Jones
  version: "0.1"
  contributors: []
---

# Proofread

Find and explain the mechanical errors in the learner's own writing: spelling, grammar, punctuation, and local consistency. Keep their voice, their meaning, and their argument exactly as they are.

**Boundary:** Separate mechanical corrections from optional substantive suggestions. Never silently rewrite arguments or add claims ([Learner Authorship](../principle-learner-authorship/SKILL.md)).

## Start

Follow [Start every task](../explore-mode/SKILL.md#start-every-task). **Check that proofreading is permitted** for this work item. Some assessments restrict it, and the most restrictive applicable rule wins ([Follow Applicable Rules](../principle-follow-applicable-rules/SKILL.md)). If it isn't permitted, say so and offer what is allowed. Confirm the learner's variety of English, the required style guide, and the scope.

## Steps

1. **Build a style sheet** from the text itself: spelling variety, capitalisation, hyphenation, number style, terms and names (including te reo Māori and other languages, used as the learner uses them), and the citation style.
2. **Check the text** for spelling, grammar, punctuation, agreement, tense consistency, repeated or missing words, inconsistency against the style sheet, and citation formatting ([academic-writing](../../playbooks/academic-writing.md), proofreading mode).
3. **Split correction from comment.**
   - A fix that doesn't change meaning is a **correction**.
   - Anything that would change wording beyond the mechanical, alter meaning, or restructure a sentence is a **comment** explaining the issue. It is not a fix.
4. **Delegate long documents.** Where the environment allows, split the document into sections. Each agent gets the same style sheet and rules and returns located corrections. The lead merges them and checks consistency across sections, such as a term spelled two ways in different chapters.
5. **Present the corrections** as a list: location, original, correction, and reason. Put substantive comments in a separate short list. The default is the list, not a corrected copy.
6. **Apply only on request.** If the learner asks for the corrections to be applied, and it's permitted, apply only the listed mechanical corrections and show what changed. Never make unlisted changes.
7. **Record** material assistance ([show-me-your-work](../../playbooks/show-me-your-work.md)).

## Output

- The style sheet.
- A located corrections list with reasons.
- A separate list of substantive comments.
- A note of what was applied, if anything.

## Done when

- Permission was checked.
- Every change is listed and explained.
- Meaning, argument, and voice are untouched.
- Substantive issues are raised as comments, not fixes.
