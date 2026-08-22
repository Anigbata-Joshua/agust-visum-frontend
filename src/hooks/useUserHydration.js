"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Mount-once hook that hydrates the user auth store from localStorage.
 * See `useMerchantHydration` for the same pattern.
 */
export function useUserHydration() {
  const [ready, setReady] = useState(false);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  return ready;
}

export default useUserHydration;
