import api from "@/lib/axios";

export const salesService = {
  getAnalytics: () => api.get("/sales"),
};
