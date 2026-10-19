---
name: file-bug
description: Reproduce a bug in the running app, then file it as a GitHub issue in super-board's bug format (Problem · Context · Evidence · Fix · AC · Risk). Use when someone says "file a bug", "report this bug", "tạo bug", "tạo ticket bug", "/file-bug", or describes broken behaviour they want ticketed.
allowed-tools: Bash(npm run dev *), Bash(git rev-parse *), Bash(node .claude/skills/file-bug/scripts/screenshot.mjs *), Bash(.claude/bin/super-qa-file-bug.sh *)
model: sonnet
---

# file-bug — reproduce first, then ticket

One job: turn "X looks broken" into one GitHub issue that a teammate or `/super-build` can fix
without asking a question. The format is not defined here: it is
`.claude/skills/super-board/references/writing-standard.md` § 3 (Ticket + Bug Evidence).
This skill is the workflow around it.

| Rule | Value |
|---|---|
| Source of truth | what you SAW in the running app. Code reading only adds a "likely cause" line |
| No repro | NEVER file. Report what you tried and stop |
| Evidence | NEVER invent. A row you did not measure says `n/a — <why>` |
| Scope | one bug per ticket |
| Secrets | NEVER read `.env`. No real customer data in inputs or screenshots |
| Filing | show the title and body to the user and wait for an OK before `gh issue create` |

## Steps

1. **Pin the report.** Route, inputs, expected vs actual. Ask one question only if the route or
   the input cannot be guessed.
2. **Run the app.** `npm ci` if `node_modules` is missing, then `npm run dev` on
   `http://localhost:3000`. Reuse a dev server that is already running. Note the branch and
   `git rev-parse --short HEAD` for the Env row.
3. **Reproduce in a real browser, like a user.** Use Claude in Chrome or the browser pane when
   available. Otherwise drive headless Chromium with Playwright (`@playwright/test` is already
   a dev dependency): open the page, click, type, read the result. Capture the browser console.
4. **Vary the input.** Try 2–4 inputs around the failure, including one control that works.
   Run each the same way and keep the observed output for a table.
5. **Screenshot the failure.** Run
   `node .claude/skills/file-bug/scripts/screenshot.mjs <url> docs/super-board/bugs/<yyyy-mm-dd>-<slug>/`
   (add `--mobile` when layout matters). It saves `desktop.png` (1280 wide) and prints the
   browser console for the Logs row. Commit the folder on a branch `evidence/<slug>` and
   push, then embed each image with a raw URL pinned to that commit sha.
   NEVER link it, NEVER upload to an image host.
6. **Find the likely cause, briefly.** Only now open the code. One line in the Evidence
   "Error + stack" row: file and why. No implementation plan.
7. **Write the body.** Copy [assets/bug-body.md](assets/bug-body.md) to `/tmp/bug.md` and
   fill every `<...>`. Title and section rules, and what the validator rejects, are in
   [references/writing-the-body.md](references/writing-the-body.md). Read it before the
   first draft and whenever step 8 fails.
8. **Validate the body.** It must exit 0:
   ```bash
   .claude/bin/super-qa-file-bug.sh --check-body --title "<title>" --body-file /tmp/bug.md
   ```
9. **Confirm, then file.** Show the title and body. After the user's OK:
   ```bash
   gh issue create --repo toinguyen-agilityio/super-board --label bug \
     --title "<title>" --body-file /tmp/bug.md
   ```
   Then put it in the board's Backlog if it is not there yet
   (`gh project item-add 1 --owner toinguyen-agilityio --url <issue-url>`). `/super-board lint`
   decides when it is Ready.
10. **Report** the issue URL and one line on what reproduced.
