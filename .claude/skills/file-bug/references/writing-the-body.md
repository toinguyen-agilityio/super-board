# Writing the bug body

The format is owned by `.claude/skills/super-board/references/writing-standard.md` § 3.
This file is the short version for `/file-bug`. Start from
[../assets/bug-body.md](../assets/bug-body.md) and replace every `<...>`.

## Title

`🐛 [bug] <scope>: <what is wrong>`, at most 70 characters, no ticket number.

## Sections

- `## Problem`: 1–3 sentences from the user's side.
- `## Context`: `- **Where:**` with lettered steps (one per line, NEVER arrows),
  `- **Who:**`, the embedded screenshot, then the input/output table from step 4.
- `## Evidence`: the folded 12-row table. All 12 rows; a row you did not measure says
  `n/a — <why>`.
- `## Fix`: 1–3 lines, no implementation plan.
- `## Acceptance Criteria`: 2–5 `- [ ]` lines, one of them a unit or e2e test.
- `## Risk`: 🟢/🟡/🔴 and one line.
- `## Blocked by`: `- #N — why` bullets, or exactly `- None.`

## What the validator rejects

`.claude/bin/super-qa-file-bug.sh --check-body` exits non-zero when:

- a required section is missing
- Acceptance Criteria has no `- [ ]` item
- Context has no `Where:` line, no lettered steps, or uses `→`
- Evidence is not inside `<details>` or misses a row
- any `<placeholder>`, `TBD` or `TODO:` is left in the prose

## Example

[#11 🐛 download: PNG file name drops non-Latin names](https://github.com/toinguyen-agilityio/super-board/issues/11):
reproduced by clicking through `/tao?mau=co-dien` with bride `李华`; variants table with a
Korean name, emoji and a Vietnamese control; Evidence rows that were not measured say
`n/a — <why>`.
