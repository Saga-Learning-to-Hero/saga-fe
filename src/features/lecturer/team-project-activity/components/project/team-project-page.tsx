"use client";

import { useMemo } from "react";
import { MOCK_PROJECTS } from "../../data/mock-team-projects";
import { ProjectHeader } from "./project-header";
import { ProjectTabs } from "./project-tabs";
import { GithubCommitsTab } from "./github-commits-tab";
import { JiraKanbanTab } from "./jira-kanban-tab";
import { AnalyticsTab } from "./analytics-tab";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { lecturerCourseTeamsPath } from "../../lib/team-project-routes";

interface TeamProjectPageProps {
  courseId: string;
  teamId: string;
  activeTab: string;
}

export function TeamProjectPage({ courseId, teamId, activeTab }: TeamProjectPageProps) {
  const router = useRouter();
  
  const project = useMemo(() => {
    return MOCK_PROJECTS.find(p => p.id === teamId);
  }, [teamId]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6">
        <AlertCircleIcon className="w-12 h-12 text-danger mb-4" />
        <h2 className="text-xl font-bold mb-2">Không tìm thấy nhóm</h2>
        <p className="text-muted-foreground mb-6">Nhóm bạn chọn không tồn tại hoặc đã bị xóa.</p>
        <Button onClick={() => router.push(lecturerCourseTeamsPath(courseId))}>
          Quay lại Danh sách lớp
        </Button>
      </div>
    );
  }

  // Treat 'overview' or undefined/empty as 'analytics'
  const currentTab = !activeTab || activeTab === "overview" ? "analytics" : activeTab;

  return (
    <div className="flex flex-col h-full">
      <ProjectHeader courseId={courseId} project={project} />
      <ProjectTabs courseId={courseId} teamId={teamId} activeTab={currentTab} />
      
      <div className="flex-1 overflow-auto bg-background/50">
        {currentTab === "analytics" && <AnalyticsTab project={project} />}
        {currentTab === "github" && <GithubCommitsTab project={project} />}
        {currentTab === "kanban" && <JiraKanbanTab project={project} />}
      </div>
    </div>
  );
}
