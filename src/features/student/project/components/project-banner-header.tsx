"use client";

import {
  FolderKanbanIcon,
  SparklesIcon,
  GraduationCapIcon,
  CheckCircle2Icon,
} from "lucide-react";
import type { StudentProjectDetails } from "../types/student-project";
import { Badge } from "@/components/ui/badge";

interface ProjectBannerHeaderProps {
  project: StudentProjectDetails;
}

export function ProjectBannerHeader({ project }: ProjectBannerHeaderProps) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-border/80 shadow-md"
      style={{
        background:
          "linear-gradient(135deg, oklch(from var(--saga-primary) calc(l + 0.05) c h), oklch(from var(--saga-accent) calc(l - 0.05) c h))",
      }}
    >
      {/* Visual background accents */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-15"
        style={{ background: "oklch(1 0 0 / 20%)" }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10"
        style={{ background: "oklch(1 0 0 / 20%)" }}
      />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white/20 hover:bg-white/25 text-white border-0 text-xs px-3 py-1 font-semibold backdrop-blur-md">
              <FolderKanbanIcon className="w-3.5 h-3.5 mr-1.5" />
              {project.category}
            </Badge>

            <Badge className="bg-emerald-500/20 text-white border-0 text-xs font-mono">
              Học kỳ: {project.semesterCode}
            </Badge>

            <Badge className="bg-blue-500/20 text-white border-0 text-xs font-mono">
              Lớp: {project.adminClassCode}
            </Badge>

            {project.status === "ACTIVE" && (
              <Badge className="bg-emerald-400 text-emerald-950 font-bold border-0 text-xs gap-1">
                <CheckCircle2Icon className="w-3 h-3" /> Đang phát triển
              </Badge>
            )}
          </div>

          {/* Project Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {project.name}
          </h1>

          {/* Subtitle / Group & Mentor Info */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-white/85 pt-1">
            <span className="flex items-center gap-1.5 font-bold">
              <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
              {project.groupName}
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCapIcon className="w-3.5 h-3.5 opacity-80" />
              GVHD: <strong className="text-white">{project.lecturer.name}</strong> ({project.lecturer.email})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
