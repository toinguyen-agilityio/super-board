import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import InvitationEditor from "./InvitationEditor";

const toPng = vi.hoisted(() => vi.fn(async () => "data:image/png;base64,AAAA"));
const toJpeg = vi.hoisted(() => vi.fn(async () => "data:image/jpeg;base64,/9j/4AAQ"));
vi.mock("html-to-image", () => ({ toPng, toJpeg }));


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
  toJpeg.mockClear();
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

type Opts = { width: number; height: number; pixelRatio: number };
const exported = (fn: typeof toPng | typeof toJpeg) => (fn.mock.calls[0] as unknown as [HTMLElement, Opts])[1];
const pick = (_group: string, label: string) => fireEvent.click(screen.getByRole("radio", { name: label }));

it("Tải về defaults to a 4:5 PNG at 2x, 1080 px wide, with the invitation file name", async () => {
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  render(<InvitationEditor template={template} />);
  fill();
  fireEvent.click(download());
  await waitFor(() => expect(click).toHaveBeenCalled());
  const node = (toPng.mock.calls[0] as unknown as [HTMLElement])[0];
  expect(node.getAttribute("aria-label")).toBe("Xem trước thiệp");
  const o = exported(toPng);
  expect(o.width * o.pixelRatio).toBeGreaterThanOrEqual(1080);
  expect(o.width / o.height).toBeCloseTo(4 / 5, 2);
  const a = click.mock.contexts[0] as HTMLAnchorElement;
  expect(a.download).toBe("thiep-cuoi-Nguyen-Thi-Hang-Tran-Van-Duc.png");
  expect(a.href).toBe("data:image/png;base64,AAAA");
  click.mockRestore();
});

it.each([
  ["Story 9:16", 9 / 16],
  ["Vuông 1:1", 1],
  ["Dọc 4:5", 4 / 5],
])("ratio %s exports an image of that ratio at least 1080 px wide", async (label, expected) => {
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  render(<InvitationEditor template={template} />);
  fill();
  pick("ratio", label);
  fireEvent.click(download());
  await waitFor(() => expect(click).toHaveBeenCalled());
  const o = exported(toPng);
  expect(o.width / o.height).toBeCloseTo(expected, 2);
  expect(o.width * o.pixelRatio).toBeGreaterThanOrEqual(1080);
  click.mockRestore();
});

it("quality 3x raises the pixel ratio", async () => {
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  render(<InvitationEditor template={template} />);
  fill();
  pick("quality", "3x");
  fireEvent.click(download());
  await waitFor(() => expect(click).toHaveBeenCalled());
  expect(exported(toPng).pixelRatio).toBe(3);
  click.mockRestore();
});

it("choosing PDF downloads a one-page .pdf with the invitation file name", async () => {
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  const createObjectURL = vi.fn((blob: Blob) => (blobs.push(blob), "blob:pdf"));
  const blobs: Blob[] = [];
  vi.stubGlobal("URL", Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() }));
  render(<InvitationEditor template={template} />);
  fill();
  pick("format", "PDF");
  fireEvent.click(download());
  await waitFor(() => expect(click).toHaveBeenCalled());
  expect(toPng).not.toHaveBeenCalled();
  const a = click.mock.contexts[0] as HTMLAnchorElement;
  expect(a.download).toBe("thiep-cuoi-Nguyen-Thi-Hang-Tran-Van-Duc.pdf");
  expect(blobs[0].type).toBe("application/pdf");
  const text = new TextDecoder("latin1").decode(await blobs[0].arrayBuffer());
  expect(text.startsWith("%PDF-1.4")).toBe(true);
  expect(text.match(/\/Type \/Page\b/g)).toHaveLength(1);
  click.mockRestore();
  vi.unstubAllGlobals();
});
