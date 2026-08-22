// NOTE: The current API contract has no /lookbook or /editorial endpoint.
// Content is sourced from this static file. When a real CMS or API call
// becomes available, replace the import in /lookbook/page.jsx and
// /lookbook/[slug]/page.jsx with a service call — no other changes needed.

export const lookbookEntries = [
  {
    slug: "field-coat-reissued",
    title: "The Field Coat, Reissued",
    excerpt:
      "A silhouette pulled from 2019, refined for the archive. Heavier cloth, cleaner lapel, same bones.",
    author: "August Visum Editorial",
    date: "2026-08-10",
    cover:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
    tags: ["Outerwear", "Reissue"],
    productIds: [], // populated by the page if real products match
    body: [
      {
        type: "paragraph",
        text: "The Field Coat was the second piece we ever put into the archive. It sold out in nine days, came back in the spring, sold out again. We didn't make it for two years. We're making it now — heavier, cleaner, more honest.",
      },
      {
        type: "paragraph",
        text: "The new cloth is from a mill in Yorkshire we've been working with since the second drop. It's a waxed, water-resistant cotton with a softer hand than the original. The lapel is wider by a centimetre, the hem is half an inch shorter. Everything else is the same — the same internal pocket layout, the same horn buttons, the same cut that won us a small handful of loyalists back in 2019.",
      },
      { type: "image", src: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80", alt: "Field coat detail" },
      {
        type: "paragraph",
        text: "We think of reissues as a kind of accountability. The first version set a standard. If we can't beat it, we shouldn't ship it. This one beats it.",
      },
    ],
  },
  {
    slug: "knit-modular-silhouettes",
    title: "Knit & Modular Silhouettes",
    excerpt:
      "Three pieces, four ways. The archive's first fully modular capsule — wear them apart, wear them together.",
    author: "August Visum Editorial",
    date: "2026-07-22",
    cover:
      "https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=1600&q=80",
    tags: ["Knitwear", "Capsule"],
    productIds: [],
    body: [
      {
        type: "paragraph",
        text: "Modularity is the through-line of Issue Nº 05. Three knit pieces — a crew, a half-zip, and a sleeveless shell — that can be layered in any combination, with hidden internal buttoning for attachment.",
      },
      {
        type: "paragraph",
        text: "The yarn is an undyed lambswool from a small Italian mill. We let the natural colour show through — bone, oat, charcoal — and skipped the usual finishing softeners. It will soften with wear.",
      },
      { type: "image", src: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1600&q=80", alt: "Knitwear details" },
    ],
  },
  {
    slug: "wide-trouser-photographed-in-accra",
    title: "The Wide Trouser, Photographed in Accra",
    excerpt:
      "Two weeks in Osu, three rolls of film, one trouser that never quite stopped being photographed.",
    author: "Photography by K. Mensah",
    date: "2026-07-04",
    cover:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1600&q=80",
    tags: ["Trousers", "Editorial"],
    productIds: [],
    body: [
      {
        type: "paragraph",
        text: "The wide trouser went to Accra with us. It came back photographed in every light, against every wall, on every surface. The cloth held up. So did the cut.",
      },
      { type: "image", src: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1600&q=80", alt: "Editorial in Accra" },
    ],
  },
  {
    slug: "object-study-tote",
    title: "Object Study: The Tote",
    excerpt:
      "An 18-month design process, distilled into a single considered object. The August Visum tote.",
    author: "August Visum Editorial",
    date: "2026-06-18",
    cover:
      "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=1600&q=80",
    tags: ["Objects"],
    productIds: [],
    body: [
      {
        type: "paragraph",
        text: "Totes are easy to get wrong. We made six prototypes before we shipped one. The final version uses 18oz canvas, double-stitched seams, brass hardware, and a hidden internal pocket sized for a passport.",
      },
    ],
  },
  {
    slug: "on-being-an-archive",
    title: "On Being an Archive",
    excerpt:
      "Why we restock, why we reissue, and why some pieces come back stronger the second time around.",
    author: "August Visum",
    date: "2026-05-30",
    cover:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
    tags: ["Brand"],
    productIds: [],
    body: [
      {
        type: "paragraph",
        text: "The archive is the through-line. We don't believe in the season — we believe in the piece. Some of the best things in the collection are older than the brand itself. They came back because the cloth lasted, the cut held, and the people who owned them kept wearing them.",
      },
    ],
  },
];

export function getLookbookBySlug(slug) {
  return lookbookEntries.find((e) => e.slug === slug) || null;
}
