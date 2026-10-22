import type { Metadata } from "next";
import { Be_Vietnam_Pro, Dancing_Script, Playfair_Display } from "next/font/google";
import { ThemeToggle } from "@/components/ThemeToggle";
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

// Runs before paint so a saved or system dark preference never flashes light.
const themeScript = `try{var t=localStorage.getItem("theme");if(t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches)document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${beVietnamPro.variable} ${playfairDisplay.variable} ${dancingScript.variable}`}
    >
      <body className="min-h-screen bg-white text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
