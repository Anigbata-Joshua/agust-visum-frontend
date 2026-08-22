import { cn } from "@/lib/utils";

/**
 * Standard horizontal container with consistent max-width scale.
 * `size` maps to the editorial max-widths used across the site.
 *  - `narrow`:  ~720px  (forms, articles)
 *  - `default`: ~1280px (most pages)
 *  - `wide`:    ~1440px (grids, marketing sections)
 *  - `bleed`:   100% width (full-bleed sections handle their own inner padding)
 */
export function Container({ size = "default", className, children, as: As = "div", ...props }) {
  const sizes = {
    narrow: "max-w-3xl",
    default: "max-w-7xl",
    wide: "max-w-[1440px]",
    bleed: "max-w-none",
  };
  return (
    <As className={cn("mx-auto w-full px-5 sm:px-6 lg:px-10", sizes[size], className)} {...props}>
      {children}
    </As>
  );
}

export default Container;
