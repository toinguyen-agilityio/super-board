const PAGE_WIDTH = 595.28; // A4 width in points; the height follows the image aspect.

// Reads the pixel size from the first SOF marker (baseline or progressive JPEG).
function jpegSize(jpeg: Uint8Array) {
  let i = 2;
  while (jpeg[0] === 0xff && jpeg[1] === 0xd8 && i + 9 < jpeg.length) {
    if (jpeg[i] !== 0xff) break;
    const marker = jpeg[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: (jpeg[i + 5] << 8) | jpeg[i + 6], width: (jpeg[i + 7] << 8) | jpeg[i + 8] };
    }
    i += 2 + ((jpeg[i + 2] << 8) | jpeg[i + 3]);
  }
  throw new Error("Not a JPEG");
}

// Wraps a JPEG in a one-page PDF whose page has the image's aspect ratio.
export function jpegToPdf(jpeg: Uint8Array): Uint8Array {
  const { width, height } = jpegSize(jpeg);
  const pageHeight = Math.round((PAGE_WIDTH * height) / width * 100) / 100;
  const content = `q ${PAGE_WIDTH} 0 0 ${pageHeight} 0 0 cm /Im0 Do Q`;
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const add = (chunk: string | Uint8Array) => {
    const bytes = typeof chunk === "string" ? encoder.encode(chunk) : chunk;
    chunks.push(bytes);
    length += bytes.length;
  };
  const object = (n: number, ...body: (string | Uint8Array)[]) => {
    offsets.push(length);
    add(`${n} 0 obj\n`);
    body.forEach(add);
    add("\nendobj\n");
  };

  add("%PDF-1.4\n");
  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  object(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
  );
  object(
    4,
    `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
    jpeg,
    "\nendstream",
  );
  object(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);

  const xref = length;
  add(`xref\n0 6\n0000000000 65535 f \n`);
  offsets.forEach((o) => add(`${String(o).padStart(10, "0")} 00000 n \n`));
  add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

  const pdf = new Uint8Array(length);
  let at = 0;
  for (const c of chunks) {
    pdf.set(c, at);
    at += c.length;
  }
  return pdf;
}
