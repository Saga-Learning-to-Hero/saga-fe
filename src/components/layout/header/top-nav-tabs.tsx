"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
  SparklesIcon,
  AlertCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isNavItemActive } from "@/components/layout/sidebar/nav-config";
import type { NavItem } from "@/components/layout/sidebar/nav-config";
import { usePrefetchLecturerCourse } from "@/features/lecturer/courses/hooks/use-lecturer-courses";
import {
  usePrefetchStudentTeam,
  STUDENT_COURSE_QUERY_KEYS,
} from "@/features/student/courses/hooks/use-student-courses";
import { usePrefetchProjectProjection } from "@/features/student/project/hooks/useProjectSync";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { studentCoursePath } from "@/features/student/courses/hooks/use-student-course-context";
import type { StudentCourseResponse } from "@/features/student/courses/types/student-course";
import { usePrefetchContributionEvaluation } from "@/features/lecturer/contribution/hooks/use-lecturer-contribution";
import { usePrefetchLecturerPeerReviews } from "@/features/lecturer/peer-review/hooks/use-lecturer-peer-review";

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
  Sparkles: SparklesIcon,
  AlertCircle: AlertCircleIcon,
};

interface TopNavTabsProps {
  items: NavItem[];
}

export function TopNavTabs({ items }: TopNavTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const studentCourseId = searchParams.get("courseId")?.trim() || "";

  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Thanh điều hướng phân hệ học phần"
      className="flex items-center gap-1.5 overflow-x-auto px-4 sm:px-6 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] py-2"
    >
      {items.map((item) => {
        const isActive = isNavItemActive(pathname, item);
        const Icon = ICON_MAP[item.icon] ?? LayoutDashboardIcon;

        return (
          <TopNavTabLink
            key={item.id}
            item={item}
            href={
              user?.role === "STUDENT"
                ? studentCourseId
                  ? studentCoursePath(item.href, studentCourseId)
                  : "/student/courses"
                : item.href
            }
            isActive={isActive}
            Icon={Icon}
            studentCourseId={studentCourseId}
          />
        );
      })}
    </nav>
  );
}

function TopNavTabLink({
  item,
  href,
  isActive,
  Icon,
  studentCourseId,
}: {
  item: NavItem;
  href: string;
  isActive: boolean;
  Icon: React.ElementType;
  studentCourseId?: string;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const prefetchLecturerCourse = usePrefetchLecturerCourse();
  const prefetchStudentTeam = usePrefetchStudentTeam();
  const prefetchProjectProjection = usePrefetchProjectProjection();
  const prefetchContributionEvaluation = usePrefetchContributionEvaluation();
  const prefetchLecturerPeerReviews = usePrefetchLecturerPeerReviews();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isActive) return;
    linkRef.current?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
  }, [isActive]);

  const handleMouseEnter = () => {
    const courseMatch = item.href.match(/^\/lecturer\/courses\/([^/]+)/);
    if (courseMatch) {
      const courseId = decodeURIComponent(courseMatch[1]);
      prefetchLecturerCourse(courseId);
      if (item.id === "course-peer-reviews") {
        prefetchLecturerPeerReviews(courseId);
      }
      return;
    }
    if (studentCourseId) {
      prefetchStudentTeam(studentCourseId);
      const cachedTeam = queryClient.getQueryData<{
        projectId?: string | null;
        teamId?: string | null;
      }>(STUDENT_COURSE_QUERY_KEYS.studentMyTeam(studentCourseId));
      const cachedCourses = queryClient.getQueryData<StudentCourseResponse[]>(
        STUDENT_COURSE_QUERY_KEYS.studentCourses
      );
      const matchedCourse = cachedCourses?.find((c) => c.courseId === studentCourseId);
      const projectId = cachedTeam?.projectId || matchedCourse?.projectId;
      const teamId = cachedTeam?.teamId || matchedCourse?.teamId;

      if (item.href === "/student/dashboard" || item.href === "/student") {
        prefetchProjectProjection(projectId, {
          courseId: studentCourseId,
          includeCommits: Boolean(projectId),
          includeTeamProgress: true,
        });
      } else if (item.href === "/student/contribution") {
        if (teamId) {
          prefetchContributionEvaluation(teamId);
        }
      } else if (item.href === "/student/commits") {
        prefetchProjectProjection(projectId, {
          courseId: studentCourseId,
          includeCommits: Boolean(projectId),
        });
      } else if (projectId) {
        prefetchProjectProjection(projectId, {
          courseId: studentCourseId,
          includeTeamProgress: true,
        });
      }
    }
  };

  return (
    <Link
      ref={linkRef}
      href={href}
      prefetch={true}
      onMouseEnter={handleMouseEnter}
      className={cn(
        "group relative inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-bold whitespace-nowrap transition-all duration-300 shrink-0 select-none rounded-full border",
        isActive
          ? "bg-primary text-primary-foreground border-primary shadow-md"
          : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      <span>{item.title}</span>

      {item.badge && (
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-mono leading-none font-extrabold",
            isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}
