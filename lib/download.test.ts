import { expect, it } from "vitest";
import { FORMATS, QUALITIES, RATIOS, exportPixelRatio, invitationFileName } from "./download";

it("strips diacritics and joins words with -", () => {
  expect(invitationFileName("Nguyễn Thị Hằng", "Trần Văn Đức")).toBe(
    "thiep-cuoi-Nguyen-Thi-Hang-Tran-Van-Duc.png",
  );
});

it("collapses extra spaces and drops characters unsafe in file names", () => {
  expect(invitationFileName("  Lan   Anh ", "Minh/Quân?")).toBe("thiep-cuoi-Lan-Anh-MinhQuan.png");
});

it("keeps CJK names as typed", () => {
  expect(invitationFileName("李华", "Trần Văn Đức")).toBe("thiep-cuoi-李华-Tran-Van-Duc.png");
  expect(invitationFileName("김민지", "Park Ji-hoon")).toBe("thiep-cuoi-김민지-Park-Ji-hoon.png");
});

it("falls back to placeholders when a name has no letters or digits", () => {
  expect(invitationFileName("😀", "🎉")).toBe("thiep-cuoi-co-dau-chu-re.png");
  expect(invitationFileName("😀", "Minh")).toBe("thiep-cuoi-co-dau-Minh.png");
  expect(invitationFileName("Lan", "  ")).toBe("thiep-cuoi-Lan-chu-re.png");
});

it("removes every file-unsafe character", () => {
  expect(invitationFileName('a/b\\c:d*e?f"g<h>i|j', "Minh")).toBe("thiep-cuoi-abcdefghij-Minh.png");
});

it("still drops characters unsafe in file names next to non-Latin letters (#11)", () => {
  expect(invitationFileName('李/华:*?"<>|\\', "Đức")).toBe("thiep-cuoi-李华-Duc.png");
});

it("keeps the marks that non-Latin scripts need (#11)", () => {
  expect(invitationFileName("हिन्दी", "Minh")).toBe("thiep-cuoi-हिन्दी-Minh.png");
  // Decomposed input: か + combining voiced mark, and Hangul jamo.
  expect(invitationFileName("が", "Minh")).toBe("thiep-cuoi-が-Minh.png");
  expect(invitationFileName("각", "Minh")).toBe("thiep-cuoi-각-Minh.png");
});

it("swaps only the extension for the chosen format", () => {
  expect(invitationFileName("Nguyễn Thị Hằng", "Trần Văn Đức", "pdf")).toBe(
    "thiep-cuoi-Nguyen-Thi-Hang-Tran-Van-Duc.pdf",
  );
  expect(invitationFileName("😀", "Minh", "png")).toBe("thiep-cuoi-co-dau-Minh.png");
});

it("offers 4:5, 9:16 and 1:1, 2x and 3x, PNG and PDF", () => {
  expect(RATIOS.map((r) => `${r.width}:${r.height}`)).toEqual(["4:5", "9:16", "1:1"]);
  expect(QUALITIES).toEqual([2, 3]);
  expect(FORMATS).toEqual(["png", "pdf"]);
});

it("picks a pixel ratio so 2x exports 1080 px wide and 3x exports 1620 px wide", () => {
  expect(exportPixelRatio(2, 0)).toBe(2);
  for (const w of [280, 327, 375, 476, 499.6, 500.4, 540, 768, 1200.7]) {
    expect(Math.floor(Math.floor(w) * exportPixelRatio(2, w))).toBeGreaterThanOrEqual(1080);
    expect(Math.floor(Math.floor(w) * exportPixelRatio(3, w))).toBeGreaterThanOrEqual(1620);
    expect(exportPixelRatio(3, w)).toBeGreaterThan(exportPixelRatio(2, w));
  }
});
