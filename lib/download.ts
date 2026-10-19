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

export const RATIOS = [
  { id: "portrait", label: "Dọc 4:5", width: 4, height: 5 },
  { id: "story", label: "Story 9:16", width: 9, height: 16 },
  { id: "square", label: "Vuông 1:1", width: 1, height: 1 },
] as const;
export const QUALITIES = [2, 3] as const;
export const FORMATS = ["png", "pdf"] as const;

export type Ratio = (typeof RATIOS)[number];
export type Quality = (typeof QUALITIES)[number];
export type Format = (typeof FORMATS)[number];

// Each quality step is 540 px of output width: 2x gives 1080 px, 3x gives 1620 px.
const BASE_WIDTH = 540;

// The pixel ratio that makes the export at least quality * 540 px wide. html-to-image rounds a fractional
// card width and truncates the canvas, so size from the rounded-down width with one spare pixel.
export function exportPixelRatio(quality: Quality, cardWidth: number) {
  const width = Math.floor(cardWidth);
  if (!width) return quality;
  return Math.ceil(((quality * BASE_WIDTH + 1) / width) * 1000) / 1000;
}

export function invitationFileName(bride: string, groom: string, format: Format = "png") {
  return `thiep-cuoi-${slug(bride, "co-dau")}-${slug(groom, "chu-re")}.${format}`;
}
