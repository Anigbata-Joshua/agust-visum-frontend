import { create } from "zustand";

export const useCartStore = create((set) => ({
  items: [],
  isDrawerOpen: false,
  toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
}));
