import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import InvitationEditor from "./InvitationEditor";

afterEach(cleanup);

const template = { id: "hoa-dao", name: "Hoa đào" };
const preview = () => within(screen.getByRole("region", { name: "Xem trước thiệp" }));

it("has 5 labelled fields", () => {
  render(<InvitationEditor template={template} />);
  for (const label of ["Tên cô dâu", "Tên chú rể", "Ngày giờ", "Địa điểm", "Lời mời"]) {
    expect(screen.getByLabelText(label)).toBeTruthy();
  }
});

it("updates the preview as the user types", () => {
  render(<InvitationEditor template={template} />);
  fireEvent.change(screen.getByLabelText("Tên cô dâu"), { target: { value: "Lan" } });
  fireEvent.change(screen.getByLabelText("Tên chú rể"), { target: { value: "Minh" } });
  fireEvent.change(screen.getByLabelText("Địa điểm"), { target: { value: "Nhà hàng Sen" } });
  fireEvent.change(screen.getByLabelText("Ngày giờ"), { target: { value: "2026-12-20T18:00" } });
  fireEvent.change(screen.getByLabelText("Lời mời"), { target: { value: "Trân trọng kính mời" } });
  expect(preview().getByText("Lan")).toBeTruthy();
  expect(preview().getByText("Minh")).toBeTruthy();
  expect(preview().getByText("Nhà hàng Sen")).toBeTruthy();
  expect(preview().getByText("18:00 · 20/12/2026")).toBeTruthy();
  expect(preview().getByText("Trân trọng kính mời")).toBeTruthy();
});

it("shows a Vietnamese error when a required field is left empty", () => {
  render(<InvitationEditor template={template} />);
  const bride = screen.getByLabelText("Tên cô dâu");
  fireEvent.focusOut(bride);
  expect(screen.getByText("Vui lòng nhập tên cô dâu")).toBeTruthy();
  expect(bride.getAttribute("aria-invalid")).toBe("true");
  fireEvent.change(bride, { target: { value: "Lan" } });
  expect(screen.queryByText("Vui lòng nhập tên cô dâu")).toBeNull();
});

it("never shows an error for the optional Lời mời", () => {
  render(<InvitationEditor template={template} />);
  fireEvent.focusOut(screen.getByLabelText("Lời mời"));
  expect(screen.queryByText(/Vui lòng nhập/)).toBeNull();
});

it("caps Lời mời at 300 characters with a remaining counter", () => {
  render(<InvitationEditor template={template} />);
  const message = screen.getByLabelText("Lời mời");
  expect(screen.getByText("Còn 300 ký tự")).toBeTruthy();
  fireEvent.change(message, { target: { value: "x".repeat(320) } });
  expect(screen.getByText("Còn 0 ký tự")).toBeTruthy();
  expect((message as HTMLTextAreaElement).value).toHaveLength(300);
});
