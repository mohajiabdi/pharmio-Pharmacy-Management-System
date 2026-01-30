import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/Logo.png";
import {
  Home,
  Pill,
  ShoppingCart,
  Users,
  Truck,
  BarChart3,
  Settings,
  Plus,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { useEffect, useState } from "react";

const navSections = [
  {
    title: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: Home }],
  },
  {
    title: "Pharmacy",
    items: [
      { to: "/medicines", label: "Medicines", icon: Pill },
      { to: "/sales", label: "Sales / POS", icon: ShoppingCart },
      { to: "/Customers", label: "Customers", icon: Users },
      { to: "/suppliers", label: "Suppliers", icon: Truck },
    ],
  },
  {
    title: "Insights",
    items: [{ to: "/reports", label: "Reports", icon: BarChart3 }],
  },
  {
    title: "System",
    items: [{ to: "/settings", label: "Settings", icon: Settings }],
  },
];

function SideLink({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition tracking-tight",
          isActive
            ? "bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))]"
            : "text-white/80 hover:bg-white/10 hover:text-white",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full transition ${
              isActive ? "bg-[hsl(var(--brand-strong))]" : "bg-transparent"
            }`}
          />

          <Icon
            className={`h-4 w-4 transition ${
              isActive
                ? "text-[hsl(var(--brand-strong))]"
                : "text-white/85 group-hover:text-white"
            }`}
          />

          <span className="font-semibold">{label}</span>
        </>
      )}
    </NavLink>
  );
}
export default function Sidebar() {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(false);
  const [open, setOpen] = useState(false); // ✅ mobile drawer

  // ✅ apply theme on first load: localStorage > system preference
  useEffect(() => {
    const saved = localStorage.getItem("theme"); // "dark" | "light" | null
    const systemDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;

    const shouldBeDark = saved ? saved === "dark" : systemDark;
    document.documentElement.classList.toggle("dark", shouldBeDark);
    setIsDark(shouldBeDark);
  }, []);

  // ✅ close sidebar when screen becomes desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false); // lg+
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ✅ toggle handler
  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  };

  // ✅ close on navigation (mobile)
  const closeOnMobile = () => {
    if (window.innerWidth < 1024) setOpen(false);
  };

  return (
    <>
      {/* ✅ Mobile/Tablet hamburger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.85)] text-[hsl(var(--foreground))] shadow-sm backdrop-blur lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* ✅ Backdrop (mobile/tablet only) */}
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
          // base
          "fixed left-0 top-0 z-50 h-dvh w-72",
          "flex flex-col border-r border-white/10 bg-[hsl(var(--brand))] px-4 pb-10 text-white",
          "overflow-hidden",
          // responsive slide
          "transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:z-40", // desktop always visible
        ].join(" ")}
      >
        {/* ✅ Mobile close button */}
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
            <div className="flex h-20 w-30 items-center justify-center rounded-xl text-[hsl(var(--brand))] shadow">
              <img
                src={logo}
                alt="Pharmly logo"
                className="h-30 w-30 object-contain"
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

        <div className="lg:px-5 lg:py-4">
          {/* <Separator className="bg-white/10" /> */}
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
                      [
                        "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition tracking-tight",
                        isActive
                          ? "bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))]"
                          : "text-white/80 hover:bg-white/10 hover:text-white",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full transition ${
                            isActive
                              ? "bg-[hsl(var(--brand-strong))]"
                              : "bg-transparent"
                          }`}
                        />

                        <Icon
                          className={`h-4 w-4 transition ${
                            isActive
                              ? "text-[hsl(var(--brand-strong))]"
                              : "text-white/85 group-hover:text-white"
                          }`}
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
                  Admin User
                </div>
                <div className="truncate text-xs font-medium text-white/60">
                  admin@pharmacy.local
                </div>
              </div>
            </div>

            {/* actions */}
            <div className="mt-3 flex gap-2">
              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold tracking-tight text-white hover:bg-white/10"
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

              {/* Logout -> go Home */}
              <button
                type="button"
                onClick={() => {
                  closeOnMobile();
                  navigate("/home");
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--brand-strong))] px-3 py-2 text-xs font-extrabold tracking-tight text-[hsl(var(--brand))] shadow hover:opacity-90"
              >
                Logout
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                closeOnMobile();
                navigate("/home");
              }}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold tracking-tight text-white hover:bg-white/10"
            >
              Home
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
