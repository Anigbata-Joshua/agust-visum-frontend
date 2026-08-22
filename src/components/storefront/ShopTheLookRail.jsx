"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/Motion";

/**
 * Category spotlight — horizontally scrollable cards that link into
 * filtered /products. Pure presentational; uses static categories since
 * the backend doesn't expose a `/categories/featured` endpoint.
 */
const defaultCategories = [
  {
    name: "Outerwear",
    blurb: "Field jackets, overcoats, shells.",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Knitwear",
    blurb: "Modular knits, archive yarns.",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Tops",
    blurb: "Boxy tees, oxfords, refined basics.",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Bottoms",
    blurb: "Wide-leg trousers, raw denim.",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Accessories",
    blurb: "Caps, totes, considered objects.",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=900&q=80",
  },
];

export function ShopTheLookRail({ categories = defaultCategories }) {
  return (
    <section className="bg-off border-y border-ink/10">
      <Container size="wide" className="py-16 sm:py-20">
        <FadeIn className="flex items-end justify-between gap-4 mb-8">
          <div>
            <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
              Shop By Category
            </span>
            <h2 className="font-display text-3xl sm:text-4xl mt-2 leading-tight">
              The Wardrobe
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-2 font-cond text-[11px] tracking-[0.18em] uppercase text-ink hover:text-brick border-b border-ink/30 hover:border-brick pb-0.5 transition-colors"
          >
            See all <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </FadeIn>

        <div
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 -mx-5 px-5 sm:mx-0 sm:px-0 snap-x snap-mandatory"
          style={{ scrollbarWidth: "thin" }}
        >
          {categories.map((c, i) => (
            <FadeIn
              key={c.name}
              delay={i * 0.05}
              className="snap-start shrink-0 w-[68vw] sm:w-[280px] md:w-[300px]"
            >
              <Link
                href={c.href}
                className="group block relative aspect-[3/4] overflow-hidden bg-stone"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${c.image})` }}
                  role="img"
                  aria-label={c.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5 text-off">
                  <span className="font-cond text-[10px] tracking-[0.22em] uppercase text-off/70">
                    Category
                  </span>
                  <div className="font-display text-2xl mt-1">{c.name}</div>
                  <div className="font-body text-xs text-off/80 mt-1">{c.blurb}</div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default ShopTheLookRail;
