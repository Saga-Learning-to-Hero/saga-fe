"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  GitGraphIcon,
  ClipboardListIcon,
  GraduationCapIcon,
  UsersIcon,
  FolderKanbanIcon,
  DatabaseIcon,
  ScrollTextIcon,
  ClipboardCheckIcon,
  PieChartIcon,
  UserCogIcon,
  BookOpenIcon,
  KanbanSquareIcon,
  GitCommitIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { NAV_GROUPS } from "./nav-config";
import type { NavItem } from "./nav-config";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard: LayoutDashboardIcon,
  GitGraph: GitGraphIcon,
  ClipboardList: ClipboardListIcon,
  GraduationCap: GraduationCapIcon,
  Users: UsersIcon,
  FolderKanban: FolderKanbanIcon,
  Kanban: KanbanSquareIcon,
  Database: DatabaseIcon,
  ScrollText: ScrollTextIcon,
  ClipboardCheck: ClipboardCheckIcon,
  PieChart: PieChartIcon,
  UserCog: UserCogIcon,
  BookOpen: BookOpenIcon,
  GitCommit: GitCommitIcon,
};

interface SidebarNavProps {
  collapsed: boolean;
}

function NavLink({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href));

  const Icon = ICON_MAP[item.icon] ?? LayoutDashboardIcon;

  const linkCls = cn(
    "group flex items-center gap-3 rounded-lg text-sm font-medium",
    "transition-all duration-150 select-none",
    collapsed ? "justify-center p-2.5 w-full" : "px-3 py-2.5 w-full",
    isActive
      ? "bg-primary/10 text-primary font-semibold shadow-2xs"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={<Link href={item.href} />}
          className={linkCls}
        >
          <Icon
            className={cn(
              "w-4 h-4 shrink-0 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )}
          />
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link href={item.href} className={linkCls}>
      <Icon
        className={cn(
          "w-[18px] h-[18px] shrink-0 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      <span className="truncate">{item.title}</span>
    </Link>
  );
}

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const { user } = useAuthStore();
  const role = user?.role ?? "STUDENT";

  const visibleGroups = NAV_GROUPS.filter((g) => g.roles.includes(role));

  return (
    <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-2">
      {visibleGroups.map((group, gi) => (
        <div key={gi} className="space-y-1">
          {/* Section label */}
          {!collapsed && group.label && (
            <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 select-none">
              {group.label}
            </p>
          )}

          {/* Divider khi collapsed */}
          {collapsed && gi > 0 && group.label && (
            <div className="my-2 mx-2 h-px bg-border/60" />
          )}

          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.href}>
                <NavLink item={item} collapsed={collapsed} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
