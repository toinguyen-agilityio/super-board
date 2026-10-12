import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import Home from "./page";
import { templates } from "@/lib/templates";

it("shows 3 template cards linking to the editor", () => {
  render(<Home />);
  const cards = screen.getAllByRole("link");
  expect(cards).toHaveLength(3);
  cards.forEach((card, i) => {
    const t = templates[i];
    expect(card.getAttribute("href")).toBe(`/tao?mau=${t.id}`);
    expect(within(card).getByRole("heading").textContent).toBe(t.name);
    expect(within(card).getByRole("img").getAttribute("alt")).toBe(`Mẫu ${t.name}`);
  });
});
