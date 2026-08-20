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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${oswald.variable} ${inter.variable}`}>
      <body className="font-body">
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}

