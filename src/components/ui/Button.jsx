import { cn } from "@/lib/utils";

/**
 * CTA system. Variants:
 *  - primary:    solid ink → brick on hover (default CTA)
 *  - secondary:  outlined ink, fills ink on hover
 *  - brick:      solid brick → ink on hover
 *  - ghost:      text + underline (link-style)
 *  - light:      solid off (for use on dark backgrounds)
 *  - danger:     subtle destructive (border + brick text)
 *
 * Sizing: `sm | md | lg`. Block prop makes it full-width.
 * `loading` shows a small inline spinner and disables the button.
 */
const variants = {
  primary:
    "bg-ink text-off hover:bg-brick focus-visible:outline-brick",
  secondary:
    "bg-transparent text-ink border border-ink hover:bg-ink hover:text-off focus-visible:outline-ink",
  brick:
    "bg-brick text-off hover:bg-ink focus-visible:outline-brick",
  ghost:
    "bg-transparent text-ink border-b border-ink px-0 py-0 hover:text-brick hover:border-brick",
  light:
    "bg-off text-ink hover:bg-brick hover:text-off focus-visible:outline-brick",
  danger:
    "bg-transparent text-brick border border-brick/60 hover:bg-brick hover:text-off focus-visible:outline-brick",
};

const sizes = {
  sm: "text-[10px] px-4 py-2",
  md: "text-[11px] px-6 py-3",
  lg: "text-xs px-8 py-4",
};

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  disabled = false,
  className,
  children,
  type = "button",
  ...props
}) {
  const isGhost = variant === "ghost";
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "font-cond tracking-[0.12em] uppercase inline-flex items-center justify-center gap-2",
        "transition-colors duration-200 select-none",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        !isGhost && sizes[size],
        variants[variant],
        block && "w-full",
        className
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"
        />
      )}
      <span>{children}</span>
    </button>
  );
}

export default Button;
