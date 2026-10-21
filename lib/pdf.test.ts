import { expect, it } from "vitest";
import { jpegToPdf } from "./pdf";

// Minimal JPEG: SOI, SOF0 (8-bit, height 500, width 400, 3 components), EOI.
const jpeg = new Uint8Array([
  0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x01, 0xf4, 0x01, 0x90, 0x03,
  0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xff, 0xd9,
]);
const text = (b: Uint8Array) => new TextDecoder("latin1").decode(b);

it("writes a valid single-page PDF around the JPEG", () => {
  const pdf = jpegToPdf(jpeg);
  const s = text(pdf);
  expect(s.startsWith("%PDF-1.4")).toBe(true);
  expect(s.trimEnd().endsWith("%%EOF")).toBe(true);
  expect(s).toContain("/Count 1");
  expect(s).toContain("/Filter /DCTDecode");
  expect(s).toContain("/Width 400 /Height 500");
});

it("has xref offsets that point at each object and a correct startxref", () => {
  const s = text(jpegToPdf(jpeg));
  const start = Number(s.match(/startxref\n(\d+)\n%%EOF/)![1]);
  expect(s.slice(start, start + 4)).toBe("xref");
  const entries = [...s.slice(start).matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]));
  expect(entries).toHaveLength(5);
  entries.forEach((offset, i) => expect(s.slice(offset).startsWith(`${i + 1} 0 obj`)).toBe(true));
  expect(s).toContain("/Size 6");
});

it("sizes the page to the image aspect and embeds the bytes unchanged", () => {
  const pdf = jpegToPdf(jpeg);
  const [, w, h] = text(pdf).match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/)!.map(Number);
  expect(w / h).toBeCloseTo(400 / 500, 2);
  expect(text(pdf)).toContain(text(jpeg));
});

it("rejects data that is not a JPEG", () => {
  expect(() => jpegToPdf(new Uint8Array([1, 2, 3]))).toThrow();
});
