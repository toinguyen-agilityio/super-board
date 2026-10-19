export const ratios = [
  { id: "portrait", name: "Dọc 4:5", width: 4, height: 5 },
  { id: "story", name: "Story 9:16", width: 9, height: 16 },
  { id: "square", name: "Vuông 1:1", width: 1, height: 1 },
] as const;
export const qualities = [2, 3] as const;
export const formats = ["png", "pdf"] as const;

export type Ratio = (typeof ratios)[number];
export type Quality = (typeof qualities)[number];
export type Format = (typeof formats)[number];

// Export canvas is 540 CSS px wide, so even 2x is 1080 px wide at every ratio.
export const EXPORT_WIDTH = 540;

export function exportSize(ratio: Ratio) {
  return { width: EXPORT_WIDTH, height: Math.round((EXPORT_WIDTH * ratio.height) / ratio.width) };
}

// "Nguyễn Thị Hằng", "Trần Văn Đức" → "thiep-cuoi-Nguyen-Thi-Hang-Tran-Van-Duc.png"
// "李华", "김민지", "हिन्दी" keep their letters and marks; emoji/symbols and / \ : * ? " < > | are dropped.
function slug(name: string, fallback: string) {
  const result = name
    .normalize("NFD")
    // Strip accents from Latin letters only; NFC then re-joins Hangul and kana.
    .replace(/(\p{Script=Latin})\p{M}+/gu, "$1")
    .normalize("NFC")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{M}\p{N}-]/gu, ""))
    .filter(Boolean)
    .join("-");
  return result || fallback;
}

export function invitationFileName(bride: string, groom: string, format: Format = "png") {
  return `thiep-cuoi-${slug(bride, "co-dau")}-${slug(groom, "chu-re")}.${format}`;
}

// One-page PDF whose page is the JPEG's own shape, so no library is needed.
export function jpegToPdf(jpeg: Uint8Array, pxWidth: number, pxHeight: number): Uint8Array {
  const pageWidth = Math.round(pxWidth * 0.75);
  const pageHeight = Math.round(pxHeight * 0.75);
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (data: Uint8Array | string) => {
    const bytes = typeof data === "string" ? enc.encode(data) : data;
    chunks.push(bytes);
    length += bytes.length;
  };
  const object = (n: number, body: string, stream?: Uint8Array) => {
    offsets[n] = length;
    push(`${n} 0 obj\n${body}`);
    if (stream) {
      push("\nstream\n");
      push(stream);
      push("\nendstream");
    }
    push("\nendobj\n");
  };
  const content = `q ${pageWidth} 0 0 ${pageHeight} 0 0 cm /Im0 Do Q`;

  push("%PDF-1.4\n");
  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  object(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
  );
  object(
    4,
    `<< /Type /XObject /Subtype /Image /Width ${pxWidth} /Height ${pxHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`,
    jpeg,
  );
  object(5, `<< /Length ${content.length} >>`, enc.encode(content));

  const xref = length;
  push(`xref\n0 6\n0000000000 65535 f \n`);
  for (let n = 1; n <= 5; n++) push(`${String(offsets[n]).padStart(10, "0")} 00000 n \n`);
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

  const out = new Uint8Array(length);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const binary = atob(dataUrl.slice(dataUrl.indexOf(",") + 1));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}
