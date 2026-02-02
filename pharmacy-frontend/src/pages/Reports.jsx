// Reports.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  DollarSign,
  Receipt,
  ShoppingCart,
  Pill,
  Calendar,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import api from "../api/client"; // your axios client

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const cx = (...a) => a.filter(Boolean).join(" ");

async function urlToDataURL(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load logo");
  const blob = await res.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // data:image/...;base64,...
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const money = (n) => {
  const num = Number(n);
  if (Number.isNaN(num)) return "$0.00";
  return `$${num.toFixed(2)}`;
};

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-[hsl(var(--overlay))]/60"
        onClick={onClose}
      />
      <div className="relative grid h-dvh place-items-center p-3 sm:p-4">
        <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-xl">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
            <div className="text-sm font-extrabold">{title}</div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[hsl(var(--foreground))]/5"
            >
              <X className="h-4 w-4 text-[hsl(var(--foreground))]/70" />
            </button>
          </div>
          <div className="max-h-[calc(100dvh-120px)] overflow-y-auto p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children, right }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold tracking-tight">{title}</div>
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

function Input(props) {
  return (
    <input
      {...props}
      className={cx(
        "h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-semibold",
        "text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground))]/40",
        "outline-none focus:border-[hsl(var(--brand-strong))]",
        props.className,
      )}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={cx(
        "h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-semibold",
        "text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--brand-strong))]",
        props.className,
      )}
    />
  );
}

function Stat({ title, value, Icon }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
            {title}
          </div>
          <div className="mt-2 text-2xl font-extrabold tracking-tight">
            {value}
          </div>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[hsl(var(--brand-strong))]/18">
          <Icon className="h-5 w-5 text-[hsl(var(--brand-strong))]" />
        </div>
      </div>
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
                    : "bg-[hsl(var(--brand))]/20",
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

// Helpers
function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function medicineStatus(m) {
  const qty = Number(m.quantity) || 0;
  const exp = m.expiryDate ? new Date(m.expiryDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let expired = false;
  let expSoon = false;

  if (exp) {
    exp.setHours(0, 0, 0, 0);
    if (exp < today) expired = true;
    const soon = addDays(today, 30);
    soon.setHours(0, 0, 0, 0);
    if (!expired && exp <= soon) expSoon = true;
  }

  if (expired) return { label: "Expired", tone: "rose" };
  if (qty <= 0) return { label: "Out", tone: "rose" };
  if (qty <= 10) return { label: "Low", tone: "amber" };
  if (expSoon) return { label: "Expiring Soon", tone: "yellow" };
  return { label: "In Stock", tone: "green" };
}

function PillTag({ tone, children }) {
  const map = {
    green: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    yellow: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    rose: "border-rose-500/20 bg-rose-500/10 text-rose-300",
    neutral:
      "border-[hsl(var(--border))] bg-[hsl(var(--foreground))]/5 text-[hsl(var(--foreground))]/80",
  };
  return (
    <span
      className={cx(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-extrabold",
        map[tone] || map.neutral,
      )}
    >
      {children}
    </span>
  );
}

export default function Reports() {
  // quick admin check (UI layer); real protection is backend requireRole("admin")
  const [forbidden, setForbidden] = useState(false);

  // UI filters
  const [preset, setPreset] = useState("7"); // 7/14/30
  const [status, setStatus] = useState(""); // Paid/Pending
  const [payment, setPayment] = useState(""); // cash/card/mobile

  // Export preview modal
  const [exportOpen, setExportOpen] = useState(false);

  // Date range (used by API)
  const today = new Date();
  const [startDate, setStartDate] = useState(isoDate(addDays(today, -6)));
  const [endDate, setEndDate] = useState(isoDate(today));

  // Data
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [err, setErr] = useState("");

  // When preset changes, auto set start/end
  useEffect(() => {
    const days = Number(preset) || 7;
    const e = new Date();
    const s = addDays(e, -(days - 1));
    setStartDate(isoDate(s));
    setEndDate(isoDate(e));
  }, [preset]);

  async function load() {
    setLoading(true);
    setErr("");
    setForbidden(false);
    try {
      const res = await api.get("/api/reports/summary", {
        params: { start: startDate, end: endDate },
      });
      setSales(Array.isArray(res?.data?.sales) ? res.data.sales : []);
      setMedicines(
        Array.isArray(res?.data?.medicines) ? res.data.medicines : [],
      );
    } catch (e) {
      const code = e?.response?.status;
      if (code === 403) setForbidden(true);
      setErr(e?.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const filteredSales = useMemo(() => {
    return sales.filter((t) => {
      if (status && t.status !== status) return false;
      if (payment && t.paymentMethod !== payment) return false;
      return true;
    });
  }, [sales, status, payment]);

  const totals = useMemo(() => {
    const revenue = filteredSales.reduce(
      (s, t) => s + (Number(t.total) || 0),
      0,
    );
    const paid = filteredSales.reduce((s, t) => s + (Number(t.paid) || 0), 0);
    const balance = filteredSales.reduce(
      (s, t) => s + (Number(t.balance) || 0),
      0,
    );
    const orders = filteredSales.length;
    const itemsSold = filteredSales.reduce(
      (sum, t) =>
        sum + (t.items || []).reduce((x, it) => x + (Number(it.qty) || 0), 0),
      0,
    );
    return { revenue, paid, balance, orders, itemsSold };
  }, [filteredSales]);

  const dailyRevenue = useMemo(() => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    s.setHours(0, 0, 0, 0);
    e.setHours(23, 59, 59, 999);

    const daysCount = Math.max(
      1,
      Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1,
    );

    const map = new Map();
    for (let i = 0; i < daysCount; i++) {
      const d = addDays(s, i);
      map.set(isoDate(d), 0);
    }

    filteredSales.forEach((t) => {
      const key = t.createdAt ? String(t.createdAt).slice(0, 10) : null;
      if (!key) return;
      if (map.has(key))
        map.set(key, (map.get(key) || 0) + (Number(t.total) || 0));
    });

    return Array.from(map.values()).map((v) => Number(v.toFixed(2)));
  }, [filteredSales, startDate, endDate]);

  const medicineSummary = useMemo(() => {
    const counts = {
      inStock: 0,
      low: 0,
      out: 0,
      expired: 0,
      expSoon: 0,
      total: medicines.length,
    };

    const lowList = [];

    medicines.forEach((m) => {
      const st = medicineStatus(m);
      if (st.label === "Expired") counts.expired++;
      else if (st.label === "Out") counts.out++;
      else if (st.label === "Low") counts.low++;
      else if (st.label === "Expiring Soon") counts.expSoon++;
      else counts.inStock++;

      if (st.label === "Low" || st.label === "Out" || st.label === "Expired") {
        lowList.push({ ...m, status: st });
      }
    });

    lowList.sort(
      (a, b) => (Number(a.quantity) || 0) - (Number(b.quantity) || 0),
    );

    return { counts, attention: lowList.slice(0, 8) };
  }, [medicines]);

  function buildExportRows() {
    return filteredSales.map((t) => ({
      OrderID: t.saleNo || t.id,
      Date: t.createdAt,
      Status: t.status,
      PaymentMethod: t.paymentMethod,
      ItemsCount: (t.items || []).length,
      Subtotal: Number(t.subtotal || 0),
      Discount: Number(t.discount || 0),
      Tax: Number(t.taxAmount || 0),
      Total: Number(t.total || 0),
      Paid: Number(t.paid || 0),
      Balance: Number(t.balance || 0),
    }));
  }

  function exportCSV() {
    const rows = buildExportRows();
    const header = Object.keys(rows[0] || { OrderID: "" });

    const csv = [header, ...rows.map((r) => header.map((k) => r[k]))]
      .map((r) =>
        r
          .map((x) => {
            const s = String(x ?? "");
            if (s.includes(",") || s.includes('"') || s.includes("\n")) {
              return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports_${startDate}_to_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    const rows = buildExportRows();
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    XLSX.writeFile(wb, `reports_${startDate}_to_${endDate}.xlsx`);
  }
  async function exportPDF() {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    // ====== theme ======
    const marginX = 40;
    const headerY = 40;

    // Try to load logo (safe fallback)
    let logoDataUrl = null;
    try {
      logoDataUrl = await urlToDataURL("/Logo.png"); // from /public
    } catch (e) {
      console.log("Logo not loaded:", e?.message);
    }

    // ====== header ======
    // Logo
    if (logoDataUrl) {
      // (x, y, width, height) — tweak size to your logo shape
      doc.addImage(logoDataUrl, "PNG", marginX, headerY - 10, 44, 44);
    }

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(
      "Pharmacy Sales Report",
      marginX + (logoDataUrl ? 56 : 0),
      headerY + 15,
    );

    // Subtitle (range)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `Range: ${startDate} → ${endDate}`,
      marginX + (logoDataUrl ? 56 : 0),
      headerY + 34,
    );

    // Right-side meta
    const now = new Date();
    doc.setFontSize(9);
    doc.text(`Generated: ${now.toLocaleString()}`, 760, headerY + 34, {
      align: "right",
    });

    // Divider line
    doc.setDrawColor(210);
    doc.setLineWidth(1);
    doc.line(marginX, headerY + 50, 802 - marginX, headerY + 50);

    // ====== KPI chips ======
    const chipY = headerY + 64;
    const chips = [
      { label: "Orders", value: String(totals.orders) },
      { label: "Revenue", value: money(totals.revenue) },
      { label: "Pending", value: money(totals.balance) },
      // If you later add profit, put it here too
    ];

    let chipX = marginX;
    chips.forEach((c) => {
      const w = 170;
      const h = 34;

      doc.setFillColor(245, 247, 255);
      doc.roundedRect(chipX, chipY, w, h, 10, 10, "F");

      doc.setTextColor(60);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(c.label, chipX + 12, chipY + 14);

      doc.setFontSize(12);
      doc.text(c.value, chipX + 12, chipY + 28);

      chipX += w + 10;
    });

    // ====== table ======
    const rows = buildExportRows();
    if (!rows.length) {
      alert("No data to export");
      return;
    }

    const cols = Object.keys(rows[0]);
    const body = rows.map((r) => cols.map((k) => String(r[k] ?? "")));

    autoTable(doc, {
      startY: chipY + 50,
      head: [cols],
      body,
      theme: "striped",
      margin: { left: marginX, right: marginX },
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 4,
        textColor: 50,
      },
      headStyles: {
        fillColor: [30, 60, 120],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      didDrawPage: (data) => {
        // Footer page numbers
        const pageCount = doc.getNumberOfPages();
        const page = doc.internal.getCurrentPageInfo().pageNumber;
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(`Page ${page} of ${pageCount}`, 802 - marginX, 575, {
          align: "right",
        });
      },
    });

    doc.save(`reports_${startDate}_to_${endDate}.pdf`);
  }

  if (forbidden) {
    return (
      <div className="min-h-screen grid place-items-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))] p-6">
        <div className="max-w-lg w-full rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6">
          <div className="flex items-center gap-2 text-rose-200 font-extrabold">
            <AlertTriangle className="h-5 w-5" /> Admin only
          </div>
          <div className="mt-2 text-sm font-medium text-red-200">
            You don’t have permission to view Reports.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-2xl font-extrabold tracking-tight ml-10">
            Reports (Admin)
          </div>
          <div className="text-sm font-medium text-[hsl(var(--foreground))]/60 ml-10">
            Sales + Inventory analytics with export preview
          </div>
        </div>

        <button
          onClick={() => setExportOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--brand))] shadow hover:opacity-90"
        >
          <Download className="h-4 w-4" />
          Export / Print
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 ml-10 mr-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2">
            <Filter className="h-4 w-4 text-[hsl(var(--foreground))]/55" />
            <div className="text-xs font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/55">
              Filters
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-4">
            <div className="sm:w-44">
              <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                Preset
              </div>
              <Select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
              </Select>
            </div>

            <div className="sm:w-44">
              <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                Start
              </div>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="sm:w-44">
              <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                End
              </div>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
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

          <div className="grid w-full grid-cols-2 gap-2 sm:ml-auto sm:w-auto sm:flex sm:items-center sm:gap-2">
            <button
              onClick={load}
              className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5 sm:w-auto"
            >
              Refresh
            </button>

            <div className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-extrabold text-[hsl(var(--foreground))]/70 sm:w-auto">
              <Calendar className="h-4 w-4 text-[hsl(var(--foreground))]/55" />
              {filteredSales.length} orders
            </div>
          </div>
        </div>
      </div>

      {/* Loading / Error */}
      <div className="ml-10 mr-10 mt-4">
        {loading ? (
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 text-sm font-semibold text-[hsl(var(--foreground))]/70">
            Loading reports...
          </div>
        ) : err ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-semibold text-rose-200">
            {err}
          </div>
        ) : null}
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5 ml-10 mr-10">
        <Stat title="Revenue" value={money(totals.revenue)} Icon={DollarSign} />
        <Stat title="Paid" value={money(totals.paid)} Icon={CheckCircle2} />
        <Stat
          title="Pending Balance"
          value={money(totals.balance)}
          Icon={AlertTriangle}
        />
        <Stat title="Orders" value={totals.orders} Icon={Receipt} />
        <Stat title="Items Sold" value={totals.itemsSold} Icon={ShoppingCart} />
      </div>

      {/* Graph + Payments */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3 ml-10 mr-10">
        <div className="xl:col-span-2">
          <Card
            title="Income Trend"
            subtitle={`Daily total (${startDate} → ${endDate})`}
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

        <Card title="Inventory Status" subtitle="Medicines summary (live)">
          <div className="grid grid-cols-2 gap-2">
            <MiniBox
              label="In Stock"
              value={medicineSummary.counts.inStock}
              tone="green"
            />
            <MiniBox
              label="Low"
              value={medicineSummary.counts.low}
              tone="amber"
            />
            <MiniBox
              label="Out"
              value={medicineSummary.counts.out}
              tone="rose"
            />
            <MiniBox
              label="Expired"
              value={medicineSummary.counts.expired}
              tone="rose"
            />
            <MiniBox
              label="Expiring ≤ 30 days"
              value={medicineSummary.counts.expSoon}
              tone="yellow"
            />
            <MiniBox
              label="Total"
              value={medicineSummary.counts.total}
              tone="neutral"
            />
          </div>

          <div className="mt-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
              Needs Attention
            </div>
            <div className="mt-2 space-y-2">
              {medicineSummary.attention.length === 0 ? (
                <div className="text-xs font-semibold text-[hsl(var(--foreground))]/60">
                  No critical items.
                </div>
              ) : (
                medicineSummary.attention.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold">
                        {m.brandName}{" "}
                        <span className="text-[hsl(var(--foreground))]/60">
                          • {m.strength}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-[hsl(var(--foreground))]/55">
                        Qty: {m.quantity} • Exp:{" "}
                        {m.expiryDate ? String(m.expiryDate).slice(0, 10) : "—"}
                      </div>
                    </div>
                    <PillTag tone={m.status.tone}>{m.status.label}</PillTag>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Order history */}
      <div className="mt-6 ml-10 mr-10">
        <Card
          title="Order History"
          subtitle="Recent orders in selected filters"
        >
          <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
            <div className="grid grid-cols-12 bg-[hsl(var(--foreground))]/5 px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
              <div className="col-span-3">Order</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Pay</div>
              <div className="col-span-2">Items</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            <div className="divide-y divide-[hsl(var(--border))]">
              {filteredSales.slice(0, 12).map((t) => (
                <div
                  key={t.saleNo || t.id}
                  className="grid grid-cols-12 items-center px-4 py-3 text-sm"
                >
                  <div className="col-span-3">
                    <div className="font-extrabold">{t.saleNo || t.id}</div>
                    <div className="text-xs font-semibold text-[hsl(var(--foreground))]/55">
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleString()
                        : ""}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <PillTag tone={t.status === "Paid" ? "green" : "yellow"}>
                      {t.status}
                    </PillTag>
                  </div>

                  <div className="col-span-2 text-xs font-extrabold text-[hsl(var(--foreground))]/75">
                    {t.paymentMethod}
                  </div>

                  <div className="col-span-2 text-xs font-extrabold text-[hsl(var(--foreground))]/75">
                    {(t.items || []).length}
                  </div>

                  <div className="col-span-3 text-right font-extrabold text-[hsl(var(--brand-strong))]">
                    {money(t.total)}
                  </div>
                </div>
              ))}

              {filteredSales.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="text-sm font-extrabold">No orders</div>
                  <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/60">
                    Nothing found in this range / filter.
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {filteredSales.length > 12 ? (
            <div className="mt-3 text-xs font-medium text-[hsl(var(--foreground))]/60">
              Showing 12 of {filteredSales.length} orders.
            </div>
          ) : null}
        </Card>
      </div>

      {/* Export Preview Modal */}
      <Modal
        open={exportOpen}
        title="Export Preview"
        onClose={() => setExportOpen(false)}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
              Start date
            </div>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
              End date
            </div>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
          <div className="text-sm font-extrabold">What you will export</div>
          <div className="mt-2 text-xs font-semibold text-[hsl(var(--foreground))]/70">
            Range: <span className="font-extrabold">{startDate}</span> →{" "}
            <span className="font-extrabold">{endDate}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <MiniBox label="Orders" value={totals.orders} tone="neutral" />
            <MiniBox
              label="Revenue"
              value={money(totals.revenue)}
              tone="green"
            />
            <MiniBox label="Paid" value={money(totals.paid)} tone="green" />
            <MiniBox
              label="Pending"
              value={money(totals.balance)}
              tone="yellow"
            />
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={exportCSV}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm font-extrabold hover:bg-[hsl(var(--foreground))]/5"
            >
              <Download className="h-4 w-4" /> CSV
            </button>

            <button
              onClick={exportExcel}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm font-extrabold hover:bg-[hsl(var(--foreground))]/5"
            >
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </button>

            <button
              onClick={() => exportPDF()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong))] px-4 py-2.5 text-sm font-extrabold text-[hsl(var(--brand))] hover:opacity-90"
            >
              <FileText className="h-4 w-4" /> PDF (Styled)
            </button>
          </div>
        </div>
      </Modal>

      <div className="h-10" />
    </div>
  );
}

function MiniBox({ label, value, tone = "neutral" }) {
  const map = {
    green: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    yellow: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    rose: "border-rose-500/20 bg-rose-500/10 text-rose-300",
    neutral:
      "border-[hsl(var(--border))] bg-[hsl(var(--foreground))]/5 text-[hsl(var(--foreground))]/80",
  };
  return (
    <div className={cx("rounded-2xl border p-3", map[tone] || map.neutral)}>
      <div className="text-[11px] font-extrabold uppercase tracking-widest opacity-80">
        {label}
      </div>
      <div className="mt-1 text-sm font-extrabold">{value}</div>
    </div>
  );
}
