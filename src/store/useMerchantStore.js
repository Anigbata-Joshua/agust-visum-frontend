import { create } from "zustand";
import { authService } from "@/services/auth.service";

export const useMerchantStore = create((set) => {
  // Listen for global merchant-logout event from Axios interceptors
  if (typeof window !== "undefined") {
    window.addEventListener("merchant-logout", () => {
      localStorage.removeItem("agt_merchant_token");
      localStorage.removeItem("agt_merchant_profile");
      set({ merchant: null, token: null, isAuthenticated: false, error: null });
    });
  }

  return {
    merchant: typeof window !== "undefined" && localStorage.getItem("agt_merchant_profile")
      ? JSON.parse(localStorage.getItem("agt_merchant_profile"))
      : null,
    token: typeof window !== "undefined" ? localStorage.getItem("agt_merchant_token") : null,
    isAuthenticated: typeof window !== "undefined" ? !!localStorage.getItem("agt_merchant_token") : false,
    loading: false,
    error: null,

    login: async (credentials) => {
      set({ loading: true, error: null });
      try {
        const response = await authService.loginMerchant(credentials);
<<<<<<< HEAD
        const { merchant, accessToken } = response.data;

        localStorage.setItem("agt_merchant_token", accessToken);
        localStorage.setItem("agt_merchant_profile", JSON.stringify(merchant));

        set({ merchant, token: accessToken, isAuthenticated: true });
=======
        const { merchant, token } = response.data;

        localStorage.setItem("agt_merchant_token", token);
        localStorage.setItem("agt_merchant_profile", JSON.stringify(merchant));

        set({ merchant, token, isAuthenticated: true });
>>>>>>> ce65e719d0981a8d076d457c267585acfea34ba2
        return { success: true };
      } catch (err) {
        const message = err.response?.data?.message || "Invalid credentials.";
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
<<<<<<< HEAD
        const { merchant, accessToken } = response.data;

        localStorage.setItem("agt_merchant_token", accessToken);
        localStorage.setItem("agt_merchant_profile", JSON.stringify(merchant));

        set({ merchant, token: accessToken, isAuthenticated: true });
=======
        const { merchant, token } = response.data;

        localStorage.setItem("agt_merchant_token", token);
        localStorage.setItem("agt_merchant_profile", JSON.stringify(merchant));

        set({ merchant, token, isAuthenticated: true });
>>>>>>> ce65e719d0981a8d076d457c267585acfea34ba2
        return { success: true };
      } catch (err) {
        const message = err.response?.data?.message || "Registration failed.";
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
        await authService.logoutMerchant();
      } catch (err) {
        // Proceed even if request fails
      } finally {
        localStorage.removeItem("agt_merchant_token");
        localStorage.removeItem("agt_merchant_profile");
        set({ merchant: null, token: null, isAuthenticated: false, loading: false, error: null });
      }
    },

    clearError: () => set({ error: null }),
  };
});

