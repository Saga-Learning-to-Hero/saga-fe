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
  UserCheckIcon,
  SlidersHorizontalIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getLecturerCourseById } from "@/features/lecturer/courses/lib/course-repository";
import { getNavGroups, isNavItemActive } from "./nav-config";
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
  UserCheck: UserCheckIcon,
  SlidersHorizontal: SlidersHorizontalIcon,
  ArrowLeft: ArrowLeftIcon,
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
  const isActive = isNavItemActive(pathname, item);
  const isBackButton = item.icon === "ArrowLeft";

  const Icon = ICON_MAP[item.icon] ?? LayoutDashboardIcon;

  const linkCls = cn(
    "group flex items-center gap-3 rounded-lg text-sm font-medium",
    "transition-all duration-150 select-none",
    collapsed ? "justify-center p-2.5 w-full" : "px-3 py-2.5 w-full",
    isBackButton
      ? "text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-dashed border-border/80 mb-1.5"
      : isActive
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
              isBackButton ? "text-muted-foreground group-hover:text-foreground" : isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
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
          isBackButton ? "text-muted-foreground group-hover:text-foreground" : isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      <span className="truncate">{item.title}</span>
    </Link>
  );
}

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const { user, selectedCourse } = useAuthStore();
  const role = user?.role ?? "STUDENT";
  const pathname = usePathname();

  // Trích xuất courseId từ pathname (chỉ cho Lecturer)
  const courseMatch = pathname.match(/^\/lecturer\/courses\/([^/]+)(?:\/|$)/);
  const courseId = courseMatch ? decodeURIComponent(courseMatch[1]) : null;

  // Lấy courseCode từ mock data (nếu đang trong context lớp)
  const course = courseId ? getLecturerCourseById(courseId) : null;
  const courseCode = course?.code;

  // Xây dựng navigation theo context — không trộn global + course
  const navGroups = getNavGroups(role, courseId, courseCode, pathname, selectedCourse);

  return (
    <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-2">
      {navGroups.map((group, gi) => (
        <div key={group.id} className="space-y-1">
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
              <li key={item.id}>
                <NavLink item={item} collapsed={collapsed} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
