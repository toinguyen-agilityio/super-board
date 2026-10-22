import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { ThemeToggle } from "./ThemeToggle";

afterEach(() => {
  document.documentElement.classList.remove("dark");
  localStorage.clear();
});

it("toggles the dark class on <html> and remembers the choice", async () => {
  render(<ThemeToggle />);
  const button = screen.getByRole("button", { name: /tối/i });
  expect(button.getAttribute("aria-pressed")).toBe("false");

  fireEvent.click(button);

  expect(document.documentElement.classList.contains("dark")).toBe(true);
  expect(localStorage.getItem("theme")).toBe("dark");
  expect((await screen.findByRole("button", { name: /sáng/i })).getAttribute("aria-pressed")).toBe("true");

  fireEvent.click(screen.getByRole("button", { name: /sáng/i }));
  expect(document.documentElement.classList.contains("dark")).toBe(false);
  expect(localStorage.getItem("theme")).toBe("light");
});
