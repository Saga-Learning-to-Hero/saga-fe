"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { lecturerCourseTeamPath } from "../../lib/team-project-routes";

interface ProjectTabsProps {
  courseId: string;
  teamId: string;
  activeTab: string;
}

export function ProjectTabs({ courseId, teamId, activeTab }: ProjectTabsProps) {
  const basePath = lecturerCourseTeamPath(courseId, teamId);
  
  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "github", label: "Commit GitHub" },
    { id: "kanban", label: "Jira Kanban" },
    { id: "analytics", label: "Phân tích" },
  ];

  return (
    <div className="bg-card border-b px-6 flex items-center gap-6 overflow-x-auto">
      {tabs.map((tab) => (
        <Link 
          key={tab.id}
          href={`${basePath}?tab=${tab.id}`}
          className={cn(
            "pb-3 pt-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap",
            activeTab === tab.id 
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
