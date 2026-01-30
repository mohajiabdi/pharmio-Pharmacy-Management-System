import {
  TrendingUp,
  TrendingDown,
  Receipt,
  BadgePercent,
  MoreVertical,
} from "lucide-react";

const cx = (...a) => a.filter(Boolean).join(" ");

function StatCard({ title, value, delta, deltaType = "up", accent = false }) {
  const isUp = deltaType === "up";

  return (
    <div
      className={cx(
        "relative rounded-2xl border p-6 sm:p-5 shadow-sm",
        accent
          ? "bg-[hsl(var(--brand))] text-white border-white/10"
          : "border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground))]"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div
            className={cx(
              "text-xs font-extrabold uppercase tracking-widest",
              accent ? "text-white/70" : "text-[hsl(var(--foreground))]/60"
            )}
          >
            {title}
          </div>

          <div
            className={cx(
              "mt-2 text-3xl font-extrabold tracking-tight",
              accent ? "text-white" : "text-[hsl(var(--foreground))]"
            )}
          >
            {value}
          </div>
        </div>

        <button
          className={cx(
            "grid h-9 w-9 place-items-center rounded-xl transition",
            accent
              ? "bg-white/10 hover:bg-white/15"
              : "hover:bg-[hsl(var(--foreground))]/5"
          )}
          aria-label="More"
        >
          <MoreVertical
            className={cx(
              "h-4 w-4",
              accent ? "text-white" : "text-[hsl(var(--foreground))]/75"
            )}
          />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={cx(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-extrabold",
            accent
              ? "bg-white/15 text-white"
              : isUp
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-rose-500/15 text-rose-300"
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
            accent ? "text-white/70" : "text-[hsl(var(--foreground))]/60"
          )}
        >
          Since last week
        </span>
      </div>
    </div>
  );
}

function RevenueChartMock() {
  const bars = [12, 18, 10, 14, 20, 16, 24, 13, 11, 17, 15, 19];

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]">
            Total Revenue
          </div>
          <div className="text-xs font-medium text-[hsl(var(--foreground))]/60">
            Let’s check your pharmacy today
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-extrabold text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5">
            This Month
          </button>
          <button className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-extrabold text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5">
            Export
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-end gap-1 sm:gap-2">
        {bars.map((h, i) => {
          const isAccent = i === 6;
          return (
            <div key={i} className="flex-1">
              <div
                className={cx(
                  "mx-auto w-full rounded-2xl",
                  isAccent
                    ? "bg-[hsl(var(--brand-strong))]"
                    : "bg-[hsl(var(--brand-strong))]/25"
                )}
                style={{ height: `${h * 6}px` }}
              />
              <div className="mt-2 text-center text-[10px] font-extrabold text-[hsl(var(--foreground))]/45">
                {String(i + 1).padStart(2, "0")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentOrdersMock() {
  const rows = [
    {
      id: "#ORD576",
      name: "Paracetamol (2), Ibuprofen (1)",
      price: "$25.50",
      pay: "Paid",
      status: "Completed",
    },
    {
      id: "#ORD575",
      name: "Amoxicillin (3), Cetirizine (2)",
      price: "$42.00",
      pay: "Pending",
      status: "In progress",
    },
    {
      id: "#ORD574",
      name: "Loratadine (1), Omeprazole (1)",
      price: "$15.00",
      pay: "Paid",
      status: "Pending",
    },
    {
      id: "#ORD573",
      name: "Aspirin (4), Hydrocodone (1)",
      price: "$48.00",
      pay: "Paid",
      status: "Completed",
    },
  ];

  const pill = (text, tone) => {
    const map = {
      green: "bg-emerald-500/15 text-emerald-300",
      yellow: "bg-amber-500/15 text-amber-300",
      gray: "bg-[hsl(var(--foreground))]/10 text-[hsl(var(--foreground))]/75",
    };
    return (
      <span
        className={cx(
          "inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold",
          map[tone]
        )}
      >
        {text}
      </span>
    );
  };

  const payPill = (pay) =>
    pay === "Paid" ? pill("Paid", "green") : pill("Pending", "yellow");
  const statusPill = (status) =>
    status === "Completed"
      ? pill("Completed", "green")
      : status === "In progress"
      ? pill("In progress", "gray")
      : pill("Pending", "yellow");

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]">
          Recent Order
        </div>
        <button className="text-xs font-extrabold text-[hsl(var(--brand-strong))] hover:opacity-80">
          View All
        </button>
      </div>

      {/* Mobile cards */}
      <div className="mt-4 space-y-3 md:hidden">
        {rows.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-[hsl(var(--foreground))]/85">
                  {r.id}
                </div>
                <div className="mt-1 text-sm font-semibold text-[hsl(var(--foreground))]/70">
                  {r.name}
                </div>
              </div>
              <div className="text-sm font-extrabold text-[hsl(var(--brand-strong))]">
                {r.price}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {payPill(r.pay)}
              {statusPill(r.status)}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="mt-4 hidden overflow-hidden rounded-xl border border-[hsl(var(--border))] md:block">
        <div className="grid grid-cols-12 bg-[hsl(var(--foreground))]/5 px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
          <div className="col-span-2">Order ID</div>
          <div className="col-span-5">Medicine Name</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-1">Pay</div>
          <div className="col-span-2">Status</div>
        </div>

        <div className="divide-y divide-[hsl(var(--border))]">
          {rows.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-12 items-center px-4 py-3 text-sm"
            >
              <div className="col-span-2 font-extrabold text-[hsl(var(--foreground))]/85">
                {r.id}
              </div>
              <div className="col-span-5 text-[hsl(var(--foreground))]/70">
                {r.name}
              </div>
              <div className="col-span-2 font-extrabold text-[hsl(var(--foreground))]/85">
                {r.price}
              </div>
              <div className="col-span-1">{payPill(r.pay)}</div>
              <div className="col-span-2">{statusPill(r.status)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] px-4 sm:px-6 w-full">
      {/* Top header (RESPONSIVE) */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-2xl font-extrabold tracking-tight ml-10">
            Sales Overview
          </div>
          <div className="text-sm font-medium text-[hsl(var(--foreground))]/60  ml-10">
            Let’s check your pharmacy today
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
          <div className="relative w-full sm:w-80 lg:w-72">
            <input
              placeholder="Search..."
              className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-sm font-semibold outline-none placeholder:text-[hsl(var(--foreground))]/40 focus:border-[hsl(var(--brand-strong))]"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="grid h-11 w-11 place-items-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--foreground))]/5">
              <Receipt className="h-5 w-5 text-[hsl(var(--foreground))]/80" />
            </button>

            <div className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2">
              <div className="h-9 w-9 rounded-full bg-[hsl(var(--brand-strong))]/20" />
              <div className="hidden leading-tight sm:block">
                <div className="text-sm font-extrabold tracking-tight">
                  James Bond
                </div>
                <div className="text-xs font-medium text-[hsl(var(--foreground))]/60">
                  @james.bond
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="$112,200"
          delta="+2%"
          deltaType="up"
          accent
        />
        <StatCard
          title="Total Profit"
          value="$12,500"
          delta="+8%"
          deltaType="up"
        />
        <StatCard
          title="Total Cost"
          value="$48,200"
          delta="-0.2%"
          deltaType="down"
        />
        <StatCard
          title="Average Order Value"
          value="$96.50"
          delta="+5%"
          deltaType="up"
        />
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="xl:col-span-2">
          <RevenueChartMock />
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm">
          <div className="text-sm font-extrabold tracking-tight">
            Orders By Time
          </div>
          <div className="mt-3 grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className={cx(
                  "h-8 rounded-lg",
                  i % 9 === 0
                    ? "bg-[hsl(var(--brand-strong))]"
                    : i % 7 === 0
                    ? "bg-[hsl(var(--brand-strong))]/55"
                    : "bg-[hsl(var(--foreground))]/8"
                )}
                style={{ opacity: i % 9 === 0 ? 0.9 : 1 }}
              />
            ))}
          </div>
          <div className="mt-4 text-xs font-medium text-[hsl(var(--foreground))]/60">
            Heatmap preview (placeholder)
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentOrdersMock />
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold tracking-tight">
              Top Products
            </div>
            <button className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-extrabold text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5">
              This Month
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {[
              {
                name: "Keytruda (Pembrolizumab)",
                price: "$356",
                sold: "359 sold",
              },
              {
                name: "Ozempic (semaglutide)",
                price: "$156",
                sold: "300 sold",
              },
              { name: "Dupixent (dupilumab)", price: "$254", sold: "289 sold" },
              { name: "Eliquis (apixaban)", price: "$59", sold: "248 sold" },
            ].map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold tracking-tight">
                    {p.name}
                  </div>
                  <div className="text-xs font-medium text-[hsl(var(--foreground))]/60">
                    {p.sold}
                  </div>
                </div>

                <div className="text-sm font-extrabold text-[hsl(var(--brand-strong))]">
                  {p.price}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-[hsl(var(--foreground))]/5 p-4">
            <div className="flex items-center gap-2 text-[hsl(var(--brand-strong))]">
              <BadgePercent className="h-5 w-5" />
              <div className="text-sm font-extrabold">Promo Tip</div>
            </div>
            <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/65">
              Offer 5% discount on slow-moving medicines this week.
            </div>
          </div>
        </div>
      </div>

      <div className="h-10" />
    </div>
  );
}
