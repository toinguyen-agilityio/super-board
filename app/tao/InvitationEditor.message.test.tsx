import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import InvitationEditor from "./InvitationEditor";

afterEach(cleanup);

const template = { id: "hoa-dao", name: "Hoa đào" };

function setup() {
  render(<InvitationEditor template={template} />);
  const message = screen.getByLabelText("Lời mời") as HTMLTextAreaElement;
  const type = (value: string) => fireEvent.change(message, { target: { value } });
  return { message, type };
}

it("counts emoji as one character each", () => {
  const { type } = setup();
  type("Hẹn gặp bạn 💐💍🎉");
  expect(screen.getByText("Còn 285 ký tự")).toBeTruthy();
});

it("accepts 300 emoji and refuses the 301st with 0 left", () => {
  const { message, type } = setup();
  type("💐".repeat(300));
  expect(screen.getByText("Còn 0 ký tự")).toBeTruthy();
  expect(message.value).toBe("💐".repeat(300));
  type("💐".repeat(301));
  expect(screen.getByText("Còn 0 ký tự")).toBeTruthy();
  expect(message.value).toBe("💐".repeat(300));
});

it("refuses an insert in the middle of a full message instead of cutting its end", () => {
  const { message, type } = setup();
  const full = "a".repeat(150) + "b".repeat(150);
  type(full);
  fireEvent.change(message, {
    target: { value: full.slice(0, 10) + "X" + full.slice(10), selectionStart: 11, selectionEnd: 11 },
  });
  expect(message.value).toBe(full);
  expect(screen.getByText("Còn 0 ký tự")).toBeTruthy();
});

it("counts composed and decomposed Vietnamese the same", () => {
  const { type } = setup();
  const text = "Trân trọng kính mời";
  type(text);
  expect(screen.getByText("Còn 281 ký tự")).toBeTruthy();
  type(text.normalize("NFD"));
  expect(screen.getByText("Còn 281 ký tự")).toBeTruthy();
});

it("counts ZWJ and variation-selector emoji as one", () => {
  const { type } = setup();
  type("👨‍👩‍👧❤️");
  expect(screen.getByText("Còn 298 ký tự")).toBeTruthy();
});

it("leaves plain Vietnamese unchanged", () => {
  const { message, type } = setup();
  type("Trân trọng kính mời");
  expect(message.value).toBe("Trân trọng kính mời");
  expect(screen.getByText("Còn 281 ký tự")).toBeTruthy();
});

it("keeps a 300-character message when the caret sits inside a grapheme cluster", () => {
  const { message, type } = setup();
  const family = "👨‍👩‍👧";
  const full = "a".repeat(298) + family + "b";
  type("a".repeat(298));
  // Caret right after "👨‍": splitting there counts the family as two clusters.
  const caret = 298 + "👨‍".length;
  fireEvent.change(message, { target: { value: full, selectionStart: caret, selectionEnd: caret } });
  expect(message.value).toBe(full);
  expect(screen.getByText("Còn 0 ký tự")).toBeTruthy();
});

it("does not trim during IME composition and applies the limit when it ends", () => {
  const { message, type } = setup();
  const full = "a".repeat(300);
  type(full);
  const composing = full.slice(0, 10) + "â" + full.slice(10);
  fireEvent.compositionStart(message);
  fireEvent.input(message, { target: { value: composing, selectionStart: 11, selectionEnd: 11 }, isComposing: true });
  expect(message.value).toBe(composing);
  fireEvent.compositionEnd(message);
  expect(message.value).toBe(full);
  expect(screen.getByText("Còn 0 ký tự")).toBeTruthy();
});
