"use client";

import { useState } from "react";
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

  const set = (name: keyof Details, value: string) =>
    setDetails((d) => ({ ...d, [name]: value }));

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
      </form>

      <section
        aria-label="Xem trước thiệp"
        data-template={template.id}
        className="flex flex-col items-center gap-3 rounded-lg border border-neutral-200 p-8 text-center"
      >
        <p className="text-sm uppercase tracking-wide text-neutral-500">Mẫu: {template.name}</p>
        <p className="text-sm">Trân trọng báo tin lễ thành hôn của</p>
        <p className="text-2xl font-semibold">
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
