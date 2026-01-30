// Suppliers.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
} from "lucide-react";

const cx = (...a) => a.filter(Boolean).join(" ");

// ✅ Change if your backend port/domain is different
const API = "http://localhost:5000/api/suppliers";

/* ✅ Responsive modal: scrollable on mobile + sticky header + body scroll lock */
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
            "w-full max-w-xl overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-xl",
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

function Textarea(props) {
  return (
    <textarea
      {...props}
      className={cx(
        "min-h-[96px] w-full resize-none rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 text-sm font-semibold",
        "text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground))]/40",
        "outline-none focus:border-[hsl(var(--brand-strong))]",
        props.className
      )}
    />
  );
}

function StatCard({ title, value, Icon }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
      <div className="flex items-center justify-between">
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

function isValidEmail(email) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function normalizePhone(phone) {
  return String(phone || "")
    .replace(/[^\d+]/g, "")
    .trim();
}

/**
 * API returns:
 * {
 *  id: 1,
 *  code: "SUP-001",
 *  name, phone, address,
 *  email, contact_person, company, notes,
 *  created_at, updated_at
 * }
 */
function mapApiToUi(s) {
  return {
    // Display id
    id: s.code,
    // Numeric db id for edit/delete
    dbId: s.id,

    name: s.name,
    phone: s.phone,
    address: s.address,

    email: s.email || "",
    contactPerson: s.contact_person || "",
    company: s.company || "",
    notes: s.notes || "",

    createdAt: s.created_at ? new Date(s.created_at).getTime() : Date.now(),
    updatedAt: s.updated_at ? new Date(s.updated_at).getTime() : undefined,
  };
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [q, setQ] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editingDbId, setEditingDbId] = useState(null);

  const emptyDraft = {
    name: "",
    phone: "",
    address: "",
    email: "",
    contactPerson: "",
    company: "",
    notes: "",
  };
  const [draft, setDraft] = useState(emptyDraft);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  async function loadSuppliers() {
    try {
      setError("");
      setLoading(true);
      const data = await apiJson(API);
      setSuppliers(Array.isArray(data) ? data.map(mapApiToUi) : []);
    } catch (e) {
      setError(e.message || "Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return suppliers
      .filter((s) => {
        if (!query) return true;
        const hay = [
          s.id,
          s.name,
          s.phone,
          s.address,
          s.email,
          s.company,
          s.contactPerson,
          s.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(query);
      })
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [suppliers, q]);

  const stats = useMemo(() => {
    const total = suppliers.length;
    const withEmail = suppliers.filter((s) => (s.email || "").trim()).length;
    const withContact = suppliers.filter((s) =>
      (s.contactPerson || "").trim()
    ).length;
    return { total, withEmail, withContact };
  }, [suppliers]);

  function openAdd() {
    setEditingDbId(null);
    setDraft(emptyDraft);
    setOpenForm(true);
  }

  function openEdit(s) {
    setEditingDbId(s.dbId);
    setDraft({
      name: s.name || "",
      phone: s.phone || "",
      address: s.address || "",
      email: s.email || "",
      contactPerson: s.contactPerson || "",
      company: s.company || "",
      notes: s.notes || "",
    });
    setOpenForm(true);
  }

  async function saveSupplier(e) {
    e.preventDefault();

    const name = draft.name.trim();
    const phone = normalizePhone(draft.phone);
    const address = draft.address.trim();
    const email = draft.email.trim();
    const contactPerson = draft.contactPerson.trim();
    const company = draft.company.trim();
    const notes = draft.notes.trim();

    if (!name) return alert("Supplier name is required.");
    if (!phone) return alert("Phone number is required.");
    if (!address) return alert("Address is required.");
    if (!isValidEmail(email)) return alert("Email format is invalid.");

    // Quick local uniqueness check (backend also enforces it)
    const exists = suppliers.some(
      (s) => s.phone === phone && s.dbId !== editingDbId
    );
    if (exists)
      return alert("A supplier with this phone number already exists.");

    try {
      setSaving(true);
      setError("");

      if (editingDbId) {
        const updated = await apiJson(`${API}/${editingDbId}`, {
          method: "PUT",
          body: JSON.stringify({
            name,
            phone,
            address,
            email,
            contactPerson,
            company,
            notes,
          }),
        });

        const ui = mapApiToUi(updated);
        setSuppliers((prev) =>
          prev.map((s) => (s.dbId === editingDbId ? ui : s))
        );
      } else {
        const created = await apiJson(API, {
          method: "POST",
          body: JSON.stringify({
            name,
            phone,
            address,
            email,
            contactPerson,
            company,
            notes,
          }),
        });

        const ui = mapApiToUi(created);
        setSuppliers((prev) => [ui, ...prev]);
      }

      setOpenForm(false);
      setDraft(emptyDraft);
      setEditingDbId(null);
    } catch (e2) {
      alert(e2.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function removeSupplier(dbId) {
    const ok = confirm("Delete this supplier?");
    if (!ok) return;

    try {
      setError("");
      await apiJson(`${API}/${dbId}`, { method: "DELETE" });
      setSuppliers((prev) => prev.filter((s) => s.dbId !== dbId));
    } catch (e) {
      alert(e.message || "Delete failed.");
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* ✅ Responsive header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-2xl font-extrabold tracking-tight ml-10">
            Suppliers
          </div>
          <div className="text-sm font-medium text-[hsl(var(--foreground))]/60 ml-10">
            Manage suppliers for purchasing and restocking medicines
          </div>

          {error ? (
            <div className="ml-10 mt-2 text-xs font-semibold text-rose-300">
              {error}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSuppliers}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-sm font-extrabold tracking-tight hover:bg-[hsl(var(--foreground))]/5"
            disabled={loading}
            title="Refresh"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          <button
            onClick={openAdd}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--brand))] shadow hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Supplier
          </button>
        </div>
      </div>

      {/* Stats + Search */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Suppliers"
          value={stats.total}
          Icon={Building2}
        />
        <StatCard title="With Email" value={stats.withEmail} Icon={Mail} />
        <StatCard
          title="With Contact Person"
          value={stats.withContact}
          Icon={User}
        />

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
          <div className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
            Search
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground))]/45" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, phone, address, company..."
              className="h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] pl-10 pr-4 text-sm font-semibold text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--foreground))]/40 focus:border-[hsl(var(--brand-strong))]"
            />
          </div>
        </div>
      </div>

      {/* ✅ Mobile cards + desktop table */}
      <div className="mt-6">
        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {loading ? (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 text-center">
              <div className="text-sm font-extrabold">Loading suppliers…</div>
              <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/60">
                Please wait.
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 text-center">
              <div className="text-sm font-extrabold">No suppliers found</div>
              <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/60">
                Try another search or add a supplier.
              </div>
            </div>
          ) : (
            filtered.map((s) => (
              <div
                key={s.dbId}
                className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold tracking-tight">
                      {s.name}
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-[hsl(var(--foreground))]/55">
                      ID: {s.id}
                      {s.company ? (
                        <span className="ml-2">• {s.company}</span>
                      ) : null}
                    </div>
                    {s.email ? (
                      <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[hsl(var(--foreground))]/65">
                        <Mail className="h-4 w-4 text-[hsl(var(--foreground))]/55" />
                        <span className="truncate">{s.email}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => openEdit(s)}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--foreground))]/5"
                      aria-label="Edit"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4 text-[hsl(var(--foreground))]/75" />
                    </button>
                    <button
                      onClick={() => removeSupplier(s.dbId)}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--foreground))]/5"
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-rose-300" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="inline-flex items-center gap-2 text-[hsl(var(--foreground))]/85">
                    <Phone className="h-4 w-4 text-[hsl(var(--foreground))]/55" />
                    <span className="font-extrabold">{s.phone}</span>
                  </div>

                  <div className="inline-flex items-start gap-2 text-[hsl(var(--foreground))]/75">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--foreground))]/55" />
                    <span className="text-sm">{s.address}</span>
                  </div>

                  {s.contactPerson ? (
                    <div className="inline-flex items-center gap-2 text-[hsl(var(--foreground))]/75">
                      <User className="h-4 w-4 text-[hsl(var(--foreground))]/55" />
                      <span className="text-xs font-semibold">
                        {s.contactPerson}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-[hsl(var(--foreground))]/45">
                      —
                    </div>
                  )}

                  {s.notes ? (
                    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 text-xs font-semibold text-[hsl(var(--foreground))]/70">
                      {s.notes}
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] md:block">
          <div className="grid grid-cols-12 bg-[hsl(var(--foreground))]/5 px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
            <div className="col-span-3">Supplier</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-4">Address</div>
            <div className="col-span-2">Contact</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          <div className="divide-y divide-[hsl(var(--border))]">
            {loading ? (
              <div className="px-4 py-10 text-center">
                <div className="text-sm font-extrabold">Loading suppliers…</div>
                <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/60">
                  Please wait.
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="text-sm font-extrabold">No suppliers found</div>
                <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]/60">
                  Try another search or add a supplier.
                </div>
              </div>
            ) : (
              filtered.map((s) => (
                <div
                  key={s.dbId}
                  className="grid grid-cols-12 items-center px-4 py-3 text-sm"
                >
                  <div className="col-span-3 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-10 w-10 rounded-2xl bg-[hsl(var(--brand-strong))]/18" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold tracking-tight">
                          {s.name}
                        </div>
                        <div className="mt-1 text-[11px] font-semibold text-[hsl(var(--foreground))]/55">
                          ID: {s.id}
                          {s.company ? (
                            <span className="ml-2">• {s.company}</span>
                          ) : null}
                        </div>
                        {s.email ? (
                          <div className="mt-1 inline-flex items-center gap-2 text-xs font-semibold text-[hsl(var(--foreground))]/65">
                            <Mail className="h-4 w-4 text-[hsl(var(--foreground))]/55" />
                            <span className="truncate">{s.email}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="inline-flex items-center gap-2 text-[hsl(var(--foreground))]/85">
                      <Phone className="h-4 w-4 text-[hsl(var(--foreground))]/55" />
                      <span className="font-extrabold">{s.phone}</span>
                    </div>
                  </div>

                  <div className="col-span-4 min-w-0">
                    <div className="inline-flex items-start gap-2 text-[hsl(var(--foreground))]/75">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--foreground))]/55" />
                      <span className="truncate">{s.address}</span>
                    </div>
                  </div>

                  <div className="col-span-2 min-w-0">
                    {s.contactPerson ? (
                      <div className="inline-flex items-center gap-2 text-[hsl(var(--foreground))]/75">
                        <User className="h-4 w-4 text-[hsl(var(--foreground))]/55" />
                        <span className="truncate text-xs font-semibold">
                          {s.contactPerson}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-[hsl(var(--foreground))]/45">
                        —
                      </span>
                    )}
                  </div>

                  <div className="col-span-1 flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(s)}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--foreground))]/5"
                      aria-label="Edit"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4 text-[hsl(var(--foreground))]/75" />
                    </button>

                    <button
                      onClick={() => removeSupplier(s.dbId)}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--foreground))]/5"
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-rose-300" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="h-10" />

      {/* Add/Edit Modal */}
      <Modal
        open={openForm}
        title={editingDbId ? "Edit Supplier" : "Add Supplier"}
        onClose={() => (saving ? null : setOpenForm(false))}
      >
        <form onSubmit={saveSupplier} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Supplier Name *">
              <Input
                value={draft.name}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, name: e.target.value }))
                }
                placeholder="e.g. SomPharma Distributors"
                disabled={saving}
              />
            </Field>

            <Field label="Phone *">
              <Input
                value={draft.phone}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, phone: e.target.value }))
                }
                placeholder="e.g. +25261XXXXXXX"
                disabled={saving}
              />
            </Field>

            <Field label="Company (optional)">
              <Input
                value={draft.company}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, company: e.target.value }))
                }
                placeholder="e.g. SomPharma"
                disabled={saving}
              />
            </Field>

            <Field label="Contact Person (optional)">
              <Input
                value={draft.contactPerson}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, contactPerson: e.target.value }))
                }
                placeholder="e.g. Hassan Ali"
                disabled={saving}
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Address *">
                <Input
                  value={draft.address}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, address: e.target.value }))
                  }
                  placeholder="e.g. Mogadishu, KM4"
                  disabled={saving}
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Email (optional)">
                <Input
                  value={draft.email}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, email: e.target.value }))
                  }
                  placeholder="e.g. sales@supplier.com"
                  disabled={saving}
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field
                label="Notes (optional)"
                hint="Payment terms, delivery schedule, pricing notes..."
              >
                <Textarea
                  value={draft.notes}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, notes: e.target.value }))
                  }
                  placeholder="e.g. Credit 14 days, deliveries on Mon/Thu"
                  disabled={saving}
                />
              </Field>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs font-medium text-[hsl(var(--foreground))]/60">
              Tip: supplier phone numbers should be unique.
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
              <button
                type="button"
                onClick={() => setOpenForm(false)}
                className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full rounded-2xl bg-[hsl(var(--brand-strong))] px-4 py-2.5 text-sm font-extrabold tracking-tight text-[hsl(var(--brand))] shadow hover:opacity-90 disabled:opacity-60"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingDbId
                  ? "Save Changes"
                  : "Add Supplier"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
