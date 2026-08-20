import api from "@/lib/axios";

export const socialService = {
  // --- Likes ---
  getLikes: (productId) => api.get(`/likes?product_id=${productId}`),
  like: (productId) => api.post("/likes", { product_id: productId }),
  unlike: (productId) => api.delete(`/likes/${productId}`),

  // --- Ratings & Reviews ---
  getRatings: (productId) => api.get(`/ratings?product_id=${productId}`),
<<<<<<< HEAD
  submitRating: (payload) => api.post("/ratings", payload), // payload: { product_id, value, text? }
=======
  submitRating: (payload) => api.post("/ratings", payload), // payload contains product_id, rating, review
>>>>>>> ce65e719d0981a8d076d457c267585acfea34ba2
  deleteRating: (productId) => api.delete(`/ratings/${productId}`),

  // --- Comment Discussion Threads ---
  getReviews: (productId) => api.get(`/reviews?product_id=${productId}`),
<<<<<<< HEAD
  postComment: (payload) => api.post("/reviews", payload), // payload: { product_id, text }
=======
  postComment: (payload) => api.post("/reviews", payload), // payload contains product_id, message
>>>>>>> ce65e719d0981a8d076d457c267585acfea34ba2
  editComment: (id, payload) => api.patch(`/reviews/${id}`, payload),
  deleteComment: (id) => api.delete(`/reviews/${id}`),
};

