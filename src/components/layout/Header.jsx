"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, User, ShoppingBag, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useUserHydration } from "@/hooks/useUserHydration";
import { cn } from "@/lib/utils";

/** Returns true when the current path matches (or is nested under) `href`. */
function useIsActive(href) {
  const pathname = usePathname();
  if (href === "/") return pathname === "/";
  return pathname === href || pathname?.startsWith(`${href}/`);
}

function NavLink({ href, children, mobile = false, onClick }) {
  const active = useIsActive(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative font-cond uppercase tracking-[0.14em] transition-colors duration-200",
        mobile ? "text-2xl font-display tracking-normal" : "text-[11px]",
        active ? "text-brick" : "text-ink hover:text-brick"
      )}
    >
      <span>{children}</span>
      {!mobile && (
        <span
          aria-hidden
          className={cn(
            "absolute -bottom-1.5 left-0 h-px bg-brick transition-all duration-300",
            active ? "w-full" : "w-0 group-hover:w-full"
          )}
        />
      )}
      {mobile && active && (
        <ChevronRight size={18} className="inline ml-2 -mt-1 text-brick" />
      )}
    </Link>
  );
}

export function Header() {
  // Hydrate the user auth store from localStorage on first mount.
  useUserHydration();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const itemCount = cart?.items?.length ?? 0;
  const showCount = mounted && isAuthenticated;

  return (
    <>
      {/* Editorial top bar — kicker label only visible on lg+ */}
      <div className="hidden lg:block bg-ink text-off">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 h-8 flex items-center justify-between font-cond text-[10px] tracking-[0.18em] uppercase">
          <span>Free shipping on orders over ₦150,000</span>
          <span className="text-off/60">Forever Classics — Volume Nº 05</span>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 bg-paper border-b border-ink/10 transition-shadow duration-200",
          scrolled && "shadow-[0_2px_24px_rgba(23,20,15,0.06)]"
        )}
      >
        <div
          className={cn(
            "max-w-[1440px] mx-auto px-5 sm:px-6 lg:px-10 flex items-center justify-between gap-4 transition-[height] duration-200",
            scrolled ? "h-14 lg:h-16" : "h-16 lg:h-20"
          )}
        >
          {/* Brand */}
          <Link
            href="/"
            className="font-display text-lg sm:text-xl font-semibold tracking-tight"
            aria-label="August Visum home"
          >
            August <span className="text-brick">Visum</span>
          </Link>

          {/* Desktop primary nav */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="/products">Shop</NavLink>
            <NavLink href="/lookbook">Lookbook</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/cart">Bag</NavLink>
          </nav>

          {/* Utility icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle tone="light" className="hidden sm:inline-flex" />
            <Link
              href="/products"
              aria-label="Search"
              className="hidden sm:inline-flex w-10 h-10 items-center justify-center hover:text-brick transition-colors"
            >
              <Search size={18} strokeWidth={1.5} />
            </Link>
            <Link
              href={mounted && isAuthenticated ? "/auth" : "/auth"}
              aria-label="Account"
              className="hidden sm:inline-flex w-10 h-10 items-center justify-center hover:text-brick transition-colors"
              title={mounted && isAuthenticated ? user?.full_name || user?.email : "Sign in"}
            >
              <User size={18} strokeWidth={1.5} />
            </Link>

            <Link
              href="/cart"
              aria-label={`Bag, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
              className="relative w-10 h-10 inline-flex items-center justify-center hover:text-brick transition-colors"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <AnimatePresence>
                {showCount && itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 26 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-brick text-off text-[10px] font-cond font-semibold tracking-wide flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden w-10 h-10 -mr-2 flex items-center justify-center hover:text-brick transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>

            {/* Merchant entry (visually de-emphasised) */}
            <Link
              href="/merchant/login"
              className="hidden lg:inline-flex ml-2 pl-3 border-l border-ink/15 font-cond text-[10px] tracking-[0.18em] uppercase text-ink/40 hover:text-brick transition-colors"
            >
              Merchant
            </Link>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)}>
        <div className="flex flex-col gap-6">
          <nav className="flex flex-col gap-5">
            <MobileLink href="/products" onClick={() => setMenuOpen(false)}>Shop</MobileLink>
            <MobileLink href="/lookbook" onClick={() => setMenuOpen(false)}>Lookbook</MobileLink>
            <MobileLink href="/about" onClick={() => setMenuOpen(false)}>About</MobileLink>
            <MobileLink href="/cart" onClick={() => setMenuOpen(false)}>
              Bag {showCount ? `(${itemCount})` : ""}
            </MobileLink>
          </nav>

          <div className="h-px bg-ink/10" />

          <div className="flex flex-col gap-4">
            {mounted && isAuthenticated ? (
              <>
                <span className="font-cond text-[11px] tracking-[0.14em] uppercase text-ink/50">
                  {user?.full_name || user?.email}
                </span>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="font-cond text-xs tracking-[0.14em] uppercase text-ink hover:text-brick text-left"
                >
                  Sign out
                </button>
              </>
            ) : (
              <MobileLink href="/auth" onClick={() => setMenuOpen(false)}>Sign in / Register</MobileLink>
            )}

            <MobileLink
              href="/merchant/login"
              onClick={() => setMenuOpen(false)}
              muted
            >
              Merchant portal
            </MobileLink>
          </div>
        </div>
      </MobileMenu>
    </>
  );
}

/** A mobile nav link styled larger with a chevron-ish hover. */
function MobileLink({ href, children, onClick, muted = false }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "font-display text-2xl tracking-tight transition-colors",
        muted ? "text-ink/40 text-base" : "text-ink hover:text-brick"
      )}
    >
      {children}
    </Link>
  );
}

export default Header;
