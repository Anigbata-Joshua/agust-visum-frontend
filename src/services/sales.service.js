import api from "@/lib/axios";

export const salesService = {
  getAnalytics: () => api.get("/sales"),
  updateOrderStatus: (orderId, status) =>
    api.patch(`/sales/${orderId}/status`, { status }),
};