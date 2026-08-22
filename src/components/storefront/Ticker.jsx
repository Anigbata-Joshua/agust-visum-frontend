"use client";

import { Container } from "@/components/ui/Container";

/**
 * Marquee / ticker strip — used to surface shipping, returns, and
 * brand statements without occupying much vertical space. The animation
 * is CSS-only and stops for `prefers-reduced-motion`.
 */
export function Ticker({ items = defaultItems, speed = 28 }) {
  // Repeat items so the strip is seamless regardless of width.
  const stream = [...items, ...items];

  return (
    <div
      role="presentation"
      aria-hidden
      className="relative bg-ink text-off border-y border-off/10 overflow-hidden"
    >
      <div
        className="ticker-track flex whitespace-nowrap py-3 will-change-transform"
        style={{ animationDuration: `${speed}s` }}
      >
        {stream.map((it, i) => (
          <div key={i} className="flex items-center gap-6 px-6">
            <span className="font-cond text-[11px] tracking-[0.22em] uppercase">
              {it}
            </span>
            <span className="text-off/30" aria-hidden>·</span>
          </div>
        ))}
      </div>

      {/* Pull the marquee styles in here so we don't bloat globals.css. */}
      <style jsx>{`
        .ticker-track {
          animation-name: ticker-scroll;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none; }
        }
      `}</style>
    </div>
  );
}

const defaultItems = [
  "Free shipping on orders over ₦150,000",
  "Archive pieces restocked quarterly",
  "30-day returns, no questions asked",
  "Modular silhouettes — built to last",
  "Issue Nº 05 — Forever Classics",
];

export default Ticker;
