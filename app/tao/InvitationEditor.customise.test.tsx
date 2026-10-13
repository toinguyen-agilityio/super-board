import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fonts, palettes } from "@/lib/customise";
import InvitationEditor from "./InvitationEditor";

const template = { id: "hoa-dao", name: "Hoa đào" };
const preview = () => screen.getByRole("region", { name: "Xem trước thiệp" });
const upload = (name: string, type: string, size: number) => {
  const f = new File(["x"], name, { type });
  Object.defineProperty(f, "size", { value: size });
  fireEvent.change(screen.getByLabelText("Ảnh nền"), { target: { files: [f] } });
};

let n = 0;
beforeEach(() => {
  vi.stubGlobal("URL", Object.assign(URL, {
    createObjectURL: vi.fn(() => `blob:test/${++n}`),
    revokeObjectURL: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("a palette changes the preview text and accent colours", () => {
  render(<InvitationEditor template={template} />);
  const p = palettes[1];
  fireEvent.click(screen.getByRole("radio", { name: p.name }));
  expect(preview().style.color).not.toBe("");
  expect(preview().style.getPropertyValue("--accent")).toBe(p.accent);
});

it("a font changes the preview font family", () => {
  render(<InvitationEditor template={template} />);
  const f = fonts[2];
  fireEvent.click(screen.getByRole("radio", { name: f.name }));
  expect(preview().style.fontFamily).toContain(f.variable);
});

it("a JPG under 5 MB becomes the preview background", () => {
  render(<InvitationEditor template={template} />);
  upload("anh.jpg", "image/jpeg", 1024);
  expect(preview().style.backgroundImage).toContain("blob:test/");
});

it("a bad file shows a Vietnamese error and keeps the old background", () => {
  render(<InvitationEditor template={template} />);
  upload("anh.png", "image/png", 1024);
  const before = preview().style.backgroundImage;
  upload("anh.gif", "image/gif", 1024);
  expect(screen.getByRole("alert").textContent).toBe("Ảnh nền phải là tệp JPG hoặc PNG");
  expect(preview().style.backgroundImage).toBe(before);
  upload("to.jpg", "image/jpeg", 5 * 1024 * 1024 + 1);
  expect(screen.getByRole("alert").textContent).toBe("Ảnh nền không được lớn hơn 5 MB");
  expect(preview().style.backgroundImage).toBe(before);
});

it("Xoá ảnh nền restores the template default background", () => {
  render(<InvitationEditor template={template} />);
  upload("anh.png", "image/png", 1024);
  fireEvent.click(screen.getByRole("button", { name: "Xoá ảnh nền" }));
  expect(preview().style.backgroundImage).toBe("");
});

it("customising keeps every typed value", () => {
  render(<InvitationEditor template={template} />);
  const values: Record<string, string> = {
    "Tên cô dâu": "Nguyễn Thị Hằng",
    "Tên chú rể": "Minh",
    "Ngày giờ": "2026-12-20T18:00",
    "Địa điểm": "Nhà hàng Sen",
    "Lời mời": "Trân trọng kính mời",
  };
  for (const [label, value] of Object.entries(values)) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.click(screen.getByRole("radio", { name: palettes[3].name }));
  fireEvent.click(screen.getByRole("radio", { name: fonts[1].name }));
  upload("anh.png", "image/png", 1024);
  fireEvent.click(screen.getByRole("button", { name: "Xoá ảnh nền" }));
  for (const [label, value] of Object.entries(values)) {
    expect((screen.getByLabelText(label) as HTMLInputElement).value).toBe(value);
  }
});
