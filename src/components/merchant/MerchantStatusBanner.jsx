"use client";

import { CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Surfaces the merchant approval status (`pending` | `approved` | `suspended`)
 * on the merchant dashboard. Backend blocks product creation unless the
 * status is `approved` — this component makes that visible to the merchant
 * and explains the next step.
 */
export function MerchantStatusBanner({ status, dark = true }) {
  const tone = getTone(status);
  const Icon = tone.icon;

  return (
    <div
      className={cn(
        "border p-4 sm:p-5 flex gap-3 items-start",
        tone.boxClass
      )}
      role="status"
    >
      <div
        className={cn(
          "w-9 h-9 flex items-center justify-center border shrink-0",
          tone.iconBoxClass
        )}
      >
        <Icon size={16} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "font-cond text-[10px] tracking-[0.2em] uppercase",
              tone.labelClass
            )}
          >
            {tone.label}
          </span>
          <span className="font-display text-base sm:text-lg leading-tight">
            {tone.headline}
          </span>
        </div>
        <p
          className={cn(
            "mt-1 text-sm font-body leading-relaxed",
            dark ? "text-off/70" : "text-ink/70"
          )}
        >
          {tone.description}
        </p>
      </div>
    </div>
  );
}

function getTone(status) {
  switch (String(status || "").toLowerCase()) {
    case "approved":
      return {
        icon: CheckCircle2,
        label: "Approved",
        headline: "Your storefront is live.",
        description:
          "You can add products, run promotions, and receive orders.",
        boxClass: "border-brick/40 bg-brick/10",
        iconBoxClass: "border-brick text-brick",
        labelClass: "text-brick",
      };
    case "suspended":
      return {
        icon: ShieldAlert,
        label: "Suspended",
        headline: "Your storefront is paused.",
        description:
          "Sales are paused while we review. Please contact support to lift the suspension.",
        boxClass: "border-brick/40 bg-brick/10",
        iconBoxClass: "border-brick text-brick",
        labelClass: "text-brick",
      };
    case "pending":
    default:
      return {
        icon: AlertCircle,
        label: "Pending review",
        headline: "We're reviewing your application.",
        description:
          "Most storefronts are approved within 24 hours. You'll be able to add products once your application is approved.",
        boxClass: "border-off/20 bg-off/5",
        iconBoxClass: "border-off/30 text-off",
        labelClass: darken("pending"),
      };
  }
}

// Helper to keep the label color readable in dark/light mode.
function darken(tone) {
  return tone === "pending" ? "text-off/70" : "text-off/70";
}

export default MerchantStatusBanner;
