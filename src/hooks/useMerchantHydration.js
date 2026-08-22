"use client";

import { useEffect, useState } from "react";
import { useMerchantStore } from "@/store/useMerchantStore";

/**
 * Mount-once hook that hydrates the merchant auth store from localStorage.
 *
 * Why this exists:
 *   The Zustand store factory runs *once* per render cycle. If we read
 *   `localStorage` from inside the factory on the server, we'd get nothing
 *   (no `window`). If we read it on the client, the factory would still
 *   hold the server-initialised `isAuthenticated=false` for the very first
 *   render, causing `RequireMerchantAuth` to redirect even when the merchant
 *   *is* signed in (visible as "sidebar shows, dashboard is blank").
 *
 *   The fix is to defer localStorage reads to a client-only effect.
 */
export function useMerchantHydration() {
  const [ready, setReady] = useState(false);
  const hydrate = useMerchantStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  return ready;
}

export default useMerchantHydration;
