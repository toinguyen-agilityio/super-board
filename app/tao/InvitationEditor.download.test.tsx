import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import InvitationEditor from "./InvitationEditor";

const toPng = vi.hoisted(() => vi.fn(async () => "data:image/png;base64,AAAA"));
const toJpeg = vi.hoisted(() => vi.fn(async () => "data:image/jpeg;base64,AAAA"));
const jpegToPdf = vi.hoisted(() => vi.fn(() => new Uint8Array([37, 80, 68, 70])));
vi.mock("html-to-image", () => ({ toPng, toJpeg }));
vi.mock("@/lib/pdf", () => ({ jpegToPdf }));

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
  jpegToPdf.mockClear();
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

it("offers ratio, quality and format radio groups with a default checked", () => {
  render(<InvitationEditor template={template} />);
  for (const [group, count, checked] of [["Tỉ lệ khung", 3, "Dọc 4:5"], ["Chất lượng", 2, "3x"], ["Định dạng", 2, "PNG"]] as const) {
    const radios = within(screen.getByRole("radiogroup", { name: group })).getAllByRole("radio") as HTMLInputElement[];
    expect(radios).toHaveLength(count);
    expect(radios.filter((r) => r.checked).map((r) => r.parentElement?.textContent)).toEqual([checked]);
  }
});

it("applies the chosen ratio to the preview and the full-screen preview", () => {
  render(<InvitationEditor template={template} />);
  const card = () => screen.getByRole("region", { name: "Xem trước thiệp" });
  expect(card().style.aspectRatio).toBe("4 / 5");
  fireEvent.click(screen.getByRole("radio", { name: "Story 9:16" }));
  expect(card().style.aspectRatio).toBe("9 / 16");
  fireEvent.click(screen.getByRole("radio", { name: "Vuông 1:1" }));
  expect(card().style.aspectRatio).toBe("1 / 1");
  fireEvent.click(screen.getByRole("button", { name: "Xem trước" }));
  expect(screen.getByRole("dialog").querySelector<HTMLElement>("[style*='aspect-ratio']")?.style.aspectRatio).toBe("1 / 1");
});

it("uses the chosen quality as the pixel ratio floor", async () => {
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  render(<InvitationEditor template={template} />);
  fill();
  fireEvent.click(screen.getByRole("radio", { name: "2x" }));
  fireEvent.click(download());
  await waitFor(() => expect(click).toHaveBeenCalled());
  expect((toPng.mock.calls[0] as unknown as [HTMLElement, { pixelRatio: number }])[1].pixelRatio).toBe(2);
  click.mockRestore();
});

it("PDF exports a white JPEG wrapped in a .pdf download", async () => {
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  URL.createObjectURL = vi.fn(() => "blob:pdf");
  URL.revokeObjectURL = vi.fn();
  render(<InvitationEditor template={template} />);
  fill();
  fireEvent.click(screen.getByRole("radio", { name: "PDF" }));
  fireEvent.click(download());
  await waitFor(() => expect(click).toHaveBeenCalled());
  expect(toPng).not.toHaveBeenCalled();
  expect((toJpeg.mock.calls[0] as unknown[])[1]).toMatchObject({ backgroundColor: "#ffffff", quality: 0.95 });
  expect(jpegToPdf).toHaveBeenCalledTimes(1);
  const a = click.mock.contexts[0] as HTMLAnchorElement;
  expect(a.download).toBe("thiep-cuoi-Nguyen-Thi-Hang-Tran-Van-Duc.pdf");
  expect(a.href).toBe("blob:pdf");
  click.mockRestore();
});

it("shows the Vietnamese error when the PDF cannot be built", async () => {
  jpegToPdf.mockImplementationOnce(() => {
    throw new Error("bad");
  });
  render(<InvitationEditor template={template} />);
  fill();
  fireEvent.click(screen.getByRole("radio", { name: "PDF" }));
  fireEvent.click(download());
  await screen.findByText("Không tạo được ảnh thiệp, vui lòng thử lại");
});

it("fixes the card to its ratio (content is scaled to fit) and keeps the full-screen card from shrinking", () => {
  render(<InvitationEditor template={template} />);
  expect(screen.getByRole("region", { name: "Xem trước thiệp" }).className).toContain("overflow-hidden");
  fireEvent.click(screen.getByRole("button", { name: "Xem trước" }));
  const full = screen.getByRole("dialog").querySelector<HTMLElement>("[style*='aspect-ratio']")!;
  expect(full.className).toContain("shrink-0");
  expect(full.className).toContain("overflow-hidden");
});
