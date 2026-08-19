import { create } from "zustand";

export const useMerchantStore = create((set) => ({
  merchant: null,
  isAuthenticated: false,
  setMerchant: (merchant) => set({ merchant, isAuthenticated: !!merchant }),
  logout: () => set({ merchant: null, isAuthenticated: false }),
}));
