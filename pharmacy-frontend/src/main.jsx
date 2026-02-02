import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// main.jsx (top of file, before ReactDOM.createRoot)
const LS_THEME = "pharmly_theme";
const LS_PALETTE = "pharmly_palette";

const PALETTES = {
  "indigo-sky": {
    brand: "230 48% 32%",
    soft: "210 90% 96%",
    strong: "215 85% 60%",
  },
  "emerald-lime": {
    brand: "164 78% 18%",
    soft: "84 90% 88%",
    strong: "84 90% 60%",
  },
  "violet-pink": {
    brand: "262 55% 35%",
    soft: "300 60% 94%",
    strong: "318 85% 70%",
  },
  "slate-cyan": {
    brand: "215 28% 24%",
    soft: "195 65% 94%",
    strong: "190 95% 55%",
  },
  "amber-orange": {
    brand: "26 86% 24%",
    soft: "45 100% 94%",
    strong: "32 95% 58%",
  },
};

const root = document.documentElement;

const savedTheme = localStorage.getItem(LS_THEME) || "system";
const savedPalette = localStorage.getItem(LS_PALETTE) || "indigo-sky";

// theme
if (savedTheme === "dark") root.classList.add("dark");
if (savedTheme === "light") root.classList.remove("dark");
if (savedTheme === "system") {
  root.classList.toggle(
    "dark",
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

// palette
const pal = PALETTES[savedPalette] || PALETTES["indigo-sky"];
root.style.setProperty("--brand", pal.brand);
root.style.setProperty("--brand-soft", pal.soft);
root.style.setProperty("--brand-strong", pal.strong);
