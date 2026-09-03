"use client";

import {
  Link2Icon,
  CheckCircle2Icon,
  ShieldCheckIcon,
} from "lucide-react";
import type { User } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { StudentJiraSettings } from "./student-jira-settings";
import { StudentGitHubSettings } from "./student-github-settings";

interface IntegrationsViewProps {
  user: User;
}

export function IntegrationsView({ user }: IntegrationsViewProps) {
  const isJiraConnected = Boolean(user.jiraIntegration?.connected);
  const isGitHubConnected = Boolean(user.githubIntegration?.connected);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* ── Status Bar ── */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-muted-foreground hidden sm:inline">Trạng thái kết nối:</span>
        <Badge
          variant="outline"
          className={
            isJiraConnected && isGitHubConnected
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold text-[11px]"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold text-[11px]"
          }
        >
          <CheckCircle2Icon className="size-3 mr-1" />
          {isJiraConnected && isGitHubConnected
            ? "Đã kết nối 2/2 công cụ"
            : `Đã kết nối ${Number(isJiraConnected) + Number(isGitHubConnected)}/2 công cụ`}
        </Badge>
      </div>

      {/* ── Banner Trung tâm Tích hợp ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-border/80 shadow-md"
        style={{
          background:
            "linear-gradient(135deg, oklch(from var(--saga-primary) calc(l + 0.05) c h), oklch(from var(--saga-accent) calc(l - 0.05) c h))",
        }}
      >
        {/* Họa tiết trang trí */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-15"
          style={{ background: "oklch(1 0 0 / 20%)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10"
          style={{ background: "oklch(1 0 0 / 20%)" }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 hover:bg-white/25 text-white border-0 text-xs px-3 py-1 font-semibold backdrop-blur-sm">
                <Link2Icon className="size-3.5 mr-1.5" />
                Trung tâm Tích hợp Đồ án SAGA
              </Badge>
              <Badge className="bg-emerald-400 text-emerald-950 border-0 text-xs font-bold font-mono">
                API v2.0
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Tích hợp Công cụ Jira Software & GitHub
            </h1>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
              Kết nối Workspace Jira và Repository GitHub để hệ thống SAGA tự động đồng bộ Kanban Backlog,
              lịch sử Commit, tính toán Story Points và trực quan hóa Đồ thị truy xuất nguồn gốc (Traceability Graph).
            </p>
          </div>

          {/* Banner Quick Stats */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white text-center min-w-[120px]">
              <span className="text-sm font-bold block mb-1">Jira Cloud</span>
              <Badge className="bg-white/25 text-white border-0 text-[10px] font-mono font-bold">
                {isJiraConnected ? "ĐÃ KẾT NỐI" : "CHƯA KẾT NỐI"}
              </Badge>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white text-center min-w-[120px]">
              <span className="text-sm font-bold block mb-1">GitHub Repo</span>
              <Badge className="bg-white/25 text-white border-0 text-[10px] font-mono font-bold">
                {isGitHubConnected ? "ĐÃ KẾT NỐI" : "CHƯA KẾT NỐI"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lưu ý bảo mật ── */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border/80 text-xs text-muted-foreground">
        <ShieldCheckIcon className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground">Bảo mật Token & Quyền truy cập</p>
          <p>
            Mã Personal Access Token (PAT) và API Token của bạn được mã hóa an toàn theo tiêu chuẩn AES-256.
            SAGA chỉ yêu cầu quyền đọc (`read:project`, `read:commit`) để đối soát minh chứng đóng góp học thuật.
          </p>
        </div>
      </div>

      {/* ── 2 Khối Tích hợp: Jira và GitHub ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Khối Cài đặt Jira */}
        <StudentJiraSettings user={user} />

        {/* Khối Cài đặt GitHub */}
        <StudentGitHubSettings user={user} />
      </div>
    </div>
  );
}
