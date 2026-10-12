import { expect, it } from "vitest";
import { BACKGROUND_MAX_BYTES, backgroundError, fonts, palettes } from "./customise";

const file = (type: string, size: number) => ({ type, size });

it("offers 5 palettes and 3 fonts", () => {
  expect(palettes).toHaveLength(5);
  expect(fonts).toHaveLength(3);
});

it("accepts a JPG or PNG up to 5 MB", () => {
  expect(backgroundError(file("image/jpeg", BACKGROUND_MAX_BYTES))).toBeNull();
  expect(backgroundError(file("image/png", 1024))).toBeNull();
});

it("rejects other types and files over 5 MB in Vietnamese", () => {
  expect(backgroundError(file("image/gif", 1024))).toBe("Ảnh nền phải là tệp JPG hoặc PNG");
  expect(backgroundError(file("image/png", BACKGROUND_MAX_BYTES + 1))).toBe(
    "Ảnh nền không được lớn hơn 5 MB",
  );
});
