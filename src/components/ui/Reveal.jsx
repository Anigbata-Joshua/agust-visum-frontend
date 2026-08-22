"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveal — a wrapper that applies a fade+rise once the element scrolls
 * into view. Built on top of the existing `.reveal` / `.in-view` CSS system
 * in `globals.css` (so `prefers-reduced-motion` is already respected).
 *
 * Use as:
 *   <Reveal as="section"><...></Reveal>
 *   <Reveal as="div" delay={120}><...></Reveal>
 */
export function Reveal({
  as: As = "div",
  delay = 0,
  className,
  children,
  threshold = 0.12,
  ...props
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!ref.current) return;
    // Respect reduced motion: just show.
    const prefersReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduce) {
      setShown(true);
      return;
    }
    const node = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            obs.disconnect();
          }
        });
      },
      { threshold }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold]);

  return (
    <As
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : undefined }}
      className={cn("reveal", shown && "in-view", className)}
      {...props}
    >
      {children}
    </As>
  );
}

export default Reveal;
