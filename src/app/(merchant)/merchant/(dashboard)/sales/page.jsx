"use client";

import { useEffect, useState } from "react";
import { Receipt, TrendingUp } from "lucide-react";
import { salesService } from "@/services/sales.service";
import { formatNaira } from "@/lib/utils";
import { DataTable } from "@/components/merchant/DataTable";
import { StatCard } from "@/components/merchant/StatCard";
import { Skeleton, StatCardSkeleton } from "@/components/ui/Skeleton";
import { FadeIn, StaggerGrid, StaggerItem } from "@/components/ui/Motion";

export default function MerchantSalesPage() {
  const [sales, setSales] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    salesService
      .getAnalytics()
      .then((res) => {
        if (cancelled) return;
        setSales(res.data?.sales ?? []);
        setTotalRevenue(res.data?.total_revenue ?? 0);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || "Could not load sales.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = sales.map((s) => ({
    Product: s.title || s.product?.title || "—",
    Quantity: s.quantity ?? 1,
    Total: formatNaira(s.line_total ?? s.total ?? 0),
    Date: s.created_at ? new Date(s.created_at).toLocaleDateString() : "—",
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
            <DataTable columns={["Product", "Quantity", "Total", "Date"]} rows={rows} />
          )}
        </div>
      </FadeIn>
    </div>
  );
}
