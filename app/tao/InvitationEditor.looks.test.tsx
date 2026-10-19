import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { palettes } from "@/lib/customise";
import { templates } from "@/lib/templates";
import InvitationEditor from "./InvitationEditor";

afterEach(cleanup);

const preview = () => screen.getByRole("region", { name: "Xem trước thiệp" });
const ornament = () => preview().querySelector("[data-ornament]")?.getAttribute("data-ornament");

it("each template renders its own ornament and card", () => {
  const seen = templates.map((t) => {
    render(<InvitationEditor template={t} />);
    const look = { ornament: ornament(), card: preview().className };
    cleanup();
    return look;
  });
  expect(new Set(seen.map((l) => l.ornament)).size).toBe(templates.length);
  expect(new Set(seen.map((l) => l.card)).size).toBe(templates.length);
});

it("custom palette still applies to every template", () => {
  for (const t of templates) {
    render(<InvitationEditor template={t} />);
    fireEvent.click(screen.getByRole("radio", { name: palettes[1].name }));
    expect(preview().style.color).not.toBe("");
    cleanup();
  }
});
