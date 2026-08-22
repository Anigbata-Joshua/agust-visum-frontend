"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Slide-in drawer for mobile / tablet nav.
 * Preserves the existing `open` / `onClose` / `children` API so callers
 * (e.g. Header.jsx) don't need prop changes.
 */
export function MobileMenu({ open, onClose, children, className }) {
  // Lock body scroll while open
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="mobile-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50"
          />
          <motion.aside
            key="mobile-menu-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
            className={cn(
              "fixed top-0 right-0 bottom-0 z-50",
              "w-[88vw] max-w-sm bg-paper text-ink border-l border-ink/10",
              "flex flex-col",
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10">
              <span className="font-display text-lg font-semibold">August Visum</span>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="w-10 h-10 -mr-2 flex items-center justify-center hover:text-brick transition-colors"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { delayChildren: 0.08, staggerChildren: 0.05 } },
              }}
              className="flex-1 overflow-y-auto px-5 py-6"
            >
              {typeof children === "function"
                ? children({ staggerItem: true })
                : children}
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileMenu;
