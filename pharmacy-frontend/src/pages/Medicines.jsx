// Medicines.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  PackagePlus,
  X,
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
} from "lucide-react";

const cx = (...a) => a.filter(Boolean).join(" ");

const FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Drops",
  "Cream",
  "Other",
];
const CATEGORIES = [
  "Pain Relief",
  "Antibiotics",
  "Allergy",
  "Gastro",
  "Diabetes",
  "Cardio",
  "Vitamins",
  "Other",
];

// ✅ Change these if your backend host/port differs
const MEDS_API = "http://localhost:5000/api/medicines";
const SUPPLIERS_API = "http://localhost:5000/api/suppliers";

function toISODate(d) {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10);
}

function daysUntil(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function money(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return "$0.00";
  return `$${num.toFixed(2)}`;
}

function computeStatus(m) {
  const qty = Number(m.quantity) || 0;
  const min = Number(m.minStock) || 0;
  const expDays = daysUntil(m.expiryDate);

  if (qty <= 0) return "out";
  if (expDays <= 30) return "expiring";
  if (qty <= min) return "low";
  return "ok";
}

function StatusPill({ status }) {
  const map = {
    ok: {
      label: "OK",
      cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
      Icon: BadgeCheck,
    },
    low: {
      label: "Low",
      cls: "bg-amber-500/15 text-amber-300 border-amber-500/20",
      Icon: AlertTriangle,
    },
    out: {
      label: "Out",
      cls: "bg-rose-500/15 text-rose-300 border-rose-500/20",
      Icon: AlertTriangle,
    },
    expiring: {
      label: "Expiring",
      cls: "bg-sky-500/15 text-sky-300 border-sky-500/20",
      Icon: CalendarClock,
    },
  };
  const item = map[status] || map.ok;
  const Icon = item.Icon;

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-extrabold tracking-tight",
        item.cls
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {item.label}
    </span>
  );
}

function Modal({ open, title, children, onClose }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-[hsl(var(--overlay))]/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative grid h-dvh place-items-center p-3 sm:p-4">
        <div
          className={cx(
            "w-full max-w-2xl overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-xl",
            "max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)]"
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
            <div className="text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]">
              {title}
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[hsl(var(--foreground))]/5"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-[hsl(var(--foreground))]/70" />
            </button>
          </div>

          <div className="max-h-[calc(100dvh-1.5rem-64px)] overflow-y-auto p-4 sm:max-h-[calc(100dvh-2rem-64px)]">
            {children}
            <div className="h-2 sm:h-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
        {label}
      </div>
      {children}
      {hint ? (
        <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/55">
          {hint}
        </div>
      ) : null}
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={cx(
        "h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 text-sm font-semibold",
        "text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground))]/40",
        "outline-none focus:border-[hsl(var(--brand-strong))]",
        props.className
      )}
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 text-sm font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--brand-strong))]"
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function StatMini({ title, value, tone = "neutral" }) {
  const toneMap = {
    neutral: "bg-[hsl(var(--surface))] border-[hsl(var(--border))]",
    amber: "bg-amber-500/10 border-amber-500/20",
    rose: "bg-rose-500/10 border-rose-500/20",
    sky: "bg-sky-500/10 border-sky-500/20",
  };

  return (
    <div className={cx("rounded-2xl border p-4", toneMap[tone])}>
      <div className="text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
        {title}
      </div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
        {value}
      </div>
    </div>
  );
}

/** Fetch helper with better error messages */
async function apiJson(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }
  if (!res.ok) {
    const msg =
      (data && data.message) ||
      (typeof data === "string" ? data : "") ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

/** Map backend row -> UI object */
function mapApiToUi(m) {
  return {
    // display code
    id: m.code,
    // numeric db id for update/delete/restock
    dbId: m.id,

    brandName: m.brand_name,
    genericName: m.generic_name || "",

    form: m.form,
    strength: m.strength,
    category: m.category,

    supplierId: m.supplier_id ?? null,
    supplier: m.supplier_name || "",

    barcode: m.barcode || "",
    batchNo: m.batch_no || "",

    quantity: Number(m.quantity) || 0,
    minStock: Number(m.min_stock) || 0,

    buyPrice: Number(m.buy_price) || 0,
    sellPrice: Number(m.sell_price) || 0,

    expiryDate: m.expiry_date ? String(m.expiry_date).slice(0, 10) : "",
    location: m.location || "",

    __updatedAt: m.updated_at ? new Date(m.updated_at).getTime() : 0,
  };
}

/** Autocomplete for supplier names (DB) */
function SupplierAutocomplete({
  value,
  onChangeValue,
  suppliers,
  onPickSupplier,
  disabled,
}) {
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    if (!q) return suppliers.slice(0, 8);
    return suppliers
      .filter((s) => {
        const hay = `${s.name} ${s.code || ""} ${s.phone || ""}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 8);
  }, [value, suppliers]);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChangeValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // small delay so click works
          setTimeout(() => setOpen(false), 120);
        }}
        placeholder="Type supplier name (suggestions will appear)"
        disabled={disabled}
      />

      {open && matches.length > 0 ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-xl">
          {matches.map((s) => (
            <button
              type="button"
              key={s.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onPickSupplier(s);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left hover:bg-[hsl(var(--foreground))]/5"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold">{s.name}</div>
                <div className="truncate text-[11px] font-semibold text-[hsl(var(--foreground))]/55">
                  {s.code ? `Code: ${s.code}` : "—"}{" "}
                  {s.phone ? `• ${s.phone}` : ""}
                </div>
              </div>
              <span className="text-xs font-extrabold text-[hsl(var(--brand-strong))]">
                Select
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Medicines() {
  const [meds, setMeds] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // UI state
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [form, setForm] = useState("");
  const [stock, setStock] = useState("");
  const [expiryWindow, setExpiryWindow] = useState("");
  const [sort, setSort] = useState("name-asc");

  // Loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [openForm, setOpenForm] = useState(false);
  const [editingDbId, setEditingDbId] = useState(null);
  const [openRestock, setOpenRestock] = useState(false);
  const [restockDbId, setRestockDbId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form draft
  const emptyDraft = {
    brandName: "",
    genericName: "",
    form: "",
    strength: "",
    category: "",
    supplier: "", // ✅ supplier name typed/selected
    supplierId: null, // ✅ supplier id from DB
    barcode: "",
    batchNo: "",
    quantity: 0,
    minStock: 0,
    buyPrice: 0,
    sellPrice: 0,
    expiryDate: "",
    location: "",
  };
  const [draft, setDraft] = useState(emptyDraft);

  // Restock
  const [restockQty, setRestockQty] = useState(0);
  const [restockBuyPrice, setRestockBuyPrice] = useState("");
  const [restockExpiry, setRestockExpiry] = useState("");

  async function loadAll() {
    try {
      setError("");
      setLoading(true);

      const [medRows, supplierRows] = await Promise.all([
        apiJson(MEDS_API),
        apiJson(SUPPLIERS_API),
      ]);

      // suppliers API returns: id, code, name, phone...
      setSuppliers(
        Array.isArray(supplierRows)
          ? supplierRows.map((s) => ({
              id: s.id,
              code: s.code,
              name: s.name,
              phone: s.phone,
            }))
          : []
      );

      setMeds(Array.isArray(medRows) ? medRows.map(mapApiToUi) : []);
    } catch (e) {
      setError(e.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const total = meds.length;
    let low = 0,
      out = 0,
      expiring = 0;
    meds.forEach((m) => {
      const s = computeStatus(m);
      if (s === "low") low += 1;
      if (s === "out") out += 1;
      if (s === "expiring") expiring += 1;
    });
    return { total, low, out, expiring };
  }, [meds]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const expN = expiryWindow ? Number(expiryWindow) : null;

    let arr = meds.filter((m) => {
      const s = computeStatus(m);

      if (query) {
        const hay = [
          m.id,
          m.brandName,
          m.genericName,
          m.strength,
          m.form,
          m.category,
          m.supplier,
          m.barcode,
          m.batchNo,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(query)) return false;
      }

      if (category && m.category !== category) return false;
      if (form && m.form !== form) return false;
      if (stock && s !== stock) return false;

      if (expN) {
        const d = daysUntil(m.expiryDate);
        if (!(d <= expN)) return false;
      }

      return true;
    });

    const byName = (a, b) =>
      `${a.brandName} ${a.genericName}`.localeCompare(
        `${b.brandName} ${b.genericName}`
      );
    const byStock = (a, b) =>
      (Number(a.quantity) || 0) - (Number(b.quantity) || 0);
    const byExpiry = (a, b) =>
      daysUntil(a.expiryDate) - daysUntil(b.expiryDate);
    const byUpdated = (a, b) => (a.__updatedAt || 0) - (b.__updatedAt || 0);

    switch (sort) {
      case "name-desc":
        arr = arr.sort((a, b) => -byName(a, b));
        break;
      case "stock-asc":
        arr = arr.sort(byStock);
        break;
      case "stock-desc":
        arr = arr.sort((a, b) => -byStock(a, b));
        break;
      case "expiry-soon":
        arr = arr.sort(byExpiry);
        break;
      case "recent":
        arr = arr.sort((a, b) => -byUpdated(a, b));
        break;
      default:
        arr = arr.sort(byName);
    }

    return arr;
  }, [meds, q, category, form, stock, expiryWindow, sort]);

  function openAdd() {
    setEditingDbId(null);
    setDraft(emptyDraft);
    setOpenForm(true);
  }

  function openEdit(m) {
    setEditingDbId(m.dbId);
    setDraft({
      brandName: m.brandName || "",
      genericName: m.genericName || "",
      form: m.form || "",
      strength: m.strength || "",
      category: m.category || "",
      supplier: m.supplier || "",
      supplierId: m.supplierId ?? null,
      barcode: m.barcode || "",
      batchNo: m.batchNo || "",
      quantity: Number(m.quantity) || 0,
      minStock: Number(m.minStock) || 0,
      buyPrice: Number(m.buyPrice) || 0,
      sellPrice: Number(m.sellPrice) || 0,
      expiryDate: m.expiryDate || "",
      location: m.location || "",
    });
    setOpenForm(true);
  }

  async function saveMedicine(e) {
    e.preventDefault();

    if (!draft.brandName.trim()) return alert("Brand name is required.");
    if (!draft.form) return alert("Form is required.");
    if (!draft.strength.trim()) return alert("Strength is required.");
    if (!draft.category) return alert("Category is required.");
    if (!draft.expiryDate) return alert("Expiry date is required.");

    if (Number(draft.sellPrice) < Number(draft.buyPrice)) {
      const ok = confirm("Sell price is lower than buy price. Save anyway?");
      if (!ok) return;
    }

    try {
      setSaving(true);

      const payload = {
        brandName: draft.brandName.trim(),
        genericName: draft.genericName.trim(),
        form: draft.form,
        strength: draft.strength.trim(),
        category: draft.category,
        supplierId: draft.supplierId ?? null, // ✅ this links to suppliers table
        barcode: draft.barcode.trim(),
        batchNo: draft.batchNo.trim(),
        quantity: Number(draft.quantity) || 0,
        minStock: Number(draft.minStock) || 0,
        buyPrice: Number(draft.buyPrice) || 0,
        sellPrice: Number(draft.sellPrice) || 0,
        expiryDate: draft.expiryDate,
        location: draft.location.trim(),
      };

      if (editingDbId) {
        const updated = await apiJson(`${MEDS_API}/${editingDbId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        // refresh supplier name by reloading list OR map join result if your API returns join fields
        await loadAll();
        setOpenForm(false);
      } else {
        const created = await apiJson(MEDS_API, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        // load again to get supplier_name via join
        await loadAll();
        setOpenForm(false);
      }

      setDraft(emptyDraft);
      setEditingDbId(null);
    } catch (err) {
      alert(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function removeMedicine(dbId) {
    const ok = confirm("Delete this medicine? (Tip: archive is safer.)");
    if (!ok) return;

    try {
      await apiJson(`${MEDS_API}/${dbId}`, { method: "DELETE" });
      setMeds((prev) => prev.filter((m) => m.dbId !== dbId));
    } catch (err) {
      alert(err.message || "Delete failed.");
    }
  }

  function openRestockModal(m) {
    setRestockDbId(m.dbId);
    setRestockQty(0);
    setRestockBuyPrice("");
    setRestockExpiry("");
    setOpenRestock(true);
  }

  async function applyRestock(e) {
    e.preventDefault();
    const qtyAdd = Number(restockQty);
    if (!restockDbId) return;
    if (!qtyAdd || qtyAdd <= 0) return alert("Enter a quantity to add.");

    try {
      setSaving(true);
      await apiJson(`${MEDS_API}/${restockDbId}/restock`, {
        method: "POST",
        body: JSON.stringify({
          addQty: qtyAdd,
          buyPrice: restockBuyPrice === "" ? null : Number(restockBuyPrice),
          expiryDate: restockExpiry || null,
        }),
      });
      await loadAll();
      setOpenRestock(false);
      setRestockDbId(null);
    } catch (err) {
      alert(err.message || "Restock failed.");
    } finally {
      setSaving(false);
    }
  }

  // When user types supplier text manually, supplierId should be cleared
  function setSupplierText(text) {
    setDraft((d) => ({ ...d, supplier: text, supplierId: null }));
  }

  function pickSupplier(s) {
    setDraft((d) => ({
      ...d,
      supplier: s.name,
      supplierId: s.id,
    }));
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-2xl font-extrabold tracking-tight">
              Medicines
            </div>
            <div className="text-sm font-medium text-[hsl(var(--foreground))]/60">
              Manage drugs available in the pharmacy: stock, expiry, pricing
            </div>

            {error ? (
              <div className="mt-2 text-xs font-semibold text-rose-300">
                {error}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAll}
              className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-sm font-extrabold tracking-tight hover:bg-[hsl(var(--foreground))]/5 sm:w-auto"
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>

            <button
              onClick={openAdd}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--brand))] shadow hover:opacity-90 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Add Medicine
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatMini title="Total" value={stats.total} tone="neutral" />
          <StatMini title="Low Stock" value={stats.low} tone="amber" />
          <StatMini title="Out of Stock" value={stats.out} tone="rose" />
          <StatMini title="Expiring ≤ 30d" value={stats.expiring} tone="sky" />
        </div>

        {/* Toolbar */}
        <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full lg:flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground))]/45" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, barcode, batch, supplier..."
                className="h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] pl-10 pr-4 text-sm font-semibold text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--foreground))]/40 focus:border-[hsl(var(--brand-strong))]"
              />
            </div>

            <div className="hidden lg:flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2">
              <Filter className="h-4 w-4 text-[hsl(var(--foreground))]/55" />
              <div className="text-xs font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/55">
                Filters
              </div>
            </div>

            <button
              onClick={() => {
                setQ("");
                setCategory("");
                setForm("");
                setStock("");
                setExpiryWindow("");
                setSort("name-asc");
              }}
              className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5 sm:w-auto"
            >
              Reset
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={CATEGORIES}
              placeholder="Category"
            />

            <Select
              value={form}
              onChange={(e) => setForm(e.target.value)}
              options={FORMS}
              placeholder="Form"
            />

            <select
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--brand-strong))]"
            >
              <option value="">Stock</option>
              <option value="ok">OK</option>
              <option value="low">Low</option>
              <option value="out">Out</option>
              <option value="expiring">Expiring</option>
            </select>

            <select
              value={expiryWindow}
              onChange={(e) => setExpiryWindow(e.target.value)}
              className="h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--brand-strong))]"
            >
              <option value="">Expiry</option>
              <option value="30">≤ 30 days</option>
              <option value="60">≤ 60 days</option>
              <option value="90">≤ 90 days</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--brand-strong))]"
            >
              <option value="name-asc">Sort: Name (A–Z)</option>
              <option value="name-desc">Sort: Name (Z–A)</option>
              <option value="stock-asc">Sort: Stock (Low→High)</option>
              <option value="stock-desc">Sort: Stock (High→Low)</option>
              <option value="expiry-soon">Sort: Expiry (Soonest)</option>
              <option value="recent">Sort: Recently Updated</option>
            </select>

            <div className="hidden lg:block" />
          </div>
        </div>

        {/* Desktop table */}
        <div className="mt-6 hidden overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] md:block">
          <div className="grid grid-cols-12 bg-[hsl(var(--foreground))]/5 px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
            <div className="col-span-4">Medicine</div>
            <div className="col-span-2">Stock</div>
            <div className="col-span-2">Expiry</div>
            <div className="col-span-2">Pricing</div>
            <div className="col-span-1">Supplier</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          <div className="divide-y divide-[hsl(var(--border))]">
            {loading ? (
              <div className="px-4 py-10 text-center">
                <div className="text-sm font-extrabold">Loading medicines…</div>
                <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/60">
                  Please wait.
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="text-sm font-extrabold">No medicines found</div>
                <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/60">
                  Try changing search/filters or add a new medicine.
                </div>
              </div>
            ) : (
              filtered.map((m) => {
                const status = computeStatus(m);
                const expDays = daysUntil(m.expiryDate);
                const qty = Number(m.quantity) || 0;
                const min = Number(m.minStock) || 0;

                return (
                  <div
                    key={m.dbId}
                    className="grid grid-cols-12 items-center px-4 py-3 text-sm"
                  >
                    <div className="col-span-4 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-10 w-10 shrink-0 rounded-2xl bg-[hsl(var(--brand-strong))]/18" />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-extrabold tracking-tight">
                            {m.brandName}{" "}
                            <span className="text-[hsl(var(--foreground))]/60">
                              • {m.strength}
                            </span>
                          </div>
                          <div className="truncate text-xs font-semibold text-[hsl(var(--foreground))]/60">
                            {m.genericName || "—"} • {m.form || "—"} •{" "}
                            {m.category || "—"}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-semibold text-[hsl(var(--foreground))]/55">
                            <span>ID: {m.id}</span>
                            {m.batchNo ? <span>Batch: {m.batchNo}</span> : null}
                            {m.barcode ? (
                              <span>Barcode: {m.barcode}</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="text-sm font-extrabold">
                        {qty}
                        <span className="ml-2 text-xs font-semibold text-[hsl(var(--foreground))]/55">
                          min {min}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-[hsl(var(--foreground))]/55">
                        Status: <StatusPill status={status} />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="text-sm font-extrabold">
                        {m.expiryDate || "—"}
                      </div>
                      <div className="text-xs font-medium text-[hsl(var(--foreground))]/55">
                        {expDays === Infinity
                          ? "No expiry"
                          : expDays < 0
                          ? "Expired"
                          : `${expDays} day(s) left`}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="text-sm font-extrabold">
                        {money(m.sellPrice)}
                      </div>
                      <div className="text-xs font-medium text-[hsl(var(--foreground))]/55">
                        Buy: {money(m.buyPrice)}
                      </div>
                    </div>

                    <div className="col-span-1 min-w-0">
                      <div className="truncate text-xs font-extrabold">
                        {m.supplier || "—"}
                      </div>
                    </div>

                    <div className="col-span-1 flex justify-end gap-2">
                      <button
                        onClick={() => openRestockModal(m)}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--foreground))]/5"
                        title="Restock"
                      >
                        <PackagePlus className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
                      </button>

                      <button
                        onClick={() => openEdit(m)}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--foreground))]/5"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4 text-[hsl(var(--foreground))]/75" />
                      </button>

                      <button
                        onClick={() => removeMedicine(m.dbId)}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--foreground))]/5"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-rose-300" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="mt-6 space-y-3 md:hidden">
          {loading ? (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-10 text-center">
              <div className="text-sm font-extrabold">Loading medicines…</div>
              <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/60">
                Please wait.
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-10 text-center">
              <div className="text-sm font-extrabold">No medicines found</div>
              <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/60">
                Try changing search/filters or add a new medicine.
              </div>
            </div>
          ) : (
            filtered.map((m) => {
              const status = computeStatus(m);
              const expDays = daysUntil(m.expiryDate);

              return (
                <div
                  key={m.dbId}
                  className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold tracking-tight">
                        {m.brandName}{" "}
                        <span className="text-[hsl(var(--foreground))]/60">
                          • {m.strength}
                        </span>
                      </div>
                      <div className="mt-1 text-xs font-semibold text-[hsl(var(--foreground))]/60">
                        {m.genericName || "—"} • {m.form || "—"} •{" "}
                        {m.category || "—"}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-[hsl(var(--foreground))]/55">
                        <span>ID: {m.id}</span>
                        {m.batchNo ? <span>Batch: {m.batchNo}</span> : null}
                        {m.barcode ? <span>Barcode: {m.barcode}</span> : null}
                      </div>
                      <div className="mt-2 text-xs font-semibold text-[hsl(var(--foreground))]/60">
                        Supplier:{" "}
                        <span className="font-extrabold">
                          {m.supplier || "—"}
                        </span>
                      </div>
                    </div>

                    <StatusPill status={status} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
                      <div className="text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                        Stock
                      </div>
                      <div className="mt-1 text-sm font-extrabold">
                        {m.quantity}{" "}
                        <span className="text-xs font-semibold text-[hsl(var(--foreground))]/55">
                          min {m.minStock}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
                      <div className="text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                        Expiry
                      </div>
                      <div className="mt-1 text-sm font-extrabold">
                        {m.expiryDate || "—"}
                      </div>
                      <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/55">
                        {expDays === Infinity
                          ? "No expiry"
                          : expDays < 0
                          ? "Expired"
                          : `${expDays} day(s) left`}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-3">
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                        Pricing
                      </div>
                      <div className="mt-1 text-sm font-extrabold text-[hsl(var(--brand-strong))]">
                        {money(m.sellPrice)}
                      </div>
                      <div className="text-xs font-medium text-[hsl(var(--foreground))]/55">
                        Buy: {money(m.buyPrice)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openRestockModal(m)}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--foreground))]/5"
                        title="Restock"
                      >
                        <PackagePlus className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
                      </button>

                      <button
                        onClick={() => openEdit(m)}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--foreground))]/5"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4 text-[hsl(var(--foreground))]/75" />
                      </button>

                      <button
                        onClick={() => removeMedicine(m.dbId)}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--foreground))]/5"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-rose-300" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="h-10" />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={openForm}
        title={editingDbId ? "Edit Medicine" : "Add Medicine"}
        onClose={() => (saving ? null : setOpenForm(false))}
      >
        <form onSubmit={saveMedicine} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Brand Name *">
              <Input
                value={draft.brandName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, brandName: e.target.value }))
                }
                placeholder="e.g. Panadol"
                disabled={saving}
              />
            </Field>

            <Field label="Generic Name (Optional)">
              <Input
                value={draft.genericName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, genericName: e.target.value }))
                }
                placeholder="e.g. Acetaminophen"
                disabled={saving}
              />
            </Field>

            <Field label="Form *">
              <Select
                value={draft.form}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, form: e.target.value }))
                }
                options={FORMS}
                placeholder="Select form"
              />
            </Field>

            <Field label="Strength *">
              <Input
                value={draft.strength}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, strength: e.target.value }))
                }
                placeholder="e.g. 500mg / 5mg/5ml"
                disabled={saving}
              />
            </Field>

            <Field label="Category *">
              <Select
                value={draft.category}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, category: e.target.value }))
                }
                options={CATEGORIES}
                placeholder="Select category"
              />
            </Field>

            {/* ✅ Supplier Autocomplete connected to suppliers table */}
            <Field
              label="Supplier (Optional)"
              hint="Start typing to see supplier suggestions from your database."
            >
              <SupplierAutocomplete
                value={draft.supplier}
                onChangeValue={setSupplierText}
                suppliers={suppliers}
                onPickSupplier={pickSupplier}
                disabled={saving}
              />
              {/* little helper line showing selection status */}
              <div className="mt-1 text-xs font-semibold text-[hsl(var(--foreground))]/55">
                {draft.supplierId ? (
                  <span>
                    Selected supplier ID:{" "}
                    <span className="font-extrabold">{draft.supplierId}</span>
                  </span>
                ) : (
                  <span>Not selected (will save as NULL)</span>
                )}
              </div>
            </Field>

            <Field label="Quantity (Optional)">
              <Input
                type="number"
                value={draft.quantity}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, quantity: e.target.value }))
                }
                min={0}
                disabled={saving}
              />
            </Field>

            <Field label="Min Stock (Optional)">
              <Input
                type="number"
                value={draft.minStock}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, minStock: e.target.value }))
                }
                min={0}
                disabled={saving}
              />
            </Field>

            <Field label="Buy Price (Optional)">
              <Input
                type="number"
                step="0.01"
                value={draft.buyPrice}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, buyPrice: e.target.value }))
                }
                min={0}
                disabled={saving}
              />
            </Field>

            <Field label="Sell Price (Optional)">
              <Input
                type="number"
                step="0.01"
                value={draft.sellPrice}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, sellPrice: e.target.value }))
                }
                min={0}
                disabled={saving}
              />
            </Field>

            <Field
              label="Expiry Date *"
              hint="Used to alert expiring medicines."
            >
              <Input
                type="date"
                value={draft.expiryDate}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, expiryDate: e.target.value }))
                }
                disabled={saving}
              />
            </Field>

            <Field label="Location (Optional)">
              <Input
                value={draft.location}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, location: e.target.value }))
                }
                placeholder="e.g. Shelf A3"
                disabled={saving}
              />
            </Field>

            <Field label="Batch No (Optional)">
              <Input
                value={draft.batchNo}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, batchNo: e.target.value }))
                }
                placeholder="e.g. B24-11"
                disabled={saving}
              />
            </Field>

            <Field label="Barcode (Optional)">
              <Input
                value={draft.barcode}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, barcode: e.target.value }))
                }
                placeholder="Scan or type barcode"
                disabled={saving}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs font-medium text-[hsl(var(--foreground))]/60">
              Tip: Selecting a supplier will save supplierId (FK). Leaving it
              empty saves NULL.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpenForm(false)}
                className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-2xl bg-[hsl(var(--brand-strong))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--brand))] shadow hover:opacity-90 disabled:opacity-60"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingDbId
                  ? "Save Changes"
                  : "Add Medicine"}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Restock Modal */}
      <Modal
        open={openRestock}
        title="Restock Medicine"
        onClose={() => (saving ? null : setOpenRestock(false))}
      >
        <form onSubmit={applyRestock} className="space-y-4">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <div className="text-sm font-extrabold tracking-tight">
              Add stock quickly
            </div>
            <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/60">
              Quantity is added to existing stock. Optionally update buy price &
              expiry (new batch).
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Add Quantity *">
              <Input
                type="number"
                min={1}
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                disabled={saving}
              />
            </Field>

            <Field label="New Buy Price (Optional)">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={restockBuyPrice}
                onChange={(e) => setRestockBuyPrice(e.target.value)}
                placeholder="Leave empty to keep"
                disabled={saving}
              />
            </Field>

            <Field label="New Expiry (Optional)">
              <Input
                type="date"
                value={restockExpiry}
                onChange={(e) => setRestockExpiry(e.target.value)}
                disabled={saving}
              />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpenRestock(false)}
              className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-[hsl(var(--brand-strong))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--brand))] shadow hover:opacity-90 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Applying..." : "Apply Restock"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
