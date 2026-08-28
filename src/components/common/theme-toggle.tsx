"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const savedTheme = localStorage.getItem("saga-theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      }
    }
  }, []);

  const toggle = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("saga-theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("saga-theme", "dark");
      setIsDark(true);
    }
  };

  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg border border-border/80 bg-background" />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      className="w-9 h-9 rounded-lg border border-border/80 bg-background/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all cursor-pointer shadow-2xs"
    >
      {isDark ? (
        <SunIcon className="w-4 h-4 text-amber-500 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <MoonIcon className="w-4 h-4 text-indigo-500 transition-transform duration-200 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
