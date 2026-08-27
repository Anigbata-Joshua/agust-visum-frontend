"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMerchantStore } from "@/store/useMerchantStore";
import { useMerchantHydration } from "@/hooks/useMerchantHydration";
import { Skeleton } from "@/components/ui/Skeleton";

export function RequireMerchantAuth({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useMerchantHydration();
  const isAuthenticated = useMerchantStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      const returnTo = pathname
        ? `?return=${encodeURIComponent(pathname)}`
        : "";
      router.replace(`/merchant/login${returnTo}`);
    }
  }, [hydrated, isAuthenticated, router, pathname]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-4">
          <Skeleton className="h-4 w-24 !bg-off/10" />
          <Skeleton className="h-8 w-full !bg-off/10" />
          <Skeleton className="h-8 w-3/4 !bg-off/10" />
          {hydrated && (
            <p className="font-cond text-[11px] tracking-[0.18em] uppercase text-off/50 pt-2">
              Redirecting to sign in…
            </p>
          )}
        </div>
      </div>
    );
  }

  return children;
}

export default RequireMerchantAuth;