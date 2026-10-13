# Issue #4 · QA v1 · head 9ed46b6

| AC | Result | Proof |
|---|---|---|
| AC1 full screen, Esc / Đóng keep input | ✅ | `e2e/download.spec.ts:12` · `e2e/download-gaps.spec.ts:130` (palette, font, background kept; focus back on "Xem trước") |
| AC2 file name `thiep-cuoi-<bride>-<groom>.png` | ✅ | `e2e/download.spec.ts:36` · `lib/download.test.ts:4` |
| AC3 PNG ≥ 1080 px, same text/colours/font/background | ❌ | `e2e/download-gaps.spec.ts:178` red: with no uploaded background the PNG is fully transparent (pixels `0,0,0,0`); the preview shows white. Dark viewers render dark text on black (`ac3-fail-transparent-on-dark.png`). With an uploaded background it matches: mean diff 1.8 vs 8.2 for a wrong font (`e2e/download-gaps.spec.ts:82`, `ac3-preview.png` / `ac3-export.png`, 1428×702) |
| AC4 Tải về disabled + Vietnamese hint | ✅ | `e2e/download-gaps.spec.ts:157` (spaces-only names/venue, cleared date) · `ac4-disabled-desktop.png` |

Repro AC3: `app/tao/InvitationEditor.tsx:92` calls `toPng(node, { pixelRatio })` on a `<section>` with no background colour (`previewStyle`, line 119; `previewClass` has none).
Fixed looks like: the exported PNG is opaque white behind the card when no image is uploaded (e.g. `bg-white` on the preview, or `backgroundColor: "#fff"` in `toPng` options), and `e2e/download-gaps.spec.ts:178` goes green.

Runs: typecheck ✅ · lint ✅ · vitest 30/30 · playwright 28/29 (1 red = AC3 gap above). Screenshots: desktop/tablet/mobile full-screen + editor (throwaway spec, not committed).

Test gaps (not written):
- Medium: full-screen card is capped at `max-w-3xl` (768 px) on a 1920 px screen (`InvitationEditor.tsx:300`) — "full screen" holds for the dialog, the invitation itself stays small (`desktop.png`).
- Medium: no focus trap in the dialog — Tab leaves it for the form behind (`aria-modal` only).
- Low: a name made only of unsafe characters gives `thiep-cuoi--Duc.png` (`lib/download.ts:16`).
- Low: export checked in Chromium only; Firefox/WebKit font embedding not run.
