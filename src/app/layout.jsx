import "@/styles/globals.css";
import { Fraunces, Oswald, Inter } from "next/font/google";
import ToasterProvider from "@/components/ui/ToasterProvider";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "500", "600", "700"],
});
const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-cond",
  weight: ["400", "500", "600", "700"],
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "August Visum — Forever Classics",
  description: "Fashion / Cultural / Style — August Visum storefront.",
};

/**
 * Pre-paint script: reads the persisted theme (or system preference)
 * and applies `data-theme` on `<html>` *before* React mounts. This
 * prevents a flash of the wrong theme on first paint.
 */
const themePrePaint = `
(function () {
  try {
    var stored = localStorage.getItem("agt_theme");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${oswald.variable} ${inter.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themePrePaint }} />
      </head>
      <body className="font-body">
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}

