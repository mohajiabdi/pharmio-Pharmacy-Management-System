import React from "react";
import { X } from "lucide-react";

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

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 text-sm font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--brand-strong))]"
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>
          {o.label ?? o}
        </option>
      ))}
    </select>
  );
}
// 🔧 normalize backend → frontend shape

function Modal({ open, title, children, onClose }) {
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
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

/**
 * suppliers can be:
 *  - [{id, name}]
 *  - [{supplier_id, supplier_name}]
 */
export default function MedicineFormModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  initial = null,
  suppliers = [],
}) {
  const emptyDraft = {
    brandName: "",
    genericName: "",
    form: "",
    strength: "",
    category: "",
    supplierId: "",
    quantity: 0,
    buyPrice: 0,
    sellPrice: 0,
    expiryDate: "",
  };

  const [draft, setDraft] = React.useState(emptyDraft);

  React.useEffect(() => {
    if (!open) return;

    if (!initial) {
      setDraft(emptyDraft);
    } else {
      setDraft({
        brandName: initial.brandName ?? "",
        genericName: initial.genericName ?? "",
        form: initial.form ?? "",
        strength: initial.strength ?? "",
        category: initial.category ?? "",
        supplierId: String(initial.supplierId ?? initial.supplier_id ?? ""),
        quantity: Number(initial.quantity ?? 0),
        buyPrice: Number(initial.buyPrice ?? 0),
        sellPrice: Number(initial.sellPrice ?? 0),
        expiryDate: initial.expiryDate ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id]);

  function handleSubmit(e) {
    e.preventDefault();

    if (!draft.brandName.trim()) return alert("Brand name is required.");
    if (!draft.form) return alert("Form is required.");
    if (!draft.strength.trim()) return alert("Strength is required.");
    if (!draft.category) return alert("Category is required.");
    if (!draft.expiryDate) return alert("Expiry date is required.");
    if (!draft.supplierId) return alert("Supplier is required.");

    if (Number(draft.sellPrice) < Number(draft.buyPrice)) {
      const ok = confirm("Sell price is lower than buy price. Save anyway?");
      if (!ok) return;
    }

    onSubmit({
      ...draft,
      supplierId: Number(draft.supplierId),
      quantity: Number(draft.quantity) || 0,
      buyPrice: Number(draft.buyPrice) || 0,
      sellPrice: Number(draft.sellPrice) || 0,
    });
  }

  const supplierOptions = (suppliers || []).map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

  return (
    <Modal
      open={open}
      title={initial ? "Edit Medicine" : "Add Medicine"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Brand Name *">
            <Input
              value={draft.brandName}
              onChange={(e) =>
                setDraft((d) => ({ ...d, brandName: e.target.value }))
              }
              placeholder="e.g. Panadol"
            />
          </Field>

          <Field label="Generic Name">
            <Input
              value={draft.genericName}
              onChange={(e) =>
                setDraft((d) => ({ ...d, genericName: e.target.value }))
              }
              placeholder="e.g. Acetaminophen"
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

          <Field label="Strength *" hint="Examples: 500mg, 5ml, 2mg/5ml">
            <Input
              value={draft.strength}
              onChange={(e) =>
                setDraft((d) => ({ ...d, strength: e.target.value }))
              }
              placeholder="e.g. 500mg / 5ml"
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

          <Field label="Supplier *">
            <Select
              value={draft.supplierId}
              onChange={(e) =>
                setDraft((d) => ({ ...d, supplierId: e.target.value }))
              }
              options={supplierOptions}
              placeholder={
                supplierOptions.length
                  ? "Select supplier"
                  : "No suppliers (check API)"
              }
            />
          </Field>

          <Field label="Quantity">
            <Input
              type="number"
              min={0}
              value={draft.quantity}
              onChange={(e) =>
                setDraft((d) => ({ ...d, quantity: e.target.value }))
              }
            />
          </Field>

          <Field label="Buy Price">
            <Input
              type="number"
              step="0.01"
              min={0}
              value={draft.buyPrice}
              onChange={(e) =>
                setDraft((d) => ({ ...d, buyPrice: e.target.value }))
              }
            />
          </Field>

          <Field label="Sell Price">
            <Input
              type="number"
              step="0.01"
              min={0}
              value={draft.sellPrice}
              onChange={(e) =>
                setDraft((d) => ({ ...d, sellPrice: e.target.value }))
              }
            />
          </Field>

          <Field label="Expiry Date *">
            <Input
              type="date"
              value={draft.expiryDate}
              onChange={(e) =>
                setDraft((d) => ({ ...d, expiryDate: e.target.value }))
              }
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className={cx(
              "rounded-2xl px-4 py-2.5 text-sm font-extrabold tracking-tight shadow",
              loading
                ? "bg-[hsl(var(--overlay)/0.08)] text-[hsl(var(--foreground)/0.6)]"
                : "bg-[hsl(var(--brand-strong))] text-[hsl(var(--brand))] hover:opacity-90",
            )}
          >
            {loading ? "Saving..." : initial ? "Save Changes" : "Add Medicine"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
