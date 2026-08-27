"use client";

import {
  FolderKanbanIcon,
  Code2Icon,
  CheckSquareIcon,
  GitBranchIcon,
  ExternalLinkIcon,
  FileTextIcon,
  Edit3Icon,
} from "lucide-react";
import type { StudentProjectDetails } from "../types/student-project";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProjectDetailsCardProps {
  project: StudentProjectDetails;
  onOpenEditModal?: () => void;
}

export function ProjectDetailsCard({
  project,
  onOpenEditModal,
}: ProjectDetailsCardProps) {
  return (
    <Card className="rounded-2xl border border-border/80 shadow-xs bg-card">
      <CardHeader className="p-5 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <FolderKanbanIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Thông tin Chi tiết Dự án
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Thông tin loại dự án, mô tả bài toán và công nghệ phát triển
              </CardDescription>
            </div>
          </div>

          {onOpenEditModal && (
            <Button
              type="button"
              onClick={onOpenEditModal}
              className="h-9 text-xs font-bold rounded-xl gap-2 cursor-pointer shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 px-4 shrink-0"
            >
              <Edit3Icon className="w-4 h-4" />
              Cập nhật dự án
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Tên dự án & Loại dự án */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-muted/40 border border-border/60">
          <div className="md:col-span-2 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Tên dự án chính thức
            </span>
            <h3 className="text-base font-bold text-foreground leading-snug">
              {project.name}
            </h3>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Loại dự án
            </span>
            <div>
              <Badge className="bg-primary/15 text-primary border-primary/20 font-bold text-xs">
                {project.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Mô tả dự án */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FileTextIcon className="w-4 h-4 text-primary" />
            Mô tả dự án & Giải pháp
          </h4>
          <div className="p-4 rounded-2xl bg-card border border-border/70 text-xs text-muted-foreground leading-relaxed space-y-2">
            <p className="whitespace-pre-line">{project.description}</p>
          </div>
        </div>

        {/* Công nghệ sử dụng (Tech Stack) */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Code2Icon className="w-4 h-4 text-purple-500" />
            Công nghệ & Framework sử dụng (Tech Stack)
          </h4>
          <div className="flex flex-wrap gap-2 pt-1">
            {project.techStack.map((tech, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="bg-secondary text-secondary-foreground text-xs px-3 py-1 font-mono rounded-lg border border-border/60"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        {/* Liên kết tích hợp bên thứ 3 (Jira & GitHub) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
          {/* Jira Link */}
          <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckSquareIcon className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-muted-foreground">Jira Project</span>
                <span className="text-xs font-bold font-mono text-foreground">{project.jiraProjectKey || "SWP490_SAGA"}</span>
              </div>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-600 border-0 text-[10px] font-semibold">
              Active
            </Badge>
          </div>

          {/* GitHub Link */}
          <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <GitBranchIcon className="w-4 h-4 text-purple-500 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold text-muted-foreground">GitHub Repo</span>
                <a
                  href={`https://github.com/${project.githubRepository}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold font-mono text-purple-600 hover:underline truncate flex items-center gap-1"
                >
                  {project.githubRepository || "Saga-Learning-to-Hero/saga-fe"}
                  <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-600 border-0 text-[10px] font-semibold">
              Active
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
