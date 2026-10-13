import type { Metadata } from "next";
import { Be_Vietnam_Pro, Dancing_Script, Playfair_Display } from "next/font/google";
import "./globals.css";

// Invitation fonts for the editor's customise panel (lib/customise.ts); all cover Vietnamese.
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese"],
  weight: ["400", "600"],
  variable: "--font-be-vietnam-pro",
});
const playfairDisplay = Playfair_Display({
  subsets: ["vietnamese"],
  variable: "--font-playfair-display",
});
const dancingScript = Dancing_Script({
  subsets: ["vietnamese"],
  variable: "--font-dancing-script",
});

export const metadata: Metadata = {
  title: "Thiệp cưới",
  description: "Tự tạo thiệp cưới của bạn",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${playfairDisplay.variable} ${dancingScript.variable}`}
    >
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
