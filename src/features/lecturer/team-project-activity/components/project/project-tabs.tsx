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
  
  // Default to analytics if overview is passed (legacy support)
  const currentTab = activeTab === "overview" ? "analytics" : activeTab;
  
  const tabs = [
    { id: "analytics", label: "Tổng quan & Phân tích" },
    { id: "github", label: "Commit GitHub" },
    { id: "kanban", label: "Jira Kanban" },
  ];

  return (
    <div className="bg-card border-b px-6 flex items-center gap-6 overflow-x-auto">
      {tabs.map((tab) => (
        <Link 
          key={tab.id}
          href={`${basePath}?tab=${tab.id}`}
          className={cn(
            "pb-3 pt-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap",
            currentTab === tab.id 
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
