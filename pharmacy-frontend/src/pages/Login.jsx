// src/pages/auth/login.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import {
  Pill,
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
} from "lucide-react";

const cx = (...a) => a.filter(Boolean).join(" ");

const LS_REMEMBER = "pharmly_remember_email";
const LS_EMAIL = "pharmly_login_email";

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

export default function Login() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const systemDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;
    const shouldBeDark = saved ? saved === "dark" : systemDark;
    document.documentElement.classList.toggle("dark", shouldBeDark);
    setIsDark(shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  };

  const nav = useNavigate();

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
      // ✅ TODO: connect to backend:
      // const res = await authApi.login({ email, password })
      // save token, set auth state, etc.

      await new Promise((r) => setTimeout(r, 450)); // mock

      // Example: after success go dashboard
      nav("/dashboard");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
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

    // ✅ TODO: call backend password reset endpoint
    // await authApi.forgotPassword(fpEmail)

    await new Promise((r) => setTimeout(r, 400)); // mock
    setFpSent(true);
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Top minimal header */}
      {/* Top minimal header */}
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.85)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          {/* Left: Brand */}
          <Link to="/home" className="flex items-center gap-3">
            <div className="grid h-20 w-20 place-items-center rounded-2xl">
              <img
                src={logo}
                alt="Pharmly logo"
                className="h-20 w-20 object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="text-base font-extrabold tracking-tight">
                Pharmly
              </div>
              <div className="text-xs font-semibold text-[hsl(var(--foreground)/0.6)]">
                Pharmacy Management System
              </div>
            </div>
          </Link>

          {/* Right: Responsive actions */}
          <LoginHeaderActions isDark={isDark} toggleTheme={toggleTheme} />
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
            Sign in to manage medicines, sales, customers, suppliers, and
            reports.
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
                {/* Remember */}
                <label className="flex cursor-pointer items-center gap-2 text-sm font-extrabold text-[hsl(var(--foreground)/0.75)]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 accent-[hsl(var(--brand-strong))]"
                  />
                  Remember me
                </label>

                {/* Forgot */}
                <button
                  type="button"
                  onClick={openForgot}
                  className="text-sm font-extrabold text-[hsl(var(--brand-strong))] hover:opacity-80"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* <button
              type="submit"
              disabled={loading}
              className={cx(
                "mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold shadow transition",
                loading
                  ? "bg-[hsl(var(--overlay)/0.08)] text-[hsl(var(--foreground)/0.6)]"
                  : "bg-[hsl(var(--brand-strong))] text-[hsl(var(--brand))] hover:opacity-90"
              )}
            >
              {loading ? "Signing in..." : "Login"}
              <ArrowRight className="h-4 w-4" />
            </button> */}

            <button
              type="button"
              onClick={() => nav("/dashboard")}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong))] px-4 py-3 text-sm font-extrabold text-[hsl(var(--brand))] shadow hover:opacity-90"
            >
              Login
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
              <div>
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
function LoginHeaderActions({ isDark, toggleTheme }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) setOpen(false); // sm+
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const close = () => setOpen(false);

  return (
    <div className="relative flex items-center gap-2">
      {/* Desktop / Tablet actions */}
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

        <Link
          to="/signup"
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-extrabold text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
        >
          Create Account
        </Link>
      </div>

      {/* Mobile actions */}
      <div className="flex items-center gap-2 sm:hidden">
        {/* icon-only theme */}
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
          aria-label="Toggle theme"
          title={isDark ? "Switch to light" : "Switch to dark"}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* menu */}
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
          {/* click-away backdrop */}
          <button
            type="button"
            onClick={close}
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close menu backdrop"
          />

          <div className="absolute right-0 top-12 z-50 w-[240px] overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-lg">
            <div className="p-2">
              <Link
                to="/home"
                onClick={close}
                className="block rounded-2xl px-4 py-3 text-sm font-extrabold text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
              >
                Home
              </Link>

              <Link
                to="/signup"
                onClick={close}
                className="mt-2 flex items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 text-sm font-extrabold text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
              >
                Create Account
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
