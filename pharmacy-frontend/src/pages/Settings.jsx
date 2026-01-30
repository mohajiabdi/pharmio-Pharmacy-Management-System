// settings.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Moon, Sun, Palette, Check, Monitor } from "lucide-react";

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

const LS_THEME = "pharmly_theme"; // "light" | "dark" | "system"
const LS_PALETTE = "pharmly_palette"; // palette key

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
      "(prefers-color-scheme: dark)"
    ).matches;
    root.classList.toggle("dark", prefersDark);
  }
}

export default function Settings() {
  const [ready, setReady] = useState(false);

  const [theme, setTheme] = useState("system");
  const [paletteKey, setPaletteKey] = useState("indigo-sky");

  const selectedPalette = useMemo(
    () => PALETTES.find((p) => p.key === paletteKey) || PALETTES[0],
    [paletteKey]
  );

  // ✅ Load once + apply immediately (prevents reset/flash)
  useEffect(() => {
    const savedTheme = localStorage.getItem(LS_THEME) || "system";
    const savedPalette = localStorage.getItem(LS_PALETTE) || "indigo-sky";

    setTheme(savedTheme);
    setPaletteKey(savedPalette);

    applyTheme(savedTheme);
    setBrandVars(PALETTES.find((p) => p.key === savedPalette) || PALETTES[0]);

    setReady(true);
  }, []);

  // ✅ Apply theme only after ready
  useEffect(() => {
    if (!ready) return;

    localStorage.setItem(LS_THEME, theme);
    applyTheme(theme);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => theme === "system" && applyTheme("system");

    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [theme, ready]);

  // ✅ Apply palette only after ready
  useEffect(() => {
    if (!ready) return;

    localStorage.setItem(LS_PALETTE, paletteKey);
    setBrandVars(selectedPalette);
  }, [paletteKey, selectedPalette, ready]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-extrabold tracking-tight">Settings</div>
          <div className="text-sm font-medium text-[hsl(var(--foreground))]/60">
            Theme, appearance, and brand colors
          </div>
        </div>
      </div>

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
                  : "border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--foreground))]/5"
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
          : "border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--foreground))]/5"
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
