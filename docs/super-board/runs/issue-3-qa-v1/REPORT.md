# Issue #3 · QA v1 · head 647f83a

| AC | Result | Proof |
|---|---|---|
| AC1 palette | ✅ | `app/tao/InvitationEditor.customise.test.tsx:28` · `e2e/customise.spec.ts:30` (names `rgb(0, 121, 107)`) |
| AC2 font + diacritics | ✅ | `e2e/customise.spec.ts:10` — all 3 web fonts load and cover "Nguyễn Thị Hằng" |
| AC3 background upload | ✅ | `e2e/customise-gaps.spec.ts:21` — real browser: 5 MB PNG accepted, 5 MB + 1 and GIF refused in Vietnamese, old background kept |
| AC4 Xoá ảnh nền | ✅ | `e2e/customise-gaps.spec.ts:42` — computed background back to `none`, button disabled again |
| AC5 typed values kept | ✅ | `e2e/customise-gaps.spec.ts:42` · `app/tao/InvitationEditor.customise.test.tsx:68` |

Runs: typecheck ✅ · lint ✅ · vitest 24/24 · playwright 25/25 (22 suite + 3 screenshot runs, not committed).
Mutation: `size > MAX` → `>=` turns `customise-gaps.spec.ts:21` red; restored.

Test gaps (not written):
- Medium: `image/jpg` or empty MIME from some OS pickers is refused (`lib/customise.ts:20`) — witness: a `.jpg` with `type=""`.
- Low: unit test AC1 asserts `color` only non-empty (`InvitationEditor.customise.test.tsx:31`); e2e pins the accent value.
