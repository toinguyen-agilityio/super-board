import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

it("falls back to code points when Intl.Segmenter is unavailable", async () => {
  vi.stubGlobal("Intl", { ...Intl, Segmenter: undefined });
  vi.resetModules();
  const { countGraphemes, truncateGraphemes } = await import("./message");
  expect(countGraphemes("abc")).toBe(3);
  expect(countGraphemes("💐💍")).toBe(2);
  expect(truncateGraphemes("💐💍🎉", 2)).toBe("💐💍");
});
