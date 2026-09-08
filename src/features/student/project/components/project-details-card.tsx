"use client";

import {
  FolderKanbanIcon,
  CheckSquareIcon,
  GitBranchIcon,
  FileTextIcon,
  Edit3Icon,
  PlusIcon,
} from "lucide-react";
import type { StudentProjectDetails } from "../types/student-project";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProjectDetailsCardProps {
  project: StudentProjectDetails;
  isLeader?: boolean;
  onOpenEditModal?: () => void;
}

export function ProjectDetailsCard({
  project,
  isLeader = true,
  onOpenEditModal,
}: ProjectDetailsCardProps) {
  // Kiểm tra xem nhóm đã có dự án hay chưa
  const hasProject = Boolean(
    (project.name && project.name.trim() !== "") ||
    (project.projectId && project.projectId.trim() !== "")
  );

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
                Thông tin chi tiết loại dự án và mô tả bài toán giải pháp
              </CardDescription>
            </div>
          </div>

          {isLeader && onOpenEditModal ? (
            <Button
              type="button"
              onClick={onOpenEditModal}
              className="h-9 text-xs font-bold rounded-xl gap-2 cursor-pointer shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 px-4 shrink-0"
            >
              {hasProject ? (
                <>
                  <Edit3Icon className="w-4 h-4" />
                  Cập nhật dự án
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4" />
                  Tạo dự án
                </>
              )}
            </Button>
          ) : (
            <Badge variant="outline" className="text-[11px] bg-muted/60 text-muted-foreground border-border/80 font-medium">
              Chế độ xem (Thành viên)
            </Badge>
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
              {project.name || "Chưa có dự án được tạo"}
            </h3>
            {project.createdBy?.fullName && (
              <p className="text-xs text-muted-foreground pt-0.5">
                Khởi tạo bởi: <span className="font-semibold text-foreground">{project.createdBy.fullName}</span>
                {project.createdAt && (
                  <span className="ml-2 font-mono text-[11px]">
                    ({new Date(project.createdAt).toLocaleDateString("vi-VN")})
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Loại dự án
            </span>
            <div>
              <Badge className="bg-primary/15 text-primary border-primary/20 font-bold text-xs">
                {project.projectType?.name || project.category || "Chưa phân loại"}
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
            <p className="whitespace-pre-line">
              {project.description ||
                (hasProject
                  ? "Chưa có mô tả dự án từ hệ thống. Vui lòng bấm 'Cập nhật dự án' để bổ sung thông tin."
                  : "Chưa có dự án nào được khởi tạo trong môn học này. Trưởng nhóm vui lòng bấm nút 'Tạo dự án' ở trên để bắt đầu đăng ký đề tài.")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
          <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckSquareIcon className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-muted-foreground">Jira Project (1 Site & Key)</span>
                <span className="text-xs font-bold font-mono text-foreground">
                  {project.jiraConfig?.projectKey || "Chưa liên kết"}
                </span>
              </div>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] font-semibold">
              Active
            </Badge>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <GitBranchIcon className="w-4 h-4 text-purple-500 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  GitHub Repositories ({project.githubRepositories?.length || 0} repos)
                </span>
                <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400 truncate">
                  {project.githubRepositories?.[0]?.repository || "Chưa liên kết"}
                </span>
              </div>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] font-semibold">
              Active
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
