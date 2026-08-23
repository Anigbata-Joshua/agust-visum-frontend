import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FadeIn, FadeUp } from "@/components/ui/Motion";

/**
 * About page — static editorial. A long-form statement of intent, sourcing,
 * and values, designed to read like the closing essay of an issue.
 */

const principles = [
  {
    n: "01",
    title: "Archive, not season.",
    body:
      "We don't move on the next drop. We move on the next piece. Silhouettes are kept in rotation for as long as the fabric and the wear justify them.",
  },
  {
    n: "02",
    title: "Mills we know by name.",
    body:
      "Every August Visum textile is sourced from a mill we've worked with for at least two seasons. We share specs, swatches, and notes the long way around.",
  },
  {
    n: "03",
    title: "Patterns we've tested for years.",
    body:
      "A field coat isn't a sketch — it's the seventh refinement of a pattern that started in 2019. We don't ship drafts; we ship decisions.",
  },
  {
    n: "04",
    title: "If it isn't ready, it doesn't ship.",
    body:
      "Lead times flex. Drops slip. We don't apologize for it — we'd rather the piece arrive as intended than on schedule.",
  },
];

const milestones = [
  { year: "2019", text: "Founded in Lagos as a pattern archive." },
  { year: "2020", text: "First modular knit, hand-finished in 12 pieces." },
  { year: "2021", text: "Field coat debut — sold out in 72 hours, restocked twice." },
  { year: "2023", text: "Studio expanded to Accra. Wide trouser drops in raw cotton." },
  { year: "2025", text: "Issue Nº 05 ships to twelve cities." },
];

export default function AboutPage() {
  return (
    <main className="bg-paper text-ink">
      {/* Cover */}
      <section className="border-b border-ink/10 bg-off">
        <Container size="wide" className="py-16 sm:py-24 lg:py-32">
          <FadeIn>
            <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
              About — Issue Nº 05
            </span>
          </FadeIn>
          <FadeUp delay={0.1} className="mt-3 max-w-4xl">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
              An archive of
              <br />
              <span className="italic text-brick">quiet decisions.</span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.2} className="mt-8 max-w-2xl">
            <p className="text-base sm:text-lg text-ink/75 leading-relaxed font-body">
              August Visum is a small label working in long, slow drops —
              the kind you can keep, repair, and wear for a decade. We make
              clothes for the archive: pieces refined until they're worth the
              shipping.
            </p>
          </FadeUp>
        </Container>
      </section>

      {/* Manifesto */}
      <section className="py-16 sm:py-24">
        <Container size="wide" className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4">
            <FadeIn>
              <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
                Manifesto
              </span>
              <h2 className="font-display text-3xl sm:text-4xl mt-2 leading-[1.05]">
                What we believe.
              </h2>
            </FadeIn>
          </div>
          <FadeUp delay={0.05} className="lg:col-span-8 space-y-6">
            <p className="text-base sm:text-lg text-ink/80 leading-relaxed font-body">
              We started August Visum because the things we kept wearing
              weren't the things we were buying. They were the things we'd
              found by accident, in the back of a sample room, on a friend,
              or half-forgotten in the corner of a closet.
            </p>
            <p className="text-base sm:text-lg text-ink/80 leading-relaxed font-body">
              We make pieces like that on purpose. Patterns that don't
              apologize. Fabrics that earn their second season. Cuts that
              assume you'll wear them twice a week for ten years.
            </p>
            <p className="text-base sm:text-lg text-ink/80 leading-relaxed font-body">
              The archive is the brief. The brief is the archive. Everything
              else is a calendar.
            </p>
          </FadeUp>
        </Container>
      </section>

      {/* Principles */}
      <section className="py-16 sm:py-24 border-y border-ink/10 bg-off">
        <Container size="wide">
          <FadeIn className="max-w-2xl mb-12">
            <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
              Principles
            </span>
            <h2 className="font-display text-3xl sm:text-4xl mt-2 leading-[1.05]">
              Four rules we hold.
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
            {principles.map((p, i) => (
              <FadeUp key={p.n} delay={i * 0.05}>
                <div className="flex gap-5">
                  <span className="font-display text-3xl text-brick leading-none">
                    {p.n}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl">{p.title}</h3>
                    <p className="mt-3 text-sm sm:text-base text-ink/70 leading-relaxed font-body">
                      {p.body}
                    </p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </Container>
      </section>

      {/* Timeline */}
      <section className="py-16 sm:py-24">
        <Container size="wide">
          <FadeIn className="max-w-2xl mb-12">
            <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
              Timeline
            </span>
            <h2 className="font-display text-3xl sm:text-4xl mt-2 leading-[1.05]">
              A short history.
            </h2>
          </FadeIn>

          <ol className="border-t border-ink/15">
            {milestones.map((m, i) => (
              <FadeUp key={m.year} delay={i * 0.04}>
                <li className="grid grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr] gap-6 py-5 border-b border-ink/10">
                  <span className="font-display text-2xl text-brick">
                    {m.year}
                  </span>
                  <p className="text-base sm:text-lg text-ink/80 leading-relaxed font-body">
                    {m.text}
                  </p>
                </li>
              </FadeUp>
            ))}
          </ol>
        </Container>
      </section>

      {/* Editorial split */}
      <section className="py-16 sm:py-24 border-t border-ink/10 bg-off">
        <Container size="wide" className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <FadeIn>
            <div className="aspect-[4/5] bg-stone overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80"
                alt="Studio detail"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </FadeIn>

          <FadeUp delay={0.1}>
            <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
              Studio
            </span>
            <h2 className="font-display text-3xl sm:text-4xl mt-2 leading-[1.05]">
              Lagos &amp; Accra.
            </h2>
            <p className="mt-4 text-base text-ink/75 leading-relaxed font-body max-w-md">
              The studio runs on two floors above a printer's workshop in
              Yaba, with a pattern room in Osu. We meet weekly, argue
              weekly, and ship when the room is quiet.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/lookbook">
                <Button variant="primary" size="md">
                  <span className="inline-flex items-center gap-2">
                    Read the lookbook
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </span>
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="ghost" size="md">
                  Shop the archive
                </Button>
              </Link>
            </div>
          </FadeUp>
        </Container>
      </section>
    </main>
  );
}
