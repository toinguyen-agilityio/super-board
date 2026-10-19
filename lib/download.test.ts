import { expect, it } from "vitest";
import { exportSize, invitationFileName, jpegToPdf, ratios } from "./download";

it("strips diacritics and joins words with -", () => {
  expect(invitationFileName("Nguyễn Thị Hằng", "Trần Văn Đức")).toBe(
    "thiep-cuoi-Nguyen-Thi-Hang-Tran-Van-Duc.png",
  );
});

it("collapses extra spaces and drops characters unsafe in file names", () => {
  expect(invitationFileName("  Lan   Anh ", "Minh/Quân?")).toBe("thiep-cuoi-Lan-Anh-MinhQuan.png");
});

it("uses the pdf extension for PDF exports", () => {
  expect(invitationFileName("Lan", "Minh", "pdf")).toBe("thiep-cuoi-Lan-Minh.pdf");
});

it("every ratio gives its own shape on a 540 px canvas (1080 px at 2x)", () => {
  for (const r of ratios) {
    const { width, height } = exportSize(r);
    expect(width * 2).toBeGreaterThanOrEqual(1080);
    expect(width / height).toBeCloseTo(r.width / r.height, 2);
  }
});

it("jpegToPdf writes one page with a consistent xref", () => {
  const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xd9]);
  const text = new TextDecoder("latin1").decode(jpegToPdf(jpeg, 1080, 1350));
  expect(text.startsWith("%PDF-1.4")).toBe(true);
  expect(text.endsWith("%%EOF\n")).toBe(true);
  expect(text.match(/\/Type \/Page\b/g)).toHaveLength(1);
  expect(text).toContain("/MediaBox [0 0 810 1013]");
  const start = Number(text.match(/startxref\n(\d+)/)![1]);
  expect(text.slice(start, start + 4)).toBe("xref");
});
