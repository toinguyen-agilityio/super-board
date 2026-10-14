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

export function invitationFileName(bride: string, groom: string) {
  return `thiep-cuoi-${slug(bride, "co-dau")}-${slug(groom, "chu-re")}.png`;
}
