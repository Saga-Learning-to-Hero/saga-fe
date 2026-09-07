"use client";

import {
  Link2Icon,
  CheckCircle2Icon,
  XCircleIcon,
  ShieldCheckIcon,
  CheckSquareIcon,
  GitBranchIcon,
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

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
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

          {/* 2 Integration Status Pills (đồng bộ từ Profile) */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 px-4 text-white flex items-center justify-between gap-4 min-w-[220px]">
              <div className="flex items-center gap-2">
                <CheckSquareIcon className="w-4 h-4 text-blue-300" />
                <span className="text-xs font-semibold">Tích hợp Jira</span>
              </div>
              {jiraConnected ? (
                <Badge className="bg-emerald-500/80 text-white border-0 text-[10px] gap-1 px-2">
                  <CheckCircle2Icon className="w-3 h-3" /> Đã kết nối
                </Badge>
              ) : (
                <Badge className="bg-rose-500/80 text-white border-0 text-[10px] gap-1 px-2">
                  <XCircleIcon className="w-3 h-3" /> Chưa kết nối
                </Badge>
              )}
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 px-4 text-white flex items-center justify-between gap-4 min-w-[220px]">
              <div className="flex items-center gap-2">
                <GitBranchIcon className="w-4 h-4 text-purple-300" />
                <span className="text-xs font-semibold">Tích hợp GitHub</span>
              </div>
              {githubConnected ? (
                <Badge className="bg-emerald-500/80 text-white border-0 text-[10px] gap-1 px-2">
                  <CheckCircle2Icon className="w-3 h-3" /> Đã kết nối
                </Badge>
              ) : (
                <Badge className="bg-rose-500/80 text-white border-0 text-[10px] gap-1 px-2">
                  <XCircleIcon className="w-3 h-3" /> Chưa kết nối
                </Badge>
              )}
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
