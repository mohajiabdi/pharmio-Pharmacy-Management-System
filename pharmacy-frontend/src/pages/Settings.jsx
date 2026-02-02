import React, { useEffect, useMemo, useState } from "react";
import {
  Moon,
  Sun,
  Palette,
  Check,
  Monitor,
  Pencil,
  UserX,
  UserCheck,
} from "lucide-react";

import api from "../api/client";
import EditUserModal from "../components/modals/EditUserModal";

const cx = (...a) => a.filter(Boolean).join(" ");

const PALETTES = [
  {
    key: "indigo-sky",
    name: "Indigo / Sky",
    brand: "230 48% 32%",
    soft: "210 90% 96%",
    strong: "215 85% 60%",
  },
  {
    key: "emerald-lime",
    name: "Emerald / Lime",
    brand: "164 78% 18%",
    soft: "84 90% 88%",
    strong: "84 90% 60%",
  },
  {
    key: "violet-pink",
    name: "Violet / Pink",
    brand: "262 55% 35%",
    soft: "300 60% 94%",
    strong: "318 85% 70%",
  },
  {
    key: "slate-cyan",
    name: "Slate / Cyan",
    brand: "215 28% 24%",
    soft: "195 65% 94%",
    strong: "190 95% 55%",
  },
  {
    key: "amber-orange",
    name: "Amber / Orange",
    brand: "26 86% 24%",
    soft: "45 100% 94%",
    strong: "32 95% 58%",
  },
];

const LS_THEME = "pharmly_theme";
const LS_PALETTE = "pharmly_palette";
// const [email, setEmail] = useState("");

function setBrandVars({ brand, soft, strong }) {
  const root = document.documentElement;
  root.style.setProperty("--brand", brand);
  root.style.setProperty("--brand-soft", soft);
  root.style.setProperty("--brand-strong", strong);
}

function applyTheme(mode) {
  const root = document.documentElement;

  if (mode === "dark") root.classList.add("dark");
  if (mode === "light") root.classList.remove("dark");

  if (mode === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    root.classList.toggle("dark", prefersDark);
  }
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

export default function Settings() {
  const [ready, setReady] = useState(false);

  // user + admin
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // account forms
  const [fullName, setFullName] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // theme
  const [theme, setTheme] = useState("system");
  const [paletteKey, setPaletteKey] = useState("indigo-sky");

  const selectedPalette = useMemo(
    () => PALETTES.find((p) => p.key === paletteKey) || PALETTES[0],
    [paletteKey],
  );
  async function adminSetActiveFromModal(nextIsActive) {
    if (!editUser?.id) return;
    // safety: do not allow self (also backend blocks)
    if (editUser.id === me?.id) return;

    setSaving(true);
    setMsg("");
    setErr("");
    try {
      await api.patch(`/api/users/${editUser.id}/active`, {
        is_active: nextIsActive,
      });
      setMsg("User status updated");
      await loadUsers();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  async function loadMe() {
    // setEmail(u?.email || "");
    setErr("");
    try {
      const r = await api.get("/api/users/me");
      const u = r.data?.data;
      setMe(u);
      setFullName(u?.full_name || "");

      // apply from DB first (fallback to local)
      const dbTheme =
        u?.theme_mode || localStorage.getItem(LS_THEME) || "system";
      const dbPalette =
        u?.palette_key || localStorage.getItem(LS_PALETTE) || "indigo-sky";

      setTheme(dbTheme);
      setPaletteKey(dbPalette);
      applyTheme(dbTheme);
      setBrandVars(PALETTES.find((p) => p.key === dbPalette) || PALETTES[0]);

      setReady(true);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load profile");
      setReady(true);
    }
  }

  async function loadUsers() {
    try {
      const r = await api.get("/api/users");
      setUsers(Array.isArray(r.data?.data) ? r.data.data : []);
    } catch (e) {
      // keep silent (admin only)
    }
  }

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (me?.role === "admin") loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.role]);

  // keep localStorage + apply immediately
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(LS_THEME, theme);
    applyTheme(theme);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => theme === "system" && applyTheme("system");
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [theme, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(LS_PALETTE, paletteKey);
    setBrandVars(selectedPalette);
  }, [paletteKey, selectedPalette, ready]);

  // save preferences to DB (debounced-ish: only when user loaded)
  useEffect(() => {
    if (!ready || !me?.id) return;
    api
      .patch("/api/users/me/preferences", {
        theme_mode: theme,
        palette_key: paletteKey,
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, paletteKey, ready, me?.id]);

  async function saveProfile() {
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      const r = await api.patch("/api/users/me/profile", {
        full_name: fullName,
      });
      setMe(r.data?.data);
      setMsg("Profile updated");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function saveEmail() {
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      const r = await api.patch("/api/users/me/email", {
        currentEmail,
        newEmail,
      });
      setMe(r.data?.data);
      setCurrentEmail("");
      setNewEmail("");
      setMsg("Email updated");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update email");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword() {
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      await api.patch("/api/users/me/password", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setMsg("Password updated");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  }

  async function adminSaveUser(payload) {
    if (!editUser?.id) return;
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      await api.patch(`/api/users/${editUser.id}`, payload);
      setEditOpen(false);
      setEditUser(null);
      setMsg("User updated");
      await loadUsers();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u) {
    if (!u?.id) return;
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      await api.patch(`/api/users/${u.id}/active`, { is_active: !u.is_active });
      await loadUsers();
      setMsg("User status updated");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-extrabold tracking-tight">Settings</div>
          <div className="text-sm font-medium text-[hsl(var(--foreground))]/60">
            Theme, appearance, account, and admin management
          </div>
        </div>
      </div>

      {msg ? (
        <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-200">
          {msg}
        </div>
      ) : null}
      {err ? (
        <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-semibold text-rose-200">
          {err}
        </div>
      ) : null}

      {/* Theme */}
      <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold tracking-tight">Theme</div>
            <div className="text-xs font-medium text-[hsl(var(--foreground))]/60">
              Choose light, dark, or follow your system setting
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong))]/15 px-3 py-2 text-xs font-extrabold text-[hsl(var(--foreground))]/80">
            <Monitor className="h-4 w-4" />
            Current: {theme}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <ThemeButton
            active={theme === "system"}
            label="System"
            icon={<Monitor className="h-4 w-4" />}
            onClick={() => setTheme("system")}
          />
          <ThemeButton
            active={theme === "light"}
            label="Light"
            icon={<Sun className="h-4 w-4" />}
            onClick={() => setTheme("light")}
          />
          <ThemeButton
            active={theme === "dark"}
            label="Dark"
            icon={<Moon className="h-4 w-4" />}
            onClick={() => setTheme("dark")}
          />
        </div>
      </div>

      {/* Brand colors */}
      <div className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold tracking-tight">
              Brand Color
            </div>
            <div className="text-xs font-medium text-[hsl(var(--foreground))]/60">
              Change the main color theme across the app
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-extrabold text-[hsl(var(--foreground))]/75">
            <Palette className="h-4 w-4 text-[hsl(var(--foreground))]/55" />
            {selectedPalette.name}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {PALETTES.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPaletteKey(p.key)}
              className={cx(
                "relative rounded-2xl border p-4 text-left transition",
                p.key === paletteKey
                  ? "border-[hsl(var(--brand-strong))] bg-[hsl(var(--background))]"
                  : "border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--foreground))]/5",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]">
                  {p.name}
                </div>
                {p.key === paletteKey ? (
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-[hsl(var(--brand-strong))]/15">
                    <Check className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
                  </div>
                ) : null}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Swatch label="Brand" hsl={p.brand} />
                <Swatch label="Soft" hsl={p.soft} />
                <Swatch label="Strong" hsl={p.strong} />
              </div>

              <div className="mt-3 text-[11px] font-semibold text-[hsl(var(--foreground))]/55">
                Updates: --brand / --brand-soft / --brand-strong
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Account */}
      <div className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5">
        <div className="text-sm font-extrabold tracking-tight">Account</div>
        <div className="text-xs font-medium text-[hsl(var(--foreground))]/60">
          Update your full name, email and password (secure checks included)
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
              Full name
            </div>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              disabled={saving}
              onClick={saveProfile}
              className="h-11 w-full rounded-2xl bg-[hsl(var(--brand-strong))] px-4 text-sm font-extrabold text-[hsl(var(--brand))] hover:opacity-90 disabled:opacity-60"
            >
              Save Profile
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
              Current eml
            </div>
            <Input
              type="email"
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
              New email
            </div>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              disabled={saving}
              onClick={saveEmail}
              className="h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-extrabold hover:bg-[hsl(var(--foreground))]/5 disabled:opacity-60"
            >
              Update Email
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
              Current password
            </div>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
              New password
            </div>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              disabled={saving}
              onClick={savePassword}
              className="h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-extrabold hover:bg-[hsl(var(--foreground))]/5 disabled:opacity-60"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* Admin users table */}
      {me?.role === "admin" ? (
        <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold tracking-tight">Users</div>
              <div className="text-xs font-medium text-[hsl(var(--foreground))]/60">
                Edit non-admin users. You cannot edit/delete yourself. Admins
                cannot be edited (only inactive).
              </div>
            </div>
            <button
              onClick={loadUsers}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-extrabold hover:bg-[hsl(var(--foreground))]/5"
            >
              Refresh
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
            <div className="grid grid-cols-12 bg-[hsl(var(--foreground))]/5 px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
              <div className="col-span-3">Name</div>
              <div className="col-span-4">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-1">Active</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y divide-[hsl(var(--border))]">
              {users.map((u) => {
                const isMe = u.id === me.id;
                const isAdmin = u.role === "admin";
                const canEdit = !isMe && !isAdmin;
                const canToggle = !isMe;

                return (
                  <div
                    key={u.id}
                    className="grid grid-cols-12 items-center px-4 py-3 text-sm"
                  >
                    <div className="col-span-3 font-extrabold">
                      {u.full_name}
                    </div>
                    <div className="col-span-4 text-[hsl(var(--foreground))]/70">
                      {u.email}
                    </div>
                    <div className="col-span-2">
                      <span
                        className={cx(
                          "inline-flex rounded-full border px-2.5 py-1 text-xs font-extrabold",
                          isAdmin
                            ? "border-[hsl(var(--brand-strong))]/30 bg-[hsl(var(--brand-strong))]/10 text-[hsl(var(--brand-strong))]"
                            : "border-[hsl(var(--border))] bg-[hsl(var(--foreground))]/5 text-[hsl(var(--foreground))]/80",
                        )}
                      >
                        {u.role}
                      </span>
                    </div>
                    <div className="col-span-1 text-xs font-extrabold">
                      {u.is_active ? "Yes" : "No"}
                    </div>

                    <div className="col-span-2 flex justify-end gap-2">
                      <button
                        disabled={!canEdit}
                        onClick={() => {
                          setEditUser(u);
                          setEditOpen(true);
                        }}
                        className={cx(
                          "grid h-9 w-9 place-items-center rounded-xl border",
                          canEdit
                            ? "border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--foreground))]/5"
                            : "border-[hsl(var(--border))] bg-[hsl(var(--foreground))]/5 opacity-50 cursor-not-allowed",
                        )}
                        title={
                          canEdit
                            ? "Edit user"
                            : "Cannot edit admins / yourself"
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        disabled={!canToggle}
                        onClick={() => toggleActive(u)}
                        className={cx(
                          "grid h-9 w-9 place-items-center rounded-xl border",
                          canToggle
                            ? "border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--foreground))]/5"
                            : "border-[hsl(var(--border))] bg-[hsl(var(--foreground))]/5 opacity-50 cursor-not-allowed",
                        )}
                        title={
                          canToggle
                            ? u.is_active
                              ? "Deactivate"
                              : "Activate"
                            : "You cannot change yourself"
                        }
                      >
                        {u.is_active ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {users.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm font-semibold text-[hsl(var(--foreground))]/70">
                  No users found.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <EditUserModal
        open={editOpen}
        user={editUser}
        meId={me?.id}
        onClose={() => {
          setEditOpen(false);
          setEditUser(null);
        }}
        onSave={adminSaveUser}
        onSetActive={adminSetActiveFromModal}
      />

      <div className="h-10" />
    </div>
  );
}

function ThemeButton({ active, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-extrabold tracking-tight transition",
        active
          ? "border-[hsl(var(--brand-strong))] bg-[hsl(var(--brand-strong))]/15 text-[hsl(var(--foreground))]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5",
      )}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function Swatch({ label, hsl }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--overlay))]/6 px-3 py-2">
      <span
        className="h-4 w-4 rounded-full border border-[hsl(var(--border))]"
        style={{ backgroundColor: `hsl(${hsl})` }}
      />
      <span className="text-xs font-extrabold text-[hsl(var(--foreground))]/70">
        {label}
      </span>
    </div>
  );
}
