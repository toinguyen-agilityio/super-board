import { describe, expect, it } from "vitest";
import { findTemplate, templates } from "./templates";

describe("templates", () => {
  it("has exactly 3 templates with unique ids", () => {
    expect(templates).toHaveLength(3);
    expect(new Set(templates.map((t) => t.id)).size).toBe(3);
  });

  it("finds a template by id", () => {
    expect(findTemplate("hoa-dao")?.name).toBe("Hoa đào");
  });

  it("returns undefined for an unknown, missing or repeated id", () => {
    expect(findTemplate("khong-co")).toBeUndefined();
    expect(findTemplate(undefined)).toBeUndefined();
    expect(findTemplate(["co-dien", "hoa-dao"])).toBeUndefined();
  });
});
