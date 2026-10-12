# super-board — project overview

| Item | Value |
|---|---|
| Repo | `toinguyen-agilityio/super-board` (private) |
| Board | [Super-board board #1](https://github.com/users/toinguyen-agilityio/projects/1) |
| Base branch | `staging` (cut from `main`; `main` is push-protected) |
| Stack | Next.js 16 (App Router) + TypeScript + Tailwind CSS 4, client-side only, Vietnamese UI |
| Entry points | `app/page.tsx` (`/` template picker) · `app/tao/page.tsx` (`/tao?mau=<id>` editor) · `lib/templates.ts` |
| Build / test | `npm ci` · `npm run typecheck` · `npm run lint` · `npm test` (Vitest) · `npm run e2e` (Playwright, builds and serves on port 3100) |

Update this file when the stack, entry points or scripts change.
