// pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Receipt,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import api from "../api/client";

const cx = (...a) => a.filter(Boolean).join(" ");

const money = (n) => {
  const num = Number(n);
  if (Number.isNaN(num)) return "$0.00";
  return `$${num.toFixed(2)}`;
};

function StatCard({
  title,
  value,
  delta,
  deltaType = "up",
  accent = false,
  Icon,
}) {
  const isUp = deltaType === "up";
  return (
    <div
      className={cx(
        "rounded-2xl border p-6 shadow-sm",
        accent
          ? "bg-[hsl(var(--brand))] text-white border-white/10"
          : "border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground))]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div
            className={cx(
              "text-xs font-extrabold uppercase tracking-widest",
              accent ? "text-white/70" : "text-[hsl(var(--foreground))]/60",
            )}
          >
            {title}
          </div>
          <div
            className={cx(
              "mt-2 text-3xl font-extrabold tracking-tight",
              accent ? "text-white" : "",
            )}
          >
            {value}
          </div>
        </div>
        {Icon ? (
          <div
            className={cx(
              "grid h-11 w-11 place-items-center rounded-2xl",
              accent ? "bg-white/10" : "bg-[hsl(var(--brand-strong))]/18",
            )}
          >
            <Icon
              className={cx(
                "h-5 w-5",
                accent ? "text-white" : "text-[hsl(var(--brand-strong))]",
              )}
            />
          </div>
        ) : null}
      </div>

      {delta ? (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={cx(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-extrabold",
              accent
                ? "bg-white/15 text-white"
                : isUp
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-rose-500/15 text-rose-300",
            )}
          >
            {isUp ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {delta}
          </span>
          <span
            className={cx(
              "text-xs font-medium",
              accent ? "text-white/70" : "text-[hsl(var(--foreground))]/60",
            )}
          >
            vs previous period
          </span>
        </div>
      ) : null}
    </div>
  );
}

function TinyBars({ values }) {
  const max = Math.max(1, ...values);
  return (
    <div className="mt-6 flex items-end gap-1 sm:gap-2">
      {values.map((v, i) => (
        <div key={i} className="flex-1">
          <div
            className={cx(
              "mx-auto w-full rounded-2xl",
              i === values.length - 1
                ? "bg-[hsl(var(--brand-strong))]"
                : "bg-[hsl(var(--brand-strong))]/25",
            )}
            style={{ height: `${Math.round((v / max) * 140) + 18}px` }}
          />
          <div className="mt-2 text-center text-[10px] font-extrabold text-[hsl(var(--foreground))]/45">
            {String(i + 1).padStart(2, "0")}
          </div>
        </div>
      ))}
    </div>
  );
}

// Heatmap: 7 rows (Mon..Sun) x 24 cols
function OrdersHeatmap({ grid }) {
  const max = useMemo(() => {
    let m = 1;
    for (const r of grid) for (const c of r) m = Math.max(m, c || 0);
    return m;
  }, [grid]);

  return (
    <div className="mt-3 grid grid-cols-24 gap-1">
      {grid.flatMap((row, rIdx) =>
        row.map((v, cIdx) => {
          const a = (v || 0) / max; // 0..1
          // opacity-based intensity
          const style = { opacity: 0.12 + a * 0.88 };
          return (
            <div
              key={`${rIdx}-${cIdx}`}
              className="h-6 rounded-lg bg-[hsl(var(--brand-strong))]"
              style={style}
              title={`Day ${rIdx + 1}, Hour ${cIdx}: ${v}`}
            />
          );
        }),
      )}
    </div>
  );
}

export default function Dashboard() {
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/api/dashboard/summary", { params: { days } });
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const bars = useMemo(() => {
    const arr = data?.dailyRevenue || [];
    return arr.map((x) => Number(x.revenue || 0));
  }, [data]);

  const heat =
    data?.heatmap || Array.from({ length: 7 }, () => Array(24).fill(0));

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] px-4 sm:px-6 w-full">
      {/* Header (NO search/profile/buttons) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-extrabold tracking-tight ml-10">
            Dashboard
          </div>
          <div className="text-sm font-medium text-[hsl(var(--foreground))]/60 ml-10">
            Sales overview + inventory signals (real data)
          </div>
        </div>

        <div className="ml-10 sm:ml-0 flex items-center gap-2">
          <button
            onClick={() => setDays(7)}
            className={cx(
              "rounded-xl border px-3 py-2 text-xs font-extrabold",
              days === 7
                ? "bg-[hsl(var(--brand-strong))] text-[hsl(var(--brand))] border-transparent"
                : "border-[hsl(var(--border))] bg-[hsl(var(--surface))]",
            )}
          >
            7 Days
          </button>
          <button
            onClick={() => setDays(14)}
            className={cx(
              "rounded-xl border px-3 py-2 text-xs font-extrabold",
              days === 14
                ? "bg-[hsl(var(--brand-strong))] text-[hsl(var(--brand))] border-transparent"
                : "border-[hsl(var(--border))] bg-[hsl(var(--surface))]",
            )}
          >
            14 Days
          </button>
          <button
            onClick={() => setDays(30)}
            className={cx(
              "rounded-xl border px-3 py-2 text-xs font-extrabold",
              days === 30
                ? "bg-[hsl(var(--brand-strong))] text-[hsl(var(--brand))] border-transparent"
                : "border-[hsl(var(--border))] bg-[hsl(var(--surface))]",
            )}
          >
            30 Days
          </button>

          <button
            onClick={load}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-xs font-extrabold hover:bg-[hsl(var(--foreground))]/5"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      <div className="ml-10 mr-10 mt-4">
        {loading ? (
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 text-sm font-semibold text-[hsl(var(--foreground))]/70">
            Loading dashboard...
          </div>
        ) : err ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-semibold text-rose-200">
            {err}
          </div>
        ) : null}
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 ml-10 mr-10">
        <StatCard
          title="Total Revenue"
          value={money(data?.kpis?.revenue || 0)}
          delta=""
          accent
          Icon={DollarSign}
        />
        <StatCard
          title="Total Profit"
          value={money(data?.kpis?.profit || 0)}
          Icon={TrendingUp}
        />
        <StatCard
          title="Total Cost"
          value={money(data?.kpis?.cost || 0)}
          Icon={TrendingDown}
        />
        <StatCard
          title="Orders"
          value={String(data?.kpis?.orders || 0)}
          Icon={Receipt}
        />
      </div>

      {/* Main grid: Bars + Heatmap */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 ml-10 mr-10">
        <div className="xl:col-span-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-extrabold tracking-tight">
                Income Trend
              </div>
              <div className="text-xs font-medium text-[hsl(var(--foreground))]/60">
                Daily revenue (last {days} days)
              </div>
            </div>
            <div className="text-sm font-extrabold text-[hsl(var(--brand-strong))]">
              {money(data?.kpis?.revenue || 0)}
            </div>
          </div>

          <TinyBars values={bars.length ? bars : Array(12).fill(0)} />
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm">
          <div className="text-sm font-extrabold tracking-tight">
            Orders By Time
          </div>
          <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/60">
            Heatmap (Mon→Sun × 24 hours)
          </div>

          <OrdersHeatmap grid={heat} />

          <div className="mt-3 text-xs font-medium text-[hsl(var(--foreground))]/60">
            Darker = more orders.
          </div>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm">
          <div className="text-sm font-extrabold tracking-tight">
            Inventory Summary
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-extrabold">
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
              In Stock: {data?.inventory?.inStock || 0}
            </div>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
              Low: {data?.inventory?.low || 0}
            </div>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
              Out: {data?.inventory?.outOfStock || 0}
            </div>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
              Expired: {data?.inventory?.expired || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-6 ml-10 mr-10 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-extrabold tracking-tight">
            Recent Orders
          </div>
          <div className="text-xs font-semibold text-[hsl(var(--foreground))]/60">
            Showing last 6
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {(data?.recent || []).length === 0 ? (
            <div className="text-xs font-medium text-[hsl(var(--foreground))]/60">
              No sales yet.
            </div>
          ) : (
            (data.recent || []).map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold">
                      {r.saleNo || r.id}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-[hsl(var(--foreground))]/60">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleString()
                        : ""}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[hsl(var(--foreground))]/75">
                      {r.itemsText || "—"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-[hsl(var(--brand-strong))]">
                      {money(r.total)}
                    </div>
                    <div className="text-xs font-semibold text-[hsl(var(--foreground))]/60">
                      {r.status}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="h-10" />
    </div>
  );
}
