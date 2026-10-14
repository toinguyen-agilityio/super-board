// "Nguyễn Thị Hằng", "Trần Văn Đức" → "thiep-cuoi-Nguyen-Thi-Hang-Tran-Van-Duc.png"
// Non-Latin letters/digits (李华, 김민지) are kept; emoji/symbols and / \ : * ? " < > | are dropped.
function slug(name: string, fallback: string) {
  const result = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .normalize("NFC")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}-]/gu, ""))
    .filter(Boolean)
    .join("-");
  return result || fallback;
}

export function invitationFileName(bride: string, groom: string) {
  return `thiep-cuoi-${slug(bride, "co-dau")}-${slug(groom, "chu-re")}.png`;
}
