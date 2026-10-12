# Issue #4 · QA v2 · head 0eea8d0

| AC | Result | Proof |
|---|---|---|
| AC1 full screen, Esc / Đóng keep input | ✅ | `e2e/download.spec.ts:12` · `e2e/download-gaps.spec.ts:130` · `desktop.png` / `tablet.png` / `mobile.png` |
| AC2 file name `thiep-cuoi-<bride>-<groom>.png` | ✅ | `e2e/download.spec.ts:28` · `lib/download.test.ts:4` · real download `thiep-cuoi-Nguyen-Thi-Hang-Tran-Van-Duc.png` (`ac3-filename.txt`) |
| AC3 PNG ≥ 1080 px, same text/colours/font/background | ✅ | `e2e/download-gaps.spec.ts:178` now green: no-background PNG is opaque white (`ac3-pass-opaque-on-dark.png`, 1428×702) · with background diff 1.8 vs 8.2 wrong font (`e2e/download-gaps.spec.ts:82`) |
| AC4 Tải về disabled + Vietnamese hint | ✅ | `e2e/download-gaps.spec.ts:157` · `ac4-disabled-desktop.png` |

Runs: typecheck ✅ · lint ✅ · vitest 30/30 · playwright 29/29.

Test gaps (not written):
- Medium: full-screen card capped at `max-w-3xl` (768 px) on a 1920 px screen; the dialog is full screen, the invitation stays small (`desktop.png`).
- Medium: no focus trap in the dialog; Tab can leave it (`aria-modal` only).
- Low: PNG corners outside `rounded-lg` are transparent (visible on a dark viewer, `ac3-pass-opaque-on-dark.png`).
- Low: a name made only of unsafe characters gives `thiep-cuoi--Duc.png` (`lib/download.ts:16`).
- Low: export checked in Chromium only.
