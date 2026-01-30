// reports.jsx
import React, { useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  ShoppingCart,
  Pill,
  Users,
  Calendar,
  Filter,
  Download,
} from "lucide-react";

const cx = (...a) => a.filter(Boolean).join(" ");

const money = (n) => {
  const num = Number(n);
  if (Number.isNaN(num)) return "$0.00";
  return `$${num.toFixed(2)}`;
};

function Card({ title, subtitle, children, right }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]">
            {title}
          </div>
          {subtitle ? (
            <div className="text-xs font-medium text-[hsl(var(--foreground))]/60">
              {subtitle}
            </div>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={cx(
        "h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-semibold",
        "text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--brand-strong))]",
        props.className
      )}
    />
  );
}

function Stat({ title, value, delta, deltaType = "up", Icon }) {
  const up = deltaType === "up";
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
            {title}
          </div>
          <div className="mt-2 text-2xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
            {value}
          </div>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[hsl(var(--brand-strong))]/18">
          <Icon className="h-5 w-5 text-[hsl(var(--brand-strong))]" />
        </div>
      </div>

      {delta ? (
        <div className="mt-3 inline-flex flex-wrap items-center gap-2 text-xs font-extrabold">
          {up ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
              <TrendingUp className="h-3.5 w-3.5" /> {delta}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-rose-300">
              <TrendingDown className="h-3.5 w-3.5" /> {delta}
            </span>
          )}
          <span className="text-xs font-medium text-[hsl(var(--foreground))]/55">
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
    <div className="overflow-x-auto">
      <div className="min-w-[560px] sm:min-w-0">
        <div className="flex items-end gap-2">
          {values.map((v, i) => (
            <div key={i} className="flex-1">
              <div
                className={cx(
                  "mx-auto w-full rounded-2xl",
                  i === values.length - 1
                    ? "bg-[hsl(var(--brand-strong))]"
                    : "bg-[hsl(var(--brand))]/20"
                )}
                style={{ height: `${Math.round((v / max) * 140) + 18}px` }}
              />
              <div className="mt-2 text-center text-[10px] font-extrabold text-[hsl(var(--foreground))]/45">
                {String(i + 1).padStart(2, "0")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Mock data (replace with API later) ---
function seedTransactions() {
  const now = new Date();
  const days = (n) => {
    const d = new Date(now);
    d.setDate(now.getDate() - n);
    return d.toISOString();
  };

  const customers = [
    { id: "CUS-001", name: "Ayaan Ali" },
    { id: "CUS-002", name: "Mohamed Ahmed" },
    { id: "CUS-003", name: "Fatima Hassan" },
    { id: "WALK-IN", name: "Walk-in Customer" },
  ];

  const meds = [
    { id: "MED-001", name: "Paracetamol 500mg" },
    { id: "MED-002", name: "Amoxicillin 500mg" },
    { id: "MED-003", name: "Cetirizine 10mg" },
    { id: "MED-004", name: "Omeprazole 20mg" },
  ];

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const rnd = (a, b) => a + Math.random() * (b - a);

  const list = [];
  for (let i = 0; i < 40; i++) {
    const itemsCount = Math.floor(rnd(1, 4));
    const items = Array.from({ length: itemsCount }).map(() => {
      const m = pick(meds);
      const qty = Math.floor(rnd(1, 4));
      const unit = Number(rnd(0.1, 1.8).toFixed(2));
      return {
        medicineId: m.id,
        name: m.name,
        qty,
        unitPrice: unit,
        lineTotal: qty * unit,
      };
    });
    const subtotal = items.reduce((s, it) => s + it.lineTotal, 0);
    const discount = Number(rnd(0, Math.min(1.5, subtotal * 0.1)).toFixed(2));
    const taxRate = 0;
    const taxAmount = 0;
    const total = Number((subtotal - discount + taxAmount).toFixed(2));

    const paid =
      Math.random() > 0.12 ? total : Number(rnd(0, total).toFixed(2));
    const balance = Number(Math.max(0, total - paid).toFixed(2));
    const status = balance === 0 ? "Paid" : "Pending";

    list.push({
      id: `ORD-${String(600 + i)}`,
      createdAt: days(Math.floor(rnd(0, 13))),
      customer: pick(customers),
      items,
      subtotal,
      discount,
      taxRate,
      taxAmount,
      total,
      paid,
      balance,
      status,
      paymentMethod:
        Math.random() > 0.6 ? "cash" : Math.random() > 0.5 ? "card" : "mobile",
    });
  }

  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export default function Reports() {
  const [transactions] = useState(() => seedTransactions());

  // Filters
  const [range, setRange] = useState("7");
  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");

  const rangeDays = Number(range) || 7;

  const filtered = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (rangeDays - 1));
    start.setHours(0, 0, 0, 0);

    return transactions.filter((t) => {
      const dt = new Date(t.createdAt);
      if (dt < start || dt > end) return false;
      if (status && t.status !== status) return false;
      if (payment && t.paymentMethod !== payment) return false;
      return true;
    });
  }, [transactions, rangeDays, status, payment]);

  const totals = useMemo(() => {
    const revenue = filtered.reduce((s, t) => s + (Number(t.total) || 0), 0);
    const paid = filtered.reduce((s, t) => s + (Number(t.paid) || 0), 0);
    const balance = filtered.reduce((s, t) => s + (Number(t.balance) || 0), 0);
    const orders = filtered.length;

    const itemsSold = filtered.reduce(
      (s, t) => s + t.items.reduce((x, it) => x + (Number(it.qty) || 0), 0),
      0
    );

    const customersCount = new Set(
      filtered.map((t) => t.customer?.id || "WALK-IN")
    ).size;

    return { revenue, paid, balance, orders, itemsSold, customersCount };
  }, [filtered]);

  const dailyRevenue = useMemo(() => {
    const map = new Map();
    const end = new Date();
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, 0);
    }

    filtered.forEach((t) => {
      const key = new Date(t.createdAt).toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + (Number(t.total) || 0));
    });

    return Array.from(map.values()).map((v) => Number(v.toFixed(2)));
  }, [filtered, rangeDays]);

  const topMedicines = useMemo(() => {
    const map = new Map();
    filtered.forEach((t) => {
      t.items.forEach((it) => {
        const key = it.name;
        const prev = map.get(key) || { qty: 0, revenue: 0 };
        map.set(key, {
          qty: prev.qty + (Number(it.qty) || 0),
          revenue: prev.revenue + (Number(it.lineTotal) || 0),
        });
      });
    });

    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [filtered]);

  const paymentBreakdown = useMemo(() => {
    const map = { cash: 0, card: 0, mobile: 0 };
    filtered.forEach((t) => {
      const k = t.paymentMethod || "cash";
      map[k] = (map[k] || 0) + (Number(t.total) || 0);
    });
    return map;
  }, [filtered]);

  const deltaRevenue = useMemo(() => {
    const up = Math.random() > 0.45;
    const pct = Number((Math.random() * 12 + 1).toFixed(1));
    return { text: `${up ? "+" : "-"}${pct}%`, type: up ? "up" : "down" };
  }, [rangeDays, status, payment]);

  function exportCSV() {
    const header = [
      "OrderID",
      "Date",
      "Customer",
      "Status",
      "PaymentMethod",
      "Subtotal",
      "Discount",
      "Tax",
      "Total",
      "Paid",
      "Balance",
    ];

    const rows = filtered.map((t) => [
      t.id,
      t.createdAt,
      t.customer?.name || "Walk-in",
      t.status,
      t.paymentMethod,
      t.subtotal,
      t.discount,
      t.taxAmount,
      t.total,
      t.paid,
      t.balance,
    ]);

    const csv = [header, ...rows]
      .map((r) =>
        r
          .map((x) => {
            const s = String(x ?? "");
            if (s.includes(",") || s.includes('"') || s.includes("\n")) {
              return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* ✅ Responsive header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-2xl font-extrabold tracking-tight ml-10">
            Reports
          </div>
          <div className="text-sm font-medium text-[hsl(var(--foreground))]/60 ml-10">
            Sales analytics, top products, payment summary, and order history
          </div>
        </div>

        <button
          onClick={exportCSV}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--brand))] shadow hover:opacity-90"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* ✅ Filters responsive grid */}
      <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2">
            <Filter className="h-4 w-4 text-[hsl(var(--foreground))]/55" />
            <div className="text-xs font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/55">
              Filters
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-3">
            <div className="sm:w-44">
              <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                Date Range
              </div>
              <Select value={range} onChange={(e) => setRange(e.target.value)}>
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
              </Select>
            </div>

            <div className="sm:w-40">
              <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                Status
              </div>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </Select>
            </div>

            <div className="sm:w-44">
              <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                Payment
              </div>
              <Select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
              >
                <option value="">All</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile">Mobile</option>
              </Select>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:ml-auto sm:w-auto sm:grid-cols-none sm:flex sm:items-center sm:gap-2">
            <button
              onClick={() => {
                setRange("7");
                setStatus("");
                setPayment("");
              }}
              className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5 sm:w-auto"
            >
              Reset
            </button>

            <div className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-extrabold text-[hsl(var(--foreground))]/70 sm:w-auto">
              <Calendar className="h-4 w-4 text-[hsl(var(--foreground))]/55" />
              {filtered.length} orders
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat
          title="Revenue"
          value={money(totals.revenue)}
          delta={deltaRevenue.text}
          deltaType={deltaRevenue.type}
          Icon={DollarSign}
        />
        <Stat title="Orders" value={totals.orders} Icon={Receipt} />
        <Stat title="Items Sold" value={totals.itemsSold} Icon={ShoppingCart} />
        <Stat title="Customers" value={totals.customersCount} Icon={Users} />
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card
            title="Revenue Trend"
            subtitle={`Daily revenue for last ${rangeDays} days`}
            right={
              <div className="inline-flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-extrabold text-[hsl(var(--foreground))]/70">
                <BarChart3 className="h-4 w-4 text-[hsl(var(--foreground))]/55" />
                {money(totals.revenue)}
              </div>
            }
          >
            <TinyBars values={dailyRevenue} />
          </Card>
        </div>

        <Card
          title="Payments"
          subtitle="Revenue by payment method"
          right={
            <div className="inline-flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-extrabold text-[hsl(var(--foreground))]/70">
              <DollarSign className="h-4 w-4 text-[hsl(var(--foreground))]/55" />
              {money(totals.paid)}
            </div>
          }
        >
          <div className="space-y-3">
            <PayRow label="Cash" value={paymentBreakdown.cash} />
            <PayRow label="Card" value={paymentBreakdown.card} />
            <PayRow label="Mobile" value={paymentBreakdown.mobile} />
            <div className="h-px bg-[hsl(var(--border))]" />
            <div className="flex items-center justify-between text-sm">
              <div className="font-semibold text-[hsl(var(--foreground))]/70">
                Pending Balance
              </div>
              <div className="font-extrabold text-amber-300">
                {money(totals.balance)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card
            title="Order History"
            subtitle="Recent orders in the selected range"
          >
            {/* ✅ Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filtered.slice(0, 10).map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-extrabold text-[hsl(var(--foreground))]/90">
                        {t.id}
                      </div>
                      <div className="text-xs font-semibold text-[hsl(var(--foreground))]/55">
                        {new Date(t.createdAt).toLocaleString()}
                      </div>
                      <div className="mt-2 truncate text-sm font-semibold text-[hsl(var(--foreground))]/80">
                        {t.customer?.name || "Walk-in"}
                      </div>
                      <div className="text-xs font-semibold text-[hsl(var(--foreground))]/55">
                        {t.items.length} item(s) • pay: {t.paymentMethod}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-sm font-extrabold text-[hsl(var(--brand-strong))]">
                        {money(t.total)}
                      </div>
                      <span
                        className={cx(
                          "mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-extrabold",
                          t.status === "Paid"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                        )}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6 text-center">
                  <div className="text-sm font-extrabold">No orders</div>
                  <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/60">
                    No sales data in this range.
                  </div>
                </div>
              ) : null}
            </div>

            {/* ✅ Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] md:block">
              <div className="grid grid-cols-12 bg-[hsl(var(--foreground))]/5 px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                <div className="col-span-3">Order</div>
                <div className="col-span-4">Customer</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Pay</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="divide-y divide-[hsl(var(--border))]">
                {filtered.slice(0, 10).map((t) => (
                  <div
                    key={t.id}
                    className="grid grid-cols-12 items-center px-4 py-3 text-sm"
                  >
                    <div className="col-span-3">
                      <div className="font-extrabold text-[hsl(var(--foreground))]/90">
                        {t.id}
                      </div>
                      <div className="text-xs font-semibold text-[hsl(var(--foreground))]/55">
                        {new Date(t.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="col-span-4 min-w-0">
                      <div className="truncate font-semibold text-[hsl(var(--foreground))]/80">
                        {t.customer?.name || "Walk-in"}
                      </div>
                      <div className="text-xs font-semibold text-[hsl(var(--foreground))]/55">
                        {t.items.length} item(s)
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span
                        className={cx(
                          "inline-flex rounded-full border px-2.5 py-1 text-xs font-extrabold",
                          t.status === "Paid"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                        )}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="col-span-1 text-xs font-extrabold text-[hsl(var(--foreground))]/70">
                      {t.paymentMethod}
                    </div>

                    <div className="col-span-2 text-right font-extrabold text-[hsl(var(--brand-strong))]">
                      {money(t.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {filtered.length > 10 ? (
              <div className="mt-3 text-xs font-medium text-[hsl(var(--foreground))]/60">
                Showing 10 of {filtered.length} orders (add pagination later).
              </div>
            ) : null}
          </Card>
        </div>

        <Card
          title="Top Products"
          subtitle="Top medicines by revenue"
          right={
            <div className="inline-flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-extrabold text-[hsl(var(--foreground))]/70">
              <Pill className="h-4 w-4 text-[hsl(var(--foreground))]/55" />
              {topMedicines.length} items
            </div>
          }
        >
          <div className="space-y-3">
            {topMedicines.length === 0 ? (
              <div className="text-xs font-medium text-[hsl(var(--foreground))]/60">
                No sales data in this range.
              </div>
            ) : (
              topMedicines.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]">
                      {p.name}
                    </div>
                    <div className="text-xs font-semibold text-[hsl(var(--foreground))]/55">
                      {p.qty} sold
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-sm font-extrabold text-[hsl(var(--brand-strong))]">
                      {money(p.revenue)}
                    </div>
                    <div className="text-[11px] font-semibold text-[hsl(var(--foreground))]/55">
                      revenue
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="h-10" />
    </div>
  );
}

function PayRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm font-semibold text-[hsl(var(--foreground))]/70">
        {label}
      </div>
      <div className="text-sm font-extrabold text-[hsl(var(--foreground))]/90">
        {money(value)}
      </div>
    </div>
  );
}
