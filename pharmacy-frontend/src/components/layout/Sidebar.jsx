import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/Logo.png";
import {
  Home,
  Pill,
  ShoppingCart,
  BarChart3,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { useEffect, useMemo, useState } from "react";
import api from "../../api/client"; // ✅ axios client with Authorization header

const cx = (...a) => a.filter(Boolean).join(" ");

const LS_THEME = "pharmly_theme"; // light | dark | system
const LS_PALETTE = "pharmly_palette"; // palette key (optional)

// theme apply helpers (same as Settings)
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

export default function Sidebar() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  // current user
  const [me, setMe] = useState(null);
  const role = me?.role || null;

  // theme state (for the button label only)
  const [themeMode, setThemeMode] = useState(
    localStorage.getItem(LS_THEME) || "system",
  );

  // ✅ load profile
  useEffect(() => {
    let mounted = true;

    async function loadMe() {
      try {
        const res = await api.get("/api/users/me");
        if (!mounted) return;
        setMe(res?.data?.data || null);

        // apply saved prefs from DB (first priority)
        const t = res?.data?.data?.theme_mode || "system";
        const p = res?.data?.data?.palette_key || "indigo-sky";

        localStorage.setItem(LS_THEME, t);
        localStorage.setItem(LS_PALETTE, p);

        setThemeMode(t);
        applyTheme(t);
      } catch (e) {
        // if token expired / invalid -> force logout
        const code = e?.response?.status;
        if (code === 401 || code === 403) {
          localStorage.removeItem("pharmly_token");
          navigate("/login", { replace: true });
        }
      }
    }

    loadMe();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  // ✅ close sidebar when screen becomes desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navSections = useMemo(() => {
    const base = [
      {
        title: "Overview",
        items: [{ to: "/dashboard", label: "Dashboard", icon: Home }],
      },
      {
        title: "Pharmacy",
        items: [
          { to: "/medicines", label: "Medicines", icon: Pill },
          { to: "/sales", label: "Sales / POS", icon: ShoppingCart },
        ],
      },
      {
        title: "System",
        items: [{ to: "/settings", label: "Settings", icon: Settings }],
      },
    ];

    // admin-only Insights
    if (role === "admin") {
      base.splice(2, 0, {
        title: "Insights",
        items: [{ to: "/reports", label: "Reports", icon: BarChart3 }],
      });
    }

    return base;
  }, [role]);

  const closeOnMobile = () => {
    if (window.innerWidth < 1024) setOpen(false);
  };

  async function savePreferences(nextThemeMode) {
    try {
      await api.patch("/api/users/me/preferences", {
        theme_mode: nextThemeMode,
        palette_key: localStorage.getItem(LS_PALETTE) || "indigo-sky",
      });
    } catch {
      // ignore — UI still works even if server fails
    }
  }

  // ✅ theme button cycles: system -> dark -> light -> system
  const cycleTheme = async () => {
    const order = ["system", "dark", "light"];
    const idx = order.indexOf(themeMode);
    const next = order[(idx + 1) % order.length];

    setThemeMode(next);
    localStorage.setItem(LS_THEME, next);
    applyTheme(next);

    await savePreferences(next);
  };

  const logout = () => {
    // ✅ REAL logout
    localStorage.removeItem("pharmly_token");
    // optional: also clear preferences cache if you want
    // localStorage.removeItem(LS_THEME);
    // localStorage.removeItem(LS_PALETTE);

    closeOnMobile();
    navigate("/login", { replace: true });
  };

  const displayName = me?.full_name || "User";
  const displayEmail = me?.email || "";

  return (
    <>
      {/* Mobile open button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.85)] text-[hsl(var(--foreground))] shadow-sm backdrop-blur lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close sidebar backdrop"
        />
      )}

      <aside
        className={[
          "fixed left-0 top-0 z-50 h-dvh w-72",
          "flex flex-col border-r border-white/10 bg-[hsl(var(--brand))] px-4 pb-10 text-white",
          "overflow-hidden transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:z-40",
        ].join(" ")}
      >
        {/* Mobile close button */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Header */}
        <div className="px-5 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl shadow">
              <img
                src={logo}
                alt="Pharmio logo"
                className="h-14 w-14 object-contain"
              />
            </div>

            <div>
              <div className="text-base font-extrabold tracking-tight text-white">
                Pharmio
              </div>
              <div className="text-xs font-medium text-white/60">
                Pharmacy Management System
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <Separator className="bg-white/10" />
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4">
          {navSections.map((section) => (
            <div key={section.title} className="mb-5">
              <div className="px-3 pb-2 text-[11px] font-extrabold uppercase tracking-widest text-white/45">
                {section.title}
              </div>

              <div className="space-y-1">
                {section.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={closeOnMobile}
                    className={({ isActive }) =>
                      cx(
                        "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition tracking-tight",
                        isActive
                          ? "bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))]"
                          : "text-white/80 hover:bg-white/10 hover:text-white",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={cx(
                            "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full transition",
                            isActive
                              ? "bg-[hsl(var(--brand-strong))]"
                              : "bg-transparent",
                          )}
                        />
                        <Icon
                          className={cx(
                            "h-4 w-4 transition",
                            isActive
                              ? "text-[hsl(var(--brand-strong))]"
                              : "text-white/85 group-hover:text-white",
                          )}
                        />
                        <span className="font-semibold">{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-4">
          <Separator className="bg-white/10" />
        </div>

        {/* Footer */}
        <div className="px-4 pb-5">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full border border-white/10 bg-white/10" />
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold tracking-tight text-white">
                  {displayName}
                </div>
                <div className="truncate text-xs font-medium text-white/60">
                  {displayEmail}
                </div>
                {role ? (
                  <div className="mt-1 text-[11px] font-extrabold uppercase tracking-widest text-white/50">
                    {role}
                  </div>
                ) : null}
              </div>
            </div>

            {/* actions */}
            {/* actions */}
            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={cycleTheme}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold tracking-tight text-white hover:bg-white/10"
                aria-label="Cycle theme"
                title="System → Dark → Light"
              >
                {themeMode === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                Theme
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--brand-strong))] px-3 py-2 text-xs font-extrabold tracking-tight text-[hsl(var(--brand))] shadow hover:opacity-90"
              >
                Logout
              </button>

              {/* ✅ Home button below Logout (same div) */}
              <button
                type="button"
                onClick={() => {
                  closeOnMobile();
                  navigate("/home"); // change to "/" if your home route is "/"
                }}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold tracking-tight text-white hover:bg-white/10"
              >
                <Home className="h-4 w-4" />
                Home
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
