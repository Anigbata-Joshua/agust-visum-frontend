"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { productService } from "@/services/product.service";
import { ProductCard } from "@/components/storefront/ProductCard";
import { useDebounce } from "@/hooks/useDebounce";
import { Container } from "@/components/ui/Container";
import { StaggerGrid, StaggerItem } from "@/components/ui/Motion";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    productService
      .listCategories()
      .then((res) => setCategories(res.data?.categories ?? res.data ?? []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    productService
      .list({
        search: debouncedSearch || undefined,
        category_id: categoryId || undefined,
        page,
      })
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
  }, [debouncedSearch, categoryId, page]);

  const hasFilters = !!(search || categoryId);

  return (
    <main className="bg-paper text-ink">
      {/* Header */}
      <section className="border-b border-ink/10 bg-off">
        <Container size="wide" className="py-12 sm:py-16">
          <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
            The Shop
          </span>
          <h1 className="font-display text-4xl sm:text-5xl mt-2 leading-tight">
            The Archive
          </h1>
          <p className="mt-3 text-sm text-ink/60 max-w-md font-body">
            Every piece in the collection. Filter by category, search by name, or scroll the lot.
          </p>
        </Container>
      </section>

      <Container size="wide" className="py-10 sm:py-14">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-8 sm:mb-10">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={15}
              strokeWidth={1.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
            />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search the archive…"
              className="w-full bg-off border border-ink/15 pl-9 pr-3 py-2.5 text-sm font-body outline-none focus:border-brick"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-ink/40 hover:text-brick"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <FilterPill
              active={!categoryId}
              onClick={() => {
                setCategoryId("");
                setPage(1);
              }}
            >
              All
            </FilterPill>
            {categories.map((c) => {
              const id = c._id || c.id;
              return (
                <FilterPill
                  key={id}
                  active={categoryId === id}
                  onClick={() => {
                    setCategoryId(id);
                    setPage(1);
                  }}
                >
                  {c.name}
                </FilterPill>
              );
            })}
          </div>
        </div>

        {/* Status row */}
        <div className="flex items-center justify-between mb-5 font-cond text-[10px] tracking-[0.18em] uppercase text-ink/50">
          <span>
            {loading
              ? "Loading the archive…"
              : `${products.length} piece${products.length === 1 ? "" : "s"}${
                  hasFilters ? " matching" : " in total"
                }`}
          </span>
          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                setCategoryId("");
                setPage(1);
              }}
              className="hover:text-brick"
            >
              Clear filters
            </button>
          )}
        </div>

        {error && (
          <p className="text-sm text-brick font-body py-6">{error}</p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCard key={i} loading />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-2xl text-ink/70">Nothing in the archive matches that.</p>
            <p className="text-sm text-ink/50 mt-2 font-body">
              Try clearing your filters, or check back after the next drop.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${debouncedSearch}-${categoryId}-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((p, i) => (
                  <StaggerItem key={p._id || p.id || i}>
                    <ProductCard product={p} priority={i < 4} />
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {products.length > 0 && (
          <div className="flex items-center justify-center gap-6 mt-12 font-cond text-[11px] tracking-[0.18em] uppercase">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border-b border-ink pb-0.5 disabled:opacity-30 disabled:cursor-not-allowed hover:text-brick hover:border-brick transition-colors"
            >
              ← Previous
            </button>
            <span className="text-ink/50">Page {page}</span>
            <button
              disabled={products.length === 0}
              onClick={() => setPage((p) => p + 1)}
              className="border-b border-ink pb-0.5 disabled:opacity-30 disabled:cursor-not-allowed hover:text-brick hover:border-brick transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </Container>
    </main>
  );
}

function FilterPill({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 font-cond text-[10px] tracking-[0.18em] uppercase px-3.5 py-2 border transition-colors",
        active
          ? "bg-ink text-off border-ink"
          : "bg-paper text-ink border-ink/15 hover:border-ink"
      )}
    >
      {children}
    </button>
  );
}
