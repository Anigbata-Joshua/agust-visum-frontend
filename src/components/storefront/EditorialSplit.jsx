"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/Motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Alternating image + copy block. Use the `reverse` prop to flip the
 * image/copy sides on consecutive instances.
 */
export function EditorialSplit({
  kicker = "Craft",
  title = "Built for the archive.",
  body = "Every August Visum piece starts in the archive — a garment from a season we loved, a silhouette we wanted to refine, a fabric we wanted to live in. We work in small drops, with mills we know by name, on patterns we've tested for years.",
  ctaLabel = "Read the manifesto",
  ctaHref = "/lookbook",
  imageUrl = "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80",
  reverse = false,
  className,
}) {
  return (
    <section className={cn("py-16 sm:py-24", className)}>
      <Container size="wide">
        <div className="grid gap-10 lg:gap-12 items-center lg:grid-cols-12">
          <FadeIn
            className={cn(
              "lg:col-span-6",
              reverse ? "lg:col-start-7" : "lg:col-start-1"
            )}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-stone">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                style={{ backgroundImage: `url(${imageUrl})` }}
                role="img"
                aria-label="Editorial photography"
              />
            </div>
          </FadeIn>

          <FadeIn
            delay={0.1}
            className={cn(
              "lg:col-span-5",
              reverse ? "lg:col-start-1" : "lg:col-start-8"
            )}
          >
            <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
              {kicker}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-3 leading-[1.05]">
              {title}
            </h2>
            <p className="mt-5 text-sm sm:text-base text-ink/70 leading-relaxed font-body max-w-md">
              {body}
            </p>
            {ctaLabel && (
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 mt-6 font-cond text-[11px] tracking-[0.18em] uppercase text-ink hover:text-brick border-b border-ink/30 hover:border-brick pb-0.5 transition-colors"
              >
                {ctaLabel} <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
            )}
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}

export default EditorialSplit;
