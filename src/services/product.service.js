import api from "@/lib/axios";

export const productService = {
  list: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (payload) => api.post("/products", payload),
  update: (id, payload) => api.patch(`/products/${id}`, payload),
  remove: (id) => api.delete(`/products/${id}`),
  // Cloudinary-backed image upload (merchant product manager)
  uploadImage: (formData) =>
    api.post("/products/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
