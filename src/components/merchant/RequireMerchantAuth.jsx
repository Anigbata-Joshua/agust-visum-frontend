"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMerchantStore } from "@/store/useMerchantStore";
import { useMerchantHydration } from "@/hooks/useMerchantHydration";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Wraps the merchant route group. While the Zustand store hydrates from
 * localStorage on the client, shows a loading skeleton (no flash of
 * protected content). If hydration finishes and the merchant is not
 * authenticated, redirects to /merchant/login and preserves the
 * originally-requested path in `?return=`.
 *
 * Render this *inside* the merchant layout so it covers every nested
 * page uniformly — no per-page checks needed.
 *
 * NOTE: /merchant/login itself must never be gated by this component —
 * it's the one page an unauthenticated merchant is supposed to see.
 * Without this early return, an unauthenticated visit to /merchant/login
 * would try to router.replace("/merchant/login") — the same URL it's
 * already on — which never actually re-navigates, so the component gets
 * stuck rendering "Redirecting to sign in…" forever instead of the login
 * form. (Longer-term fix: move /merchant/login outside the layout that
 * renders this guard entirely, via a Next.js route group, so this
 * path-string check isn't needed at all.)
 */
export function RequireMerchantAuth({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useMerchantHydration();
  const isAuthenticated = useMerchantStore((s) => s.isAuthenticated);

  const isLoginPage = pathname === "/merchant/login";

  useEffect(() => {
    if (isLoginPage) return;
    if (!hydrated) return;
    if (!isAuthenticated) {
      const returnTo = pathname
        ? `?return=${encodeURIComponent(pathname)}`
        : "";
      router.replace(`/merchant/login${returnTo}`);
    }
  }, [hydrated, isAuthenticated, router, pathname, isLoginPage]);

  if (isLoginPage) {
    return children;
  }

  if (!hydrated) {
    return (
      <div className="px-6 py-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 !bg-off/10" />
          ))}
        </div>
        <Skeleton className="h-64 !bg-off/10" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="px-6 py-12 max-w-7xl mx-auto w-full">
        <p className="font-cond text-[11px] tracking-[0.18em] uppercase text-off/50">
          Redirecting to sign in…
        </p>
      </div>
    );
  }

  return children;
}

export default RequireMerchantAuth;