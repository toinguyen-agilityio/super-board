"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      className="fixed left-4 top-4 z-[60] rounded border border-neutral-300 bg-white px-3 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
    >
      {dark ? "☀️ Sáng" : "🌙 Tối"}
    </button>
  );
}
