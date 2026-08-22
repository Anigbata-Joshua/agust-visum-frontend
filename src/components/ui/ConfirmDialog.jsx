"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

/**
 * A small modal-based confirm dialog. Used in exactly one place
 * (single-merchant cart clear) where the user must make a blocking
 * decision that a toast can't accommodate. For every other "alert"
 * we use Sonner toasts (see §4.5 of the prompt).
 */
export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger", // "danger" | "primary"
  loading = false,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onCancel}
            aria-hidden
            className="fixed inset-0 bg-ink/55 backdrop-blur-sm z-[100]"
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[min(92vw,420px)] bg-paper border border-ink/15 p-6"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 flex items-center justify-center border ${
                  tone === "danger" ? "border-brick text-brick" : "border-ink text-ink"
                }`}
              >
                <AlertTriangle size={16} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="confirm-dialog-title" className="font-display text-xl">
                  {title}
                </h2>
                {description && (
                  <p className="mt-2 text-sm text-ink/70 font-body leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={onCancel}
                disabled={loading}
                className="font-cond text-[11px] tracking-[0.18em] uppercase text-ink/70 hover:text-ink border-b border-ink/20 hover:border-ink pb-0.5 transition-colors disabled:opacity-40"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`font-cond text-[11px] tracking-[0.18em] uppercase px-4 py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2 ${
                  tone === "danger"
                    ? "bg-brick text-off hover:bg-ink"
                    : "bg-ink text-off hover:bg-brick"
                }`}
              >
                {loading && (
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
