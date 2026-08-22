import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/Motion";
import { ProductCard } from "@/components/storefront/ProductCard";
import { getLookbookBySlug, lookbookEntries } from "@/data/lookbook";
import { productService } from "@/services/product.service";

export async function generateStaticParams() {
  return lookbookEntries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = getLookbookBySlug(slug);
  if (!entry) return { title: "Lookbook — August Visum" };
  return {
    title: `${entry.title} — August Visum Lookbook`,
    description: entry.excerpt,
  };
}

function formatDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

export default async function LookbookArticlePage({ params }) {
  const { slug } = await params;
  const entry = getLookbookBySlug(slug);
  if (!entry) notFound();

  // Try to source related products from the real catalog. If the API is
  // unreachable, fall back to a static "shop the look" suggestion.
  let related = [];
  try {
    const res = await productService.list({ limit: 4 });
    const list = res?.data?.products ?? res?.data?.results ?? res?.data ?? [];
    related = Array.isArray(list) ? list.slice(0, 4) : [];
  } catch {
    related = [];
  }

  return (
    <main className="bg-paper text-ink">
      {/* Cover */}
      <section className="relative h-[58vh] sm:h-[68vh] lg:h-[76vh] overflow-hidden bg-ink">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${entry.cover})` }}
          role="img"
          aria-label={entry.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/30" />
        <Container size="wide" className="relative h-full flex flex-col justify-end pb-10 sm:pb-14">
          <div className="text-off max-w-2xl">
            <Link
              href="/lookbook"
              className="inline-flex items-center gap-2 font-cond text-[10px] tracking-[0.18em] uppercase text-off/70 hover:text-off mb-5"
            >
              <ArrowLeft size={12} strokeWidth={1.5} /> The Lookbook
            </Link>
            <div className="flex items-center gap-3 font-cond text-[10px] tracking-[0.18em] uppercase text-off/70">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={11} strokeWidth={1.5} />
                {formatDate(entry.date)}
              </span>
              {entry.author && (
                <>
                  <span className="text-off/30">·</span>
                  <span>{entry.author}</span>
                </>
              )}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl mt-3 leading-[1.02]">
              {entry.title}
            </h1>
          </div>
        </Container>
      </section>

      {/* Body */}
      <Container size="narrow" className="py-14 sm:py-20">
        <FadeIn>
          <p className="font-display text-2xl leading-snug text-ink/90 mb-8">
            {entry.excerpt}
          </p>
        </FadeIn>

        <article className="prose-editorial space-y-7">
          {entry.body?.map((block, i) => {
            if (block.type === "image") {
              return (
                <FadeIn key={i} className="my-2">
                  <figure className="border border-ink/10">
                    <div
                      className="aspect-[16/10] bg-cover bg-center"
                      style={{ backgroundImage: `url(${block.src})` }}
                      role="img"
                      aria-label={block.alt}
                    />
                    {block.alt && (
                      <figcaption className="px-3 py-2 font-cond text-[10px] tracking-[0.18em] uppercase text-ink/50 bg-off">
                        {block.alt}
                      </figcaption>
                    )}
                  </figure>
                </FadeIn>
              );
            }
            return (
              <FadeIn key={i}>
                <p className="text-base sm:text-[17px] text-ink/80 font-body leading-relaxed">
                  {block.text}
                </p>
              </FadeIn>
            );
          })}
        </article>

        {/* Tags */}
        {entry.tags?.length > 0 && (
          <div className="mt-12 pt-6 border-t border-ink/10 flex flex-wrap items-center gap-2">
            <span className="font-cond text-[10px] tracking-[0.18em] uppercase text-ink/50 mr-1">
              Filed under
            </span>
            {entry.tags.map((t) => (
              <span
                key={t}
                className="border border-ink/15 px-3 py-1 font-cond text-[10px] tracking-[0.18em] uppercase text-ink/70"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </Container>

      {/* Shop the look */}
      <section className="bg-off border-y border-ink/10">
        <Container size="wide" className="py-14 sm:py-20">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
                Shop the look
              </span>
              <h2 className="font-display text-2xl sm:text-3xl mt-2">
                Pieces from the archive
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 font-cond text-[11px] tracking-[0.18em] uppercase text-ink hover:text-brick border-b border-ink/30 hover:border-brick pb-0.5 transition-colors"
            >
              View all <ArrowRight size={13} strokeWidth={1.5} />
            </Link>
          </div>

          {related.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink/50 font-body">
              No live products to feature right now — visit the shop to see
              the current drop.
            </p>
          )}
        </Container>
      </section>
    </main>
  );
}
