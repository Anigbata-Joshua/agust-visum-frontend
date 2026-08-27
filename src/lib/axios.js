import axios from "axios";

const STORAGE = {
  user: {
    access: "agt_user_token",
    refresh: "agt_user_refresh_token",
    profile: "agt_user_profile",
    refreshUrl: "/users/refresh",
    logoutUrl: "/users/logout",
    logoutEvent: "user-logout",
  },
  merchant: {
    access: "agt_merchant_token",
    refresh: "agt_merchant_refresh_token",
    profile: "agt_merchant_profile",
    refreshUrl: "/merchants/refresh",
    logoutUrl: "/merchants/logout",
    logoutEvent: "merchant-logout",
  },
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: true,
  timeout: 30_000,
});

const MERCHANT_MUTATION_PREFIXES = ["/products", "/categories"];

function getRequestScope(config) {
  const url = config?.url || "";
  const method = (config?.method || "get").toLowerCase();

  if (url.startsWith("/merchants") || url.startsWith("/sales")) {
    return STORAGE.merchant;
  }

  if (
    method !== "get" &&
    MERCHANT_MUTATION_PREFIXES.some((prefix) => url.startsWith(prefix))
  ) {
    return STORAGE.merchant;
  }

  return STORAGE.user;
}

/* ------------------------------------------------------------------ *
 * Request interceptor — attach the right Bearer token per domain
 * ------------------------------------------------------------------ */
api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const scope = getRequestScope(config);
  const token = localStorage.getItem(scope.access);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshInFlight = null; // de-dupe parallel refreshes per page lifetime

async function refreshTokens(scope) {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = localStorage.getItem(scope.refresh);
    if (!refreshToken) {
      throw new Error("no-refresh-token");
    }

    const baseURL = api.defaults.baseURL;
    const { data } = await axios.post(
      `${baseURL}${scope.refreshUrl}`,
      { refreshToken },
      { withCredentials: true }
    );

    const newAccess = data?.accessToken;
    const newRefresh = data?.refreshToken;
    if (!newAccess) {
      throw new Error("refresh-missing-access-token");
    }

    // Persist BOTH — the old refresh token is now invalid.
    localStorage.setItem(scope.access, newAccess);
    if (newRefresh) localStorage.setItem(scope.refresh, newRefresh);

    return newAccess;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

function forceLogout(scope) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(scope.access);
    localStorage.removeItem(scope.refresh);
    localStorage.removeItem(scope.profile);
  } catch {
    /* localStorage unavailable */
  }
  window.dispatchEvent(new CustomEvent(scope.logoutEvent, {
    detail: { reason: "refresh-failed" },
  }));
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    // Not a 401, or this is the refresh call itself — just propagate.
    if (status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const scope = getRequestScope(originalRequest);
    // Never try to refresh on a refresh request.
    if (originalRequest.url?.includes(scope.refreshUrl)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccess = await refreshTokens(scope);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (refreshError) {
      forceLogout(scope);
      return Promise.reject(refreshError);
    }
  }
);

export default api;
