export type Palette = { id: string; name: string; text: string; accent: string };
export type Font = { id: string; name: string; variable: string };

export const palettes: readonly Palette[] = [
  { id: "hong-phan", name: "Hồng phấn", text: "#4a2c2a", accent: "#c2185b" },
  { id: "do-son", name: "Đỏ son", text: "#3b0a0a", accent: "#b71c1c" },
  { id: "xanh-ngoc", name: "Xanh ngọc", text: "#1f3d3a", accent: "#00796b" },
  { id: "vang-kim", name: "Vàng kim", text: "#3e2f10", accent: "#a87400" },
  { id: "tim-oai-huong", name: "Tím oải hương", text: "#2e2440", accent: "#6a4c93" },
];

// CSS variables are declared by next/font in app/layout.tsx (vietnamese subset).
export const fonts: readonly Font[] = [
  { id: "be-vietnam-pro", name: "Be Vietnam Pro", variable: "--font-be-vietnam-pro" },
  { id: "playfair-display", name: "Playfair Display", variable: "--font-playfair-display" },
  { id: "dancing-script", name: "Dancing Script", variable: "--font-dancing-script" },
];

export const BACKGROUND_MAX_BYTES = 5 * 1024 * 1024;
const BACKGROUND_TYPES = ["image/jpeg", "image/png"];

export function backgroundError(file: { type: string; size: number }) {
  if (!BACKGROUND_TYPES.includes(file.type)) return "Ảnh nền phải là tệp JPG hoặc PNG";
  if (file.size > BACKGROUND_MAX_BYTES) return "Ảnh nền không được lớn hơn 5 MB";
  return null;
}
