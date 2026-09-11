"use client";

import { useEffect, useRef } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { isNavItemActive } from "@/components/layout/sidebar/nav-config";
import type { NavItem } from "@/components/layout/sidebar/nav-config";
import { LecturerCourseService } from "@/features/lecturer/courses/api/lecturer-course-service";
import { LecturerTeamService } from "@/features/lecturer/teams/api/lecturer-team-service";
import { LecturerWeightsService } from "@/features/lecturer/contribution/api/lecturer-weights-service";
import { LECTURER_COURSE_QUERY_KEYS } from "@/features/lecturer/courses/hooks/use-lecturer-courses";
import { LECTURER_TEAM_QUERY_KEYS } from "@/features/lecturer/teams/hooks/use-lecturer-teams";
import { CONTRIBUTION_QUERY_KEYS } from "@/features/lecturer/contribution/hooks/use-lecturer-contribution";

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
          <TopNavTabLink key={item.id} item={item} isActive={isActive} Icon={Icon} />
        );
      })}
    </nav>
  );
}
function TopNavTabLink({
  item,
  isActive,
  Icon,
}: {
  item: NavItem;
  isActive: boolean;
  Icon: React.ElementType;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isActive) return;
    linkRef.current?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
  }, [isActive]);

  const handleMouseEnter = () => {
    const courseMatch = item.href.match(/^\/lecturer\/courses\/([^/]+)/);
    if (!courseMatch) return;
    const courseId = decodeURIComponent(courseMatch[1]);

    if (item.href.includes("/teams")) {
      void queryClient.prefetchQuery({
        queryKey: LECTURER_COURSE_QUERY_KEYS.lecturerRoster(courseId),
        queryFn: () => LecturerCourseService.getRoster(courseId),
        staleTime: 1000 * 60 * 3,
      });
      void queryClient.prefetchQuery({
        queryKey: LECTURER_TEAM_QUERY_KEYS.lecturerTeams(courseId),
        queryFn: () => LecturerTeamService.getTeams(courseId),
        staleTime: 1000 * 60 * 3,
      });
    } else if (item.href.includes("/contribution-configuration")) {
      void queryClient.prefetchQuery({
        queryKey: CONTRIBUTION_QUERY_KEYS.sliceWeights(courseId),
        queryFn: () => LecturerWeightsService.getSliceWeights(courseId),
        staleTime: 1000 * 60 * 3,
      });
      void queryClient.prefetchQuery({
        queryKey: CONTRIBUTION_QUERY_KEYS.teamWeights(courseId),
        queryFn: () => LecturerWeightsService.getTeamWeights(courseId),
        staleTime: 1000 * 60 * 3,
      });
    } else if (item.href.includes("/dashboard")) {
      void queryClient.prefetchQuery({
        queryKey: LECTURER_COURSE_QUERY_KEYS.lecturerCourse(courseId),
        queryFn: () => LecturerCourseService.getCourseById(courseId),
        staleTime: 1000 * 60 * 5,
      });
      void queryClient.prefetchQuery({
        queryKey: LECTURER_COURSE_QUERY_KEYS.lecturerRoster(courseId),
        queryFn: () => LecturerCourseService.getRoster(courseId),
        staleTime: 1000 * 60 * 3,
      });
      void queryClient.prefetchQuery({
        queryKey: LECTURER_TEAM_QUERY_KEYS.lecturerTeams(courseId),
        queryFn: () => LecturerTeamService.getTeams(courseId),
        staleTime: 1000 * 60 * 3,
      });
      void queryClient.prefetchQuery({
        queryKey: CONTRIBUTION_QUERY_KEYS.teamWeights(courseId),
        queryFn: () => LecturerWeightsService.getTeamWeights(courseId),
        staleTime: 1000 * 60 * 3,
      });
    }
  };

  return (
    <Link
      ref={linkRef}
      href={item.href}
      prefetch={true}
      onMouseEnter={handleMouseEnter}
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

      {isActive && (
        <span className="absolute inset-x-1 -bottom-[1px] h-[2.5px] rounded-t-full bg-primary shadow-xs" />
      )}
    </Link>
  );
}
