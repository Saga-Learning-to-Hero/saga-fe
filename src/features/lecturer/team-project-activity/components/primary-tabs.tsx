"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { lecturerCourseTeamsPath } from "../lib/team-project-routes";

interface PrimaryTabsProps {
  courseId: string;
}

export function PrimaryTabs({ courseId }: PrimaryTabsProps) {
  const pathname = usePathname();
  const basePath = lecturerCourseTeamsPath(courseId);

  // Chỉ hiển thị tab dự án khi URL đã có teamId thực sự.
  // Segment "select" là màn hình trung gian, chưa đại diện cho một nhóm đã chọn.
  const nestedSegment = pathname.startsWith(`${basePath}/`)
    ? pathname.slice(`${basePath}/`.length).split("/")[0]
    : null;
  const hasSelectedTeam = Boolean(nestedSegment && nestedSegment !== "select");

  return (
    <nav className="flex items-center gap-6" aria-label="Điều hướng hoạt động nhóm">
      <Link 
        href={basePath}
        aria-current={!hasSelectedTeam ? "page" : undefined}
        className={cn(
          "pb-3 pt-4 text-sm font-bold border-b-2 transition-colors",
          !hasSelectedTeam
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        Danh sách lớp
      </Link>
      {hasSelectedTeam && (
        <Link
          href={pathname}
          aria-current="page"
          className="border-primary pb-3 pt-4 text-sm font-bold text-primary border-b-2 transition-colors"
        >
          Dự án nhóm
        </Link>
      )}
    </nav>
  );
}
