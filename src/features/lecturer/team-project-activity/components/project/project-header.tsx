"use client";

import { useState } from "react";
import { GitBranchIcon, KanbanIcon, UsersIcon, CalendarIcon, CrownIcon, ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TeamProjectInfo } from "../../types/team-project";
import { TeamSelector } from "./team-selector";

interface ProjectHeaderProps {
  courseId: string;
  project: TeamProjectInfo;
}

export function ProjectHeader({ courseId, project }: ProjectHeaderProps) {
  const leader = project.members.find(m => m.id === project.leaderId);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card border-b p-4 sm:p-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold truncate max-w-[400px]">{project.projectName}</h2>
            <Badge variant={project.status === "Đang thực hiện" ? "default" : "secondary"} className="h-5 text-[10px] hidden sm:inline-flex">
              {project.status}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              className="h-6 w-6 ml-1 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Thu gọn" : "Mở rộng"}
            >
              {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </Button>
          </div>
          {isExpanded ? (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{project.description}</p>
          ) : (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1 font-medium text-foreground"><UsersIcon className="w-3 h-3 text-muted-foreground" /> {project.teamName}</span>
              <span className="flex items-center gap-1"><CrownIcon className="w-3 h-3 text-amber-500" /> {leader?.fullName || "Chưa có"}</span>
              <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {new Date(project.deadline).toLocaleDateString("vi-VN")}</span>
            </div>
          )}
        </div>
        <div className="shrink-0 w-full sm:w-auto flex items-center gap-2 justify-end">
          {!isExpanded && (
            <div className="flex items-center gap-1 mr-2">
              {project.githubRepo && (
                <div className="h-8 w-8 flex items-center justify-center rounded-md border bg-muted/30 text-muted-foreground" title={`GitHub: ${project.githubRepo}`}>
                  <GitBranchIcon className="w-4 h-4" />
                </div>
              )}
              {project.jiraProjectKey && (
                <div className="h-8 w-8 flex items-center justify-center rounded-md border bg-muted/30 text-muted-foreground" title={`Jira: ${project.jiraProjectKey}`}>
                  <KanbanIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          )}
          <TeamSelector courseId={courseId} currentTeam={project} />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-dashed animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2 text-sm">
              <UsersIcon className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">{project.teamName}</span>
              <span className="text-muted-foreground">· {project.members.length} thành viên</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <CrownIcon className="w-4 h-4 text-amber-500" />
              <span className="text-muted-foreground">Leader:</span>
              <span className="font-semibold">{leader?.fullName || "Chưa có"}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {new Date(project.startDate).toLocaleDateString("vi-VN")} – {new Date(project.deadline).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 mt-4 border-t">
            <Badge variant={project.status === "Đang thực hiện" ? "default" : "secondary"}>
              {project.status}
            </Badge>
            
            {project.currentSprint && (
              <Badge variant="outline" className="bg-muted/30">
                {project.currentSprint}
              </Badge>
            )}
            
            <div className="flex items-center gap-3 ml-auto">
              {project.githubRepo ? (
                <Button variant="outline" size="sm" className="h-8">
                  <GitBranchIcon className="w-4 h-4 mr-2" />
                  {project.githubRepo}
                  <ExternalLinkIcon className="w-3 h-3 ml-2 text-muted-foreground" />
                </Button>
              ) : (
                <Badge variant="outline" className="text-muted-foreground border-dashed">
                  <GitBranchIcon className="w-3.5 h-3.5 mr-1.5" /> Chưa kết nối GitHub
                </Badge>
              )}

              {project.jiraProjectKey ? (
                <Button variant="outline" size="sm" className="h-8">
                  <KanbanIcon className="w-4 h-4 mr-2" />
                  Jira: {project.jiraProjectKey}
                  <ExternalLinkIcon className="w-3 h-3 ml-2 text-muted-foreground" />
                </Button>
              ) : (
                <Badge variant="outline" className="text-muted-foreground border-dashed">
                  <KanbanIcon className="w-3.5 h-3.5 mr-1.5" /> Chưa kết nối Jira
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
