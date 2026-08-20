import api from "@/lib/axios";

export const socialService = {
  // --- Likes ---
  getLikes: (productId) => api.get(`/likes?product_id=${productId}`),
  like: (productId) => api.post("/likes", { product_id: productId }),
  unlike: (productId) => api.delete(`/likes/${productId}`),

  // --- Ratings & Reviews ---
  getRatings: (productId) => api.get(`/ratings?product_id=${productId}`),
  submitRating: (payload) => api.post("/ratings", payload), // payload: { product_id, value, text? }
  deleteRating: (productId) => api.delete(`/ratings/${productId}`),

  // --- Comment Discussion Threads ---
  getReviews: (productId) => api.get(`/reviews?product_id=${productId}`),
  postComment: (payload) => api.post("/reviews", payload), // payload: { product_id, text }
  editComment: (id, payload) => api.patch(`/reviews/${id}`, payload),
  deleteComment: (id) => api.delete(`/reviews/${id}`),
};

