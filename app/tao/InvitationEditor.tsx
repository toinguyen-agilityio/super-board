"use client";

import { useEffect, useState, type ChangeEvent, type CSSProperties } from "react";
import { backgroundError, fonts, palettes, type Font, type Palette } from "@/lib/customise";
import type { Template } from "@/lib/templates";

const MESSAGE_MAX = 300;

const fields = [
  { name: "bride", label: "Tên cô dâu", type: "text", error: "Vui lòng nhập tên cô dâu" },
  { name: "groom", label: "Tên chú rể", type: "text", error: "Vui lòng nhập tên chú rể" },
  { name: "when", label: "Ngày giờ", type: "datetime-local", error: "Vui lòng chọn ngày giờ" },
  { name: "venue", label: "Địa điểm", type: "text", error: "Vui lòng nhập địa điểm" },
] as const;

type Details = Record<(typeof fields)[number]["name"] | "message", string>;

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
            maxLength={MESSAGE_MAX}
            value={details.message}
            onChange={(e) => set("message", e.target.value.slice(0, MESSAGE_MAX))}
            aria-describedby="f-message-count"
            className="rounded border border-neutral-300 px-3 py-2"
          />
          <p id="f-message-count" className="text-sm text-neutral-600" aria-live="polite">
            Còn {MESSAGE_MAX - details.message.length} ký tự
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

      <section
        aria-label="Xem trước thiệp"
        data-template={template.id}
        style={previewStyle}
        className="flex flex-col items-center gap-3 rounded-lg border border-neutral-200 p-8 text-center"
      >
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
      </section>
    </div>
  );
}
