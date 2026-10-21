"use client";

import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { toJpeg, toPng } from "html-to-image";
import { backgroundError, fonts, palettes, type Font, type Palette } from "@/lib/customise";
import {
  dataUrlToBytes,
  exportSize,
  formats,
  invitationFileName,
  jpegToPdf,
  qualities,
  ratios,
  type Format,
  type Quality,
  type Ratio,
} from "@/lib/download";
import { countGraphemes, truncateGraphemes } from "@/lib/message";
import type { Template } from "@/lib/templates";

const MESSAGE_MAX = 300;

const fields = [
  { name: "bride", label: "Tên cô dâu", type: "text", error: "Vui lòng nhập tên cô dâu" },
  { name: "groom", label: "Tên chú rể", type: "text", error: "Vui lòng nhập tên chú rể" },
  { name: "when", label: "Ngày giờ", type: "datetime-local", error: "Vui lòng chọn ngày giờ" },
  { name: "venue", label: "Địa điểm", type: "text", error: "Vui lòng nhập địa điểm" },
] as const;

type Details = Record<(typeof fields)[number]["name"] | "message", string>;

// Each template's own card, layout and ornament; mirrors its thumbnail in public/templates.
const looks = {
  "co-dien": {
    card: "border-4 border-[#7f1d1d] bg-[#fef3c7] p-3",
    body: "flex flex-col items-center gap-3 border border-[#7f1d1d] p-6 text-center",
    ornament: (
      <div data-ornament="vong-tron" aria-hidden="true" className="size-14 rounded-full border-[3px] border-[#7f1d1d]" />
    ),
  },
  "hoa-dao": {
    card: "rounded-3xl border-2 border-[#db2777] bg-[#fdf2f8] p-8",
    body: "flex flex-col items-center gap-3 text-center",
    ornament: (
      <div data-ornament="hoa-dao" aria-hidden="true" className="text-3xl tracking-[0.5em] text-[#db2777]">
        ✿ ❀ ✿
      </div>
    ),
  },
  "toi-gian": {
    card: "border border-neutral-400 bg-[#fafafa] p-10",
    body: "flex flex-col items-start gap-3 text-left",
    ornament: <hr data-ornament="duong-ke" aria-hidden="true" className="w-12 border-t-2 border-neutral-700" />,
  },
} as const;

const empty: Details = { bride: "", groom: "", when: "", venue: "", message: "" };

// "2026-12-20T18:00" → "18:00 · 20/12/2026", read as typed (no timezone shift).
function formatWhen(value: string) {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/);
  return m ? `${m[4]} · ${m[3]}/${m[2]}/${m[1]}` : "";
}

export default function InvitationEditor({
  template,
}: {
  template: Pick<Template, "id" | "name">;
}) {
  const [details, setDetails] = useState<Details>(empty);
  const [touched, setTouched] = useState<Partial<Record<keyof Details, boolean>>>({});

  const [palette, setPalette] = useState<Palette | null>(null);
  const [font, setFont] = useState<Font | null>(null);
  const [background, setBackground] = useState<string | null>(null);
  const [backgroundMessage, setBackgroundMessage] = useState<string | null>(null);

  const [ratio, setRatio] = useState<Ratio>(ratios[0]);
  const [quality, setQuality] = useState<Quality>(2);
  const [format, setFormat] = useState<Format>("png");

  const [fullScreen, setFullScreen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const previewRef = useRef<HTMLElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const ready =
    fields.every((f) => details[f.name].trim()) && formatWhen(details.when) !== "";

  // Full screen: focus the close button, Esc closes, focus goes back to "Xem trước".
  useEffect(() => {
    if (!fullScreen) return;
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullScreen(false);
    };
    document.addEventListener("keydown", onKey);
    const opener = openButtonRef.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [fullScreen]);

  // Revoke the old object URL when the background changes or the editor unmounts.
  useEffect(() => () => {
    if (background) URL.revokeObjectURL(background);
  }, [background]);

  const set = (name: keyof Details, value: string) =>
    setDetails((d) => ({ ...d, [name]: value }));

  const pickBackground = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const error = backgroundError(file);
    setBackgroundMessage(error);
    if (!error) setBackground(URL.createObjectURL(file));
  };

  // Exports the preview at the chosen ratio: a 540 px wide canvas × quality, so 2x is already 1080 px wide.
  const save = async () => {
    const node = previewRef.current;
    if (!node) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { width, height } = exportSize(ratio);
      const options = {
        width,
        height,
        pixelRatio: quality,
        style: { width: `${width}px`, height: `${height}px` },
      };
      let href: string;
      if (format === "pdf") {
        const jpeg = await toJpeg(node, { ...options, quality: 0.95, backgroundColor: "#ffffff" });
        const pdf = jpegToPdf(dataUrlToBytes(jpeg), width * quality, height * quality);
        href = URL.createObjectURL(new Blob([pdf as BlobPart], { type: "application/pdf" }));
      } else {
        href = await toPng(node, options);
      }
      const a = document.createElement("a");
      a.href = href;
      a.download = invitationFileName(details.bride, details.groom, format);
      a.click();
      if (format === "pdf") URL.revokeObjectURL(href);
    } catch {
      setSaveError("Không tạo được ảnh thiệp, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const look = looks[template.id as keyof typeof looks] ?? looks["toi-gian"];
  const previewContent = (
    <div className={look.body}>
      {look.ornament}
      <p className="text-sm uppercase tracking-wide text-neutral-500">Mẫu: {template.name}</p>
      <p className="text-sm">Trân trọng báo tin lễ thành hôn của</p>
      <p className="text-2xl font-semibold" style={{ color: "var(--accent)" }}>
        <span>{details.bride || "Cô dâu"}</span>
        <span aria-hidden="true"> &amp; </span>
        <span>{details.groom || "Chú rể"}</span>
      </p>
      <p>{formatWhen(details.when) || "Ngày giờ"}</p>
      <p>{details.venue || "Địa điểm"}</p>
      {details.message && <p className="whitespace-pre-line italic">{details.message}</p>}
    </div>
  );

  const previewStyle = {
    color: palette?.text,
    "--accent": palette?.accent,
    fontFamily: font ? `var(${font.variable}), sans-serif` : undefined,
    backgroundImage: background
      ? `linear-gradient(rgb(255 255 255 / 0.7), rgb(255 255 255 / 0.7)), url("${background}")`
      : undefined,
    backgroundSize: background ? "cover" : undefined,
    backgroundPosition: background ? "center" : undefined,
  } as CSSProperties;
  // The template's card has an opaque background colour, so the PNG is opaque rather than transparent.
  const previewClass = look.card;

  // Trim overflow from the inserted text (before the caret), never from the message's end.
  function limitMessage(el: HTMLTextAreaElement) {
    // Fast path: splitting at a caret inside a cluster (NFD marks, ZWJ) overcounts, so only split when over.
    if (countGraphemes(el.value) <= MESSAGE_MAX) return set("message", el.value);
    const caret = el.selectionStart;
    const after = el.value.slice(caret);
    const before = truncateGraphemes(el.value.slice(0, caret), Math.max(0, MESSAGE_MAX - countGraphemes(after)));
    queueMicrotask(() => el.setSelectionRange(before.length, before.length));
    set("message", before + after);
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <form className="flex flex-col gap-4" noValidate onSubmit={(e) => e.preventDefault()}>
        {fields.map((f) => {
          const id = `f-${f.name}`;
          const invalid = touched[f.name] && !details[f.name].trim();
          return (
            <div key={f.name} className="flex flex-col gap-1">
              <label htmlFor={id} className="font-medium">
                {f.label}
              </label>
              <input
                id={id}
                type={f.type}
                required
                value={details[f.name]}
                onChange={(e) => set(f.name, e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, [f.name]: true }))}
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? `${id}-error` : undefined}
                className="rounded border border-neutral-300 px-3 py-2 aria-invalid:border-red-600"
              />
              {invalid && (
                <p id={`${id}-error`} className="text-sm text-red-600">
                  {f.error}
                </p>
              )}
            </div>
          );
        })}
        <div className="flex flex-col gap-1">
          <label htmlFor="f-message" className="font-medium">
            Lời mời
          </label>
          <textarea
            id="f-message"
            rows={4}
            value={details.message}
            onChange={(e) => {
              // Rewriting value mid-composition breaks Telex/VNI input; onCompositionEnd applies the limit.
              if ((e.nativeEvent as InputEvent).isComposing) set("message", e.target.value);
              else limitMessage(e.target);
            }}
            onCompositionEnd={(e) => limitMessage(e.currentTarget)}
            aria-describedby="f-message-count"
            className="rounded border border-neutral-300 px-3 py-2"
          />
          <p id="f-message-count" className="text-sm text-neutral-600" aria-live="polite">
            Còn {Math.max(0, MESSAGE_MAX - countGraphemes(details.message))} ký tự
          </p>
        </div>

        <fieldset className="flex flex-col gap-4 rounded border border-neutral-200 p-4">
          <legend className="px-1 font-medium">Tuỳ chỉnh thiệp</legend>
          <div role="radiogroup" aria-label="Bảng màu" className="flex flex-wrap gap-2">
            {palettes.map((p) => (
              <label key={p.id} className="flex items-center gap-2 rounded border border-neutral-300 px-2 py-1 text-sm has-checked:border-neutral-900">
                <input
                  type="radio"
                  name="palette"
                  checked={palette?.id === p.id}
                  onChange={() => setPalette(p)}
                />
                <span aria-hidden="true" className="size-4 rounded-full" style={{ background: p.accent }} />
                {p.name}
              </label>
            ))}
          </div>
          <div role="radiogroup" aria-label="Phông chữ" className="flex flex-wrap gap-2">
            {fonts.map((f) => (
              <label
                key={f.id}
                className="flex items-center gap-2 rounded border border-neutral-300 px-2 py-1 text-sm has-checked:border-neutral-900"
                style={{ fontFamily: `var(${f.variable}), sans-serif` }}
              >
                <input
                  type="radio"
                  name="font"
                  checked={font?.id === f.id}
                  onChange={() => setFont(f)}
                />
                {f.name}
              </label>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="f-background" className="font-medium">
              Ảnh nền
            </label>
            <input
              id="f-background"
              type="file"
              accept="image/jpeg,image/png"
              onChange={pickBackground}
              aria-describedby={backgroundMessage ? "f-background-error" : undefined}
              className="text-sm"
            />
            {backgroundMessage && (
              <p id="f-background-error" role="alert" className="text-sm text-red-600">
                {backgroundMessage}
              </p>
            )}
            <button
              type="button"
              disabled={!background}
              onClick={() => {
                setBackground(null);
                setBackgroundMessage(null);
              }}
              className="self-start rounded border border-neutral-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              Xoá ảnh nền
            </button>
          </div>
        </fieldset>
      </form>

      <div className="flex flex-col gap-3">
        <section
          ref={previewRef}
          aria-label="Xem trước thiệp"
          data-template={template.id}
          style={previewStyle}
          className={previewClass}
        >
          {previewContent}
        </section>
        <fieldset className="flex flex-col gap-3 rounded border border-neutral-200 p-4">
          <legend className="px-1 font-medium">Tuỳ chọn tải về</legend>
          <div role="radiogroup" aria-label="Tỉ lệ" className="flex flex-wrap gap-2">
            {ratios.map((r) => (
              <label key={r.id} className="flex items-center gap-2 rounded border border-neutral-300 px-2 py-1 text-sm has-checked:border-neutral-900">
                <input type="radio" name="ratio" checked={ratio.id === r.id} onChange={() => setRatio(r)} />
                {r.name}
              </label>
            ))}
          </div>
          <div role="radiogroup" aria-label="Chất lượng" className="flex flex-wrap gap-2">
            {qualities.map((q) => (
              <label key={q} className="flex items-center gap-2 rounded border border-neutral-300 px-2 py-1 text-sm has-checked:border-neutral-900">
                <input type="radio" name="quality" checked={quality === q} onChange={() => setQuality(q)} />
                {q}x
              </label>
            ))}
          </div>
          <div role="radiogroup" aria-label="Định dạng" className="flex flex-wrap gap-2">
            {formats.map((f) => (
              <label key={f} className="flex items-center gap-2 rounded border border-neutral-300 px-2 py-1 text-sm has-checked:border-neutral-900">
                <input type="radio" name="format" checked={format === f} onChange={() => setFormat(f)} />
                {f.toUpperCase()}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <button
            ref={openButtonRef}
            type="button"
            onClick={() => setFullScreen(true)}
            className="rounded border border-neutral-300 px-4 py-2"
          >
            Xem trước
          </button>
          <button
            type="button"
            disabled={!ready || saving}
            onClick={save}
            aria-describedby={ready ? undefined : "download-hint"}
            className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
          >
            Tải về
          </button>
        </div>
        {!ready && (
          <p id="download-hint" className="text-sm text-neutral-600">
            Hãy điền đủ tên cô dâu, tên chú rể, ngày giờ và địa điểm để tải thiệp
          </p>
        )}
        {saveError && (
          <p role="alert" className="text-sm text-red-600">
            {saveError}
          </p>
        )}
      </div>

      {fullScreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xem trước toàn màn hình"
          className="fixed inset-0 z-50 flex flex-col items-center gap-4 overflow-auto bg-white p-6"
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setFullScreen(false)}
            className="self-end rounded border border-neutral-300 px-4 py-2"
          >
            Đóng
          </button>
          <div style={previewStyle} className={`${previewClass} my-auto w-full max-w-3xl text-lg`}>
            {previewContent}
          </div>
        </div>
      )}
    </div>
  );
}
