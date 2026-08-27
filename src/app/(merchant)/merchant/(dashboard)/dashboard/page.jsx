"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  Receipt,
  ArrowUpRight,
  Package,
  Tags,
} from "lucide-react";
import { useMerchantStore } from "@/store/useMerchantStore";
import { salesService } from "@/services/sales.service";
import { formatNaira, cn } from "@/lib/utils";
import { DataTable } from "@/components/merchant/DataTable";
import { Skeleton, StatCardSkeleton } from "@/components/ui/Skeleton";

export default function MerchantDashboardPage() {
  const { merchant } = useMerchantStore();
  const [analytics, setAnalytics] = useState({ sales: [], total_revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    salesService
      .getAnalytics()
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || "Could not load analytics.");
        return { data: { sales: [], total_revenue: 0 } };
      })
      .then((analyticsRes) => {
        if (cancelled) return;
        setAnalytics({
          sales: analyticsRes.data?.sales ?? [],
          total_revenue: analyticsRes.data?.total_revenue ?? 0,
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

const sales = analytics.sales;
const totalRevenue = analytics.total_revenue;
// "Orders", "Avg. order", and the chart below all need to reflect only
// confirmed (paid) sales — otherwise a pile of pending/cancelled orders
// would inflate the order count and revenue chart even though the
// "Revenue" stat card above (sourced from the API's total_revenue) is
// already correctly confirmed-only. Same bug, different display.
const confirmedSales = sales.filter((s) => s.status === "paid");
const orderCount = confirmedSales.length;
const avgOrder = orderCount > 0 ? totalRevenue / orderCount : 0;

// Build a chart series from confirmed sales only.
const series = bucketSalesByDay(confirmedSales);

  const tableRows = sales.slice(0, 8).map((s) => ({
    Product: s.title || s.product?.title || "—",
    Quantity: s.quantity ?? 1,
    Total: formatNaira(s.line_total ?? s.total ?? 0),
    Date: s.created_at
      ? new Date(s.created_at).toLocaleDateString()
      : "—",
  }));

  return (
    <div>
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
          Dashboard
        </span>
        <h1 className="font-display text-3xl sm:text-4xl mt-2">
          Welcome, {merchant?.store_name || "merchant"}.
        </h1>
        <p className="mt-2 text-sm text-off/60 font-body">
          Here's how your store is doing this issue.
        </p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            Icon={TrendingUp}
            label="Revenue"
            value={formatNaira(totalRevenue)}
            tone="brick"
          />
          <StatCard
            Icon={Receipt}
            label="Orders"
            value={orderCount}
            tone="off"
          />
          <StatCard
            Icon={ShoppingBag}
            label="Avg. order"
            value={formatNaira(avgOrder)}
            tone="off"
          />
        </div>
      )}

      {/* Chart + side cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        <div className="lg:col-span-8 border border-off/15 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl">Revenue, last 30 days</h2>
              <p className="font-cond text-[10px] tracking-[0.16em] uppercase text-off/50 mt-0.5">
                Daily sales
              </p>
            </div>
            <span className="font-cond text-[10px] tracking-[0.18em] uppercase text-brick">
              {formatNaira(totalRevenue)} total
            </span>
          </div>
          {loading ? (
            <Skeleton className="h-64 !bg-off/10" />
          ) : series.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-off/50 font-body">
              No sales recorded yet — your chart will populate after the
              first order.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rev-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9A2E1F" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#9A2E1F" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(247,244,236,0.08)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="rgba(247,244,236,0.5)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="rgba(247,244,236,0.5)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${Math.round(v / 1000)}k` : v
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#17140F",
                      border: "1px solid rgba(247,244,236,0.18)",
                      borderRadius: 0,
                      color: "#F7F4EC",
                      fontFamily: "var(--font-body), sans-serif",
                      fontSize: 12,
                    }}
                    formatter={(v) => [formatNaira(v), "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#9A2E1F"
                    strokeWidth={2}
                    fill="url(#rev-gradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          {error && (
            <p className="text-xs text-brick mt-3 font-body">{error}</p>
          )}
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Link
            href="/merchant/products"
            className="block border border-off/15 p-5 hover:border-brick transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 border border-brick/40 flex items-center justify-center text-brick">
                <Package size={16} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="font-cond text-[10px] tracking-[0.18em] uppercase text-off/50">
                  Catalog
                </div>
                <div className="font-display text-lg mt-0.5">
                  Manage products
                </div>
              </div>
              <ArrowUpRight
                size={16}
                strokeWidth={1.5}
                className="text-off/50 group-hover:text-brick transition-colors"
              />
            </div>
          </Link>

          <Link
            href="/merchant/categories"
            className="block border border-off/15 p-5 hover:border-brick transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 border border-brick/40 flex items-center justify-center text-brick">
                <Tags size={16} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="font-cond text-[10px] tracking-[0.18em] uppercase text-off/50">
                  Organisation
                </div>
                <div className="font-display text-lg mt-0.5">
                  Manage categories
                </div>
              </div>
              <ArrowUpRight
                size={16}
                strokeWidth={1.5}
                className="text-off/50 group-hover:text-brick transition-colors"
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent sales table */}
      <div>
        <div className="border border-off/15 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Recent sales</h2>
            <Link
              href="/merchant/sales"
              className="font-cond text-[11px] tracking-[0.18em] uppercase text-off/60 hover:text-brick border-b border-off/20 hover:border-brick pb-0.5 transition-colors"
            >
              View all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 !bg-off/10" />
              ))}
            </div>
          ) : tableRows.length === 0 ? (
            <p className="text-sm text-off/50 font-body py-6 text-center">
              No sales recorded yet.
            </p>
          ) : (
            <DataTable columns={["Product", "Quantity", "Total", "Date"]} rows={tableRows} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ Icon, label, value, tone = "off" }) {
  return (
    <div className="border border-off/15 p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-7 h-7 flex items-center justify-center",
            tone === "brick" ? "text-brick" : "text-off/70"
          )}
        >
          <Icon size={15} strokeWidth={1.5} />
        </div>
        <div className="font-cond text-[10px] tracking-[0.18em] uppercase text-off/50">
          {label}
        </div>
      </div>
      <div className="font-display text-2xl sm:text-3xl mt-1">{value}</div>
    </div>
  );
}

function bucketSalesByDay(sales = []) {
  if (!Array.isArray(sales) || sales.length === 0) return [];

  const map = new Map();
  for (const s of sales) {
    const ts = s.created_at ? new Date(s.created_at) : null;
    if (!ts || isNaN(ts.getTime())) continue;
    const day = new Date(ts.getFullYear(), ts.getMonth(), ts.getDate());
    const key = day.toISOString();
    const prev = map.get(key) || { value: 0, day };
    prev.value += Number(s.line_total ?? s.total ?? 0);
    map.set(key, prev);
  }

  return Array.from(map.values())
    .sort((a, b) => a.day - b.day)
    .map((d) => ({
      label: d.day.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: d.value,
    }));
}
