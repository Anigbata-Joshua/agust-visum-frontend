"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/Motion";

/**
 * Editorial hero — split layout on desktop, stacked on mobile.
 * Reuses the "Forever Classics" positioning from the previous page-level
 * implementation but is now a self-contained, reusable section.
 */
export function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Subtle parallax for the image layer — gentle, capped to a small range.
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  return (
    <section
      ref={ref}
      aria-label="Forever Classics — hero"
      className="relative w-full overflow-hidden bg-off"
    >
      <div className="grid lg:grid-cols-12 gap-0 lg:gap-8 min-h-[78svh] lg:min-h-[82svh]">
        {/* Image layer — fills the entire left half of the section, with a
            gentle hover scale to add editorial weight without distracting. */}
        <div className="group relative lg:col-span-7 h-[58svh] sm:h-[64svh] lg:h-full overflow-hidden">
          <motion.div
            initial={{ scale: 1.06, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
            whileHover={{ scale: 1.04 }}
            style={{ y: imageY }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(23,20,15,0.18) 0%, rgba(23,20,15,0.02) 35%, rgba(23,20,15,0.18) 100%), url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=80')",
              }}
              role="img"
              aria-label="Editorial fashion silhouette"
            />
          </motion.div>

          {/* Editorial caption (bottom-left) */}
          <FadeIn delay={0.5} className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10">
            <div className="bg-paper/85 backdrop-blur-sm border border-ink/10 px-3 py-2 max-w-[260px]">
              <p className="font-cond text-[10px] tracking-[0.18em] uppercase text-brick">
                Issue Nº 05
              </p>
              <p className="font-display text-sm leading-snug mt-0.5">
                The archive, not the season.
              </p>
            </div>
          </FadeIn>
        </div>

        {/* Copy layer */}
        <div className="relative lg:col-span-5 flex flex-col justify-center px-5 sm:px-8 lg:px-12 py-10 lg:py-20">
          <FadeIn>
            <span className="inline-block font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
              August Visum — Storefront
            </span>
          </FadeIn>

          <FadeIn delay={0.1} as="h1" className="font-display font-light text-5xl sm:text-6xl lg:text-7xl mt-4 leading-[0.95] tracking-tight">
            Forever<br />
            <span className="italic text-brick">Classics</span>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-6 max-w-md text-sm sm:text-base text-ink/70 leading-relaxed font-body">
              Streetwear built for the archive, not the season. Modular silhouettes,
              slow drops, and considered staples — released when ready, restocked
              when honored.
            </p>
          </FadeIn>

          <FadeIn delay={0.3} className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/products" className="inline-block">
              <Button variant="primary" size="lg" className="px-8">
                <span className="inline-flex items-center gap-2">
                  Shop the collection
                  <ArrowRight size={14} strokeWidth={1.5} />
                </span>
              </Button>
            </Link>
            <Link
              href="/lookbook"
              className="font-cond text-[11px] tracking-[0.18em] uppercase text-ink/70 hover:text-brick border-b border-ink/30 hover:border-brick pb-0.5 transition-colors"
            >
              View Lookbook
            </Link>
          </FadeIn>

          {/* Tiny stat row */}
          <FadeIn delay={0.45} className="mt-12 grid grid-cols-3 gap-4 sm:gap-6 max-w-md">
            {[
              { k: "Drops", v: "05" },
              { k: "Pieces", v: "120+" },
              { k: "Cities", v: "12" },
            ].map((s) => (
              <div key={s.k} className="border-t border-ink/15 pt-3">
                <div className="font-display text-2xl">{s.v}</div>
                <div className="font-cond text-[10px] tracking-[0.18em] uppercase text-ink/50 mt-0.5">
                  {s.k}
                </div>
              </div>
            ))}
          </FadeIn>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-ink/50">
        <span className="font-cond text-[10px] tracking-[0.22em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          <ChevronDown size={18} strokeWidth={1.5} />
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
