import { expect, it } from "vitest";
import { countGraphemes, truncateGraphemes } from "./message";

it("counts user-perceived characters", () => {
  expect(countGraphemes("")).toBe(0);
  expect(countGraphemes("Trân trọng kính mời")).toBe(19);
  expect(countGraphemes("Trân trọng kính mời".normalize("NFD"))).toBe(19);
  expect(countGraphemes("Hẹn gặp bạn 💐💍🎉")).toBe(15);
  expect(countGraphemes("❤️".repeat(5))).toBe(5);
  expect(countGraphemes("👨‍👩‍👧")).toBe(1);
});

it("truncates to the first n graphemes without splitting one", () => {
  expect(truncateGraphemes("abc", 5)).toBe("abc");
  expect(truncateGraphemes("abcdef", 3)).toBe("abc");
  expect(truncateGraphemes("💐💍🎉", 2)).toBe("💐💍");
  expect(truncateGraphemes("a👨‍👩‍👧b", 2)).toBe("a👨‍👩‍👧");
  expect(truncateGraphemes("êx".repeat(2), 1)).toBe("ê");
});
