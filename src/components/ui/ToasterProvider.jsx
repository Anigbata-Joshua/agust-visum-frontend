"use client";

import { Toaster, toast as sonnerToast } from "sonner";

/**
 * Global toast theme. Position is `top-right` so toasts don't collide with
 * the mobile sticky add-to-cart bar or any future bottom nav. The visual
 * treatment (paper/ink/line) and the blocky `borderRadius: 0` aesthetic
 * from the previous version are preserved.
 */
export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#F7F4EC", // var(--off)
          color: "#17140F",      // var(--ink)
          border: "1px solid rgba(23, 20, 15, 0.16)", // var(--line)
          fontFamily: "var(--font-body), sans-serif",
          borderRadius: "0px", // blocky editorial design
        },
        classNames: {
          success: "!bg-[#EAF3EA] !text-[#1F4D2C] !border-[#1F4D2C]/30",
          error: "!bg-[#FBEAEA] !text-[#7A1F1F] !border-[#7A1F1F]/30",
          warning: "!bg-[#FBF3E3] !text-[#7A5A1F] !border-[#7A5A1F]/30",
        },
      }}
    />
  );
}

// Helper wrapper kept for backward compatibility — sonner already exposes
// the same names, so re-export them with sensible defaults.
export const toast = {
  success: (message, options) =>
    sonnerToast.success(message, options),
  error: (message, options) =>
    sonnerToast.error(message, options),
  warning: (message, options) =>
    sonnerToast.warning(message, options),
  info: (message, options) =>
    sonnerToast.info(message, options),
  message: (message, options) =>
    sonnerToast.message(message, options),
};
