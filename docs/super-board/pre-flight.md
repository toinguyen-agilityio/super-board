# Pre-flight — Super-board board #1

Checked 2026-10-12 by `super-board lint`. Each `[ ]` halts `super-board run`.

🔑 Credentials the loop will need:
   [✓] None — #1–#4 are client-side only (no API keys, no login, no database)

🛠  Tools the loop will need:
   [✓] gh CLI authenticated as toinguyen-agilityio (verified; scopes project, repo)
   [✓] Node 20+ — v22.20.0 (verified)
   [✓] npm — 10.9.3 (verified)
   [✓] Playwright Chromium — installed (chromium-1248)

🌐 Environment:
   [✓] No target URL — QA runs against `npm run dev` locally (#1–#4)
   [✓] No environment file needed

⚠️  Not a gate, but fix after #1 merges:
   - `verify_commands` in `.claude/super-board/configs/super-board.json` is empty; set it to
     `["npm ci --silent && npm run typecheck && npm run lint && npm test"]` once #1 lands, so the
     merge gate proves #2–#4 still build against staging.
