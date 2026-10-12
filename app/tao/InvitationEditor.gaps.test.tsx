import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import InvitationEditor from "./InvitationEditor";

afterEach(cleanup);

const template = { id: "hoa-dao", name: "Hoa đào" };

const required = [
  { label: "Tên cô dâu", error: "Vui lòng nhập tên cô dâu" },
  { label: "Tên chú rể", error: "Vui lòng nhập tên chú rể" },
  { label: "Ngày giờ", error: "Vui lòng chọn ngày giờ" },
  { label: "Địa điểm", error: "Vui lòng nhập địa điểm" },
];

for (const f of required) {
  it(`blurring an empty "${f.label}" shows its error right under that field`, () => {
    render(<InvitationEditor template={template} />);
    const input = screen.getByLabelText(f.label);
    expect(screen.queryByText(f.error)).toBeNull();
    fireEvent.focusOut(input);
    const error = screen.getByText(f.error);
    expect(input.nextElementSibling).toBe(error);
    expect(input.getAttribute("aria-describedby")).toBe(error.id);
    // Only the blurred field complains.
    expect(screen.getAllByText(/^Vui lòng/)).toHaveLength(1);
  });
}

it("treats a whitespace-only required field as empty", () => {
  render(<InvitationEditor template={template} />);
  const groom = screen.getByLabelText("Tên chú rể");
  fireEvent.change(groom, { target: { value: "   " } });
  fireEvent.focusOut(groom);
  expect(screen.getByText("Vui lòng nhập tên chú rể")).toBeTruthy();
});

it("counts down as Lời mời is typed, at 299 / 300 / 301 boundaries", () => {
  render(<InvitationEditor template={template} />);
  const message = screen.getByLabelText("Lời mời") as HTMLTextAreaElement;
  fireEvent.change(message, { target: { value: "Thân mời" } });
  expect(screen.getByText("Còn 292 ký tự")).toBeTruthy();
  fireEvent.change(message, { target: { value: "x".repeat(299) } });
  expect(screen.getByText("Còn 1 ký tự")).toBeTruthy();
  fireEvent.change(message, { target: { value: "x".repeat(300) } });
  expect(screen.getByText("Còn 0 ký tự")).toBeTruthy();
  fireEvent.change(message, { target: { value: "x".repeat(301) } });
  expect(message.value).toHaveLength(300);
  expect(screen.getByText("Còn 0 ký tự")).toBeTruthy();
});
