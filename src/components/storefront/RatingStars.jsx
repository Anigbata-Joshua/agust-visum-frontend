export function RatingStars({ value = 0, max = 5 }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < value ? "text-brick" : "text-ink/20"}>
          ★
        </span>
      ))}
    </div>
  );
}
