"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/Motion";
import { toast } from "sonner";

/**
 * Newsletter / CTA banner. Used as a full-width band before the footer
 * and as the in-footer form. The current API contract has no newsletter
 * endpoint, so this is optimistic — drop in a real call when ready.
 */
export function NewsletterCTA({
  kicker = "Newsletter",
  title = "Drops, edits, archive dispatches.",
  body = "Once a month, on a slow day. No tracking links, no noise.",
  onSubscribe,
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setSubmitting(true);
      if (onSubscribe) await onSubscribe(email);
      else toast.success("You're on the list. Welcome to the archive.");
      setEmail("");
    } catch {
      toast.error("Could not subscribe. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-brick text-off">
      <Container size="wide" className="py-16 sm:py-20">
        <FadeIn className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-off/70">
              {kicker}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-2 leading-[1.05]">
              {title}
            </h2>
            <p className="mt-3 text-sm text-off/80 max-w-md font-body">
              {body}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="lg:col-span-5 flex w-full"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@archive.com"
              required
              className="flex-1 min-w-0 bg-off text-ink placeholder:text-ink/40 border border-off/0 px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-off"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-ink text-off px-5 sm:px-6 font-cond text-[11px] tracking-[0.18em] uppercase hover:bg-paper hover:text-ink transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {submitting ? "…" : (<>Subscribe <ArrowRight size={14} strokeWidth={1.5} /></>)}
            </button>
          </form>
        </FadeIn>
      </Container>
    </section>
  );
}

export default NewsletterCTA;
