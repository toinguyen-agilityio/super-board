// "Nguyễn Thị Hằng", "Trần Văn Đức" → "thiep-cuoi-Nguyen-Thi-Hang-Tran-Van-Duc.png"
function slug(name: string) {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Za-z0-9-]/g, ""))
    .filter(Boolean)
    .join("-");
}

export function invitationFileName(bride: string, groom: string) {
  return `thiep-cuoi-${slug(bride)}-${slug(groom)}.png`;
}
