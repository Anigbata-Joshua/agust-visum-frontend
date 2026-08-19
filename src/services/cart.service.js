import api from "@/lib/axios";

export const cartService = {
  get: () => api.get("/cart"),
  add: (payload) => api.post("/cart/items", payload),
  update: (itemId, payload) => api.patch(`/cart/items/${itemId}`, payload),
  remove: (itemId) => api.delete(`/cart/items/${itemId}`),
  checkout: (payload) => api.post("/checkout", payload),
};
