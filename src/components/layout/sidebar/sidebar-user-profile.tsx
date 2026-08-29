"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AccountMenu } from "@/components/layout/account/account-menu";

interface Props {
  collapsed: boolean;
}

export function SidebarUserProfile({ collapsed }: Props) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("saga-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      document.documentElement.classList.add("dark");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("saga-theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("saga-theme", "dark");
    }
    setIsDark((v) => !v);
  };

  return (
    <div className="border-t border-sidebar-border p-3 space-y-2 shrink-0">
      {/* ── Nút chuyển Theme trực tiếp ── */}
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger
            onClick={toggleTheme}
            className="flex items-center justify-center w-full rounded-xl p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            aria-label="Đổi giao diện sáng/tối"
          >
            {isDark ? (
              <SunIcon className="w-4 h-4 text-amber-500" />
            ) : (
              <MoonIcon className="w-4 h-4" />
            )}
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {isDark ? "Giao diện sáng" : "Giao diện tối"}
          </TooltipContent>
        </Tooltip>
      ) : (
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-150 cursor-pointer border border-transparent hover:border-border/40"
        >
          <span className="flex items-center gap-2.5">
            {isDark ? (
              <SunIcon className="w-4 h-4 text-amber-500" />
            ) : (
              <MoonIcon className="w-4 h-4 text-muted-foreground" />
            )}
            Giao diện
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-muted/90 text-foreground/80 font-medium">
            {isDark ? "Tối" : "Sáng"}
          </span>
        </button>
      )}

      {/* ── User Profile Card ── */}
      <AccountMenu
        variant="sidebar"
        collapsed={collapsed}
        dropdownSide="right"
        dropdownAlign="end"
      />
    </div>
  );
}
