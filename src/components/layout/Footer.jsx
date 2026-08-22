"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  FiInstagram,
  FiTwitter,
  FiFacebook,
  FiYoutube,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Social brand icons via `react-icons` (Feather pack). Light, tree-shakeable,
 * and visually consistent with the rest of the iconography.
 */
const socials = [
  { key: "instagram", label: "Instagram", Icon: FiInstagram },
  { key: "twitter", label: "Twitter", Icon: FiTwitter },
  { key: "facebook", label: "Facebook", Icon: FiFacebook },
  { key: "youtube", label: "YouTube", Icon: FiYoutube },
];

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/products" },
      { label: "New Arrivals", href: "/products" },
      { label: "Lookbook", href: "/lookbook" },
      { label: "Bestsellers", href: "/products" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Editorial", href: "/lookbook" },
      { label: "Contact", href: "/lookbook" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Shipping", href: "/lookbook" },
      { label: "Returns", href: "/lookbook" },
      { label: "FAQ", href: "/lookbook" },
      { label: "Size Guide", href: "/lookbook" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [openCol, setOpenCol] = useState(null);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // No backend endpoint for newsletter in the current API contract —
    // optimistically acknowledge. (Hook up to a real endpoint when available.)
    toast.success("You're on the list. Welcome to the archive.");
    setEmail("");
  };

  return (
    <footer className="mt-20 border-t border-ink/10 bg-off text-ink">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-6 lg:px-10 py-14 lg:py-20">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-12">
          {/* Brand block */}
          <div className="lg:col-span-4 space-y-5">
            <Link
              href="/"
              className="inline-block font-display text-2xl font-semibold tracking-tight"
            >
              August <span className="text-brick">Visum</span>
            </Link>
            <p className="font-body text-sm text-ink/70 leading-relaxed max-w-sm">
              Editorial streetwear, archive silhouettes, and modular classics.
              Built for the long term — never the season.
            </p>

            <div className="flex items-center gap-3 pt-2">
              {socials.map(({ key, label, Icon }) => (
                <a
                  key={key}
                  href="#"
                  aria-label={label}
                  className="w-10 h-10 border border-ink/15 flex items-center justify-center hover:bg-ink hover:text-off hover:border-ink transition-colors"
                >
                  <Icon size={15} strokeWidth={1.5} aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-5 grid sm:grid-cols-3 gap-8 sm:gap-6">
            {columns.map((col, idx) => {
              const isOpen = openCol === idx;
              return (
                <div key={col.title}>
                  <button
                    onClick={() => setOpenCol(isOpen ? null : idx)}
                    className="flex sm:cursor-default items-center justify-between w-full text-left sm:pointer-events-none font-cond text-[11px] tracking-[0.18em] uppercase text-ink mb-4"
                    aria-expanded={isOpen}
                  >
                    {col.title}
                    <span className="sm:hidden text-ink/40 text-xs">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  <ul
                    className={cn(
                      "space-y-3 font-body text-sm",
                      isOpen ? "block" : "hidden sm:block"
                    )}
                  >
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <Link
                          href={l.href}
                          className="text-ink/70 hover:text-brick transition-colors"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h4 className="font-cond text-[11px] tracking-[0.18em] uppercase text-ink mb-4">
              Newsletter
            </h4>
            <p className="font-body text-sm text-ink/70 mb-4 leading-relaxed">
              Drops, edits, and the occasional dispatch from the archive.
            </p>
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@archive.com"
                className="flex-1 min-w-0 bg-paper border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-brick placeholder:text-ink/40"
                required
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="bg-ink text-off px-3 hover:bg-brick transition-colors"
              >
                <ArrowRight size={16} strokeWidth={1.5} />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-14 lg:mt-20 pt-6 border-t border-ink/10 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 font-cond text-[10px] tracking-[0.18em] uppercase text-ink/50">
          <span>© {new Date().getFullYear()} August Visum — Forever Classics</span>
          <div className="flex items-center gap-5">
            <Link href="/lookbook" className="hover:text-brick">Privacy</Link>
            <Link href="/lookbook" className="hover:text-brick">Terms</Link>
            <Link href="/merchant/login" className="hover:text-brick">Merchant</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
