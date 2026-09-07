"use client";

import {
  ShieldCheckIcon,
  CheckCircle2Icon,
  XCircleIcon,
  MailIcon,
  GitBranchIcon,
  CheckSquareIcon,
} from "lucide-react";
import type { User } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, getInitials } from "@/components/layout/sidebar/nav-config";

interface ProfileHeaderProps {
  user: User;
  compact?: boolean;
}

export function ProfileHeader({ user, compact = false }: ProfileHeaderProps) {
  const isStudent = user.role === "STUDENT";
  const jiraConnected = (user.jiraIntegrations && user.jiraIntegrations.length > 0)
    ? user.jiraIntegrations.some((j) => j.connected)
    : user.jiraIntegration?.connected;
  const githubConnected = (user.githubIntegrations && user.githubIntegrations.length > 0)
    ? user.githubIntegrations.some((g) => g.connected)
    : user.githubIntegration?.connected;

  if (compact) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl p-4 sm:p-4.5 border border-border/80 shadow-sm"
        style={{
          background:
            "linear-gradient(135deg, oklch(from var(--saga-primary) calc(l + 0.05) c h), oklch(from var(--saga-accent) calc(l - 0.05) c h))",
        }}
      >
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-15"
          style={{ background: "oklch(1 0 0 / 20%)" }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3.5">
            <Avatar className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl border-2 border-white/40 shadow-sm shrink-0">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-base font-black bg-white/20 text-white backdrop-blur-md">
                {getInitials(user.name || user.fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-0.5 text-white">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge className="bg-white/20 hover:bg-white/25 text-white border-0 text-[10px] px-2 py-0.5 font-semibold backdrop-blur-md">
                  <ShieldCheckIcon className="w-3 h-3 mr-1" />
                  {ROLE_LABELS[user.role]}
                </Badge>

                {user.username && (
                  <Badge className="bg-white/15 text-white/90 border-0 text-[10px] font-mono px-2 py-0.5">
                    @{user.username}
                  </Badge>
                )}
              </div>

              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                {user.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/80">
                <span className="flex items-center gap-1">
                  <MailIcon className="w-3 h-3 opacity-80" />
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          {isStudent && (
            <div className="flex sm:flex-col gap-2 shrink-0 self-start sm:self-center">
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl px-2.5 py-1 text-white flex items-center gap-2">
                <CheckSquareIcon className="w-3.5 h-3.5 text-blue-300" />
                <span className="text-[11px] font-semibold">Jira</span>
                {jiraConnected ? (
                  <Badge className="bg-emerald-500/80 text-white border-0 text-[9px] gap-0.5 px-1.5 py-0 h-4">
                    <CheckCircle2Icon className="w-2.5 h-2.5" /> Đã kết nối
                  </Badge>
                ) : (
                  <Badge className="bg-rose-500/80 text-white border-0 text-[9px] gap-0.5 px-1.5 py-0 h-4">
                    <XCircleIcon className="w-2.5 h-2.5" /> Chưa kết nối
                  </Badge>
                )}
              </div>

              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl px-2.5 py-1 text-white flex items-center gap-2">
                <GitBranchIcon className="w-3.5 h-3.5 text-purple-300" />
                <span className="text-[11px] font-semibold">GitHub</span>
                {githubConnected ? (
                  <Badge className="bg-emerald-500/80 text-white border-0 text-[9px] gap-0.5 px-1.5 py-0 h-4">
                    <CheckCircle2Icon className="w-2.5 h-2.5" /> Đã kết nối
                  </Badge>
                ) : (
                  <Badge className="bg-rose-500/80 text-white border-0 text-[9px] gap-0.5 px-1.5 py-0 h-4">
                    <XCircleIcon className="w-2.5 h-2.5" /> Chưa kết nối
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-5 sm:p-6 border border-border/80 shadow-md"
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

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Thông tin cá nhân bên trái */}
        <div className="flex items-center gap-4.5 min-w-0">
          <Avatar className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 border-white/40 shadow-md shrink-0">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xl font-black bg-white/20 text-white backdrop-blur-md">
              {getInitials(user.name || user.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1 text-white min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge className="bg-white/20 hover:bg-white/25 text-white border-0 text-[11px] px-2.5 py-0.5 font-semibold backdrop-blur-md">
                <ShieldCheckIcon className="w-3.5 h-3.5 mr-1" />
                {ROLE_LABELS[user.role]}
              </Badge>

              {user.username && (
                <Badge className="bg-white/15 text-white/90 border-0 text-[11px] font-mono px-2 py-0.5">
                  @{user.username}
                </Badge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate">
              {user.name}
            </h1>

            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <MailIcon className="w-3.5 h-3.5 opacity-80 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        {/* 2 Thẻ tích hợp Jira / GitHub cho Sinh viên bên phải */}
        {isStudent && (
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 px-3.5 text-white flex items-center justify-between gap-3 min-w-[200px]">
              <div className="flex items-center gap-2">
                <CheckSquareIcon className="w-4 h-4 text-blue-300 shrink-0" />
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

            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 px-3.5 text-white flex items-center justify-between gap-3 min-w-[200px]">
              <div className="flex items-center gap-2">
                <GitBranchIcon className="w-4 h-4 text-purple-300 shrink-0" />
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
        )}
      </div>
    </div>
  );
}

