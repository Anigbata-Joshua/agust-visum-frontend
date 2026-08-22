"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Hydrates the cart store for the current user. Returns a `hydrated`
 * flag that flips to `true` once the first fetch completes (success
 * or fail) — useful to gate flash-of-empty-state UI.
 */
export function useCartHydration() {
  const { isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setHydrated(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await fetchCart();
      } catch {
        // store handles its own error state
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, fetchCart]);

  return { hydrated };
}

export default useCartHydration;
