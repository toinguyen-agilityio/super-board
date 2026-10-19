import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import InvitationEditor from "./InvitationEditor";

afterEach(cleanup);

const template = { id: "hoa-dao", name: "Hoa đào" };

function fillRequired() {
  fireEvent.change(screen.getByLabelText("Tên cô dâu"), { target: { value: "Lan" } });
  fireEvent.change(screen.getByLabelText("Tên chú rể"), { target: { value: "Minh" } });
  fireEvent.change(screen.getByLabelText("Ngày giờ"), { target: { value: "2026-12-20T18:00" } });
  fireEvent.change(screen.getByLabelText("Địa điểm"), { target: { value: "Nhà hàng A" } });
}

it("leaves the optional fields out of the preview and keeps Tải về enabled when empty", () => {
  render(<InvitationEditor template={template} />);
  fillRequired();
  const preview = screen.getByLabelText("Xem trước thiệp");
  expect(preview.textContent).not.toMatch(/Nhà trai|Nhà gái|Âm lịch|Trang phục|Bản đồ/);
  expect((screen.getByRole("button", { name: "Tải về" }) as HTMLButtonElement).disabled).toBe(false);
});

it("shows each filled optional field in the preview", () => {
  render(<InvitationEditor template={template} />);
  fireEvent.change(screen.getByLabelText("Phụ huynh nhà trai"), { target: { value: "Ông Bình" } });
  fireEvent.change(screen.getByLabelText("Phụ huynh nhà gái"), { target: { value: "Bà Hoa" } });
  fireEvent.change(screen.getByLabelText("Ngày âm lịch"), { target: { value: "10/11 Bính Ngọ" } });
  fireEvent.change(screen.getByLabelText("Trang phục"), { target: { value: "Pastel" } });
  fireEvent.change(screen.getByLabelText("Liên kết bản đồ"), { target: { value: "https://maps.app/x" } });
  const text = screen.getByLabelText("Xem trước thiệp").textContent;
  for (const v of ["Ông Bình", "Bà Hoa", "10/11 Bính Ngọ", "Pastel", "https://maps.app/x"]) {
    expect(text).toContain(v);
  }
});

it("shows an inline error for an invalid map link and clears it when fixed", () => {
  render(<InvitationEditor template={template} />);
  fillRequired();
  const input = screen.getByLabelText("Liên kết bản đồ");
  fireEvent.change(input, { target: { value: "not a url" } });
  fireEvent.focusOut(input);
  expect(screen.getByText("Liên kết bản đồ không hợp lệ")).toBeTruthy();
  expect((screen.getByRole("button", { name: "Tải về" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(input, { target: { value: "https://maps.app/x" } });
  expect(screen.queryByText("Liên kết bản đồ không hợp lệ")).toBeNull();
});
