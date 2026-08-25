"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  GitGraphIcon,
  ClipboardListIcon,
  GraduationCapIcon,
  PlugZapIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Role } from "@/types/auth";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboardIcon,
    roles: ["ADMIN", "LECTURER", "STUDENT"],
  },
  {
    title: "Traceability Graph",
    href: "/graph",
    icon: GitGraphIcon,
    roles: ["LECTURER", "STUDENT"],
  },
  {
    title: "Jira Tasks",
    href: "/tasks",
    icon: ClipboardListIcon,
    roles: ["LECTURER", "STUDENT"],
  },
  {
    title: "Assessment",
    href: "/assessment",
    icon: GraduationCapIcon,
    roles: ["LECTURER", "STUDENT"],
  },
  {
    title: "Integrations",
    href: "/integrations",
    icon: PlugZapIcon,
    roles: ["ADMIN"],
  },
  {
    title: "System Settings",
    href: "/settings",
    icon: SettingsIcon,
    roles: ["ADMIN"],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const role = user?.role ?? "STUDENT";

  const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 border-b border-sidebar-border shrink-0 px-4",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <GitGraphIcon className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-bold text-sidebar-foreground text-lg tracking-tight">
            SAGA
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 justify-center w-full",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  render={<Link href={item.href} />}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-all duration-150 shadow-sm z-10"
        aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
      >
        {collapsed ? (
          <ChevronRightIcon className="w-3 h-3" />
        ) : (
          <ChevronLeftIcon className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
