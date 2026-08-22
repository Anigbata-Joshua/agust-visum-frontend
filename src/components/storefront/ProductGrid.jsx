"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { productService } from "@/services/product.service";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Container } from "@/components/ui/Container";
import { StaggerGrid, StaggerItem } from "@/components/ui/Motion";

/**
 * Reusable product grid section. Pass a `sectionId` and `viewAllHref`
 * to differentiate homepage rails. Handles its own loading / error
 * state and uses skeletons, not raw text.
 */
export function ProductGrid({
  kicker = "",
  title,
  subtitle,
  viewAllHref = "/products",
  fetchParams = { limit: 8 },
  columns = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  className,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    productService
      .list(fetchParams)
      .then((res) => {
        if (cancelled) return;
        const list = res.data?.products ?? res.data?.results ?? res.data ?? [];
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || "Could not load products.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(fetchParams)]);

  return (
    <section className={className}>
      <Container size="wide">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
          <div>
            {kicker && (
              <span className="block font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
                {kicker}
              </span>
            )}
            <h2 className="font-display text-3xl sm:text-4xl mt-2 leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-ink/60 max-w-md font-body">
                {subtitle}
              </p>
            )}
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 font-cond text-[11px] tracking-[0.18em] uppercase text-ink hover:text-brick border-b border-ink/30 hover:border-brick pb-0.5 self-start sm:self-auto transition-colors"
            >
              View all <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          )}
        </div>

        {error && (
          <p className="text-sm text-brick mb-6 font-body">{error}</p>
        )}

        {loading ? (
          <div className={`grid ${columns} gap-4 sm:gap-6`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCard key={i} loading />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-sm text-ink/50 font-body py-12 text-center">
            No pieces in this drop yet — check back soon.
          </p>
        ) : (
          <StaggerGrid className={`grid ${columns} gap-4 sm:gap-6`}>
            {products.map((p, i) => (
              <StaggerItem key={p._id || p.id || i}>
                <ProductCard product={p} priority={i < 4} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </Container>
    </section>
  );
}

export default ProductGrid;
