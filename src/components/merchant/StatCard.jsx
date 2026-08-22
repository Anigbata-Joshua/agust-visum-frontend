"use client";

import { cn } from "@/lib/utils";

export function StatCard({ Icon, label, value, tone = "off" }) {
  return (
    <div className="border border-off/15 p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-7 h-7 flex items-center justify-center",
            tone === "brick" ? "text-brick" : "text-off/70"
          )}
        >
          {Icon && <Icon size={15} strokeWidth={1.5} />}
        </div>
        <div className="font-cond text-[10px] tracking-[0.18em] uppercase text-off/50">
          {label}
        </div>
      </div>
      <div className="font-display text-2xl sm:text-3xl mt-1">{value}</div>
    </div>
  );
}

export default StatCard;
