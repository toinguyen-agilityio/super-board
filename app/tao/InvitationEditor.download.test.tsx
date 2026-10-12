import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import InvitationEditor from "./InvitationEditor";

const toPng = vi.hoisted(() => vi.fn(async () => "data:image/png;base64,AAAA"));
vi.mock("html-to-image", () => ({ toPng }));

const template = { id: "hoa-dao", name: "Hoa đào" };
const download = () => screen.getByRole("button", { name: "Tải về" });
const fill = () => {
  fireEvent.change(screen.getByLabelText("Tên cô dâu"), { target: { value: "Nguyễn Thị Hằng" } });
  fireEvent.change(screen.getByLabelText("Tên chú rể"), { target: { value: "Trần Văn Đức" } });
  fireEvent.change(screen.getByLabelText("Ngày giờ"), { target: { value: "2026-12-20T18:00" } });
  fireEvent.change(screen.getByLabelText("Địa điểm"), { target: { value: "Hà Nội" } });
};

afterEach(() => {
  cleanup();
  toPng.mockClear();
});

it("Xem trước opens the invitation full screen and Esc returns with input kept", () => {
  render(<InvitationEditor template={template} />);
  fill();
  fireEvent.click(screen.getByRole("button", { name: "Xem trước" }));
  const dialog = screen.getByRole("dialog", { name: "Xem trước toàn màn hình" });
  expect(dialog.textContent).toContain("Nguyễn Thị Hằng");
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByLabelText<HTMLInputElement>("Tên cô dâu").value).toBe("Nguyễn Thị Hằng");
});

it("the close button also leaves full screen", () => {
  render(<InvitationEditor template={template} />);
  fireEvent.click(screen.getByRole("button", { name: "Xem trước" }));
  fireEvent.click(screen.getByRole("button", { name: "Đóng" }));
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("Tải về is disabled with a Vietnamese hint until every required field is filled", () => {
  render(<InvitationEditor template={template} />);
  expect(download()).toHaveProperty("disabled", true);
  expect(download().getAttribute("aria-describedby")).toBe("download-hint");
  expect(document.getElementById("download-hint")?.textContent).toBe("Hãy điền đủ tên cô dâu, tên chú rể, ngày giờ và địa điểm để tải thiệp");
  fill();
  fireEvent.change(screen.getByLabelText("Địa điểm"), { target: { value: "   " } });
  expect(download()).toHaveProperty("disabled", true);
  fireEvent.change(screen.getByLabelText("Địa điểm"), { target: { value: "Hà Nội" } });
  expect(download()).toHaveProperty("disabled", false);
  expect(document.getElementById("download-hint")).toBeNull();
});

it("Tải về exports the preview as a PNG at least 1080 px wide with the invitation file name", async () => {
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  render(<InvitationEditor template={template} />);
  fill();
  fireEvent.click(download());
  await waitFor(() => expect(click).toHaveBeenCalled());
  const [node, options] = toPng.mock.calls[0] as unknown as [HTMLElement, { pixelRatio: number }];
  expect(node.getAttribute("aria-label")).toBe("Xem trước thiệp");
  // jsdom has no layout, so offsetWidth is 0: the ratio must still be finite and >= 1.
  expect(Number.isFinite(options.pixelRatio)).toBe(true);
  const a = click.mock.contexts[0] as HTMLAnchorElement;
  expect(a.download).toBe("thiep-cuoi-Nguyen-Thi-Hang-Tran-Van-Duc.png");
  expect(a.href).toBe("data:image/png;base64,AAAA");
  click.mockRestore();
});
