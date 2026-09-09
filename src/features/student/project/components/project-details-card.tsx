"use client";

import {
  FolderKanbanIcon,
  FileTextIcon,
  CheckCircle2Icon,
} from "lucide-react";
import type { StudentProjectDetails } from "../types/student-project";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectDetailsCardProps {
  project: StudentProjectDetails;
  isLeader?: boolean;
}

export function ProjectDetailsCard({
  project,
}: ProjectDetailsCardProps) {
  const hasProject = Boolean(
    (project.name && project.name.trim() !== "") ||
    (project.projectId && project.projectId.trim() !== "")
  );

  return (
    <Card className="rounded-2xl border border-border/80 shadow-xs bg-card overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <FolderKanbanIcon className="w-4.5 h-4.5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                Thông tin Đề tài & Giải pháp
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Thông tin phân loại đề tài và mục tiêu giải pháp kỹ thuật
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge className="bg-primary/15 text-primary border-primary/20 font-bold text-[11px]">
              {project.projectType?.name || project.category || "Chưa phân loại"}
            </Badge>
            {hasProject && (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] font-semibold gap-1">
                <CheckCircle2Icon className="w-3 h-3" />
                Đề tài chính thức
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Tên đề tài dự án
            </span>
            {project.createdBy?.fullName && (
              <span className="text-[11px] text-muted-foreground">
                Khởi tạo bởi: <strong className="text-foreground">{project.createdBy.fullName}</strong>
                {project.createdAt && (
                  <span className="ml-1.5 font-mono text-[10px]">
                    ({new Date(project.createdAt).toLocaleDateString("vi-VN")})
                  </span>
                )}
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-foreground leading-snug">
            {project.name || "Chưa có đề tài dự án"}
          </h3>
        </div>

        <div className="space-y-1.5">
          <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FileTextIcon className="w-3.5 h-3.5 text-primary" />
            Mô tả bài toán & Giải pháp
          </h4>
          <div className="p-3 rounded-xl bg-card border border-border/70 text-xs text-muted-foreground leading-relaxed">
            <p className="whitespace-pre-line text-foreground/90">
              {project.description ||
                (hasProject
                  ? "Chưa có mô tả chi tiết cho đề tài này."
                  : "Chưa có dự án nào được khởi tạo trong môn học này.")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
