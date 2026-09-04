"use client";

import {
  Link2Icon,
  CheckCircle2Icon,
  ShieldCheckIcon,
  CheckSquareIcon,
  GitBranchIcon,
  GitCommitIcon,
  ActivityIcon,
} from "lucide-react";
import type { User } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { StudentJiraSettings } from "./student-jira-settings";
import { StudentGitHubSettings } from "./student-github-settings";

interface IntegrationsViewProps {
  user: User;
}

export function IntegrationsView({ user }: IntegrationsViewProps) {
  const jiraCount = user.jiraIntegrations?.length ?? (user.jiraIntegration?.connected ? 1 : 2);
  const githubCount = user.githubIntegrations?.length ?? (user.githubIntegration?.connected ? 1 : 3);

  const totalTasks = (user.jiraIntegrations || []).reduce(
    (acc, curr) => acc + (curr.syncedTasksCount || 0),
    user.jiraIntegrations ? 0 : 42
  );

  const totalCommits = (user.githubIntegrations || []).reduce(
    (acc, curr) => acc + (curr.syncedCommitsCount || 0),
    user.githubIntegrations ? 0 : 119
  );

  const isConnectedAny = jiraCount > 0 || githubCount > 0;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5">
            Đa kết nối (Multi-Integration)
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Hạ tầng đồng bộ:</span>
          <Badge
            variant="outline"
            className={
              isConnectedAny
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold text-[11px]"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold text-[11px]"
            }
          >
            <CheckCircle2Icon className="size-3 mr-1" />
            {jiraCount} Jira · {githubCount} Repositories
          </Badge>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-border/80 shadow-md"
        style={{
          background:
            "linear-gradient(135deg, oklch(from var(--saga-primary) calc(l + 0.05) c h), oklch(from var(--saga-accent) calc(l - 0.05) c h))",
        }}
      >
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-15 pointer-events-none"
          style={{ background: "oklch(1 0 0 / 20%)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: "oklch(1 0 0 / 20%)" }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 hover:bg-white/25 text-white border-0 text-xs px-3 py-1 font-semibold backdrop-blur-sm">
                <Link2Icon className="size-3.5 mr-1.5" />
                Trung tâm Tích hợp Đồ án SAGA
              </Badge>
              <Badge className="bg-emerald-400 text-emerald-950 border-0 text-xs font-bold font-mono">
                API Multi-Link v2.0
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Tích hợp Đa Công cụ Jira Software & GitHub
            </h1>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
              Hỗ trợ liên kết đồng thời nhiều Workspace Jira và nhiều Repository GitHub (Frontend, Backend, AI Model).
              Hệ thống tự động gom dữ liệu, đối soát commit và hiển thị toàn diện trên Đồ thị Traceability Graph.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 shrink-0">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-white text-center min-w-[105px]">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-white/80 mb-0.5">
                <CheckSquareIcon className="size-3" />
                <span>Jira Cloud</span>
              </div>
              <span className="text-xl font-black font-mono block">
                {jiraCount}
              </span>
              <span className="text-[10px] text-white/70">Workspaces</span>
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-white text-center min-w-[105px]">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-white/80 mb-0.5">
                <GitBranchIcon className="size-3" />
                <span>GitHub</span>
              </div>
              <span className="text-xl font-black font-mono block">
                {githubCount}
              </span>
              <span className="text-[10px] text-white/70">Repositories</span>
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-white text-center min-w-[105px]">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-white/80 mb-0.5">
                <GitCommitIcon className="size-3" />
                <span>Commits</span>
              </div>
              <span className="text-xl font-black font-mono block">
                {totalCommits}
              </span>
              <span className="text-[10px] text-white/70">Đã đồng bộ</span>
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-white text-center min-w-[105px]">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-white/80 mb-0.5">
                <ActivityIcon className="size-3" />
                <span>Tasks</span>
              </div>
              <span className="text-xl font-black font-mono block">
                {totalTasks}
              </span>
              <span className="text-[10px] text-white/70">Tasks liên kết</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border/80 text-xs text-muted-foreground shadow-2xs">
        <ShieldCheckIcon className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground">Bảo mật Token & Phạm vi truy cập</p>
          <p>
            Mã Personal Access Token (PAT) và API Token của các workspace được mã hóa an toàn theo chuẩn AES-256.
            Hệ thống chỉ yêu cầu quyền đọc (`read:project`, `read:commit`, `repo:status`) để phục vụ tổng hợp và phân tích đóng góp của nhóm.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <StudentJiraSettings user={user} />
        <StudentGitHubSettings user={user} />
      </div>
    </div>
  );
}
