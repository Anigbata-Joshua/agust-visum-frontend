import { formatNaira } from "@/lib/utils";

export function ProductCard({ product }) {
  return (
    <div className="bg-off border border-ink/10 flex flex-col">
      <div className="h-[280px] bg-stone" />
      <div className="p-4">
        <div className="font-display font-semibold text-[15px] mb-2">{product?.name}</div>
        <div className="font-cond text-xs text-brick">{formatNaira(product?.price ?? 0)}</div>
      </div>
    </div>
  );
}
