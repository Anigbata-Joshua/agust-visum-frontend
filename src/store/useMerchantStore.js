import { create } from "zustand";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/lib/utils";
/**
 * Merchant auth store. Mirrors `useAuthStore` but for the merchant
 * domain. The `merchant` object includes `status` ("pending" |
 * "approved" | "suspended") — the UI uses this to gate the "Add
 * product" affordance (see §2.6 of the API guide).
 *
 * IMPORTANT: The initial state is intentionally empty on the server.
 * Reading from `localStorage` inside the store factory caused a
 * mismatch: the factory runs once per server render with `isAuthenticated=false`
 * and never re-runs on the client, so `RequireMerchantAuth` would always
 * think the merchant was logged out. Hydration now happens in `hydrate()`
 * which is called from `useMerchantHydration` (client-only).
 */
const emptyState = {
  merchant: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const useMerchantStore = create((set, get) => {
  // Register the cross-tab logout listener exactly once on the client.
  if (typeof window !== "undefined" && !window.__agtMerchantLogoutBound) {
    window.__agtMerchantLogoutBound = true;
    window.addEventListener("merchant-logout", (e) => {
      try {
        localStorage.removeItem("agt_merchant_token");
        localStorage.removeItem("agt_merchant_refresh_token");
        localStorage.removeItem("agt_merchant_profile");
      } catch {
        /* ignore */
      }
      set({ merchant: null, token: null, isAuthenticated: false, error: null });
      setTimeout(async () => {
        try {
          const { toast } = await import("sonner");
          if (e?.detail?.reason === "refresh-failed") {
            toast.error("Your merchant session expired. Please sign in again.");
          }
        } catch {
          /* silent */
        }
      }, 0);
    });
  }

  return {
    ...emptyState,
    hydrated: false,

    /**
     * Read tokens / profile from localStorage. Safe to call multiple
     * times — the second call is a no-op once `hydrated === true`.
     */
    hydrate: () => {
      if (get().hydrated) return;
      if (typeof window === "undefined") return;
      try {
        const token = localStorage.getItem("agt_merchant_token");
        const profileRaw = localStorage.getItem("agt_merchant_profile");
        const profile = profileRaw ? JSON.parse(profileRaw) : null;
        set({
          merchant: profile,
          token,
          isAuthenticated: !!token,
          hydrated: true,
        });
      } catch {
        set({ hydrated: true });
      }
    },

    reset: () => set({ ...emptyState, hydrated: get().hydrated }),

    login: async (credentials) => {
      set({ loading: true, error: null });
      try {
        const response = await authService.loginMerchant(credentials);
        const { merchant, accessToken, refreshToken } = response.data;
        if (!merchant || !accessToken) {
          throw new Error("Unexpected response shape from /merchants/login");
        }
        localStorage.setItem("agt_merchant_token", accessToken);
        if (refreshToken) localStorage.setItem("agt_merchant_refresh_token", refreshToken);
        localStorage.setItem("agt_merchant_profile", JSON.stringify(merchant));
        set({ merchant, token: accessToken, isAuthenticated: true });
        return { success: true };
      } catch (err) {
        const message = getErrorMessage(err, "Invalid credentials."); 
        set({ error: message });
        return { success: false, error: message };
      } finally {
        set({ loading: false });
      }
    },

    register: async (payload) => {
      set({ loading: true, error: null });
      try {
        const response = await authService.registerMerchant(payload);
        const { merchant, accessToken, refreshToken } = response.data;
        if (!merchant || !accessToken) {
          throw new Error("Unexpected response shape from /merchants/register");
        }
        localStorage.setItem("agt_merchant_token", accessToken);
        if (refreshToken) localStorage.setItem("agt_merchant_refresh_token", refreshToken);
        localStorage.setItem("agt_merchant_profile", JSON.stringify(merchant));
        set({ merchant, token: accessToken, isAuthenticated: true });
        return { success: true };
      } catch (err) {
        const message = err.response?.data?.message || err.message || "Registration failed.";
        set({ error: message });
        return { success: false, error: message };
      } finally {
        set({ loading: false });
      }
    },

    updateStore: async (payload) => {
      set({ loading: true, error: null });
      try {
        const response = await authService.updateMerchant(payload);
        const updatedMerchant = response.data.merchant || response.data;
        localStorage.setItem("agt_merchant_profile", JSON.stringify(updatedMerchant));
        set({ merchant: updatedMerchant });
        return { success: true };
      } catch (err) {
        const message = err.response?.data?.message || "Failed to update store settings.";
        set({ error: message });
        return { success: false, error: message };
      } finally {
        set({ loading: false });
      }
    },

    logout: async () => {
      set({ loading: true });
      try {
        const refreshToken =
          typeof window !== "undefined" ? localStorage.getItem("agt_merchant_refresh_token") : null;
        await authService.logoutMerchant(refreshToken);
      } catch (err) {
        // proceed regardless
      } finally {
        localStorage.removeItem("agt_merchant_token");
        localStorage.removeItem("agt_merchant_refresh_token");
        localStorage.removeItem("agt_merchant_profile");
        set({ merchant: null, token: null, isAuthenticated: false, loading: false, error: null });
      }
    },

    clearError: () => set({ error: null }),
  };
});
