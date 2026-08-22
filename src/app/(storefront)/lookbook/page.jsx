import Link from "next/link";
import { Calendar, ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn, StaggerGrid, StaggerItem } from "@/components/ui/Motion";
import { lookbookEntries } from "@/data/lookbook";

export const metadata = {
  title: "Lookbook — August Visum",
  description: "Editorial photography, brand writing, and pieces from the archive.",
};

function formatDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

export default function LookbookPage() {
  const [hero, ...rest] = lookbookEntries;

  return (
    <main className="bg-paper text-ink">
      <section className="border-b border-ink/10 bg-off">
        <Container size="wide" className="py-14 sm:py-20">
          <FadeIn>
            <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
              The Lookbook
            </span>
          </FadeIn>
          <FadeIn delay={0.1} as="h1" className="font-display text-5xl sm:text-6xl lg:text-7xl mt-3 leading-[0.95]">
            Editorial <span className="italic text-brick">Nº 05</span>
          </FadeIn>
          <FadeIn delay={0.2} className="mt-4 max-w-xl text-sm sm:text-base text-ink/70 font-body">
            Field notes, photo essays, and reissue announcements from the
            August Visum archive. Photographed on the streets we live and work
            in.
          </FadeIn>
        </Container>
      </section>

      {/* Hero entry */}
      {hero && (
        <Container size="wide" className="py-10 sm:py-14">
          <FadeIn>
            <Link
              href={`/lookbook/${hero.slug}`}
              className="group block grid lg:grid-cols-12 gap-6 lg:gap-10 items-center"
            >
              <div className="lg:col-span-7 relative aspect-[4/3] overflow-hidden bg-stone">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${hero.cover})` }}
                  role="img"
                  aria-label={hero.title}
                />
              </div>
              <div className="lg:col-span-5">
                <div className="flex items-center gap-2 font-cond text-[10px] tracking-[0.18em] uppercase text-ink/55">
                  <Calendar size={11} strokeWidth={1.5} />
                  {formatDate(hero.date)}
                  {hero.tags?.[0] && (
                    <>
                      <span className="text-ink/30">·</span>
                      <span className="text-brick">{hero.tags[0]}</span>
                    </>
                  )}
                </div>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-3 leading-[1.05] group-hover:text-brick transition-colors">
                  {hero.title}
                </h2>
                <p className="mt-3 text-sm sm:text-base text-ink/70 font-body max-w-md leading-relaxed">
                  {hero.excerpt}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 font-cond text-[11px] tracking-[0.18em] uppercase text-ink border-b border-ink/30 group-hover:text-brick group-hover:border-brick pb-0.5 transition-colors">
                  Read the edit <ArrowRight size={13} strokeWidth={1.5} />
                </div>
              </div>
            </Link>
          </FadeIn>
        </Container>
      )}

      {/* Grid */}
      <Container size="wide" className="pb-20 sm:pb-28">
        <div className="border-t border-ink/10 pt-12 sm:pt-16">
          <FadeIn className="flex items-end justify-between gap-4 mb-8">
            <h3 className="font-display text-2xl sm:text-3xl">More from the archive</h3>
            <span className="font-cond text-[10px] tracking-[0.18em] uppercase text-ink/50">
              {rest.length} entries
            </span>
          </FadeIn>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {rest.map((entry) => (
              <StaggerItem key={entry.slug}>
                <Link
                  href={`/lookbook/${entry.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-stone">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${entry.cover})` }}
                      role="img"
                      aria-label={entry.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 w-9 h-9 bg-paper/90 border border-ink/10 flex items-center justify-center group-hover:bg-ink group-hover:text-off transition-colors">
                      <ArrowUpRight size={14} strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="flex items-center gap-2 font-cond text-[10px] tracking-[0.18em] uppercase text-ink/55">
                      <Calendar size={11} strokeWidth={1.5} />
                      {formatDate(entry.date)}
                      {entry.tags?.[0] && (
                        <>
                          <span className="text-ink/30">·</span>
                          <span className="text-brick">{entry.tags[0]}</span>
                        </>
                      )}
                    </div>
                    <h4 className="font-display text-xl sm:text-2xl mt-2 leading-snug group-hover:text-brick transition-colors">
                      {entry.title}
                    </h4>
                    <p className="mt-1.5 text-sm text-ink/65 font-body line-clamp-2">
                      {entry.excerpt}
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </Container>
    </main>
  );
}
