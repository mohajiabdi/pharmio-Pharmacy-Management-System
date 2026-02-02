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

import MedicineFormModal from "../components/medicines/MedicineFormModal";
import medicinesApi from "../api/medicinesApi";
import suppliersApi from "../api/suppliersApi";

const cx = (...a) => a.filter(Boolean).join(" ");

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
  const expDays = daysUntil(m.expiryDate);

  if (qty <= 0) return "out";
  if (expDays < 0) return "expired";
  if (expDays <= 30) return "expiring";
  return "ok";
}

function StatusPill({ status }) {
  const map = {
    ok: {
      label: "OK",
      cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
      Icon: BadgeCheck,
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
    expired: {
      label: "Expired",
      cls: "bg-rose-500/15 text-rose-200 border-rose-500/20",
      Icon: AlertTriangle,
    },
  };

  const item = map[status] || map.ok;
  const Icon = item.Icon;

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-extrabold tracking-tight",
        item.cls,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {item.label}
    </span>
  );
}

/** Simple modal (keep for restock only) */
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
            "w-full max-w-lg overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-xl",
            "max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)]",
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
        props.className,
      )}
    />
  );
}

function StatMini({ title, value, tone = "neutral" }) {
  const toneMap = {
    neutral: "bg-[hsl(var(--surface))] border-[hsl(var(--border))]",
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
// 🔧 normalize backend → frontend shape
function normalizeSupplier(s) {
  return {
    id: s.id ?? s.supplier_id,
    name: s.name ?? s.supplier_name,
    isActive: s.isActive ?? s.is_active ?? 1,
  };
}

function normalizeMedicine(m) {
  return {
    id: m.id,
    brandName: m.brandName ?? m.brand_name,
    genericName: m.genericName ?? m.generic_name,
    form: m.form,
    category: m.category,
    strength: m.strength,
    supplierId: m.supplierId ?? m.supplier_id,
    supplierName: m.supplierName ?? m.name ?? m.supplier_name,
    quantity: Number(m.quantity) || 0,
    buyPrice: Number(m.buyPrice ?? m.buy_price) || 0,
    sellPrice: Number(m.sellPrice ?? m.sell_price) || 0,
    expiryDate: m.expiryDate ?? m.expiry_date,
    isActive: m.isActive ?? m.is_active ?? 1,
  };
}

export default function Medicines() {
  const [meds, setMeds] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("name-asc");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [openRestock, setOpenRestock] = useState(false);
  const [restockItem, setRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState(0);

  const [loadingPage, setLoadingPage] = useState(true);
  const [pageError, setPageError] = useState("");

  async function loadAll() {
    setLoadingPage(true);
    setPageError("");

    try {
      const [sRes, mRes] = await Promise.all([
        suppliersApi.list(),
        medicinesApi.list(),
      ]);

      const rawSuppliers =
        sRes?.data?.data || sRes?.data?.suppliers || sRes?.data || [];
      const rawMeds =
        mRes?.data?.data || mRes?.data?.medicines || mRes?.data || [];

      const sList = Array.isArray(rawSuppliers)
        ? rawSuppliers
            .map(normalizeSupplier)
            .filter((s) => Number(s.isActive) === 1)
        : [];

      const mList = Array.isArray(rawMeds)
        ? rawMeds.map(normalizeMedicine)
        : [];

      setSuppliers(sList);
      setMeds(mList);

      console.log("Suppliers normalized:", sList);
    } catch (e) {
      console.error(e);
      setPageError("Failed to load medicines/suppliers. Check backend.");
    } finally {
      setLoadingPage(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const stats = useMemo(() => {
    let total = meds.length;
    let out = 0;
    let expiring = 0;
    let expired = 0;

    meds.forEach((m) => {
      const s = computeStatus(m);
      if (s === "out") out += 1;
      if (s === "expiring") expiring += 1;
      if (s === "expired") expired += 1;
    });

    return { total, out, expiring, expired };
  }, [meds]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    let arr = meds.filter((m) => {
      if (!query) return true;

      const label = `MED-${String(m.id).padStart(3, "0")}`;
      const hay = [
        label,
        m.brandName,
        m.genericName,
        m.form,
        m.category,
        m.strength,
        m.supplierName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(query);
    });

    const byName = (a, b) =>
      `${a.brandName} ${a.genericName}`.localeCompare(
        `${b.brandName} ${b.genericName}`,
      );
    const byStock = (a, b) =>
      (Number(a.quantity) || 0) - (Number(b.quantity) || 0);
    const byExpiry = (a, b) =>
      daysUntil(a.expiryDate) - daysUntil(b.expiryDate);

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
      default:
        arr = arr.sort(byName);
    }

    return arr;
  }, [meds, q, sort]);

  function openAdd() {
    setEditing(null);
    setOpenForm(true);
  }

  function openEdit(m) {
    setEditing(m);
    setOpenForm(true);
  }

  async function handleSubmitMedicine(draft) {
    setSaving(true);
    try {
      if (editing?.id) await medicinesApi.update(editing.id, draft);
      else await medicinesApi.create(draft);

      setOpenForm(false);
      setEditing(null);
      await loadAll();
    } catch (e) {
      console.error(e);
      alert("Save failed. Check backend/console.");
    } finally {
      setSaving(false);
    }
  }

  async function removeMedicine(id) {
    const ok = confirm("Delete this medicine? (Soft delete later in DB.)");
    if (!ok) return;

    try {
      await medicinesApi.remove(id);
      await loadAll();
    } catch (e) {
      console.error(e);
      alert("Delete failed. Check backend/console.");
    }
  }

  function openRestockModal(m) {
    setRestockItem(m);
    setRestockQty(0);
    setOpenRestock(true);
  }

  async function applyRestock(e) {
    e.preventDefault();
    const qtyAdd = Number(restockQty);
    if (!restockItem?.id) return;
    if (!qtyAdd || qtyAdd <= 0) return alert("Enter quantity.");

    try {
      await medicinesApi.restock(restockItem.id, { quantity: qtyAdd });
      setOpenRestock(false);
      setRestockItem(null);
      await loadAll();
    } catch (e2) {
      console.error(e2);
      alert("Restock failed. Check backend/console.");
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-2xl font-extrabold tracking-tight">
              Medicines
            </div>
            <div className="text-sm font-medium text-[hsl(var(--foreground))]/60">
              Simple medicines module (university project)
            </div>
          </div>

          <button
            onClick={openAdd}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--brand))] shadow hover:opacity-90 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Medicine
          </button>
        </div>

        {loadingPage ? (
          <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 text-sm font-semibold text-[hsl(var(--foreground))]/70">
            Loading...
          </div>
        ) : pageError ? (
          <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-200">
            {pageError}
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatMini title="Total" value={stats.total} tone="neutral" />
          <StatMini title="Out of Stock" value={stats.out} tone="rose" />
          <StatMini title="Expiring ≤ 30d" value={stats.expiring} tone="sky" />
          <StatMini title="Expired" value={stats.expired} tone="rose" />
        </div>

        <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full lg:flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground))]/45" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, supplier, strength..."
                className="h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] pl-10 pr-4 text-sm font-semibold text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--foreground))]/40 focus:border-[hsl(var(--brand-strong))]"
              />
            </div>

            <div className="hidden lg:flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2">
              <Filter className="h-4 w-4 text-[hsl(var(--foreground))]/55" />
              <div className="text-xs font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/55">
                Sort
              </div>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--brand-strong))] sm:w-auto"
            >
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
              <option value="stock-asc">Stock (Low→High)</option>
              <option value="stock-desc">Stock (High→Low)</option>
              <option value="expiry-soon">Expiry (Soonest)</option>
            </select>

            <button
              onClick={() => {
                setQ("");
                setSort("name-asc");
              }}
              className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5 sm:w-auto"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
          <div className="grid grid-cols-12 bg-[hsl(var(--foreground))]/5 px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
            <div className="col-span-4">Medicine</div>
            <div className="col-span-2">Supplier</div>
            <div className="col-span-2">Stock</div>
            <div className="col-span-2">Pricing</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          <div className="divide-y divide-[hsl(var(--border))]">
            {!loadingPage && filtered.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="text-sm font-extrabold">No medicines found</div>
                <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/60">
                  Try searching or add a new medicine.
                </div>
              </div>
            ) : (
              filtered.map((m) => {
                const status = computeStatus(m);
                const expDays = daysUntil(m.expiryDate);
                const idLabel = `MED-${String(m.id).padStart(3, "0")}`;

                return (
                  <div
                    key={m.id}
                    className="grid grid-cols-12 items-center px-4 py-3 text-sm"
                  >
                    <div className="col-span-4 min-w-0">
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
                      <div className="mt-1 text-[11px] font-semibold text-[hsl(var(--foreground))]/55">
                        {idLabel} • Exp: {m.expiryDate || "—"}{" "}
                        {expDays < 0
                          ? "(Expired)"
                          : expDays !== Infinity
                            ? `(${expDays}d)`
                            : ""}
                      </div>
                    </div>

                    <div className="col-span-2 text-xs font-semibold text-[hsl(var(--foreground))]/70">
                      {m.supplierName || "—"}
                    </div>

                    <div className="col-span-2">
                      <div className="text-sm font-extrabold text-[hsl(var(--foreground))]/90">
                        {Number(m.quantity) || 0}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="text-sm font-extrabold text-[hsl(var(--foreground))]/90">
                        {money(m.sellPrice)}
                      </div>
                      <div className="text-xs font-medium text-[hsl(var(--foreground))]/55">
                        Buy: {money(m.buyPrice)}
                      </div>
                    </div>

                    <div className="col-span-1">
                      <StatusPill status={status} />
                    </div>

                    <div className="col-span-1 flex justify-end gap-2">
                      <button
                        onClick={() => openRestockModal(m)}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--foreground))]/5"
                        aria-label="Restock"
                        title="Restock"
                      >
                        <PackagePlus className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
                      </button>

                      <button
                        onClick={() => openEdit(m)}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--foreground))]/5"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4 text-[hsl(var(--foreground))]/75" />
                      </button>

                      <button
                        onClick={() => removeMedicine(m.id)}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--foreground))]/5"
                        aria-label="Delete"
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

        <div className="h-10" />
      </div>

      <MedicineFormModal
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onSubmit={handleSubmitMedicine}
        loading={saving}
        initial={
          editing
            ? {
                id: editing.id,
                brandName: editing.brandName,
                genericName: editing.genericName,
                form: editing.form,
                strength: editing.strength,
                category: editing.category,
                supplierId: editing.supplierId,
                quantity: editing.quantity,
                buyPrice: editing.buyPrice,
                sellPrice: editing.sellPrice,
                expiryDate: editing.expiryDate,
              }
            : null
        }
        suppliers={suppliers}
      />

      <Modal
        open={openRestock}
        title="Restock Medicine"
        onClose={() => setOpenRestock(false)}
      >
        <form onSubmit={applyRestock} className="space-y-4">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <div className="text-sm font-extrabold tracking-tight">
              Add stock quickly
            </div>
            <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/60">
              Quantity will be added to current stock.
            </div>
          </div>

          <Field label="Add Quantity *">
            <Input
              type="number"
              min={1}
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
            />
          </Field>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpenRestock(false)}
              className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-[hsl(var(--brand-strong))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--brand))] shadow hover:opacity-90"
            >
              Apply Restock
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
