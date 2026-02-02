import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";

import medicinesApi from "../api/medicinesApi";
import salesApi from "../api/salesApi";

const cx = (...a) => a.filter(Boolean).join(" ");

const money = (n) => {
  const num = Number(n);
  if (Number.isNaN(num)) return "$0.00";
  return `$${num.toFixed(2)}`;
};

// ---------- input helpers (STRICT) ----------
function digitsOnly(s) {
  return String(s || "").replace(/[^\d]/g, "");
}
function toIntSafe(s, fallback = 0) {
  const v = Number(digitsOnly(s));
  return Number.isFinite(v) ? v : fallback;
}
function moneyClean(s) {
  // allow digits + single dot, remove other chars
  let v = String(s ?? "").replace(/[^\d.]/g, "");
  const parts = v.split(".");
  if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join(""); // keep first dot only
  return v;
}
function toMoneySafe(s, fallback = 0) {
  const cleaned = moneyClean(s);
  const v = Number(cleaned);
  if (!Number.isFinite(v)) return fallback;
  return v < 0 ? 0 : v;
}

function statusForStock(qty) {
  if (qty <= 0) return { label: "Out", tone: "rose" };
  if (qty <= 10) return { label: "Low", tone: "yellow" };
  return { label: "In Stock", tone: "green" };
}

function Pill({ tone = "neutral", children }) {
  const map = {
    neutral:
      "bg-[hsl(var(--foreground))]/10 text-[hsl(var(--foreground))]/80 border-[hsl(var(--border))]",
    green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    yellow: "bg-amber-500/15 text-amber-300 border-amber-500/20",
    rose: "bg-rose-500/15 text-rose-300 border-rose-500/20",
    sky: "bg-sky-500/15 text-sky-300 border-sky-500/20",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-extrabold",
        map[tone],
      )}
    >
      {children}
    </span>
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

/* ✅ Responsive Modal: max-height + scrollable body */
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
            "w-full max-w-3xl overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-xl",
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

export default function Sales() {
  const [medicines, setMedicines] = useState([]);
  const [q, setQ] = useState("");
  const [cart, setCart] = useState([]); // { medicineId, qtyInt }
  const [discountInput, setDiscountInput] = useState("0"); // keep as string for input
  const TAX_RATE = 5; // fixed
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("0");

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [openReceipt, setOpenReceipt] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);

  async function loadRecentTransactions() {
    try {
      const res = await salesApi.listRecent(7);
      const list = res?.data || [];
      setTransactions(Array.isArray(list) ? list : []);
    } catch (e) {
      // don’t block the whole page if this fails
      console.log("Failed to load recent transactions", e);
    }
  }

  async function loadMeds() {
    setLoading(true);
    setPageError("");
    try {
      const res = await medicinesApi.list();
      const list = res?.data?.data || res?.data?.medicines || res?.data || [];
      setMedicines(Array.isArray(list) ? list : []);
    } catch (e) {
      setPageError("Failed to load medicines. Check backend or token.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMeds();
    loadRecentTransactions();
  }, []);

  const medicineResults = useMemo(() => {
    const query = q.trim().toLowerCase();
    const arr = medicines.filter((m) => {
      if (!query) return true;
      const hay = [
        `MED-${String(m.id).padStart(3, "0")}`,
        m.brandName,
        m.genericName,
        m.form,
        m.strength,
        m.barcode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
    // show in-stock first
    return arr.sort(
      (a, b) => (Number(b.quantity) > 0) - (Number(a.quantity) > 0),
    );
  }, [medicines, q]);

  const cartLines = useMemo(() => {
    return cart
      .map((line) => {
        const med = medicines.find(
          (m) => Number(m.id) === Number(line.medicineId),
        );
        if (!med) return null;
        const qty = Number(line.qty) || 0;
        const price = Number(med.sellPrice) || 0;
        const lineTotal = qty * price;
        return { ...line, med, price, lineTotal };
      })
      .filter(Boolean);
  }, [cart, medicines]);

  const subtotal = useMemo(
    () => cartLines.reduce((sum, l) => sum + l.lineTotal, 0),
    [cartLines],
  );

  useEffect(() => {
    const max = subtotal * 0.1;
    const current = Number(discountInput);
    if (!Number.isNaN(current) && current > max) {
      setDiscountInput(max.toFixed(2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  // subtotal already exists

  // discount: number (sanitized) + capped at 10% of subtotal
  const discountMax = useMemo(() => subtotal * 0.1, [subtotal]);

  const discountValue = useMemo(() => {
    const raw = Number(discountInput);
    if (Number.isNaN(raw) || raw < 0) return 0;
    return raw;
  }, [discountInput]);

  const discountClamped = useMemo(() => {
    if (discountValue > discountMax) return discountMax;
    return discountValue;
  }, [discountValue, discountMax]);

  // fixed tax 5%
  const taxAmount = useMemo(() => {
    if (subtotal - discountClamped <= 0) return 0;
    return (subtotal - discountClamped) * (TAX_RATE / 100);
  }, [subtotal, discountClamped]);

  const total = useMemo(() => {
    const t = subtotal - discountClamped + taxAmount;
    return t < 0 ? 0 : t;
  }, [subtotal, discountClamped, taxAmount]);

  const paidVal = useMemo(() => toMoneySafe(amountPaid, 0), [amountPaid]);
  const balance = useMemo(() => total - paidVal, [total, paidVal]);
  const change = useMemo(
    () => (paidVal > total ? paidVal - total : 0),
    [paidVal, total],
  );

  const canCheckout = cartLines.length > 0;

  function handleDiscountChange(e) {
    // allow only digits + dot, no minus, no letters
    let v = e.target.value.replace(/[^0-9.]/g, "");

    // allow only one dot
    const parts = v.split(".");
    if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");

    // prevent leading zeros like 0002 (optional)
    if (v.length > 1 && v[0] === "0" && v[1] !== ".") {
      v = String(Number(v));
    }

    // clamp to max 10% based on current subtotal
    const num = Number(v);
    if (!Number.isNaN(num)) {
      const max = subtotal * 0.1;
      if (num > max) v = max.toFixed(2);
    }

    setDiscountInput(v === "" ? "0" : v);
  }

  function addToCart(medicineId) {
    const med = medicines.find((m) => Number(m.id) === Number(medicineId));
    const available = Number(med?.quantity) || 0;
    if (available <= 0) return;

    setCart((prev) => {
      const existing = prev.find(
        (l) => Number(l.medicineId) === Number(medicineId),
      );
      if (existing) {
        // clamp to available
        const nextQty = Math.min(available, Number(existing.qty) + 1);
        return prev.map((l) =>
          Number(l.medicineId) === Number(medicineId)
            ? { ...l, qty: nextQty }
            : l,
        );
      }
      return [...prev, { medicineId: Number(medicineId), qty: 1 }];
    });
  }

  function setQty(medicineId, nextQtyStr) {
    const med = medicines.find((m) => Number(m.id) === Number(medicineId));
    const available = Number(med?.quantity) || 0;

    const nextInt = toIntSafe(nextQtyStr, 0);
    setCart((prev) => {
      if (nextInt <= 0)
        return prev.filter((l) => Number(l.medicineId) !== Number(medicineId));
      const clamped = Math.min(nextInt, available);
      return prev.map((l) =>
        Number(l.medicineId) === Number(medicineId)
          ? { ...l, qty: clamped }
          : l,
      );
    });
  }

  function inc(medicineId) {
    const med = medicines.find((m) => Number(m.id) === Number(medicineId));
    const available = Number(med?.quantity) || 0;

    setCart((prev) =>
      prev.map((l) => {
        if (Number(l.medicineId) !== Number(medicineId)) return l;
        const next = Math.min(available, Number(l.qty) + 1);
        return { ...l, qty: next };
      }),
    );
  }

  function dec(medicineId) {
    setCart((prev) =>
      prev
        .map((l) =>
          Number(l.medicineId) === Number(medicineId)
            ? { ...l, qty: Number(l.qty) - 1 }
            : l,
        )
        .filter((l) => Number(l.qty) > 0),
    );
  }

  function clearCart() {
    setCart([]);
    setDiscountInput("0");
    setAmountPaid("0");
  }

  function validateStockBeforeCheckout() {
    for (const line of cartLines) {
      const available = Number(line.med.quantity) || 0;
      const want = Number(line.qty) || 0;
      if (!Number.isInteger(want) || want <= 0) {
        return {
          ok: false,
          message: "Cart quantity must be a positive whole number.",
        };
      }
      if (want > available) {
        return {
          ok: false,
          message: `Not enough stock for ${line.med.brandName} (${line.med.strength}). Available: ${available}, In cart: ${want}.`,
        };
      }
    }
    return { ok: true };
  }

  async function checkout() {
    if (!canCheckout) return;

    const stockCheck = validateStockBeforeCheckout();
    if (!stockCheck.ok) return alert(stockCheck.message);

    try {
      const payload = {
        paymentMethod,
        discount: Number(discountClamped.toFixed(2)),
        taxRate: TAX_RATE,
        paid: Number(paidVal.toFixed(2)),
        items: cartLines.map((l) => ({
          medicineId: Number(l.med.id),
          qty: Number(l.qty),
        })),
      };

      const res = await salesApi.create(payload);
      const receipt = res?.data;

      // show receipt + store local recent list
      setLastReceipt(receipt);
      setTransactions((prev) => [receipt, ...prev]);
      setOpenReceipt(true);

      clearCart();
      setQ("");

      // reload medicines after stock reduced on server
      await loadMeds();
      loadRecentTransactions();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        "Checkout failed. Check token, stock, expiry, backend logs.";
      alert(msg);
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-2xl font-extrabold tracking-tight ml-10">
            Sales / POS
          </div>
          <div className="text-sm font-medium text-[hsl(var(--foreground))]/60 ml-10">
            Walk-in sales only (university project)
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
          <button
            onClick={clearCart}
            className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5"
          >
            Clear Cart
          </button>
          <button
            onClick={checkout}
            disabled={!canCheckout}
            className={cx(
              "w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold tracking-tight shadow transition",
              canCheckout
                ? "bg-[hsl(var(--brand-strong))] text-[hsl(var(--brand))] hover:opacity-90"
                : "bg-[hsl(var(--foreground))]/10 text-[hsl(var(--foreground))]/50 cursor-not-allowed",
            )}
          >
            <Receipt className="h-4 w-4" />
            Checkout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 ml-10 mr-10 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 text-sm font-semibold text-[hsl(var(--foreground))]/70">
          Loading medicines...
        </div>
      ) : pageError ? (
        <div className="mt-6 ml-10 mr-10 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-200">
          {pageError}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 ml-10 mr-10">
        {/* Left */}
        <div className="space-y-4 lg:col-span-1 xl:col-span-2">
          {/* Search */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <div className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
              Search Medicine
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground))]/45" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, strength, form..."
                className="pl-10 bg-[hsl(var(--background))]"
              />
            </div>

            <div className="mt-3 text-xs font-medium text-[hsl(var(--foreground))]/60">
              Customer: <span className="font-extrabold">Walk-in</span>
            </div>
          </div>

          {/* Medicines list */}
          <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            <div className="hidden md:grid grid-cols-12 bg-[hsl(var(--foreground))]/5 px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
              <div className="col-span-6">Medicine</div>
              <div className="col-span-2">Stock</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2 text-right">Add</div>
            </div>

            <div className="divide-y divide-[hsl(var(--border))]">
              {medicineResults.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <div className="text-sm font-extrabold">
                    No medicines found
                  </div>
                  <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/60">
                    Try another search keyword.
                  </div>
                </div>
              ) : (
                medicineResults.map((m) => {
                  const st = statusForStock(Number(m.quantity) || 0);
                  const disabled = (Number(m.quantity) || 0) <= 0;
                  const idLabel = `MED-${String(m.id).padStart(3, "0")}`;

                  return (
                    <div key={m.id} className="px-4 py-3">
                      <div className="md:hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 h-10 w-10 rounded-2xl bg-[hsl(var(--brand-strong))]/18" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-extrabold tracking-tight">
                              {m.brandName}{" "}
                              <span className="text-[hsl(var(--foreground))]/60">
                                • {m.strength}
                              </span>
                            </div>
                            <div className="truncate text-xs font-semibold text-[hsl(var(--foreground))]/60">
                              {m.genericName || "—"} • {m.form || "—"} •{" "}
                              {idLabel}
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-[hsl(var(--foreground))]/60">
                                  Stock
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                  <div className="text-sm font-extrabold">
                                    {m.quantity}
                                  </div>
                                  <Pill tone={st.tone}>{st.label}</Pill>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-xs font-semibold text-[hsl(var(--foreground))]/60">
                                  Price
                                </div>
                                <div className="mt-1 text-sm font-extrabold text-[hsl(var(--brand-strong))]">
                                  {money(m.sellPrice)}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => addToCart(m.id)}
                              disabled={disabled}
                              className={cx(
                                "mt-3 w-full inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-extrabold tracking-tight transition",
                                disabled
                                  ? "bg-[hsl(var(--foreground))]/10 text-[hsl(var(--foreground))]/50 cursor-not-allowed"
                                  : "bg-[hsl(var(--brand-strong))] text-[hsl(var(--brand))] hover:opacity-90",
                              )}
                            >
                              <Plus className="h-4 w-4" />
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:grid grid-cols-12 items-center text-sm">
                        <div className="col-span-6 min-w-0">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 h-10 w-10 rounded-2xl bg-[hsl(var(--brand-strong))]/18" />
                            <div className="min-w-0">
                              <div className="truncate text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]">
                                {m.brandName}{" "}
                                <span className="text-[hsl(var(--foreground))]/60">
                                  • {m.strength}
                                </span>
                              </div>
                              <div className="truncate text-xs font-semibold text-[hsl(var(--foreground))]/60">
                                {m.genericName || "—"} • {m.form || "—"} •{" "}
                                {idLabel}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <div className="font-extrabold">{m.quantity}</div>
                          <div className="mt-1">
                            <Pill tone={st.tone}>{st.label}</Pill>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <div className="font-extrabold">
                            {money(m.sellPrice)}
                          </div>
                          <div className="text-xs font-medium text-[hsl(var(--foreground))]/55">
                            per unit
                          </div>
                        </div>

                        <div className="col-span-2 flex justify-end">
                          <button
                            onClick={() => addToCart(m.id)}
                            disabled={disabled}
                            className={cx(
                              "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-extrabold tracking-tight transition",
                              disabled
                                ? "bg-[hsl(var(--foreground))]/10 text-[hsl(var(--foreground))]/50 cursor-not-allowed"
                                : "bg-[hsl(var(--brand-strong))] text-[hsl(var(--brand))] hover:opacity-90",
                            )}
                          >
                            <Plus className="h-4 w-4" />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent transactions (from successful backend) */}
          <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="text-sm font-extrabold tracking-tight">
                Recent Transactions
              </div>
              <div className="text-xs font-semibold text-[hsl(var(--foreground))]/60">
                {transactions.length} total
              </div>
            </div>

            <div className="divide-y divide-[hsl(var(--border))]">
              {transactions.length === 0 ? (
                <div className="px-4 pb-5 text-xs font-medium text-[hsl(var(--foreground))]/60">
                  No transactions yet. Complete a checkout to generate a
                  receipt.
                </div>
              ) : (
                transactions.slice(0, 5).map((t) => (
                  <div
                    key={t.saleNo || t.id}
                    className="flex flex-col gap-3 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="font-extrabold text-[hsl(var(--foreground))]/90">
                        {t.saleNo || t.id}{" "}
                        <span className="text-[hsl(var(--foreground))]/55">
                          •{" "}
                          {t.createdAt
                            ? new Date(t.createdAt).toLocaleString()
                            : ""}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-[hsl(var(--foreground))]/60">
                        Walk-in • {t.items?.length || 0} item(s)
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-[hsl(var(--brand-strong))]">
                          {money(t.total)}
                        </div>
                        <div className="text-xs font-semibold text-[hsl(var(--foreground))]/55">
                          {t.status}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setLastReceipt(t);
                          setOpenReceipt(true);
                        }}
                        className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-extrabold text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4 xl:col-span-1">
          {/* Cart */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold tracking-tight">Cart</div>
              <div className="text-xs font-semibold text-[hsl(var(--foreground))]/60">
                {cartLines.length} item(s)
              </div>
            </div>

            <div className="mt-3 space-y-3">
              {cartLines.length === 0 ? (
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 text-center">
                  <div className="text-sm font-extrabold">Cart is empty</div>
                  <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/60">
                    Search medicines and press “Add”.
                  </div>
                </div>
              ) : (
                cartLines.map((l) => {
                  const available = Number(l.med.quantity) || 0;
                  const over = Number(l.qty) > available;

                  return (
                    <div
                      key={l.med.id}
                      className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-extrabold tracking-tight">
                            {l.med.brandName}{" "}
                            <span className="text-[hsl(var(--foreground))]/60">
                              • {l.med.strength}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-[hsl(var(--foreground))]/60">
                            <span>{money(l.price)} / unit</span>
                            <span className="text-[hsl(var(--border))]">•</span>
                            <span>Available: {available}</span>
                          </div>

                          {over ? (
                            <div className="mt-2 inline-flex items-center gap-2 text-xs font-extrabold text-amber-300">
                              <AlertTriangle className="h-4 w-4" />
                              Quantity exceeds stock
                            </div>
                          ) : null}
                        </div>

                        <button
                          onClick={() => setQty(l.med.id, "0")}
                          className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[hsl(var(--foreground))]/5"
                          aria-label="Remove"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4 text-rose-300" />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex w-full items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] sm:w-auto">
                          <button
                            onClick={() => dec(l.med.id)}
                            className="grid h-10 w-10 place-items-center hover:bg-[hsl(var(--foreground))]/5"
                            aria-label="Decrease"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <input
                            value={String(l.qty)}
                            onChange={(e) => setQty(l.med.id, e.target.value)}
                            className="h-10 w-16 bg-transparent text-center text-sm font-extrabold outline-none"
                            inputMode="numeric"
                            pattern="[0-9]*"
                          />

                          <button
                            onClick={() => inc(l.med.id)}
                            className="grid h-10 w-10 place-items-center hover:bg-[hsl(var(--foreground))]/5"
                            aria-label="Increase"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-extrabold text-[hsl(var(--brand-strong))]">
                            {money(l.lineTotal)}
                          </div>
                          <div className="text-xs font-semibold text-[hsl(var(--foreground))]/55">
                            line total
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <div className="text-sm font-extrabold tracking-tight">Totals</div>

            <div className="mt-3 space-y-3">
              <Row label="Subtotal" value={money(subtotal)} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                    Discount (max 10%)
                  </div>
                  <Input
                    inputMode="decimal"
                    value={discountInput}
                    onChange={handleDiscountChange}
                    placeholder="0.00"
                    className="bg-[hsl(var(--background))]"
                  />
                  <div className="mt-1 text-[11px] font-semibold text-[hsl(var(--foreground))]/55">
                    Max discount: {money(discountMax)}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                    Tax (fixed)
                  </div>
                  <div className="h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-extrabold flex items-center">
                    {TAX_RATE}%
                  </div>
                </div>
              </div>

              <Row label="Tax" value={money(taxAmount)} />
              <div className="h-px bg-[hsl(var(--border))]" />
              <Row
                label={
                  <span className="text-[hsl(var(--foreground))]">Total</span>
                }
                value={
                  <span className="text-[hsl(var(--brand-strong))]">
                    {money(total)}
                  </span>
                }
                strong
              />
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <div className="text-sm font-extrabold tracking-tight">Payment</div>

            <div className="mt-3 space-y-3">
              <div>
                <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                  Payment Method
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <PayBtn
                    active={paymentMethod === "cash"}
                    onClick={() => setPaymentMethod("cash")}
                    icon={<Banknote className="h-4 w-4" />}
                    label="Cash"
                  />
                  <PayBtn
                    active={paymentMethod === "card"}
                    onClick={() => setPaymentMethod("card")}
                    icon={<CreditCard className="h-4 w-4" />}
                    label="Card"
                  />
                  <PayBtn
                    active={paymentMethod === "mobile"}
                    onClick={() => setPaymentMethod("mobile")}
                    icon={<CreditCard className="h-4 w-4" />}
                    label="Mobile"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                  Amount Paid
                </div>
                <Input
                  inputMode="decimal"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(moneyClean(e.target.value))}
                  placeholder="0.00"
                  className="bg-[hsl(var(--background))]"
                />
              </div>

              {total <= 0 ? (
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 text-xs font-semibold text-[hsl(var(--foreground))]/60">
                  Add items to cart to calculate payment.
                </div>
              ) : balance > 0 ? (
                <div className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3">
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold text-amber-300">
                    <AlertTriangle className="h-4 w-4" />
                    Pending balance
                  </div>
                  <div className="text-sm font-extrabold text-amber-300">
                    {money(balance)}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    Paid
                  </div>
                  <div className="text-sm font-extrabold text-emerald-300">
                    Change: {money(change)}
                  </div>
                </div>
              )}

              <button
                onClick={checkout}
                disabled={!canCheckout}
                className={cx(
                  "mt-1 w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold tracking-tight shadow transition",
                  canCheckout
                    ? "bg-[hsl(var(--brand-strong))] text-[hsl(var(--brand))] hover:opacity-90"
                    : "bg-[hsl(var(--foreground))]/10 text-[hsl(var(--foreground))]/50 cursor-not-allowed",
                )}
              >
                <Receipt className="h-4 w-4" />
                Complete Sale
              </button>

              <div className="text-[11px] font-semibold text-[hsl(var(--foreground))]/55">
                Note: Server validates expiry + stock, then reduces stock.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt modal */}
      <Modal
        open={openReceipt}
        title="Receipt"
        onClose={() => setOpenReceipt(false)}
      >
        {lastReceipt ? (
          <ReceiptView receipt={lastReceipt} />
        ) : (
          <div className="text-sm font-medium text-[hsl(var(--foreground))]/70">
            No receipt data.
          </div>
        )}
      </Modal>

      <div className="h-10" />
    </div>
  );
}

function Row({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between">
      <div
        className={cx(
          "text-sm",
          strong ? "font-extrabold" : "font-semibold",
          "text-[hsl(var(--foreground))]/75",
        )}
      >
        {label}
      </div>
      <div
        className={cx(
          "text-sm",
          "font-extrabold",
          "text-[hsl(var(--foreground))]/90",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function PayBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-xs font-extrabold tracking-tight transition",
        active
          ? "border-[hsl(var(--brand-strong))] bg-[hsl(var(--brand-strong))]/15 text-[hsl(var(--foreground))]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ReceiptView({ receipt }) {
  // backend returns: saleNo, items[], totals etc.
  const idLabel = receipt.saleNo || receipt.id;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]">
              {idLabel}
            </div>
            <div className="text-xs font-medium text-[hsl(var(--foreground))]/60">
              {receipt.createdAt
                ? new Date(receipt.createdAt).toLocaleString()
                : ""}
            </div>
          </div>
          <Pill tone={receipt.status === "Paid" ? "green" : "yellow"}>
            {receipt.status}
          </Pill>
        </div>

        <div className="mt-3 text-xs font-semibold text-[hsl(var(--foreground))]/70">
          Customer:{" "}
          <span className="font-extrabold text-[hsl(var(--foreground))]">
            Walk-in
          </span>
        </div>

        <div className="mt-1 text-xs font-semibold text-[hsl(var(--foreground))]/60">
          Method:{" "}
          <span className="font-extrabold">{receipt.paymentMethod}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 bg-[hsl(var(--foreground))]/5 px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
          <div className="col-span-7">Item</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-3 text-right">Total</div>
        </div>

        <div className="divide-y divide-[hsl(var(--border))]">
          {(receipt.items || []).map((it, idx) => (
            <div key={idx} className="px-4 py-3">
              <div className="sm:hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
                <div className="font-extrabold">{it.name}</div>
                <div className="mt-1 text-xs font-semibold text-[hsl(var(--foreground))]/60">
                  Unit: {money(it.unitPrice)}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm font-extrabold">Qty: {it.qty}</div>
                  <div className="text-sm font-extrabold text-[hsl(var(--brand-strong))]">
                    {money(it.lineTotal)}
                  </div>
                </div>
              </div>

              <div className="hidden sm:grid grid-cols-12 items-center text-sm">
                <div className="col-span-7 min-w-0">
                  <div className="truncate font-extrabold text-[hsl(var(--foreground))]/90">
                    {it.name}
                  </div>
                  <div className="text-xs font-semibold text-[hsl(var(--foreground))]/60">
                    Unit: {money(it.unitPrice)}
                  </div>
                </div>
                <div className="col-span-2 text-right font-extrabold text-[hsl(var(--foreground))]/85">
                  {it.qty}
                </div>
                <div className="col-span-3 text-right font-extrabold text-[hsl(var(--brand-strong))]">
                  {money(it.lineTotal)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 space-y-2">
        <KV k="Subtotal" v={money(receipt.subtotal)} />
        <KV k="Discount" v={money(receipt.discount)} />
        <KV k={`Tax (${receipt.taxRate}%)`} v={money(receipt.taxAmount)} />
        <div className="h-px bg-[hsl(var(--border))]" />
        <KV
          k={<span className="font-extrabold">Total</span>}
          v={
            <span className="font-extrabold text-[hsl(var(--brand-strong))]">
              {money(receipt.total)}
            </span>
          }
        />
        <KV k="Paid" v={money(receipt.paid)} />
        {Number(receipt.balance) > 0 ? (
          <KV
            k={<span className="text-amber-300 font-extrabold">Balance</span>}
            v={
              <span className="text-amber-300 font-extrabold">
                {money(receipt.balance)}
              </span>
            }
          />
        ) : (
          <KV
            k={<span className="text-emerald-300 font-extrabold">Change</span>}
            v={
              <span className="text-emerald-300 font-extrabold">
                {money(receipt.change)}
              </span>
            }
          />
        )}
      </div>
    </div>
  );
}

function KV({ k, v }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="font-semibold text-[hsl(var(--foreground))]/70">{k}</div>
      <div className="font-extrabold text-[hsl(var(--foreground))]/90">{v}</div>
    </div>
  );
}
