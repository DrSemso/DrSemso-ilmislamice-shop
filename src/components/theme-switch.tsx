"use client";

import { Moon, Sun } from "lucide-react";
import { THEME_KEY } from "@/lib/theme-script";

// Light/dark toggle. The icon shown is decided by CSS from html[data-theme], so it is right before hydration.
export function ThemeSwitch({ className = "" }: { className?: string }) {
  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  }
  return (
    <button type="button" onClick={toggle} aria-label="Svijetla ili tamna tema" title="Svijetla / tamna tema" className={`grid h-7 w-7 place-items-center opacity-80 hover:opacity-100 ${className}`}>
      <Moon size={15} className="theme-moon" />
      <Sun size={15} className="theme-sun" />
    </button>
  );
}
