import api from "@/lib/axios";

export const productService = {
  // --- Products ---
  list: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (payload) => api.post("/products", payload),
  update: (id, payload) => api.patch(`/products/${id}`, payload),
  remove: (id) => api.delete(`/products/${id}`),
  // Cloudinary-backed image upload for a product (max 5)
  uploadImages: (id, formData) =>
    api.post(`/products/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // --- Categories ---
  listCategories: (params) => api.get("/categories", { params }),
  createCategory: (payload) => api.post("/categories", payload),
  renameCategory: (id, payload) => api.patch(`/categories/${id}`, payload),
  removeCategory: (id) => api.delete(`/categories/${id}`),
};

