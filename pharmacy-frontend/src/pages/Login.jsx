// src/pages/auth/login.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useNavigate as useNav,
  useNavigate as useNavigateDup,
} from "react-router-dom"; // (safe if your project already imports Link/useNavigate elsewhere)
import { authApi } from "../api/authApi";
import api from "../api/client";
import logo from "../assets/Logo.png";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  KeyRound,
  Sun,
  Moon,
  Menu,
  UserRound,
  LogOut,
  LayoutDashboard,
  BarChart3,
  Settings as SettingsIcon,
  ShoppingCart,
  Pill,
} from "lucide-react";

const cx = (...a) => a.filter(Boolean).join(" ");

const LS_REMEMBER = "pharmly_remember_email";
const LS_EMAIL = "pharmly_login_email";
const LS_THEME = "pharmly_theme"; // ✅ unified key

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
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

export default function Login() {
  const nav = useNavigate();

  const [isDark, setIsDark] = useState(false);
  const [me, setMe] = useState(null);

  // ✅ Theme load
  useEffect(() => {
    const savedTheme = localStorage.getItem(LS_THEME) || "system";
    applyTheme(savedTheme);
    setIsDark(document.documentElement.classList.contains("dark"));

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const t = localStorage.getItem(LS_THEME) || "system";
      if (t === "system") {
        applyTheme("system");
        setIsDark(document.documentElement.classList.contains("dark"));
      }
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // ✅ Load current user (if token exists)
  useEffect(() => {
    const token = localStorage.getItem("pharmly_token");
    if (!token) return;

    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/api/users/me");
        if (!mounted) return;
        setMe(res?.data?.data || null);
      } catch {
        localStorage.removeItem("pharmly_token");
        localStorage.removeItem("pharmly_user");
        setMe(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const toggleTheme = () => {
    const current = localStorage.getItem(LS_THEME) || "system";
    const order = ["system", "dark", "light"];
    const idx = order.indexOf(current);
    const next = order[(idx + 1) % order.length];

    localStorage.setItem(LS_THEME, next);
    applyTheme(next);
    setIsDark(document.documentElement.classList.contains("dark"));
  };

  const logout = () => {
    localStorage.removeItem("pharmly_token");
    localStorage.removeItem("pharmly_user");
    setMe(null);
    nav("/login", { replace: true });
  };

  // ================== FORM ==================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot password modal
  const [fpOpen, setFpOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpSent, setFpSent] = useState(false);

  const canSubmit = useMemo(() => {
    if (!isEmail(email)) return false;
    if (!password || password.length < 6) return false;
    return true;
  }, [email, password]);

  // Load remembered email
  useEffect(() => {
    const savedRemember = localStorage.getItem(LS_REMEMBER);
    const savedEmail = localStorage.getItem(LS_EMAIL);

    if (savedRemember === "false") setRemember(false);
    if (savedEmail) setEmail(savedEmail);
  }, []);

  // Persist remember/email
  useEffect(() => {
    localStorage.setItem(LS_REMEMBER, String(remember));
    if (remember) localStorage.setItem(LS_EMAIL, email);
    else localStorage.removeItem(LS_EMAIL);
  }, [remember, email]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Please enter a valid email and password (min 6 chars).");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login({ email, password });

      // save token
      localStorage.setItem("pharmly_token", res.data.token);

      // optional: store user snapshot (but UI uses /me)
      if (res?.data?.user) {
        localStorage.setItem("pharmly_user", JSON.stringify(res.data.user));
      }

      nav("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function openForgot() {
    setFpOpen(true);
    setFpSent(false);
    setFpEmail(email || "");
  }

  async function sendReset(e) {
    e.preventDefault();
    setError("");

    if (!isEmail(fpEmail)) {
      setError("Enter a valid email for password reset.");
      return;
    }

    // ✅ TODO: call backend reset endpoint
    // await authApi.forgotPassword(fpEmail)

    await new Promise((r) => setTimeout(r, 400)); // mock
    setFpSent(true);
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Header (same style, but supports profile dropdown when logged in) */}
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.85)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          {/* Left: Brand */}
          <Link to="/home" className="flex items-center gap-3">
            <div className="grid h-20 w-20 place-items-center rounded-2xl">
              <img
                src={logo}
                alt="Pharmio logo"
                className="h-20 w-20 object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="text-base font-extrabold tracking-tight">
                Pharmio
              </div>
              <div className="text-xs font-semibold text-[hsl(var(--foreground)/0.6)]">
                Pharmacy Management System
              </div>
            </div>
          </Link>

          {/* Right actions */}
          <AuthHeaderActions
            isDark={isDark}
            toggleTheme={toggleTheme}
            me={me}
            onLogout={logout}
            loggedOutCta={{ label: "Create Account", to: "/signup" }}
          />
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-5 py-10 md:grid-cols-2 md:items-center">
        {/* Left info */}
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-7 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong)/0.15)] px-3 py-2 text-xs font-extrabold text-[hsl(var(--brand-strong))]">
            <ShieldCheck className="h-4 w-4" />
            Secure login
          </div>

          <div className="mt-4 text-3xl font-extrabold tracking-tight">
            Welcome back
          </div>
          <div className="mt-2 text-sm font-medium text-[hsl(var(--foreground)/0.65)]">
            Sign in to manage medicines, sales, and reports.
          </div>

          <div className="mt-6 space-y-3">
            <Benefit text="Fast Sales/POS workflow" />
            <Benefit text="Stock updates automatically after sales" />
            <Benefit text="Reports for revenue and top products" />
          </div>

          <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[hsl(var(--foreground)/0.55)]">
              Tip
            </div>
            <div className="mt-2 text-sm font-semibold text-[hsl(var(--foreground)/0.75)]">
              Use Settings to switch dark/light mode and brand colors.
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-7 shadow-sm">
          <div className="text-2xl font-extrabold tracking-tight">Login</div>
          <div className="mt-1 text-sm font-medium text-[hsl(var(--foreground)/0.6)]">
            Enter your account details to continue
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--overlay)/0.06)] p-3 text-sm font-semibold text-[hsl(var(--foreground)/0.8)]">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-widest text-[hsl(var(--foreground)/0.55)]">
                Email
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3">
                <Mail className="h-4 w-4 text-[hsl(var(--foreground)/0.55)]" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pharmacy.com"
                  className="w-full bg-transparent text-sm font-semibold text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--foreground)/0.35)]"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-widest text-[hsl(var(--foreground)/0.55)]">
                Password
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3">
                <Lock className="h-4 w-4 text-[hsl(var(--foreground)/0.55)]" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type={showPass ? "text" : "password"}
                  className="w-full bg-transparent text-sm font-semibold text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--foreground)/0.35)]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[hsl(var(--overlay)/0.06)]"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? (
                    <EyeOff className="h-4 w-4 text-[hsl(var(--foreground)/0.6)]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[hsl(var(--foreground)/0.6)]" />
                  )}
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-extrabold text-[hsl(var(--foreground)/0.75)]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 accent-[hsl(var(--brand-strong))]"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={openForgot}
                  className="text-sm font-extrabold text-[hsl(var(--brand-strong))] hover:opacity-80"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cx(
                "mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold shadow transition",
                loading
                  ? "bg-[hsl(var(--overlay)/0.08)] text-[hsl(var(--foreground)/0.6)]"
                  : "bg-[hsl(var(--brand-strong))] text-[hsl(var(--brand))] hover:opacity-90",
              )}
            >
              {loading ? "Signing in..." : "Login"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-center text-sm font-semibold text-[hsl(var(--foreground)/0.65)]">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="font-extrabold text-[hsl(var(--brand-strong))] hover:opacity-80"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {fpOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center px-4">
          <div
            className="absolute inset-0 bg-[hsl(var(--overlay)/0.6)]"
            onClick={() => setFpOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[hsl(var(--brand-strong)/0.15)]">
                  <KeyRound className="h-5 w-5 text-[hsl(var(--brand-strong))]" />
                </div>
                <div>
                  <div className="text-lg font-extrabold tracking-tight">
                    Reset password
                  </div>
                  <div className="text-sm font-medium text-[hsl(var(--foreground)/0.6)]">
                    We’ll send a reset link to your email.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setFpOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[hsl(var(--overlay)/0.06)]"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-[hsl(var(--foreground)/0.7)]" />
              </button>
            </div>

            {fpSent ? (
              <div className="mt-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--brand-strong)/0.15)] p-4">
                <div className="flex items-center gap-2 text-[hsl(var(--brand-strong))]">
                  <Check className="h-5 w-5" />
                  <div className="text-sm font-extrabold">Reset link sent</div>
                </div>
                <div className="mt-1 text-sm font-semibold text-[hsl(var(--foreground)/0.75)]">
                  Check your inbox for instructions.
                </div>
              </div>
            ) : (
              <form onSubmit={sendReset} className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-widest text-[hsl(var(--foreground)/0.55)]">
                    Email
                  </label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3">
                    <Mail className="h-4 w-4 text-[hsl(var(--foreground)/0.55)]" />
                    <input
                      value={fpEmail}
                      onChange={(e) => setFpEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-transparent text-sm font-semibold text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--foreground)/0.35)]"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong))] px-4 py-3 text-sm font-extrabold text-[hsl(var(--brand))] shadow hover:opacity-90"
                >
                  Send reset link <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setFpOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 text-sm font-extrabold text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Benefit({ text }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3">
      <div className="grid h-7 w-7 place-items-center rounded-xl bg-[hsl(var(--brand-strong)/0.15)]">
        <Check className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
      </div>
      <div className="text-sm font-extrabold text-[hsl(var(--foreground)/0.8)]">
        {text}
      </div>
    </div>
  );
}

function AuthHeaderActions({
  isDark,
  toggleTheme,
  me,
  onLogout,
  loggedOutCta,
}) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false); // mobile menu
  const [profileOpen, setProfileOpen] = useState(false); // desktop profile

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

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) setOpen(false);
      if (window.innerWidth < 640) setProfileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeAll = () => {
    setOpen(false);
    setProfileOpen(false);
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Desktop/Tablet */}
      <div className="hidden items-center gap-2 sm:flex">
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-extrabold text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
          aria-label="Toggle theme"
          title={isDark ? "Switch to light" : "Switch to dark"}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {isDark ? "Light" : "Dark"}
        </button>

        {!isLoggedIn ? (
          <Link
            to={loggedOutCta?.to || "/signup"}
            className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-extrabold text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
          >
            {loggedOutCta?.label || "Create Account"}
          </Link>
        ) : (
          <>
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
                          nav(l.to);
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
          </>
        )}
      </div>

      {/* Mobile */}
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

          <div className="absolute right-0 top-12 z-50 w-[260px] overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-lg">
            <div className="p-2">
              <Link
                to="/home"
                onClick={closeAll}
                className="block rounded-2xl px-4 py-3 text-sm font-extrabold text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
              >
                Home
              </Link>

              {!isLoggedIn ? (
                <Link
                  to={loggedOutCta?.to || "/signup"}
                  onClick={closeAll}
                  className="mt-2 flex items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 text-sm font-extrabold text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
                >
                  {loggedOutCta?.label || "Create Account"}
                </Link>
              ) : (
                <>
                  <div className="my-2 h-px bg-[hsl(var(--border))]" />

                  <div className="px-3 py-2">
                    <div className="text-sm font-extrabold">
                      {me?.full_name}
                    </div>
                    <div className="text-xs font-semibold text-[hsl(var(--foreground)/0.6)]">
                      {me?.email}
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
