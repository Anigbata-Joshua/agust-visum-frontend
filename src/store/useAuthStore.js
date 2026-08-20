import { create } from "zustand";
import { authService } from "@/services/auth.service";

export const useAuthStore = create((set) => {
  // Listen for global user-logout event from Axios interceptors
  if (typeof window !== "undefined") {
    window.addEventListener("user-logout", () => {
      localStorage.removeItem("agt_user_token");
      localStorage.removeItem("agt_user_profile");
      set({ user: null, token: null, isAuthenticated: false, error: null });
    });
  }

  return {
    user: typeof window !== "undefined" && localStorage.getItem("agt_user_profile")
      ? JSON.parse(localStorage.getItem("agt_user_profile"))
      : null,
    token: typeof window !== "undefined" ? localStorage.getItem("agt_user_token") : null,
    isAuthenticated: typeof window !== "undefined" ? !!localStorage.getItem("agt_user_token") : false,
    loading: false,
    error: null,

    login: async (credentials) => {
      set({ loading: true, error: null });
      try {
        const response = await authService.loginUser(credentials);
        const { user, accessToken } = response.data;

        localStorage.setItem("agt_user_token", accessToken);
        localStorage.setItem("agt_user_profile", JSON.stringify(user));

        set({ user, token: accessToken, isAuthenticated: true });
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
        const response = await authService.registerUser(payload);
        const { user, accessToken } = response.data;

        localStorage.setItem("agt_user_token", accessToken);
        localStorage.setItem("agt_user_profile", JSON.stringify(user));

        set({ user, token: accessToken, isAuthenticated: true });
        return { success: true };
      } catch (err) {
        const message = err.response?.data?.message || "Registration failed.";
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

    logout: async () => {
      set({ loading: true });
      try {
        await authService.logoutUser();
      } catch (err) {
        // Proceed with client logout even if backend fails
      } finally {
        localStorage.removeItem("agt_user_token");
        localStorage.removeItem("agt_user_profile");
        set({ user: null, token: null, isAuthenticated: false, loading: false, error: null });
      }
    },

    clearError: () => set({ error: null }),
  };
});

