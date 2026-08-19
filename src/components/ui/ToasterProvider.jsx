"use client";

import { Toaster } from "sonner";

export default function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#F7F4EC", // var(--off)
          color: "#17140F",      // var(--ink)
          border: "1px solid rgba(23, 20, 15, 0.16)", // var(--line)
          fontFamily: "var(--font-body), sans-serif",
          borderRadius: "0px", // blocky editorial design
        },
      }}
    />
  );
}
