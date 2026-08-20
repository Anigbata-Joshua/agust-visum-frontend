import api from "@/lib/axios";

export const cartService = {
  get: () => api.get("/carts"),
<<<<<<< HEAD
  // Adds item or updates quantity. Body shape:
  // { product_id, quantity, has_variation, variation: { color_index, size_index } }
  upsertItem: (payload) => api.post("/carts", payload),
  // NOTE: backend does not yet support removing a single cart line — only
  // clearing the whole cart (see clear() below). This endpoint is not built.
=======
  // Adds item or updates quantity. Body contains: product_id, quantity, color_index, size_index
  upsertItem: (payload) => api.post("/carts", payload),
  // Removes specific item or variation. Use query params: color_index, size_index
>>>>>>> ce65e719d0981a8d076d457c267585acfea34ba2
  removeItem: (productId, params) => api.delete(`/carts/items/${productId}`, { params }),
  setDeliveryNote: (note) => api.post("/carts/set-note", { note }),
  checkout: () => api.post("/carts/checkout"),
  clear: () => api.delete("/carts"),
};

