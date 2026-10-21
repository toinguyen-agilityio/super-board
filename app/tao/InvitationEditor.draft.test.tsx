import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import InvitationEditor from "./InvitationEditor";

const template = { id: "hoa-dao", name: "Hoa đào" };

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const field = (label: string) => screen.getByLabelText(label) as HTMLInputElement;

it("restores the fields, colour and font after a reload", () => {
  const first = render(<InvitationEditor template={template} />);
  fireEvent.change(field("Tên cô dâu"), { target: { value: "Lan" } });
  fireEvent.change(field("Địa điểm"), { target: { value: "Nhà hàng Sen" } });
  fireEvent.click(screen.getByLabelText("Đỏ son"));
  fireEvent.click(screen.getByLabelText("Dancing Script"));
  first.unmount();

  render(<InvitationEditor template={template} />);
  expect(field("Tên cô dâu").value).toBe("Lan");
  expect(field("Địa điểm").value).toBe("Nhà hàng Sen");
  expect(field("Đỏ son").checked).toBe(true);
  expect(field("Dancing Script").checked).toBe(true);
});

it("clears the draft and the form with 'Làm lại từ đầu'", () => {
  const first = render(<InvitationEditor template={template} />);
  fireEvent.change(field("Tên cô dâu"), { target: { value: "Lan" } });
  fireEvent.click(screen.getByLabelText("Đỏ son"));
  fireEvent.click(screen.getByRole("button", { name: "Làm lại từ đầu" }));
  expect(field("Tên cô dâu").value).toBe("");
  expect(field("Đỏ son").checked).toBe(false);
  first.unmount();

  render(<InvitationEditor template={template} />);
  expect(field("Tên cô dâu").value).toBe("");
});

it("keeps a separate draft per template", () => {
  const first = render(<InvitationEditor template={template} />);
  fireEvent.change(field("Tên cô dâu"), { target: { value: "Lan" } });
  first.unmount();

  render(<InvitationEditor template={{ id: "co-dien", name: "Cổ điển" }} />);
  expect(field("Tên cô dâu").value).toBe("");
});

it("ignores a corrupt draft", () => {
  localStorage.setItem("thiep-draft:hoa-dao", "{not json");
  render(<InvitationEditor template={template} />);
  expect(field("Tên cô dâu").value).toBe("");
});

it("still works when localStorage throws", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  render(<InvitationEditor template={template} />);
  fireEvent.change(field("Tên cô dâu"), { target: { value: "Lan" } });
  expect(field("Tên cô dâu").value).toBe("Lan");
  fireEvent.click(screen.getByRole("button", { name: "Làm lại từ đầu" }));
  expect(field("Tên cô dâu").value).toBe("");
});
