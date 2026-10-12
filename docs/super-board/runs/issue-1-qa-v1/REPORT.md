# QA v1 · issue #1 · base `f6bc07c`

| AC | Result | Proof |
|---|---|---|
| 1 scripts exit 0 after `npm ci` | ✅ | npm-ci.log, typecheck.log, lint.log, test.log (4/4 Vitest) |
| 2 three cards, VN name + thumbnail | ✅ | app/page.test.tsx; e2e/picker-gaps.spec.ts "every card thumbnail actually loads"; desktop.png |
| 3 click → `/tao?mau=<id>` | ✅ | e2e/picker-gaps.spec.ts, one test per template |
| 4 `/tao` heading + name; bad `mau` → `/` | ✅ | e2e/picker.spec.ts; picker-gaps.spec.ts missing/repeated `mau`; tao-mobile.png |
| 5 375 px one column, no h-scroll | ✅ | e2e/picker.spec.ts "cards stack…"; mobile.png |

e2e: 9/9 pass (e2e-full.log; screenshot specs were run from a scratch file, not committed).
