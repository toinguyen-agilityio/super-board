// "Nguyễn Thị Hằng", "Trần Văn Đức" → "thiep-cuoi-Nguyen-Thi-Hang-Tran-Van-Duc.png"
// "李华", "김민지" keep their letters; a name with no letters or digits gets a placeholder.
function slug(name: string) {
  return name
    .normalize("NFD")
    // Strip accents from Latin letters only; NFC then re-joins Hangul and kana.
    .replace(/(\p{Script=Latin})\p{M}+/gu, "$1")
    .normalize("NFC")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}-]/gu, ""))
    .filter(Boolean)
    .join("-");
}

export function invitationFileName(bride: string, groom: string) {
  return `thiep-cuoi-${slug(bride) || "co-dau"}-${slug(groom) || "chu-re"}.png`;
}
