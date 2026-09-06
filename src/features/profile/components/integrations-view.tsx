"use client";

import {
  Link2Icon,
  CheckCircle2Icon,
  ShieldCheckIcon,
  CheckSquareIcon,
  GitBranchIcon,
  UserCheckIcon,
  AlertCircleIcon,
} from "lucide-react";
import type { User } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { StudentJiraSettings } from "./student-jira-settings";
import { StudentGitHubSettings } from "./student-github-settings";

interface IntegrationsViewProps {
  user: User;
}

export function IntegrationsView({ user }: IntegrationsViewProps) {
  const jiraConnected = Boolean(
    user.jiraIntegration?.connected ||
    (user.jiraIntegrations && user.jiraIntegrations.some((j) => j.connected))
  );

  const githubConnected = Boolean(
    user.githubIntegration?.connected ||
    (user.githubIntegrations && user.githubIntegrations.some((g) => g.connected))
  );

  const connectedCount = (jiraConnected ? 1 : 0) + (githubConnected ? 1 : 0);

  const githubUsername = user.githubIntegration?.username || "lehoanghai-fpt";
  const jiraEmail = user.jiraIntegration?.email || user.email || "hailhhe170504@fpt.edu.vn";

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5">
            Định danh Cá nhân (Personal Identity)
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Trạng thái định danh:</span>
          <Badge
            variant="outline"
            className={
              connectedCount === 2
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold text-[11px]"
                : connectedCount === 1
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold text-[11px]"
                  : "bg-muted text-muted-foreground border-border font-semibold text-[11px]"
            }
          >
            {connectedCount === 2 ? (
              <CheckCircle2Icon className="size-3 mr-1 text-emerald-500" />
            ) : (
              <AlertCircleIcon className="size-3 mr-1 text-amber-500" />
            )}
            {connectedCount}/2 Tài khoản đã liên kết
          </Badge>
        </div>
      </div>

      {/* Hero Banner */}
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
                Định danh Tác giả & Assignee SAGA
              </Badge>
              <Badge className="bg-emerald-400 text-emerald-950 border-0 text-xs font-bold font-mono">
                OAuth 2.0 Direct Link
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Liên kết Tài khoản Cá nhân Jira & GitHub
            </h1>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
              Sinh viên chỉ cần liên kết tài khoản Jira và GitHub cá nhân một lần duy nhất. Hệ thống SAGA tự động
              đối soát tác giả commit và người thực hiện task trên toàn bộ các repository và bảng Jira của nhóm mà không cần chọn từng site hay repo.
            </p>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 shrink-0">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-white text-center min-w-[110px]">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-white/80 mb-0.5">
                <CheckSquareIcon className="size-3" />
                <span>Atlassian Jira</span>
              </div>
              <span className="text-sm font-black block mt-1">
                {jiraConnected ? "Đã liên kết" : "Chưa liên kết"}
              </span>
              <span className="text-[10px] text-white/70">
                {jiraConnected ? "OAuth Hoạt động" : "Cần kết nối"}
              </span>
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-white text-center min-w-[110px]">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-white/80 mb-0.5">
                <GitBranchIcon className="size-3" />
                <span>GitHub</span>
              </div>
              <span className="text-sm font-black block mt-1">
                {githubConnected ? "Đã liên kết" : "Chưa liên kết"}
              </span>
              <span className="text-[10px] text-white/70">
                {githubConnected ? "OAuth Hoạt động" : "Cần kết nối"}
              </span>
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-white text-center min-w-[110px]">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-white/80 mb-0.5">
                <GitBranchIcon className="size-3" />
                <span>Git Author</span>
              </div>
              <span className="text-xs font-black font-mono block mt-1 truncate">
                {githubConnected ? `@${githubUsername}` : "Chưa có"}
              </span>
              <span className="text-[10px] text-white/70">Nhận diện commit</span>
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-white text-center min-w-[110px]">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-white/80 mb-0.5">
                <UserCheckIcon className="size-3" />
                <span>Jira Assignee</span>
              </div>
              <span className="text-xs font-black font-mono block mt-1 truncate max-w-[110px] mx-auto">
                {jiraConnected ? jiraEmail.split("@")[0] : "Chưa có"}
              </span>
              <span className="text-[10px] text-white/70">Nhận diện Task</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border/80 text-xs text-muted-foreground shadow-2xs">
        <ShieldCheckIcon className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground">Bảo mật & Quyền riêng tư của Sinh viên</p>
          <p>
            Hệ thống SAGA chỉ yêu cầu quyền đọc thông tin tài khoản cơ bản để khớp danh tính sinh viên với tác giả commit và người nhận việc Jira. Hệ thống không bao giờ lưu trữ mật khẩu cá nhân và không yêu cầu quyền can thiệp vào mã nguồn hay các dự án riêng tư bên ngoài đồ án.
          </p>
        </div>
      </div>

      {/* Two Integration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <StudentJiraSettings user={user} />
        <StudentGitHubSettings user={user} />
      </div>
    </div>
  );
}
