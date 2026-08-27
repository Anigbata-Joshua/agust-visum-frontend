"use client";

import { useEffect, useState } from "react";
import { Receipt, TrendingUp } from "lucide-react";
import { salesService } from "@/services/sales.service";
import { formatNaira } from "@/lib/utils";
import { DataTable } from "@/components/merchant/DataTable";
import { StatCard } from "@/components/merchant/StatCard";
import { Skeleton, StatCardSkeleton } from "@/components/ui/Skeleton";
import { FadeIn, StaggerGrid, StaggerItem } from "@/components/ui/Motion";
import { toast } from "sonner";

const STATUS_OPTIONS = ["pending", "paid", "shipped", "completed", "cancelled"];

export default function MerchantSalesPage() {
  const [sales, setSales] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const loadSales = () => {
    salesService
      .getAnalytics()
      .then((res) => {
        setSales(res.data?.sales ?? []);
        setTotalRevenue(res.data?.total_revenue ?? 0);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not load sales.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    // 'pending' is the default state, not a valid target per the backend
    // schema — selecting it back should just be a no-op.
    if (newStatus === "pending") return;

    setUpdatingOrderId(orderId);
    try {
      await salesService.updateOrderStatus(orderId, newStatus);
      // Update every line item that belongs to this order, since status
      // lives on the whole Order, not per line item.
      setSales((prev) =>
        prev.map((s) => (s.order_id === orderId ? { ...s, status: newStatus } : s))
      );
      toast.success("Order status updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const rows = sales.map((s) => ({
    Product: s.title || s.product?.title || "—",
    Quantity: s.quantity ?? 1,
    Total: formatNaira(s.line_total ?? s.total ?? 0),
    Date: s.created_at ? new Date(s.created_at).toLocaleDateString() : "—",
    Status: (
      <select
        value={s.status || "pending"}
        disabled={updatingOrderId === s.order_id}
        onChange={(e) => handleStatusChange(s.order_id, e.target.value)}
        className="bg-ink border border-off/20 px-2 py-1.5 text-xs outline-none focus:border-brick disabled:opacity-50 capitalize"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt} value={opt} disabled={opt === "pending"}>
            {opt}
          </option>
        ))}
      </select>
    ),
  }));

  const orderCount = sales.length;
  const avgOrder = orderCount > 0 ? totalRevenue / orderCount : 0;

  return (
    <div>
      <FadeIn className="mb-8 sm:mb-10">
        <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
          Revenue
        </span>
        <h1 className="font-display text-3xl sm:text-4xl mt-2">Sales & Revenue</h1>
        <p className="text-sm text-off/60 font-body mt-2">
          Every order, every piece, every drop.
        </p>
      </FadeIn>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <StaggerGrid className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StaggerItem>
            <StatCard
              Icon={TrendingUp}
              label="Revenue"
              value={formatNaira(totalRevenue)}
              tone="brick"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              Icon={Receipt}
              label="Orders"
              value={orderCount}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              Icon={Receipt}
              label="Avg. order"
              value={formatNaira(avgOrder)}
            />
          </StaggerItem>
        </StaggerGrid>
      )}

      {error && (
        <p className="text-sm text-brick font-body mb-4">{error}</p>
      )}

      <FadeIn>
        <div className="border border-off/15 p-5 sm:p-6">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 !bg-off/10" />
              ))}
            </div>
          ) : sales.length === 0 ? (
            <p className="text-sm text-off/50 font-body py-6 text-center">
              No sales recorded yet.
            </p>
          ) : (
            <DataTable columns={["Product", "Quantity", "Total", "Date", "Status"]} rows={rows} />
          )}
        </div>
      </FadeIn>
    </div>
  );
}