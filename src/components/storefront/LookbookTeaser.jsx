"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/Motion";

/**
 * Lookbook teaser — 2–3 image editorial spread with a CTA into /lookbook.
 * Image content is intentionally curated; this is a teaser so the real
 * grid lives on /lookbook.
 */
const spreads = [
  {
    title: "The Field Coat, Reissued",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80",
    span: "lg:col-span-7",
  },
  {
    title: "Knit & Modular Silhouettes",
    image:
      "https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=900&q=80",
    span: "lg:col-span-5",
  },
];

export function LookbookTeaser() {
  return (
    <section className="bg-ink text-off">
      <Container size="wide" className="py-16 sm:py-24">
        <FadeIn className="flex items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
              The Lookbook
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-2 leading-[1.05]">
              Editorial Nº 05
            </h2>
            <p className="mt-3 text-sm text-off/70 max-w-md font-body">
              Photographed on the streets of Lagos and Accra. Built to be lived in.
            </p>
          </div>
          <Link
            href="/lookbook"
            className="hidden sm:inline-flex items-center gap-2 font-cond text-[11px] tracking-[0.18em] uppercase text-off hover:text-brick border-b border-off/30 hover:border-brick pb-0.5 transition-colors"
          >
            Read the edit <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {spreads.map((s, i) => (
            <FadeIn
              key={s.title}
              delay={i * 0.08}
              className={`${s.span} aspect-[4/5] lg:aspect-[3/4] relative group overflow-hidden`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${s.image})` }}
                role="img"
                aria-label={s.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6">
                <div className="font-display text-2xl sm:text-3xl">{s.title}</div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-8 sm:hidden" delay={0.2}>
          <Link
            href="/lookbook"
            className="inline-flex items-center gap-2 font-cond text-[11px] tracking-[0.18em] uppercase text-off hover:text-brick border-b border-off/30 hover:border-brick pb-0.5 transition-colors"
          >
            Read the edit <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </FadeIn>
      </Container>
    </section>
  );
}

export default LookbookTeaser;
