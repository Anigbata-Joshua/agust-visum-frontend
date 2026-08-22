"use client";

import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/Motion";
import { productService } from "@/services/product.service";
import { socialService } from "@/services/social.service";

/**
 * Testimonials highlight strip — curates the highest-rated reviews from
 * real product ratings (`GET /ratings?product_id=…`).
 *
 * Flow:
 *   1. Fetch a batch of products (we only need 30 to start).
 *   2. For each product, fetch its ratings (best-effort).
 *   3. Flatten, keep only those with a `text` and value >= 4.
 *   4. Sort by rating value, take top 3.
 *   5. Render with the editorial treatment.
 *
 * Falls back to a small curated static set if the network fails, so the
 * homepage never goes blank.
 */
const FALLBACK = [
  {
    quote:
      "The field coat has replaced every other jacket I own. Quietly confident, generously cut — the kind of piece that gets better with wear.",
    name: "Adaeze Okonkwo",
    role: "Lagos · Verified buyer",
    piece: "Field Coat, Stone",
    value: 5,
  },
  {
    quote:
      "August Visum's knit is the closest thing to a hug my wardrobe has. Modular, honest, and never tries too hard.",
    name: "Kojo Asante",
    role: "Accra · Verified buyer",
    piece: "Modular Crew, Charcoal",
    value: 5,
  },
  {
    quote:
      "Restocked twice — same fit, same fabric. That's rarer than it should be in this category. I'll be back for drops five and six.",
    name: "Tomi Bankole",
    role: "London · Verified buyer",
    piece: "Wide Trouser, Raw",
    value: 5,
  },
];

const POOL_SIZE = 18; // how many products to scan for ratings

export function TestimonialsStrip() {
  const [items, setItems] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await productService.list({ limit: POOL_SIZE });
        const list = res.data?.products ?? res.data?.results ?? res.data ?? [];
        const products = Array.isArray(list) ? list : [];

        // Fetch ratings per product in parallel; tolerate failures.
        const ratingArrays = await Promise.all(
          products.slice(0, POOL_SIZE).map((p) =>
            socialService
              .getRatings(p._id || p.id)
              .then((r) => r.data?.ratings ?? [])
              .catch(() => [])
          )
        );

        const flattened = [];
        products.slice(0, POOL_SIZE).forEach((p, i) => {
          const productTitle = p.title || p.name || "an August Visum piece";
          const ratings = ratingArrays[i] || [];
          ratings.forEach((r) => {
            const value = Number(r.value ?? 0);
            const text = (r.text || "").trim();
            if (!text) return;
            if (value < 4) return;
            // Surface the user's full name (backend puts it on the populated
            // `user` field of each rating). Fall back to the username, then
            // a labelled placeholder so the testimonial still reads cleanly.
            const user = r.user || {};
            const fullName =
              user.full_name ||
              user.fullName ||
              [user.first_name, user.last_name].filter(Boolean).join(" ") ||
              user.name ||
              user.username ||
              null;
            flattened.push({
              quote: text,
              name: fullName || "Verified buyer",
              role: "Verified buyer",
              piece: productTitle,
              value,
            });
          });
        });

        // Curate: highest value first, then stable by original order.
        flattened.sort((a, b) => b.value - a.value);
        const top = flattened.slice(0, 3);

        if (!cancelled) {
          if (top.length > 0) setItems(top);
          // else: keep fallback
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-16 sm:py-24">
      <Container size="wide">
        <FadeIn className="max-w-2xl mb-10">
          <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
            From the Archive
          </span>
          <h2 className="font-display text-3xl sm:text-4xl mt-2 leading-[1.05]">
            Worn, kept, restocked.
          </h2>
          <p className="mt-3 text-sm text-ink/60 font-body max-w-md">
            A curated set of reviews from verified buyers — pulled from the
            top-rated pieces in the catalog.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {items.map((t, i) => (
            <FadeIn
              key={`${t.name}-${i}-${t.piece}`}
              delay={i * 0.07}
              className="border-t border-ink/15 pt-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <Quote size={20} strokeWidth={1.5} className="text-brick" />
                <span className="inline-flex items-center gap-0.5 text-brick">
                  {Array.from({ length: 5 }).map((_, n) => (
                    <Star
                      key={n}
                      size={11}
                      strokeWidth={1.5}
                      fill={n < t.value ? "currentColor" : "none"}
                    />
                  ))}
                </span>
              </div>
              <p className="font-display text-lg leading-snug text-ink flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 font-cond text-[10px] tracking-[0.18em] uppercase text-ink/50">
                {t.name} · {t.role}
              </div>
              <div className="font-cond text-[10px] tracking-[0.18em] uppercase text-brick mt-1">
                {t.piece}
              </div>
            </FadeIn>
          ))}
        </div>

        {loading && (
          <p className="mt-6 text-[11px] font-cond tracking-[0.18em] uppercase text-ink/40">
            Curating the latest reviews…
          </p>
        )}
      </Container>
    </section>
  );
}

export default TestimonialsStrip;
