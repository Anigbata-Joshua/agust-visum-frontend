import { useAuthStore } from "@/store/useAuthStore";

export function useAuth() {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  return { user, isAuthenticated, setUser, logout };
}
