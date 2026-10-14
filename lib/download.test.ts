import { expect, it } from "vitest";
import { invitationFileName } from "./download";

it("strips diacritics and joins words with -", () => {
  expect(invitationFileName("Nguyễn Thị Hằng", "Trần Văn Đức")).toBe(
    "thiep-cuoi-Nguyen-Thi-Hang-Tran-Van-Duc.png",
  );
});

it("collapses extra spaces and drops characters unsafe in file names", () => {
  expect(invitationFileName("  Lan   Anh ", "Minh/Quân?")).toBe("thiep-cuoi-Lan-Anh-MinhQuan.png");
});

it("keeps names that have no Latin letters (#11)", () => {
  expect(invitationFileName("李华", "Trần Văn Đức")).toBe("thiep-cuoi-李华-Tran-Van-Duc.png");
  expect(invitationFileName("김민지", "Park Ji-hoon")).toBe("thiep-cuoi-김민지-Park-Ji-hoon.png");
});

it("falls back to a placeholder when a name has no letters or digits (#11)", () => {
  expect(invitationFileName("😀", "🎉")).toBe("thiep-cuoi-co-dau-chu-re.png");
});

it("still drops characters unsafe in file names next to non-Latin letters (#11)", () => {
  expect(invitationFileName('李/华:*?"<>|\\', "Đức")).toBe("thiep-cuoi-李华-Duc.png");
});
