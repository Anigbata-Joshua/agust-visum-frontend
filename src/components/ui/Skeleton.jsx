import { cn } from "@/lib/utils";

/**
 * Skeleton primitives — used while data is loading. The base block
 * pulses softly and respects `prefers-reduced-motion` via globals.css.
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden
      className={cn("bg-ink/10 animate-pulse", className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton({ className }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Skeleton className="aspect-[3/4] w-full" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, className }) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function LineItemSkeleton() {
  return (
    <div className="flex gap-4 py-4">
      <Skeleton className="w-20 h-24" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="border border-off/15 p-5 flex flex-col gap-2">
      <Skeleton className="h-2 w-1/3 !bg-off/15" />
      <Skeleton className="h-6 w-1/2 !bg-off/15" />
    </div>
  );
}

export default Skeleton;
