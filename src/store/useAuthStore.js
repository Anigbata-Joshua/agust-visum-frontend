import { create } from "zustand";
import { authService } from "@/services/auth.service";

/**
 * User (customer) auth store.
 *
 * Listens for `user-logout` events dispatched by the axios interceptor
 * when a refresh attempt fails. In that case we clear local state and
 * surface a toast so the user isn't left wondering why the app is
 * "redirecting…".
 *
 * IMPORTANT: Initial state is intentionally empty on the server. Hydration
 * from `localStorage` is deferred to `hydrate()`, which is called from
 * `useUserHydration` (client-only). Reading localStorage inside the store
 * factory caused an SSR/hydration mismatch that broke gated pages.
 */
const emptyState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const useAuthStore = create((set, get) => {
  // Bind the cross-tab/logout listener exactly once on the client.
  if (typeof window !== "undefined" && !window.__agtUserLogoutBound) {
    window.__agtUserLogoutBound = true;
    window.addEventListener("user-logout", (e) => {
      try {
        localStorage.removeItem("agt_user_token");
        localStorage.removeItem("agt_user_refresh_token");
        localStorage.removeItem("agt_user_profile");
      } catch {
        /* ignore */
      }
      set({ user: null, token: null, isAuthenticated: false, error: null });
      // Show a toast on the next tick (after the event has fully
      // propagated and any in-flight promise has settled).
      setTimeout(async () => {
        try {
          const { toast } = await import("sonner");
          if (e?.detail?.reason === "refresh-failed") {
            toast.error("Your session expired. Please sign in again.");
          }
        } catch {
          /* sonner not available — silent */
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
        const token = localStorage.getItem("agt_user_token");
        const profileRaw = localStorage.getItem("agt_user_profile");
        const user = profileRaw ? JSON.parse(profileRaw) : null;
        set({
          user,
          token,
          isAuthenticated: !!token,
          hydrated: true,
        });
      } catch {
        set({ hydrated: true });
      }
    },

    reset: () => set({ ...emptyState, hydrated: get().hydrated }),

    // credentials: { email, password }
    login: async (credentials) => {
      set({ loading: true, error: null });
      try {
        const response = await authService.loginUser(credentials);
        const { user, accessToken, refreshToken } = response.data;
        if (!user || !accessToken) {
          throw new Error("Unexpected response shape from /users/login");
        }
        localStorage.setItem("agt_user_token", accessToken);
        if (refreshToken) localStorage.setItem("agt_user_refresh_token", refreshToken);
        localStorage.setItem("agt_user_profile", JSON.stringify(user));
        set({ user, token: accessToken, isAuthenticated: true });
        return { success: true };
      } catch (err) {
        const message = err.response?.data?.message || err.message || "Invalid credentials.";
        set({ error: message });
        return { success: false, error: message };
      } finally {
        set({ loading: false });
      }
    },

    // payload: { full_name, email, phone, password }
    register: async (payload) => {
      set({ loading: true, error: null });
      try {
        const response = await authService.registerUser(payload);
        const { user, accessToken, refreshToken } = response.data;
        if (!user || !accessToken) {
          throw new Error("Unexpected response shape from /users/register");
        }
        localStorage.setItem("agt_user_token", accessToken);
        if (refreshToken) localStorage.setItem("agt_user_refresh_token", refreshToken);
        localStorage.setItem("agt_user_profile", JSON.stringify(user));
        set({ user, token: accessToken, isAuthenticated: true });
        return { success: true };
      } catch (err) {
        const message = err.response?.data?.message || err.message || "Registration failed.";
        set({ error: message });
        return { success: false, error: message };
      } finally {
        set({ loading: false });
      }
    },

    updateProfile: async (payload) => {
      set({ loading: true, error: null });
      try {
        const response = await authService.updateUser(payload);
        const updatedUser = response.data.user || response.data;
        localStorage.setItem("agt_user_profile", JSON.stringify(updatedUser));
        set({ user: updatedUser });
        return { success: true };
      } catch (err) {
        const message = err.response?.data?.message || "Failed to update profile.";
        set({ error: message });
        return { success: false, error: message };
      } finally {
        set({ loading: false });
      }
    },

    setUser: (user) => {
      if (typeof window !== "undefined") {
        if (user) localStorage.setItem("agt_user_profile", JSON.stringify(user));
        else localStorage.removeItem("agt_user_profile");
      }
      set({ user });
    },

    logout: async () => {
      set({ loading: true });
      try {
        const refreshToken =
          typeof window !== "undefined" ? localStorage.getItem("agt_user_refresh_token") : null;
        await authService.logoutUser(refreshToken);
      } catch (err) {
        // Proceed with client logout even if the backend call fails
      } finally {
        localStorage.removeItem("agt_user_token");
        localStorage.removeItem("agt_user_refresh_token");
        localStorage.removeItem("agt_user_profile");
        set({ user: null, token: null, isAuthenticated: false, loading: false, error: null });
      }
    },

    clearError: () => set({ error: null }),
  };
});
