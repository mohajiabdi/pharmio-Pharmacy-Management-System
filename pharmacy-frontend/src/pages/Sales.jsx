// src/pages/Sales.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  User,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  X,
  Share2,
  Download,
  Printer,
  Loader2,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();

  try {
    const json = JSON.parse(text);
    if (!res.ok)
      throw new Error(json?.message || `Request failed (${res.status})`);
    return json;
  } catch {
    throw new Error(
      `Expected JSON but got HTML/text.\nURL: ${url}\nStatus: ${
        res.status
      }\nPreview: ${text.slice(0, 160)}`
    );
  }
}

const cx = (...a) => a.filter(Boolean).join(" ");

const money = (n) => {
  const num = Number(n);
  if (Number.isNaN(num)) return "$0.00";
  return `$${num.toFixed(2)}`;
};

function safeText(x) {
  return String(x ?? "").trim();
}

/* ✅ Responsive Modal */
function Modal({ open, title, children, onClose, right }) {
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
            "w-full max-w-4xl overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-xl",
            "max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)]"
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
            <div className="text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]">
              {title}
            </div>

            <div className="flex items-center gap-2">
              {right}
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[hsl(var(--foreground))]/5"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-[hsl(var(--foreground))]/70" />
              </button>
            </div>
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
        map[tone]
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
        props.className
      )}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={cx(
        "h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 text-sm font-semibold",
        "text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--brand-strong))]",
        props.className
      )}
    />
  );
}

function Row({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between">
      <div
        className={cx(
          "text-sm",
          strong ? "font-extrabold" : "font-semibold",
          "text-[hsl(var(--foreground))]/75"
        )}
      >
        {label}
      </div>
      <div className="text-sm font-extrabold text-[hsl(var(--foreground))]/90">
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
          : "border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function statusForStock(qty) {
  if (qty <= 0) return { label: "Out", tone: "rose" };
  if (qty <= 10) return { label: "Low", tone: "yellow" };
  return { label: "In Stock", tone: "green" };
}

/* ------------------- Receipt helpers ------------------- */
async function ensureHtml2Canvas() {
  try {
    const mod = await import("html2canvas");
    return mod.default;
  } catch {
    throw new Error(
      "To download/share receipt as image, install html2canvas: npm i html2canvas"
    );
  }
}

async function nodeToPngBlob(node) {
  const html2canvas = await ensureHtml2Canvas();

  // Wait one frame so layout is stable (modal + fonts)
  await new Promise((r) => requestAnimationFrame(() => r()));

  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: "#0b0b0f",
    useCORS: true,
    allowTaint: true,
    logging: false,
    windowWidth: document.documentElement.clientWidth,
    windowHeight: document.documentElement.clientHeight,
  });

  const blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png", 1)
  );

  if (!blob)
    throw new Error("PNG generation failed (canvas.toBlob returned null).");
  return blob;
}

async function tryShareFile(file) {
  try {
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: file.name,
        text: "Receipt",
        files: [file],
      });
      return true;
    }
  } catch {
    // user cancelled / not supported
  }
  return false;
}

async function tryCopyImageToClipboard(blob) {
  try {
    if (!navigator.clipboard || typeof ClipboardItem === "undefined")
      return false;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

function forceDownloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}

function openBlobInNewTab(blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}

function printReceiptHtml(html) {
  const w = window.open("", "_blank");
  if (!w) return;

  w.document.open();
  w.document.write(html);
  w.document.close();

  w.onload = () => {
    w.focus();
    w.print();
  };
}

/* ------------------- Main Component ------------------- */
export default function Sales() {
  // Backend data
  const [medicines, setMedicines] = useState([]);
  const [customersSuggest, setCustomersSuggest] = useState([]);
  const [loadingMeds, setLoadingMeds] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [apiError, setApiError] = useState("");

  // POS state
  const [q, setQ] = useState("");
  const [cart, setCart] = useState([]); // { medicineId, qty }
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState(0);

  // Customer mode
  const [customerMode, setCustomerMode] = useState("walkin"); // "walkin" | "registered"
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");

  // Registered customer search/select
  const [customerQuery, setCustomerQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null); // {id, code, name, phone}

  // Transactions
  const [transactions, setTransactions] = useState([]);

  // Receipt
  const [openReceipt, setOpenReceipt] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  const receiptRef = useRef(null);
  const [receiptBusy, setReceiptBusy] = useState(false);

  // Small toast instead of alert-spam
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  /* ------------------- Fetch: medicines (search) ------------------- */
  useEffect(() => {
    const query = safeText(q);
    const ac = new AbortController();

    setLoadingMeds(true);
    setApiError("");

    const t = setTimeout(async () => {
      try {
        const url = `${API_BASE}/api/sales/medicines${
          query ? `?q=${encodeURIComponent(query)}` : ""
        }`;
        const data = await fetchJson(url, { signal: ac.signal });
        setMedicines(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.name !== "AbortError") {
          setMedicines([]);
          setApiError(e.message || "Failed to fetch medicines");
        }
      } finally {
        setLoadingMeds(false);
      }
    }, 250);

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [q]);

  /* ------------------- Fetch: customers suggestions (FROM customers table) ------------------- */
  useEffect(() => {
    if (customerMode !== "registered") return;

    const query = safeText(customerQuery);
    const ac = new AbortController();

    setLoadingCustomers(true);
    setApiError("");

    const t = setTimeout(async () => {
      try {
        // ✅ This must hit your customers API (customers table)
        const url = `${API_BASE}/api/customers${
          query ? `?q=${encodeURIComponent(query)}` : ""
        }`;
        const data = await fetchJson(url, { signal: ac.signal });
        setCustomersSuggest(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.name !== "AbortError") {
          setCustomersSuggest([]);
          setApiError(e.message || "Failed to fetch customers");
        }
      } finally {
        setLoadingCustomers(false);
      }
    }, 250);

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [customerMode, customerQuery]);

  /* ------------------- Derived: medicine results + cart lines ------------------- */
  const medicineResults = useMemo(() => {
    const arr = [...(medicines || [])];
    return arr.sort(
      (a, b) => (Number(b.quantity) > 0) - (Number(a.quantity) > 0)
    );
  }, [medicines]);

  const cartLines = useMemo(() => {
    return cart
      .map((line) => {
        const med = medicines.find((m) => m.id === line.medicineId);
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
    [cartLines]
  );

  const discountClamped = useMemo(() => {
    const d = Number(discount) || 0;
    if (d < 0) return 0;
    if (d > subtotal) return subtotal;
    return d;
  }, [discount, subtotal]);

  const taxAmount = useMemo(() => {
    const r = Number(taxRate) || 0;
    if (r <= 0) return 0;
    return (subtotal - discountClamped) * (r / 100);
  }, [subtotal, discountClamped, taxRate]);

  const total = useMemo(() => {
    const t = subtotal - discountClamped + taxAmount;
    return t < 0 ? 0 : t;
  }, [subtotal, discountClamped, taxAmount]);

  const paid = useMemo(() => {
    const a = Number(amountPaid) || 0;
    return a < 0 ? 0 : a;
  }, [amountPaid]);

  const balance = useMemo(() => total - paid, [total, paid]);
  const change = useMemo(
    () => (paid > total ? paid - total : 0),
    [paid, total]
  );

  const canCheckout = cartLines.length > 0;

  /* ------------------- Cart actions ------------------- */
  function addToCart(medicineId) {
    setCart((prev) => {
      const existing = prev.find((l) => l.medicineId === medicineId);
      if (existing)
        return prev.map((l) =>
          l.medicineId === medicineId ? { ...l, qty: l.qty + 1 } : l
        );
      return [...prev, { medicineId, qty: 1 }];
    });
  }

  function setQty(medicineId, nextQty) {
    const n = Number(nextQty);
    if (Number.isNaN(n)) return;
    setCart((prev) => {
      if (n <= 0) return prev.filter((l) => l.medicineId !== medicineId);
      return prev.map((l) =>
        l.medicineId === medicineId ? { ...l, qty: n } : l
      );
    });
  }

  function inc(medicineId) {
    setCart((prev) =>
      prev.map((l) =>
        l.medicineId === medicineId ? { ...l, qty: l.qty + 1 } : l
      )
    );
  }

  function dec(medicineId) {
    setCart((prev) =>
      prev
        .map((l) =>
          l.medicineId === medicineId ? { ...l, qty: l.qty - 1 } : l
        )
        .filter((l) => l.qty > 0)
    );
  }

  function clearCart() {
    setCart([]);
    setDiscount(0);
    setTaxRate(0);
    setAmountPaid(0);
  }

  function validateStockBeforeCheckout() {
    for (const line of cartLines) {
      const available = Number(line.med.quantity) || 0;
      const want = Number(line.qty) || 0;
      if (want > available) {
        return {
          ok: false,
          message: `Not enough stock for ${line.med.brandName} (${line.med.strength}). Available: ${available}, In cart: ${want}.`,
        };
      }
    }
    return { ok: true };
  }

  /* ------------------- Checkout (backend) ------------------- */
  async function checkout() {
    if (!canCheckout) return;

    const stockCheck = validateStockBeforeCheckout();
    if (!stockCheck.ok) {
      setToast(stockCheck.message);
      return;
    }

    if (customerMode === "registered" && !selectedCustomer) {
      setToast("Select a registered customer (or switch to Walk-in).");
      return;
    }

    const body = {
      customerId: customerMode === "registered" ? selectedCustomer?.id : null,
      walkinName: customerMode === "walkin" ? safeText(walkinName) : null,
      walkinPhone: customerMode === "walkin" ? safeText(walkinPhone) : null,
      paymentMethod,
      taxRate: Number(taxRate) || 0,
      discount: Number(discountClamped) || 0,
      amountPaid: Number(paid) || 0,
      items: cartLines.map((l) => ({
        medicineId: l.med.id,
        qty: Number(l.qty) || 0,
      })),
    };

    try {
      setApiError("");

      // ✅ Use fetchJson so you see real backend errors (DB failures, etc.)
      const data = await fetchJson(`${API_BASE}/api/sales/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // ✅ Require backend to return receipt (do NOT hide DB failures)
      if (!data?.receipt) {
        throw new Error(
          "Server did not return a receipt. Backend might not be saving sales to the database."
        );
      }

      const receipt = data.receipt;

      setLastReceipt(receipt);
      setTransactions((prev) => [receipt, ...prev].slice(0, 30));
      setOpenReceipt(true);
      setToast("Sale completed ✅");

      // Optimistically reduce stock in UI (backend should also reduce stock)
      setMedicines((prev) =>
        prev.map((m) => {
          const line = cartLines.find((l) => l.med.id === m.id);
          if (!line) return m;
          return {
            ...m,
            quantity: (Number(m.quantity) || 0) - (Number(line.qty) || 0),
          };
        })
      );

      clearCart();
      setCustomerQuery("");
      setSelectedCustomer(null);
      setWalkinName("");
      setWalkinPhone("");
      setCustomerMode("walkin");
    } catch (e) {
      setApiError(e.message || "Checkout failed");
      setToast(e.message || "Checkout failed");
    }
  }

  // Local receipt builder kept only as a helper (not used by default anymore)
  function buildLocalReceipt(payload) {
    const now = new Date();
    const id = `ORD-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const customer =
      payload.customerMode === "registered"
        ? payload.selectedCustomer
        : {
            id: "WALK-IN",
            name: safeText(payload.walkinName) || "Walk-in Customer",
            phone: safeText(payload.walkinPhone),
            code: "WALK-IN",
          };

    const status = payload.balance <= 0 ? "Paid" : "Pending";

    return {
      id,
      createdAt: now.toISOString(),
      customer,
      items: payload.cartLines.map((l) => ({
        medicineId: l.med.id,
        name: `${l.med.brandName} • ${l.med.strength}`,
        qty: Number(l.qty) || 0,
        unitPrice: Number(l.price) || 0,
        lineTotal: Number(l.lineTotal) || 0,
      })),
      subtotal: payload.subtotal,
      discount: payload.discount,
      taxRate: payload.taxRate,
      taxAmount: payload.taxAmount,
      total: payload.total,
      paid: payload.paid,
      balance: payload.balance,
      change: payload.change,
      paymentMethod: payload.paymentMethod,
      status,
      meta: {
        pharmacyName: "Hanad Pharmacy",
        address: "Mogadishu, Somalia",
        phone: "9494",
      },
    };
  }

  /* ------------------- Customer UI helpers ------------------- */
  const registeredSuggestions = useMemo(() => {
    const qx = safeText(customerQuery).toLowerCase();
    let arr = [...customersSuggest];

    if (qx) {
      arr = arr.filter((c) => {
        const hay = [c.name, c.phone, c.code]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(qx);
      });
    }

    return arr.slice(0, 8);
  }, [customersSuggest, customerQuery]);

  function selectRegisteredCustomer(c) {
    setSelectedCustomer(c);
    setCustomerQuery(`${c.name} (${c.phone || c.code || ""})`.trim());
  }

  /* ------------------- Receipt: Share / Download / Print ------------------- */
  async function downloadReceiptPng() {
    if (!receiptRef.current || !lastReceipt) return;
    setReceiptBusy(true);

    try {
      const blob = await nodeToPngBlob(receiptRef.current);
      forceDownloadBlob(blob, `${lastReceipt.id}.png`);
      setToast("Downloaded ✅");
    } catch (e) {
      // fallback: open in new tab
      try {
        const blob = await nodeToPngBlob(receiptRef.current);
        openBlobInNewTab(blob);
        setToast("Opened in new tab (download blocked)");
      } catch {
        setToast(e.message || "Download failed");
      }
    } finally {
      setReceiptBusy(false);
    }
  }

  async function shareReceipt() {
    if (!receiptRef.current || !lastReceipt) return;
    setReceiptBusy(true);

    try {
      const blob = await nodeToPngBlob(receiptRef.current);
      const file = new File([blob], `${lastReceipt.id}.png`, {
        type: "image/png",
      });

      // 1) Native share (mostly mobile)
      const shared = await tryShareFile(file);
      if (shared) {
        setToast("Shared ✅");
        return;
      }

      // 2) Copy to clipboard (desktop)
      const copied = await tryCopyImageToClipboard(blob);
      if (copied) {
        setToast("Copied to clipboard ✅ (Ctrl+V)");
        return;
      }

      // 3) fallback: download
      forceDownloadBlob(blob, `${lastReceipt.id}.png`);
      setToast("Downloaded (share not supported)");
    } catch (e) {
      setToast(e.message || "Share failed");
    } finally {
      setReceiptBusy(false);
    }
  }

  function printReceipt() {
    if (!lastReceipt) return;

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${lastReceipt.id}</title>
  <style>
    body{font-family:Arial, sans-serif; padding:24px; color:#111;}
    .wrap{max-width:420px; margin:0 auto;}
    h1{font-size:18px; margin:0 0 6px;}
    .muted{color:#555; font-size:12px;}
    table{width:100%; border-collapse:collapse; margin-top:12px;}
    th,td{font-size:12px; padding:6px 0; border-bottom:1px solid #eee;}
    th{text-align:left;}
    td:last-child, th:last-child{text-align:right;}
    .totals{margin-top:12px;}
    .row{display:flex; justify-content:space-between; font-size:12px; margin:4px 0;}
    .bold{font-weight:700;}
    @media print { body{padding:0;} .wrap{max-width:none;} }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${lastReceipt.meta?.pharmacyName || "Hanad Pharmacy"}</h1>
    <div class="muted">${lastReceipt.meta?.address || ""}</div>
    <div class="muted">${lastReceipt.meta?.phone || "9494"}</div>

    <div class="muted" style="margin-top:8px;">
      <div><b>Receipt:</b> ${lastReceipt.id}</div>
      <div><b>Date:</b> ${new Date(
        lastReceipt.createdAt
      ).toLocaleString()}</div>
      <div><b>Customer:</b> ${lastReceipt.customer?.name || "Walk-in"} ${
      lastReceipt.customer?.phone ? `(${lastReceipt.customer.phone})` : ""
    }</div>
      <div><b>Payment:</b> ${lastReceipt.paymentMethod} • <b>Status:</b> ${
      lastReceipt.status
    }</div>
    </div>

    <table>
      <thead>
        <tr><th>Item</th><th>Qty</th><th>Total</th></tr>
      </thead>
      <tbody>
        ${lastReceipt.items
          .map(
            (it) => `
          <tr>
            <td>${it.name}</td>
            <td>${it.qty}</td>
            <td>${money(it.lineTotal)}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>

    <div class="totals">
      <div class="row"><span>Subtotal</span><span>${money(
        lastReceipt.subtotal
      )}</span></div>
      <div class="row"><span>Discount</span><span>${money(
        lastReceipt.discount
      )}</span></div>
      <div class="row"><span>Tax (${lastReceipt.taxRate}%)</span><span>${money(
      lastReceipt.taxAmount
    )}</span></div>
      <div class="row bold"><span>Total</span><span>${money(
        lastReceipt.total
      )}</span></div>
      <div class="row"><span>Paid</span><span>${money(
        lastReceipt.paid
      )}</span></div>
      ${
        lastReceipt.balance > 0
          ? `<div class="row bold"><span>Balance</span><span>${money(
              lastReceipt.balance
            )}</span></div>`
          : `<div class="row bold"><span>Change</span><span>${money(
              lastReceipt.change
            )}</span></div>`
      }
    </div>

    <div class="muted" style="margin-top:14px;">Thank you for your purchase.</div>
  </div>
</body>
</html>`;

    printReceiptHtml(html);
  }

  /* ------------------- UI ------------------- */
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-2xl font-extrabold tracking-tight ml-10">
            Sales / POS
          </div>
          <div className="text-sm font-medium text-[hsl(var(--foreground))]/60 ml-10">
            Sell medicines, pick customer (walk-in or registered), generate
            receipt
          </div>
          {apiError ? (
            <div className="ml-10 mt-2 inline-flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-extrabold text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              {apiError}
            </div>
          ) : null}
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
                : "bg-[hsl(var(--foreground))]/10 text-[hsl(var(--foreground))]/50 cursor-not-allowed"
            )}
          >
            <Receipt className="h-4 w-4" />
            Checkout
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {/* Left */}
        <div className="space-y-4 lg:col-span-1 xl:col-span-2">
          {/* Search + customer */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {/* Medicine Search */}
              <div className="lg:col-span-2">
                <div className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                  Search Medicine
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground))]/45" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by name, barcode, strength..."
                    className="pl-10 bg-[hsl(var(--background))]"
                  />
                  {loadingMeds ? (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[hsl(var(--foreground))]/45" />
                  ) : null}
                </div>
              </div>

              {/* Customer Type */}
              <div>
                <div className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                  Customer Type
                </div>
                <Select
                  value={customerMode}
                  onChange={(e) => {
                    const mode = e.target.value;
                    setCustomerMode(mode);
                    setSelectedCustomer(null);
                    setCustomerQuery("");
                    setWalkinName("");
                    setWalkinPhone("");
                    setCustomersSuggest([]);
                  }}
                  className="bg-[hsl(var(--background))]"
                >
                  <option value="walkin">Walk-in</option>
                  <option value="registered">Registered</option>
                </Select>
              </div>
            </div>

            {/* Customer block */}
            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
              {customerMode === "walkin" ? (
                <>
                  <div className="lg:col-span-2">
                    <div className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                      Walk-in Name (Optional)
                    </div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground))]/45" />
                      <Input
                        value={walkinName}
                        onChange={(e) => setWalkinName(e.target.value)}
                        placeholder="e.g. Ahmed"
                        className="pl-10 bg-[hsl(var(--background))]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                      Walk-in Phone (Optional)
                    </div>
                    <Input
                      value={walkinPhone}
                      onChange={(e) => setWalkinPhone(e.target.value)}
                      placeholder="9494"
                      className="bg-[hsl(var(--background))]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="lg:col-span-3">
                    <div className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                      Find Registered Customer (name or phone)
                    </div>

                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground))]/45" />
                      <Input
                        value={customerQuery}
                        onChange={(e) => {
                          setCustomerQuery(e.target.value);
                          setSelectedCustomer(null);
                        }}
                        placeholder="Type name or phone (shows suggestions)..."
                        className="pl-10 bg-[hsl(var(--background))]"
                      />
                      {loadingCustomers ? (
                        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[hsl(var(--foreground))]/45" />
                      ) : null}
                    </div>

                    {/* Suggestions */}
                    {safeText(customerQuery) && !selectedCustomer ? (
                      <div className="mt-2 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
                        {registeredSuggestions.length === 0 ? (
                          <div className="px-4 py-3 text-xs font-semibold text-[hsl(var(--foreground))]/60">
                            No matching customers. (Switch to Walk-in if
                            needed.)
                          </div>
                        ) : (
                          registeredSuggestions.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => selectRegisteredCustomer(c)}
                              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-[hsl(var(--foreground))]/5"
                            >
                              <div className="min-w-0">
                                <div className="truncate font-extrabold">
                                  {c.name}
                                </div>
                                <div className="mt-1 text-xs font-semibold text-[hsl(var(--foreground))]/60">
                                  {c.phone || "—"} {c.code ? `• ${c.code}` : ""}
                                </div>
                              </div>
                              <span className="text-xs font-extrabold text-[hsl(var(--brand-strong))]">
                                Select
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    ) : null}

                    {/* Selected badge */}
                    {selectedCustomer ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Pill tone="sky">{selectedCustomer.name}</Pill>
                        {selectedCustomer.phone ? (
                          <Pill tone="neutral">{selectedCustomer.phone}</Pill>
                        ) : null}
                        {selectedCustomer.code ? (
                          <Pill tone="neutral">{selectedCustomer.code}</Pill>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCustomer(null);
                            setCustomerQuery("");
                          }}
                          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs font-extrabold text-[hsl(var(--foreground))]/75 hover:bg-[hsl(var(--foreground))]/5"
                        >
                          Clear
                        </button>
                      </div>
                    ) : null}
                  </div>
                </>
              )}
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
                    Make sure your backend route <b>/api/sales/medicines</b>{" "}
                    works.
                  </div>
                </div>
              ) : (
                medicineResults.map((m) => {
                  const st = statusForStock(Number(m.quantity) || 0);
                  const disabled = (Number(m.quantity) || 0) <= 0;

                  return (
                    <div key={m.id} className="px-4 py-3">
                      {/* mobile card */}
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
                              {m.code || m.id}
                            </div>
                            {m.barcode ? (
                              <div className="mt-1 text-[11px] font-semibold text-[hsl(var(--foreground))]/55">
                                Barcode: {m.barcode}
                              </div>
                            ) : null}

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
                                  : "bg-[hsl(var(--brand-strong))] text-[hsl(var(--brand))] hover:opacity-90"
                              )}
                            >
                              <Plus className="h-4 w-4" />
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* md+ row */}
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
                                {m.code || m.id}
                              </div>
                              {m.barcode ? (
                                <div className="mt-1 text-[11px] font-semibold text-[hsl(var(--foreground))]/55">
                                  Barcode: {m.barcode}
                                </div>
                              ) : null}
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
                                : "bg-[hsl(var(--brand-strong))] text-[hsl(var(--brand))] hover:opacity-90"
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

          {/* Recent transactions */}
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
                    key={t.id}
                    className="flex flex-col gap-3 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="font-extrabold text-[hsl(var(--foreground))]/90">
                        {t.id}{" "}
                        <span className="text-[hsl(var(--foreground))]/55">
                          • {new Date(t.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-[hsl(var(--foreground))]/60">
                        {t.customer?.name || "Walk-in"} • {t.items.length}{" "}
                        item(s)
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

        {/* Right: Cart + totals + payment */}
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
                  const over = l.qty > available;

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
                          onClick={() => setQty(l.med.id, 0)}
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
                            value={l.qty}
                            onChange={(e) => setQty(l.med.id, e.target.value)}
                            className="h-10 w-16 bg-transparent text-center text-sm font-extrabold outline-none"
                            inputMode="numeric"
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
                    Discount
                  </div>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0.00"
                    className="bg-[hsl(var(--background))]"
                  />
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                    Tax %
                  </div>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    placeholder="0"
                    className="bg-[hsl(var(--background))]"
                  />
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
                  type="number"
                  min={0}
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
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
                    : "bg-[hsl(var(--foreground))]/10 text-[hsl(var(--foreground))]/50 cursor-not-allowed"
                )}
              >
                <Receipt className="h-4 w-4" />
                Complete Sale
              </button>

              <div className="text-[11px] font-semibold text-[hsl(var(--foreground))]/55">
                Checkout sends data to backend and generates a receipt you can
                share/print/download.
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
        right={
          lastReceipt ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={printReceipt}
                className="inline-flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-extrabold text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>

              <button
                type="button"
                disabled={receiptBusy}
                onClick={downloadReceiptPng}
                className={cx(
                  "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-extrabold",
                  receiptBusy
                    ? "border-[hsl(var(--border))] bg-[hsl(var(--foreground))]/10 text-[hsl(var(--foreground))]/55"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5"
                )}
              >
                {receiptBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download
              </button>

              <button
                type="button"
                disabled={receiptBusy}
                onClick={shareReceipt}
                className={cx(
                  "inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong))] px-3 py-2 text-xs font-extrabold text-[hsl(var(--brand))] hover:opacity-90",
                  receiptBusy ? "opacity-70" : ""
                )}
              >
                {receiptBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
                Share
              </button>
            </div>
          ) : null
        }
      >
        {lastReceipt ? (
          <ReceiptCard receipt={lastReceipt} receiptRef={receiptRef} />
        ) : (
          <div className="text-sm font-medium text-[hsl(var(--foreground))]/70">
            No receipt data.
          </div>
        )}
      </Modal>

      {toast ? (
        <div className="fixed bottom-4 right-4 z-[60] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 text-sm font-semibold shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="h-10" />
    </div>
  );
}

function ReceiptCard({ receipt, receiptRef }) {
  return (
    <div className="space-y-4">
      {/* This node is captured as image */}
      <div
        ref={receiptRef}
        className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]">
              {receipt.meta?.pharmacyName || "Hanad Pharmacy"}
            </div>
            <div className="text-xs font-semibold text-[hsl(var(--foreground))]/60">
              {receipt.meta?.address || "Mogadishu, Somalia"}
            </div>
            <div className="text-xs font-semibold text-[hsl(var(--foreground))]/60">
              {receipt.meta?.phone || "9494"}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-extrabold">{receipt.id}</div>
            <div className="text-xs font-medium text-[hsl(var(--foreground))]/60">
              {new Date(receipt.createdAt).toLocaleString()}
            </div>
            <div className="mt-2">
              <span
                className={cx(
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-extrabold",
                  receipt.status === "Paid"
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/20"
                )}
              >
                {receipt.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
              Customer
            </div>
            <div className="mt-1 text-sm font-extrabold">
              {receipt.customer?.name || "Walk-in"}
            </div>
            <div className="mt-1 text-xs font-semibold text-[hsl(var(--foreground))]/60">
              {receipt.customer?.phone || "—"}
            </div>
            {receipt.customer?.code ? (
              <div className="mt-1 text-xs font-semibold text-[hsl(var(--foreground))]/60">
                {receipt.customer.code}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
              Payment
            </div>
            <div className="mt-1 text-sm font-extrabold">
              {receipt.paymentMethod}
            </div>
            <div className="mt-1 text-xs font-semibold text-[hsl(var(--foreground))]/60">
              Tax: {receipt.taxRate}% • Discount: {money(receipt.discount)}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
          <div className="grid grid-cols-12 bg-[hsl(var(--foreground))]/5 px-3 py-2 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
            <div className="col-span-7">Item</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          <div className="divide-y divide-[hsl(var(--border))]">
            {receipt.items.map((it, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 items-center px-3 py-2 text-sm"
              >
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
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 space-y-2">
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
          {receipt.balance > 0 ? (
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
              k={
                <span className="text-emerald-300 font-extrabold">Change</span>
              }
              v={
                <span className="text-emerald-300 font-extrabold">
                  {money(receipt.change)}
                </span>
              }
            />
          )}
        </div>

        <div className="mt-3 text-center text-[11px] font-semibold text-[hsl(var(--foreground))]/55">
          Thank you for your purchase.
        </div>
      </div>

      <div className="text-xs font-semibold text-[hsl(var(--foreground))]/60">
        Tip: Install <b>html2canvas</b> to share/download receipt as image:{" "}
        <b>npm i html2canvas</b>
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
