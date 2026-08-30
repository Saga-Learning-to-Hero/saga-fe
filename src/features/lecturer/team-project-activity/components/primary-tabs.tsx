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
  
  // If the path exactly matches basePath, we are in "Danh sách lớp"
  // If the path contains basePath + "/something", we are in "Dự án nhóm"
  const isProjectActive = pathname !== basePath && pathname.startsWith(basePath);

  return (
    <div className="flex items-center gap-6">
      <Link 
        href={basePath}
        className={cn(
          "pb-3 pt-4 text-sm font-bold border-b-2 transition-colors",
          !isProjectActive 
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        Danh sách lớp
      </Link>
      <Link 
        href={`${basePath}/select`}
        className={cn(
          "pb-3 pt-4 text-sm font-bold border-b-2 transition-colors",
          isProjectActive 
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        Dự án nhóm
      </Link>
    </div>
  );
}
