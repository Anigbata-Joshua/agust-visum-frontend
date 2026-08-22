import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Renders star rating. Supports half-stars and a `size` variant
 * (`sm` for cards, `md` for general UI, `lg` for product page hero).
 * Backwards compatible — still accepts the same `value` and `max` props.
 */
export function RatingStars({ value = 0, max = 5, size = "md", showNumber = false, className }) {
  const safe = Math.max(0, Math.min(max, Number(value) || 0));
  const sizes = {
    sm: { box: 12, stroke: 1.5, gap: "gap-0.5" },
    md: { box: 16, stroke: 1.5, gap: "gap-1" },
    lg: { box: 22, stroke: 1.5, gap: "gap-1.5" },
  };
  const s = sizes[size] ?? sizes.md;

  return (
    <div
      className={cn("inline-flex items-center", s.gap, className)}
      role="img"
      aria-label={`${safe} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, safe - i));
        return (
          <span key={i} className="relative inline-block leading-none" style={{ width: s.box, height: s.box }}>
            {/* background star */}
            <Star
              size={s.box}
              strokeWidth={s.stroke}
              className="absolute inset-0 text-ink/15"
              fill="currentColor"
            />
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
                aria-hidden
              >
                <Star
                  size={s.box}
                  strokeWidth={s.stroke}
                  className="text-brick"
                  fill="currentColor"
                />
              </span>
            )}
            {fill === 0.5 && (
              <StarHalf
                size={s.box}
                strokeWidth={s.stroke}
                className="absolute inset-0 text-brick"
                fill="currentColor"
              />
            )}
          </span>
        );
      })}
      {showNumber && (
        <span className="ml-1.5 font-cond text-xs text-ink/70">{safe.toFixed(1)}</span>
      )}
    </div>
  );
}

export default RatingStars;
