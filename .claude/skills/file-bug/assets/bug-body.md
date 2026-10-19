## Problem
<1–3 sentences: what is wrong, from the user's side>

## Context
- **Where:** <page>, `<route>`
  - a. <first step>
  - b. <next step>
- **Who:** <which users>

![<page> · desktop](<raw URL pinned to the evidence commit sha>)

| Input | Observed |
|---|---|
| <failing input> | <what you saw> |
| <control input> | <works as expected> |

## Evidence
<details><summary>12 rows · <one-line summary></summary>

| Row | Value |
|---|---|
| Error + stack | <error> · <file:line> (likely cause) |
| Request / trace ID | n/a — <why> |
| Sentry | n/a — <why> |
| PostHog replay | n/a — <why> |
| Logs | <browser console or server log line> |
| Screenshots | ![desktop](<raw URL>) |
| HAR / API sample | n/a — <why> |
| Env + release | local dev · <branch> · `<short sha>` |
| First / last seen | <date> · <date> |
| Users affected | n/a — <why> |
| Steps | 1. <step> 2. <step> 3. <step> |
| Expected / actual | <expected> / <actual> |

</details>

## Fix
<the intended change in 1–3 lines, no implementation plan>

## Acceptance Criteria
- [ ] <checkable outcome>
- [ ] <unit or e2e test that covers it>

## Risk
🟢 **Low** · <one line>

## Blocked by
- None.
