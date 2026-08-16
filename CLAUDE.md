# Claude Code — kickoff for the ffontana.dev rebuild

## Before you start

1. Drop the spec into the repo as `docs/portfolio-spec.md`.
2. Add the `CLAUDE.md` block at the bottom of this file to the repo root.
3. Branch: `git checkout -b p0-positioning`.

Working from a file in the repo rather than pasting the spec into chat matters — Claude Code can re-read it on every task, and it survives context compaction across a long session.

---

## Prompt 1 — orientation (paste this first, run it alone)

```
Read docs/portfolio-spec.md in full before doing anything else. It's an
implementation spec for this portfolio site, derived from an audit of the
live build. It is the source of truth for this work.

Don't write any code yet. First, orient:

1. Map the codebase against the spec. For each of §5's sections (hero,
   stack strip, work, method, archive, contact), tell me which file and
   component renders it.
2. Find where metadata is defined — I need to know if it's static HTML,
   a head component, or framework metadata config.
3. Find how the language switcher works today. The spec (§8) requires
   moving from client-side state to URL segments; tell me how invasive
   that is here.
4. Find the project data — is it a typed array, MDX, JSON, or inline JSX?
   The spec (§5.4) adds `role` and `metrics[]` fields to it.
5. Flag anything in the spec that's wrong about this codebase. The audit
   was done from the outside, via DOM and CSSOM inspection, so it may
   have misread the implementation.

Then give me a P0 plan: the five items in §13 P0, in order, with the
specific files each one touches. Wait for my approval before editing.
```

## Prompt 2 — P0 (after you've approved the plan)

```
Implement §13 P0, items 1-4. Skip item 5 — those are facts I have to
verify myself, not code changes.

Constraints:
- One commit per numbered item, message referencing the spec section
  (e.g. "fix: add h1 and rewrite hero copy (spec §5.1)").
- Ship the copy in the spec verbatim. It's been written for a specific
  audience; don't improve it.
- Don't touch the visual design. §3.1 lists what's deliberately staying:
  the Fraunces/JetBrains Mono pairing, the reduced-motion handling, the
  alt text, the editorial voice. Preserve all of it.
- Where the spec has a [SUPPLY] or [VERIFY] marker, leave a literal
  TODO comment in the code. Do not fill in a plausible value.

After each item, run the acceptance criteria from that spec section
against the built output and tell me pass/fail. For item 2 that means
verifying there is exactly one h1 and that it's the largest text at
every breakpoint.
```

## Prompt 3 — P1

```
P0 is merged. Implement §13 P1, items 6-12.

Item 11 (locale routing) is the largest — do it last and on its own
branch. Items 6-10 and 12 are copy and configuration; batch those.

For item 8, the metrics are already in my résumé and quoted in §5.4 of
the spec. Use those exact numbers and no others.

For item 9, I've decided on [Option A / Option B from §4.2] — apply it
to the site only. I'll handle GitHub and LinkedIn myself.
```

## Prompt 4 — the performance bug

Run this on its own; it's the one open question the audit couldn't resolve.

```
Read §10 of docs/portfolio-spec.md, "Known regression risk."

Browser automation could never screenshot or extract text from the live
page — document_idle timed out at 45 seconds, repeatedly, while
readyState was 'complete' and loadEventEnd was 531ms. Something keeps
the page from ever settling.

Find it. Prime suspects are the three canvas elements and the guided
tour logic — likely a requestAnimationFrame loop with no exit condition,
or a fetch that never resolves. Check for RAF loops that don't cancel on
unmount or on visibilitychange.

Diagnose before you fix, and tell me what you found.
```

---

## `CLAUDE.md` for the repo root

```markdown
# ffontana.dev

Personal portfolio. Currently being repositioned for the US software
engineering market.

## Source of truth

`docs/portfolio-spec.md` is the implementation spec for all current work.
Read it before making changes. Reference spec sections in commit messages.

## Hard rules

1. **Never invent a number.** No metric, team size, date, or percentage
   ships unless it appears in the spec or I've stated it. Spec markers
   `[SUPPLY]` and `[VERIFY]` are blanks — leave a TODO, never a guess.
   This is a credibility artifact; a plausible-sounding invented figure
   is worse than an empty one.

2. **No redesign.** Spec §3.1 lists what stays: Fraunces + JetBrains
   Mono, prefers-reduced-motion handling, full alt coverage, lazy
   loading, the editorial voice. Changes are content, metadata, and IA —
   not aesthetics. The only sanctioned visual change is the type scale
   in §3.2.

3. **Copy ships verbatim.** Prose in the spec is final. Don't rewrite,
   condense, or "improve" it.

4. **Every change has acceptance criteria.** They're in the spec section.
   Verify against the built output, not the source.

## Quality floor (measured, treat as ceilings)

- loadEventEnd ≤ 800ms (currently 531ms)
- DOM nodes ≤ 1,100 (currently 880)
- Exactly one h1 per page
- No horizontal scroll at 390px
- 100% alt coverage on images
- prefers-reduced-motion honored
- Lighthouse: Perf ≥ 90, A11y ≥ 95, SEO ≥ 95

## Stack

React · Tailwind v4 · Vercel 
```

---

## Notes

**Run the prompts in order, in separate turns.** Prompt 1 alone will use a
lot of context reading the codebase — let it finish and approve a plan
before Prompt 2 starts editing.

**The "never invent a number" rule is the important one.** Everything else
is recoverable; a fabricated metric on a portfolio is the kind of thing
that surfaces in an interview.

**Prompt 4 is independent** — run it whenever, it doesn't depend on the
others. 