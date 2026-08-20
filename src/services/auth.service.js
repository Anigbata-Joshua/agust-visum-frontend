import api from "@/lib/axios";

export const authService = {
  // --- Customers (Users) ---
  registerUser: (payload) => api.post("/users/register", payload),
  loginUser: (payload) => api.post("/users/login", payload),
  refreshUserToken: () => api.post("/users/refresh"),
  logoutUser: () => api.post("/users/logout"),
  updateUser: (payload) => api.patch("/users/me", payload),
  changeUserPassword: (payload) => api.patch("/users/me/change-password", payload),

  // --- Merchants ---
  registerMerchant: (payload) => api.post("/merchants/register", payload),
  loginMerchant: (payload) => api.post("/merchants/login", payload),
  refreshMerchantToken: () => api.post("/merchants/refresh"),
  logoutMerchant: () => api.post("/merchants/logout"),
  getMerchantProfile: (id) => api.get(`/merchants/${id}`),
  updateMerchant: (payload) => api.patch("/merchants/me", payload),
  changeMerchantPassword: (payload) => api.patch("/merchants/me/change-password", payload),
};

