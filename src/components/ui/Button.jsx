import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-ink text-off px-6 py-3 hover:bg-brick",
  ghost: "border-b border-ink pb-0.5",
};

export function Button({ variant = "primary", className, children, ...props }) {
  return (
    <button
      className={cn(
        "font-cond text-[11px] tracking-[0.1em] uppercase inline-block transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
