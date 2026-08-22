import { HeroSection } from "@/components/storefront/HeroSection";
import { Ticker } from "@/components/storefront/Ticker";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { ShopTheLookRail } from "@/components/storefront/ShopTheLookRail";
import { EditorialSplit } from "@/components/storefront/EditorialSplit";
import { LookbookTeaser } from "@/components/storefront/LookbookTeaser";
import { TestimonialsStrip } from "@/components/storefront/TestimonialsStrip";
import { NewsletterCTA } from "@/components/storefront/NewsletterCTA";

/**
 * Homepage — composed entirely of storefront section components so each
 * piece is independently testable, swappable, and reusable.
 */
export default function HomePage() {
  return (
    <main className="bg-paper text-ink">
      <HeroSection />

      <Ticker />

      <ProductGrid
        className="py-16 sm:py-24"
        kicker="New Arrivals"
        title="The latest drop."
        subtitle="Pieces from Issue Nº 05 — released, photographed, and ready."
        fetchParams={{ limit: 8 }}
      />

      <ShopTheLookRail />

      <EditorialSplit
        kicker="The Manifesto"
        title="Built for the archive, not the season."
        body="Every August Visum piece starts in the archive — a silhouette we wanted to refine, a fabric we wanted to live in. We work in small drops, with mills we know by name, on patterns we've tested for years. If a piece isn't ready, it doesn't ship. If it doesn't last, it doesn't ship."
        ctaLabel="Read the manifesto"
        ctaHref="/lookbook"
        imageUrl="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80"
      />

      <ProductGrid
        className="py-16 sm:py-24 bg-off border-y border-ink/10"
        kicker="Bestsellers"
        title="The pieces that come back."
        subtitle="The most restocked, most loved, most kept silhouettes in the archive."
        fetchParams={{ limit: 4 }}
        columns="grid-cols-2 md:grid-cols-4"
      />

      <EditorialSplit
        reverse
        kicker="Field Notes"
        title="Considered details, considered cuts."
        body="Hidden interior pockets, modular buttoning for re-tailoring, double-stitched seams at every stress point. We don't talk about these things on the product page — we'd rather they show up after a year of wear."
        ctaLabel="See the details"
        ctaHref="/lookbook"
        imageUrl="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=80"
      />

      <LookbookTeaser />

      <TestimonialsStrip />

      <NewsletterCTA />
    </main>
  );
}
