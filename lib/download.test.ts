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

it("keeps CJK names as typed", () => {
  expect(invitationFileName("李华", "Trần Văn Đức")).toBe("thiep-cuoi-李华-Tran-Van-Duc.png");
  expect(invitationFileName("김민지", "Park Ji-hoon")).toBe("thiep-cuoi-김민지-Park-Ji-hoon.png");
});

it("falls back to placeholders when a name has no letters or digits", () => {
  expect(invitationFileName("😀", "🎉")).toBe("thiep-cuoi-co-dau-chu-re.png");
  expect(invitationFileName("😀", "Minh")).toBe("thiep-cuoi-co-dau-Minh.png");
  expect(invitationFileName("Lan", "  ")).toBe("thiep-cuoi-Lan-chu-re.png");
});

it("removes every file-unsafe character", () => {
  expect(invitationFileName('a/b\\c:d*e?f"g<h>i|j', "Minh")).toBe("thiep-cuoi-abcdefghij-Minh.png");
});
