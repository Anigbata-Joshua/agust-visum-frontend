import api from "@/lib/axios";

export const cartService = {
  get: () => api.get("/carts"),
  // Adds item or updates quantity. Body contains: product_id, quantity, color_index, size_index
  upsertItem: (payload) => api.post("/carts", payload),
  // Removes specific item or variation. Use query params: color_index, size_index
  removeItem: (productId, params) => api.delete(`/carts/items/${productId}`, { params }),
  setDeliveryNote: (note) => api.post("/carts/set-note", { note }),
  checkout: () => api.post("/carts/checkout"),
  clear: () => api.delete("/carts"),
};

