# QA v1 · issue #2 · base `f8bbe3e`

| AC | Result | Proof |
|---|---|---|
| 1 five labelled fields | ✅ | app/tao/InvitationEditor.test.tsx:10 (getByLabelText for all 5) |
| 2 preview updates as you type, no submit | ✅ | InvitationEditor.test.tsx:17 · e2e/editor-gaps.spec.ts:10 all 5 fields in Chromium, 0 buttons |
| 3 empty required + blur → VN error under field | ✅ | InvitationEditor.gaps.test.tsx:17 each of 4 fields, error is next sibling + aria-describedby · :30 whitespace-only · e2e/editor.spec.ts:20 |
| 4 Lời mời ≤ 300 + counter | ✅ | InvitationEditor.gaps.test.tsx:38 299/300/301 · e2e/editor-gaps.spec.ts:23 typed 305 → 300, "Còn 0 ký tự" |
| 5 side by side ≥ 1024, stacked at 375 | ✅ | e2e/editor.spec.ts:27, :36 · e2e/editor-gaps.spec.ts:31 (1920) · desktop/tablet/mobile.png |

- Unit: 15/15 (test.log). typecheck, lint exit 0.
- e2e: 19/19 (e2e-full.log) = 16 committed specs + 3 scratch screenshot specs (not committed).
- Mutation check: dropping `.trim()` and the `slice(0, 300)` guard turns gaps tests :30 and :38 red; restored.
- Test gaps (not written): Low · invalid/partial `datetime-local` value shows the "Ngày giờ" placeholder (browser blocks such input).
