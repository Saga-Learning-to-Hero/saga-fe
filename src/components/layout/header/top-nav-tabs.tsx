"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  GitGraphIcon,
  UsersIcon,
  FolderKanbanIcon,
  ScrollTextIcon,
  PieChartIcon,
  BookOpenIcon,
  KanbanSquareIcon,
  GitCommitIcon,
  UserCheckIcon,
  SlidersHorizontalIcon,
  DatabaseIcon,
  UserCogIcon,
  Link2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isNavItemActive } from "@/components/layout/sidebar/nav-config";
import type { NavItem } from "@/components/layout/sidebar/nav-config";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard: LayoutDashboardIcon,
  GitGraph: GitGraphIcon,
  Users: UsersIcon,
  FolderKanban: FolderKanbanIcon,
  Kanban: KanbanSquareIcon,
  ScrollText: ScrollTextIcon,
  PieChart: PieChartIcon,
  BookOpen: BookOpenIcon,
  GitCommit: GitCommitIcon,
  UserCheck: UserCheckIcon,
  SlidersHorizontal: SlidersHorizontalIcon,
  Database: DatabaseIcon,
  UserCog: UserCogIcon,
  Link2: Link2Icon,
};

interface TopNavTabsProps {
  items: NavItem[];
}

export function TopNavTabs({ items }: TopNavTabsProps) {
  const pathname = usePathname();

  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Thanh điều hướng phân hệ học phần"
      className="flex items-center gap-1 overflow-x-auto px-4 sm:px-6 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]"
    >
      {items.map((item) => {
        const isActive = isNavItemActive(pathname, item);
        const Icon = ICON_MAP[item.icon] ?? LayoutDashboardIcon;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "group relative inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 select-none",
              isActive
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-t-lg"
            )}
          >
            <Icon
              className={cn(
                "size-3.5 shrink-0 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            <span>{item.title}</span>

            {item.badge && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono leading-none font-bold",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {item.badge}
              </span>
            )}

            {/* Thanh Underline Active Indicator theo phong cách Linear/GitHub */}
            {isActive && (
              <span className="absolute inset-x-1 -bottom-[1px] h-[2.5px] rounded-t-full bg-primary shadow-xs" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
