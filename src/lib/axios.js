import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Helper to determine if a request configuration is merchant-scoped
const getRequestScope = (config) => {
  const url = config.url || "";
  const method = (config.method || "").toLowerCase();
  
  // Merchant actions: targeting merchants/sales, or mutating products/categories
  const isMerchant =
    url.startsWith("/merchants") ||
    url.startsWith("/sales") ||
    ((url.startsWith("/products") || url.startsWith("/categories")) &&
      ["post", "put", "patch", "delete"].includes(method));
      
  return {
    isMerchant,
    tokenKey: isMerchant ? "agt_merchant_token" : "agt_user_token",
    refreshUrl: isMerchant ? "/merchants/refresh" : "/users/refresh",
    logoutEvent: isMerchant ? "merchant-logout" : "user-logout",
  };
};

// Request Interceptor: Attach bearer token based on route scope
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const { tokenKey } = getRequestScope(config);
    const token = localStorage.getItem(tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response Interceptor: Catch 401 and perform silent token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and request has not been retried yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refreshUrl, tokenKey, logoutEvent } = getRequestScope(originalRequest);
      
      try {
        // Attempt token rotation using cookie-based or authorization-header session refresh
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}${refreshUrl}`,
          {},
          { withCredentials: true }
        );
        
        const token = refreshResponse.data?.token || refreshResponse.data?.accessToken;
        if (token) {
          localStorage.setItem(tokenKey, token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is invalid/expired — clear storage and dispatch logout event
        if (typeof window !== "undefined") {
          localStorage.removeItem(tokenKey);
          window.dispatchEvent(new Event(logoutEvent));
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

