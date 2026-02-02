// src/pages/auth/signup.jsx
import React, { useMemo, useState, useEffect } from "react";
import { authApi } from "../api/authApi";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import {
  Pill,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Check,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";

const cx = (...a) => a.filter(Boolean).join(" ");

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}
function isPhone(v) {
  const s = String(v || "").replace(/\s/g, "");
  return s.length >= 7; // simple check
}

export default function Signup() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const systemDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)",
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

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [agree, setAgree] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    if (!fullName.trim()) return false;
    if (!isEmail(email)) return false;
    if (!password || password.length < 6) return false;
    if (!agree) return false;
    return true;
  }, [fullName, email, password, agree]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Please fill all required fields correctly.");
      return;
    }

    setLoading(true);
    try {
      await authApi.signup({ fullName, email, password });
      nav("/login");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Signup failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
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
          <SignupHeaderActions isDark={isDark} toggleTheme={toggleTheme} />
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-5 py-10 md:grid-cols-2 md:items-start">
        {/* Left info */}
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-7 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--brand-strong)/0.15)] px-3 py-2 text-xs font-extrabold text-[hsl(var(--brand-strong))]">
            <ShieldCheck className="h-4 w-4" />
            Create your account
          </div>

          <div className="mt-4 text-3xl font-extrabold tracking-tight">
            Start managing your pharmacy
          </div>
          <div className="mt-2 text-sm font-medium text-[hsl(var(--foreground)/0.65)]">
            Setup your account, then login to access the dashboard and modules.
          </div>

          <div className="mt-6 space-y-3">
            <Bullet text="Add medicines and track stock" />
            <Bullet text="Sell using POS and keep history" />
            <Bullet text="Save customers and suppliers" />
            <Bullet text="View reports and change theme" />
          </div>
        </div>

        {/* Right form */}
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-7 shadow-sm">
          <div className="text-2xl font-extrabold tracking-tight">Sign up</div>
          <div className="mt-1 text-sm font-medium text-[hsl(var(--foreground)/0.6)]">
            Fill in your details to create an account
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--overlay)/0.06)] p-3 text-sm font-semibold text-[hsl(var(--foreground)/0.8)]">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            {/* Name */}
            <Field
              label="Full name"
              icon={User}
              value={fullName}
              onChange={setFullName}
              placeholder="Your name"
              autoComplete="name"
            />

            {/* Email */}
            <Field
              label="Email"
              icon={Mail}
              value={email}
              onChange={setEmail}
              placeholder="admin@pharmacy.com"
              autoComplete="email"
            />

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
                  placeholder="Min 6 characters"
                  type={showPass ? "text" : "password"}
                  className="w-full bg-transparent text-sm font-semibold text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--foreground)/0.35)]"
                  autoComplete="new-password"
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
            </div>

            {/* Agree */}
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[hsl(var(--brand-strong))]"
              />
              <div className="text-sm font-semibold text-[hsl(var(--foreground)/0.75)]">
                I agree to the{" "}
                <span className="font-extrabold text-[hsl(var(--brand-strong))]">
                  Terms
                </span>{" "}
                and{" "}
                <span className="font-extrabold text-[hsl(var(--brand-strong))]">
                  Privacy Policy
                </span>
                .
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className={cx(
                "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold shadow transition",
                loading
                  ? "bg-[hsl(var(--overlay)/0.08)] text-[hsl(var(--foreground)/0.6)]"
                  : "bg-[hsl(var(--brand-strong))] text-[hsl(var(--brand))] hover:opacity-90",
              )}
            >
              {loading ? "Creating..." : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-center text-sm font-semibold text-[hsl(var(--foreground)/0.65)]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-extrabold text-[hsl(var(--brand-strong))] hover:opacity-80"
              >
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  autoComplete,
}) {
  return (
    <div>
      <label className="text-xs font-extrabold uppercase tracking-widest text-[hsl(var(--foreground)/0.55)]">
        {label}
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3">
        <Icon className="h-4 w-4 text-[hsl(var(--foreground)/0.55)]" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-semibold text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--foreground)/0.35)]"
          autoComplete={autoComplete}
        />
      </div>
    </div>
  );
}

function Bullet({ text }) {
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
function SignupHeaderActions({ isDark, toggleTheme }) {
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
          to="/login"
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-extrabold text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
        >
          Login
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
                to="/login"
                onClick={close}
                className="mt-2 flex items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 text-sm font-extrabold text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--overlay)/0.06)]"
              >
                Login
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
