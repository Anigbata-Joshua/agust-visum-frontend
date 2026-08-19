import api from "@/lib/axios";

export const socialService = {
  like: (productId) => api.post(`/products/${productId}/like`),
  unlike: (productId) => api.delete(`/products/${productId}/like`),
  rate: (productId, rating) => api.post(`/products/${productId}/rate`, { rating }),
  comment: (productId, message) => api.post(`/products/${productId}/comments`, { message }),
  comments: (productId) => api.get(`/products/${productId}/comments`),
};
