---
name: verify-sources
description: "Use whenever a source, citation, quotation, statistic, or claimed finding is about to be relied on, especially one supplied by a model, search tool, or secondary account. Finds the original, saves it to the source register, reads it for the specific claim, assesses credibility and fit, traces important claims to their origin, and records verification status and access limits."
metadata:
  author: Dafydd Jones
  version: "0.1"
  contributors: []
---

# Verify Sources

A source is verified for a claim only when it has been found, saved, and read, and it actually says what the claim needs it to say. Existing is not the same as supporting.

**Why:** Models invent plausible references, attach real authors to papers they didn't write, and summarise papers they never read. Secondary sources drift: a hedged finding becomes a headline, and a statistic loses its population. Search tools see mostly open-access material, so their picture of a literature is partial. A learner who cites an unverified source carries the integrity risk (**principle-ai-is-not-evidence**).

## When to use

- Before any source is cited, quoted, or used to support a claim in the learner's work or in EXplore's research notes.
- When a model, search summary, handoff, or another agent supplies a reference or finding.
- When a claim is consequential, surprising, or suspiciously neat.

`search` finds candidates. This playbook turns candidates into verified, or honestly unverified, sources.

## Method

1. **Find the original.** Locate it through a DOI resolver, the publisher, a library database, or a scholarly index such as Crossref, OpenAlex, or PubMed. Confirm that the title, authors, year, venue, and identifier all match one real item. Common failures:
   - Real authors with the wrong title, or a real title with the wrong year or journal.
   - A DOI that resolves to a different paper.
   - A preprint cited as the published version, or the reverse.
   - A retracted or corrected article. Check for notices.
   - A predatory or unclear venue.
2. **Save it.** Add it to `library/SOURCES.md` with a stable ID (**show-me-your-work**). Record:
   - the full citation;
   - the link or identifier;
   - the access date;
   - the access status: full text read, abstract only, not accessed, paywalled, or not found;
   - who read it: the model, or confirmed by the learner.

   Save a copy only when licensing permits (**principle-protect-data**).
3. **Read it for the claim.** Find the passage, table, or figure that supports the specific claim, and record a locator (page, section, table). Check that the source says it with the same strength, population, conditions, and date. Check that the finding belongs to these authors and isn't their citation of someone else's work.
4. **Assess credibility and fit:**
   - **Type:** peer-reviewed empirical study, review, policy, grey literature, vendor material, news, commentary, or AI output.
   - **Method:** is it appropriate to the claim type?
   - **Who was studied, where, and when.** Would the finding transfer to the learner's context (**principle-cultural-awareness**)?
   - **Funding, affiliations, and interests.**
   - **Currency:** emerging-technology evidence dates quickly.
   - **Independent corroboration, critiques, or replications.**
5. **Trace consequential claims to their origin.** Follow the citation chain back to the original study or data. Note circular citation, several sources that all rest on one origin, and claims that changed as they passed through secondary accounts.
6. **Record the verification status** for each claim–source pair in `CLAIMS.md`:

   | Status | Meaning |
   | --- | --- |
   | Verified | Read, and it supports the claim as stated |
   | Partial | Supports a weaker, narrower, or conditional version |
   | Does not support | The source doesn't say this |
   | Contradicts | The source says the opposite |
   | Unverifiable | It exists but couldn't be accessed |
   | Not found | No matching item located; treat as possibly fabricated |

   Correct any claim that rested on a "does not support", "contradicts", or "not found" source, and tell the learner.
7. **Check the citation itself.** Confirm the in-text citations and reference list match and follow the required style. Never invent a missing page number, DOI, or date; mark it missing.

## Output

A verification table: source ID, claim ID, locator, status, access status, credibility notes, and corrections made. Updates go to `SOURCES.md` and `CLAIMS.md`.

## Watch for

- Treating an abstract as the findings, or a search snippet as the source.
- Describing a paywalled source you couldn't open.
- Counting several articles that repeat one press release as corroboration.
- Checking that a source exists and stopping there.
- Uploading copyrighted full texts to tools without permission.

## Related

**evidence-synthesis** for what the verified sources support together, **principle-preserve-uncertainty**, `search`, `preflight`.
