import api from "@/lib/axios";

export const authService = {
  // --- Customers (Users) ---
  // payload: { full_name, email, phone, password }
  registerUser: (payload) => api.post("/users/register", payload),
  loginUser: (payload) => api.post("/users/login", payload),
  // The backend's refresh/logout cookies are sameSite:"strict", which never
  // reach a cross-domain frontend, so we pass the refresh token explicitly.
  refreshUserToken: (refreshToken) => api.post("/users/refresh", { refreshToken }),
  logoutUser: (refreshToken) => api.post("/users/logout", { refreshToken }),
  updateUser: (payload) => api.patch("/users/me", payload),
  changeUserPassword: (payload) => api.patch("/users/me/change-password", payload),

  // --- Merchants ---
  // payload: { full_name, email, phone, password, store_name, descp?, icon?, banner? }
  registerMerchant: (payload) => api.post("/merchants/register", payload),
  loginMerchant: (payload) => api.post("/merchants/login", payload),
  refreshMerchantToken: (refreshToken) => api.post("/merchants/refresh", { refreshToken }),
  logoutMerchant: (refreshToken) => api.post("/merchants/logout", { refreshToken }),
  getMerchantProfile: (id) => api.get(`/merchants/${id}`),
  updateMerchant: (payload) => api.patch("/merchants/me", payload),
  changeMerchantPassword: (payload) => api.patch("/merchants/me/change-password", payload),
};
