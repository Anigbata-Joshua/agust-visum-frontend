"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Tags,
  TrendingUp,
  Store,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useMerchantStore } from "@/store/useMerchantStore";
import { useMerchantHydration } from "@/hooks/useMerchantHydration";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/merchant/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/merchant/products", label: "Products", Icon: Package },
  { href: "/merchant/categories", label: "Categories", Icon: Tags },
  { href: "/merchant/sales", label: "Sales", Icon: TrendingUp },
  { href: "/merchant/settings", label: "Store Settings", Icon: Store, soon: true },
];

export function MerchantSidebar() {
  // Hydrate the merchant auth store from localStorage on first mount.
  useMerchantHydration();
  const pathname = usePathname();
  const router = useRouter();
  const { merchant, logout } = useMerchantStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await logout();
    router.push("/merchant/login");
  };

  const isActive = (href) => pathname === href || pathname?.startsWith(`${href}/`);

  const nav = (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ href, label, Icon, soon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={soon ? "#" : href}
            aria-disabled={soon || undefined}
            onClick={(e) => {
              if (soon) {
                e.preventDefault();
              }
            }}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 font-cond text-[11px] tracking-[0.16em] uppercase transition-colors",
              active
                ? "bg-ink text-off border-l-2 border-brick pl-[10px]"
                : "text-off/70 hover:text-off hover:bg-ink/30",
              soon && "opacity-50 pointer-events-none"
            )}
          >
            <Icon size={16} strokeWidth={1.5} />
            <span className="flex-1">{label}</span>
            {soon && (
              <span className="text-[9px] tracking-widest text-off/40">
                SOON
              </span>
            )}
            {active && <ChevronRight size={12} strokeWidth={1.5} className="text-brick" />}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-ink text-off border-r border-off/10 flex-col z-30">
        <div className="px-5 py-5 border-b border-off/10">
          <Link
            href="/merchant/dashboard"
            className="font-display text-lg font-semibold flex items-center gap-2"
          >
            August <span className="text-brick">Visum</span>
            <span className="font-cond text-[9px] tracking-[0.18em] uppercase text-off/40 ml-auto">
              Merchant
            </span>
          </Link>
          {merchant?.store_name && (
            <p className="mt-2 font-cond text-[10px] tracking-[0.16em] uppercase text-off/55 truncate">
              {merchant.store_name}
            </p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {nav}
        </div>
        <div className="border-t border-off/10 p-3 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 font-cond text-[11px] tracking-[0.16em] uppercase text-off/55 hover:text-off hover:bg-ink/30 transition-colors"
          >
            <ExternalLink size={14} strokeWidth={1.5} />
            View storefront
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 font-cond text-[11px] tracking-[0.16em] uppercase text-off/55 hover:text-brick hover:bg-ink/30 transition-colors"
          >
            <LogOut size={14} strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-ink text-off border-b border-off/10 flex items-center justify-between px-4 h-14">
        <Link
          href="/merchant/dashboard"
          className="font-display text-base font-semibold"
        >
          August <span className="text-brick">Visum</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="w-10 h-10 -mr-2 flex items-center justify-center hover:text-brick"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
              className="fixed top-0 left-0 bottom-0 w-[88vw] max-w-sm bg-ink text-off z-50 lg:hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Merchant menu"
            >
              <div className="px-5 py-4 border-b border-off/10 flex items-center justify-between">
                <Link
                  href="/merchant/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-lg font-semibold"
                >
                  August <span className="text-brick">Visum</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="w-10 h-10 -mr-2 flex items-center justify-center hover:text-brick"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4 px-3">
                {nav}
              </div>
              <div className="border-t border-off/10 p-3 space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 font-cond text-[11px] tracking-[0.16em] uppercase text-off/55 hover:text-off"
                >
                  <ExternalLink size={14} strokeWidth={1.5} />
                  View storefront
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 font-cond text-[11px] tracking-[0.16em] uppercase text-off/55 hover:text-brick"
                >
                  <LogOut size={14} strokeWidth={1.5} />
                  Sign out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default MerchantSidebar;
