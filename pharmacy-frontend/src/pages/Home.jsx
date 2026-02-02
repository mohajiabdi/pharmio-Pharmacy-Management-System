// src/pages/Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import logo from "../assets/Logo.png";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";

import {
  MessageCircle,
  CreditCard,
  FileText,
  Sun,
  Moon,
  Menu,
  X,
  ShieldCheck,
  Pill,
  ShoppingCart,
  BarChart3,
  Clock,
  CheckCircle2,
  ArrowRight,
  UserRound,
  LogOut,
  LayoutDashboard,
  Settings as SettingsIcon,
  GraduationCap,
  Users,
} from "lucide-react";

const cx = (...a) => a.filter(Boolean).join(" ");

const LS_THEME = "pharmly_theme";

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

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1 text-xs font-extrabold text-[hsl(var(--foreground)/0.8)]">
      {children}
    </span>
  );
}

function Card({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[hsl(var(--brand-strong)/0.15)]">
          <Icon className="h-5 w-5 text-[hsl(var(--brand-strong))]" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]">
            {title}
          </div>
          <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground)/0.6)]">
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
      <div className="text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground)/0.55)]">
        {label}
      </div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
        {value}
      </div>
    </div>
  );
}

function MiniKPI({ title, value }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
      <div className="text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground)/0.55)]">
        {title}
      </div>
      <div className="mt-2 text-xl font-extrabold tracking-tight">{value}</div>
    </div>
  );
}

function ActionPill({ icon: Icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-xs font-extrabold text-[hsl(var(--foreground)/0.75)]">
      <Icon className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
      {text}
    </div>
  );
}

function Pricing({ title, price, note, features, highlight }) {
  return (
    <div
      className={cx(
        "rounded-3xl border p-6 shadow-sm",
        highlight
          ? "border-[hsl(var(--brand-strong))] bg-[hsl(var(--surface))]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--surface))]",
      )}
    >
      <div className="text-sm font-extrabold tracking-tight">{title}</div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight">{price}</div>
      <div className="mt-1 text-xs font-medium text-[hsl(var(--foreground)/0.6)]">
        {note}
      </div>

      <div className="mt-5 space-y-2">
        {features.map((f) => (
          <div
            key={f}
            className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--foreground)/0.75)]"
          >
            <CheckCircle2 className="h-5 w-5 text-[hsl(var(--brand-strong))]" />
            {f}
          </div>
        ))}
      </div>

      <Link
        to="/signup"
        className={cx(
          "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold shadow hover:opacity-90",
          highlight
            ? "bg-[hsl(var(--brand-strong))] text-[hsl(var(--brand))]"
            : "bg-[hsl(var(--overlay)/0.06)] text-[hsl(var(--foreground))]",
        )}
      >
        Choose <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function HeaderActions({ isDark, toggleTheme, me, onLogout }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // mobile nav
  const [profileOpen, setProfileOpen] = useState(false); // profile dropdown

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
      if (window.innerWidth < 1024) setProfileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isLoggedIn = !!me;

  const links = useMemo(() => {
    const base = [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/medicines", label: "Medicines", icon: Pill },
      { to: "/sales", label: "Sales", icon: ShoppingCart },
      { to: "/settings", label: "Settings", icon: SettingsIcon },
    ];

    if (me?.role === "admin") {
      base.splice(3, 0, { to: "/reports", label: "Reports", icon: BarChart3 });
    }

    return base;
  }, [me?.role]);

  const closeAll = () => {
    setOpen(false);
    setProfileOpen(false);
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Desktop (logged out) */}
      {!isLoggedIn ? (
        <div className="hidden items-center gap-2 sm:flex">
          <Link
            to="/login"
            className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-extrabold text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
          >
            Login
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-extrabold text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
            aria-label="Toggle theme"
            title={isDark ? "Switch to light" : "Switch to dark"}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            {isDark ? "Light" : "Dark"}
          </button>

          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong))] px-4 py-2 text-sm font-extrabold text-[hsl(var(--brand))] shadow hover:opacity-90"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        // Desktop (logged in)
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-extrabold text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
            aria-label="Toggle theme"
            title={isDark ? "Switch to light" : "Switch to dark"}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            {isDark ? "Light" : "Dark"}
          </button>

          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-extrabold text-[hsl(var(--foreground)/0.85)] hover:bg-[hsl(var(--overlay)/0.06)]"
          >
            <UserRound className="h-4 w-4" />
            {me?.full_name || "User"}
          </button>

          {profileOpen && (
            <>
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
                aria-label="Close profile menu"
              />
              <div className="absolute right-0 top-12 z-50 w-[280px] overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-lg">
                <div className="p-2">
                  <div className="px-3 py-2">
                    <div className="text-sm font-extrabold">
                      {me?.full_name}
                    </div>
                    <div className="text-xs font-semibold text-[hsl(var(--foreground)/0.6)]">
                      {me?.email}
                    </div>
                    <div className="mt-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground)/0.45)]">
                      {me?.role}
                    </div>
                  </div>

                  <div className="my-2 h-px bg-[hsl(var(--border))]" />

                  {links.map((l) => (
                    <button
                      key={l.to}
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate(l.to);
                      }}
                      className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold text-[hsl(var(--foreground)/0.85)] hover:bg-[hsl(var(--overlay)/0.06)]"
                    >
                      <l.icon className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
                      {l.label}
                    </button>
                  ))}

                  <div className="my-2 h-px bg-[hsl(var(--border))]" />

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold text-rose-300 hover:bg-rose-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mobile actions */}
      <div className="flex items-center gap-2 sm:hidden">
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
          aria-label="Open menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <>
          <button
            type="button"
            onClick={closeAll}
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close menu backdrop"
          />

          <div className="absolute right-0 top-12 z-50 w-[280px] overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-lg">
            <div className="p-2">
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    onClick={closeAll}
                    className="block rounded-2xl px-4 py-3 text-sm font-extrabold text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeAll}
                    className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong))] px-4 py-3 text-sm font-extrabold text-[hsl(var(--brand))] shadow hover:opacity-90"
                  >
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <>
                  <div className="px-3 py-2">
                    <div className="text-sm font-extrabold">
                      {me?.full_name}
                    </div>
                    <div className="text-xs font-semibold text-[hsl(var(--foreground)/0.6)]">
                      {me?.email}
                    </div>
                    <div className="mt-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground)/0.45)]">
                      {me?.role}
                    </div>
                  </div>

                  <div className="my-2 h-px bg-[hsl(var(--border))]" />

                  {links.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={closeAll}
                      className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold text-[hsl(var(--foreground)/0.85)] hover:bg-[hsl(var(--overlay)/0.06)]"
                    >
                      <l.icon className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
                      {l.label}
                    </Link>
                  ))}

                  <div className="my-2 h-px bg-[hsl(var(--border))]" />

                  {/* Logout at bottom */}
                  <button
                    type="button"
                    onClick={() => {
                      closeAll();
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold text-rose-300 hover:bg-rose-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
const team = [
  { no: 1, id: "C1221277", name: "Mohamed Mahad Abdi" },
  { no: 2, id: "C1220214", name: "Zamzam ismael abdullahi" },
  { no: 3, id: "C1220163", name: "Mohamed Hared Salad" },
  { no: 4, id: "C1220590", name: "Rayan rabiile Adan" },
  { no: 5, id: "C1221319", name: "Abdiaziz Abdullahi Ali" },
  { no: 6, id: "C1220168", name: "Najmo Mohamud Abdulle" },
  { no: 7, id: "C1220894", name: "Maryan Mohamed Elmi" },
];

export default function Home() {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(false);
  const [me, setMe] = useState(null);

  // ✅ Load theme + user (if token exists)
  useEffect(() => {
    const savedTheme = localStorage.getItem(LS_THEME) || "system";
    applyTheme(savedTheme);
    setIsDark(document.documentElement.classList.contains("dark"));

    const token = localStorage.getItem("pharmly_token");
    if (!token) return;

    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/api/users/me");
        if (!mounted) return;
        const user = res?.data?.data || null;
        setMe(user);

        // apply DB theme if exists
        const t = user?.theme_mode || savedTheme;
        localStorage.setItem(LS_THEME, t);
        applyTheme(t);
        setIsDark(document.documentElement.classList.contains("dark"));
      } catch {
        // token invalid -> logout
        localStorage.removeItem("pharmly_token");
        setMe(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const toggleTheme = async () => {
    // cycle like: system -> dark -> light -> system
    const current = localStorage.getItem(LS_THEME) || "system";
    const order = ["system", "dark", "light"];
    const idx = order.indexOf(current);
    const next = order[(idx + 1) % order.length];

    localStorage.setItem(LS_THEME, next);
    applyTheme(next);
    setIsDark(document.documentElement.classList.contains("dark"));

    // save to DB if logged in
    if (me) {
      try {
        await api.patch("/api/users/me/preferences", {
          theme_mode: next,
          palette_key: localStorage.getItem("pharmly_palette") || "indigo-sky",
        });
      } catch {
        // ignore
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("pharmly_token");
    setMe(null);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.8)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          {/* Left: Logo + Brand */}
          <div className="flex items-center gap-3">
            <div className="grid h-20 w-20 place-items-center rounded-2xl">
              <Link to="/home">
                <img
                  src={logo}
                  alt="Pharmio logo"
                  className="h-20 w-20 object-contain"
                />
              </Link>
            </div>
            <div className="leading-tight">
              <Link to="/home">
                <div className="text-base font-extrabold tracking-tight">
                  Pharmio
                </div>
                <div className="text-xs font-semibold text-[hsl(var(--foreground)/0.6)]">
                  Pharmacy Management System
                </div>
              </Link>
            </div>
          </div>

          {/* Right */}
          <HeaderActions
            isDark={isDark}
            toggleTheme={toggleTheme}
            me={me}
            onLogout={logout}
          />
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-5 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge>
                <ShieldCheck className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
                Secure & Reliable
              </Badge>
              <Badge>
                <Clock className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
                Faster Sales / POS
              </Badge>
            </div>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight md:text-4xl">
              Manage your pharmacy with a clean, modern system.
            </h1>
            <p className="mt-3 text-sm font-medium text-[hsl(var(--foreground)/0.65)] md:text-base">
              Track medicines, stock, sales, and reports — all in one place.
              Designed for daily pharmacy operations with speed and clarity.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {!me ? (
                <>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong))] px-5 py-3 text-sm font-extrabold text-[hsl(var(--brand))] shadow hover:opacity-90"
                  >
                    Create Account <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-3 text-sm font-extrabold text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong))] px-5 py-3 text-sm font-extrabold text-[hsl(var(--brand))] shadow hover:opacity-90"
                >
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Stat label="Avg checkout time" value="< 30s" />
              <Stat label="Stock accuracy" value="High" />
            </div>
          </div>

          {/* Right preview mock */}
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold tracking-tight">
                Today Snapshot
              </div>
              <div className="rounded-full bg-[hsl(var(--brand-strong)/0.15)] px-3 py-1 text-xs font-extrabold text-[hsl(var(--brand-strong))]">
                Live
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <MiniKPI title="Revenue" value="$—" />
              <MiniKPI title="Orders" value="—" />
              <MiniKPI title="Low Stock" value="—" />
              <MiniKPI title="Users" value="—" />
            </div>

            <div className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[hsl(var(--foreground)/0.55)]">
                Quick Actions
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <ActionPill icon={ShoppingCart} text="New Sale" />
                <ActionPill icon={Pill} text="Add Medicine" />
                <ActionPill icon={BarChart3} text="View Reports" />
                <ActionPill icon={UserRound} text="Manage Profile" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto w-full max-w-6xl px-5 pb-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-[hsl(var(--foreground)/0.55)]">
              Features
            </div>
            <div className="mt-2 text-2xl font-extrabold tracking-tight">
              Everything you need to run daily operations
            </div>
            <div className="mt-2 text-sm font-medium text-[hsl(var(--foreground)/0.6)]">
              Built for speed, clarity, and real pharmacy workflows.
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card
            icon={ShoppingCart}
            title="Sales / POS"
            desc="Fast checkout, invoice-ready totals, and transaction history."
          />
          <Card
            icon={Pill}
            title="Inventory Management"
            desc="Add medicines, track stock, and identify low stock quickly."
          />
          <Card
            icon={BarChart3}
            title="Reports"
            desc="Revenue, orders, top products, and export PDF/Excel/CSV."
          />
          <Card
            icon={SettingsIcon}
            title="Preferences"
            desc="Theme + brand palettes saved per user."
          />
          <Card
            icon={ShieldCheck}
            title="Secure Access"
            desc="Login system + protected routes for admin/staff."
          />
          <Card
            icon={FileText}
            title="Invoices"
            desc="Clean receipts, timestamps, and printable exports."
          />
        </div>
      </section>

      {/* WhatsApp + Payments (kept) */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-12">
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-[hsl(var(--foreground)/0.55)]">
                Payments & Messaging
              </div>
              <div className="mt-2 text-2xl font-extrabold tracking-tight">
                Receipt + WhatsApp message after checkout
              </div>
              <div className="mt-2 text-sm font-medium text-[hsl(var(--foreground)/0.6)]">
                After a sale, send a clean receipt to the customer on WhatsApp
                and store payment details for reporting.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong)/0.15)] px-4 py-2 text-sm font-extrabold text-[hsl(var(--brand-strong))]">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong)/0.15)] px-4 py-2 text-sm font-extrabold text-[hsl(var(--brand-strong))]">
                <CreditCard className="h-4 w-4" />
                Payments
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-5">
              <div className="flex items-center gap-2 text-[hsl(var(--brand-strong))]">
                <FileText className="h-5 w-5" />
                <div className="text-sm font-extrabold">Receipt</div>
              </div>
              <div className="mt-2 text-sm font-semibold text-[hsl(var(--foreground)/0.75)]">
                Auto-generate invoice with items, qty, total, and timestamp.
              </div>
            </div>

            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-5">
              <div className="flex items-center gap-2 text-[hsl(var(--brand-strong))]">
                <MessageCircle className="h-5 w-5" />
                <div className="text-sm font-extrabold">Send via WhatsApp</div>
              </div>
              <div className="mt-2 text-sm font-semibold text-[hsl(var(--foreground)/0.75)]">
                Send a message to customer with receipt summary and order ID.
              </div>
            </div>

            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-5">
              <div className="flex items-center gap-2 text-[hsl(var(--brand-strong))]">
                <CreditCard className="h-5 w-5" />
                <div className="text-sm font-extrabold">Payment tracking</div>
              </div>
              <div className="mt-2 text-sm font-semibold text-[hsl(var(--foreground)/0.75)]">
                Cash / Card / Mobile Money, paid/pending status, daily totals.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="mx-auto w-full max-w-6xl px-5 pb-12">
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-2xl font-extrabold tracking-tight">
                Modules included
              </div>
              <div className="mt-2 text-sm font-medium text-[hsl(var(--foreground)/0.6)]">
                A complete workflow from stock → sales → reporting.
              </div>
            </div>
            {!me ? (
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong))] px-5 py-3 text-sm font-extrabold text-[hsl(var(--brand))] shadow hover:opacity-90"
              >
                Start Now <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong))] px-5 py-3 text-sm font-extrabold text-[hsl(var(--brand))] shadow hover:opacity-90"
              >
                Open App <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              "Medicines management (CRUD + stock)",
              "Sales / POS transactions",
              "Reports and analytics (Admin-only reports)",
              "Settings: theme + brand palettes (per user)",
              "Secure access: protected routes",
              "Exports: CSV / Excel / PDF",
            ].map((t) => (
              <div
                key={t}
                className="flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3"
              >
                <CheckCircle2 className="h-5 w-5 text-[hsl(var(--brand-strong))]" />
                <div className="text-sm font-extrabold text-[hsl(var(--foreground)/0.8)]">
                  {t}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto w-full max-w-6xl px-5 pb-12">
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong)/0.15)] px-3 py-2 text-xs font-extrabold text-[hsl(var(--brand-strong))]">
                <GraduationCap className="h-4 w-4" />
                About Us
              </div>

              <div className="mt-3 text-2xl font-extrabold tracking-tight">
                Jamhuriya University Students
              </div>

              <div className="mt-2 text-sm font-medium text-[hsl(var(--foreground)/0.65)]">
                This project was developed after learning Node.js and the MERN
                stack, using <span className="font-extrabold">MySQL</span>,{" "}
                <span className="font-extrabold">Express.js</span>,{" "}
                <span className="font-extrabold">React</span>, and{" "}
                <span className="font-extrabold">Node.js</span>. Our goal is to
                build a practical pharmacy system with real modules and clean
                exports (PDF/CSV/XLSX).
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-extrabold text-[hsl(var(--foreground)/0.75)]">
              <Users className="h-4 w-4 text-[hsl(var(--foreground)/0.55)]" />
              Team Members: {team.length}
            </div>
          </div>

          {/* Team Table */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
            <div className="grid grid-cols-12 bg-[hsl(var(--foreground))]/5 px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
              <div className="col-span-2">No</div>
              <div className="col-span-3">ID</div>
              <div className="col-span-7">Name</div>
            </div>

            <div className="divide-y divide-[hsl(var(--border))]">
              {team.map((m) => (
                <div
                  key={m.id}
                  className="grid grid-cols-12 items-center px-4 py-3 text-sm"
                >
                  <div className="col-span-2 font-extrabold">{m.no}</div>
                  <div className="col-span-3 font-semibold text-[hsl(var(--foreground)/0.75)]">
                    {m.id}
                  </div>
                  <div className="col-span-7 font-extrabold">{m.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-xs font-semibold text-[hsl(var(--foreground))]/55">
            Note: Receipt sharing via WhatsApp is not included. Reports are
            exported as PDF, CSV, and XLSX.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-[hsl(var(--border))]">
        <div className="mx-auto w-full max-w-6xl px-5 py-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="text-base font-extrabold tracking-tight">
                Pharmio
              </div>
              <div className="mt-2 text-sm font-medium text-[hsl(var(--foreground)/0.6)]">
                Modern pharmacy management system.
              </div>
            </div>

            <div className="text-sm font-extrabold text-[hsl(var(--foreground)/0.7)]">
              Contact:{" "}
              <span className="text-[hsl(var(--foreground))]">
                admin@pharmacy.local
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
