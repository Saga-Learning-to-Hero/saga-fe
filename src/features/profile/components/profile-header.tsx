"use client";

import {
  UserIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckCircle2Icon,
  XCircleIcon,
  MailIcon,
  PhoneIcon,
  GraduationCapIcon,
  GitBranchIcon,
  CheckSquareIcon,
} from "lucide-react";
import type { User } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, ROLE_COLORS, getInitials } from "@/components/layout/sidebar/nav-config";

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const isStudent = user.role === "STUDENT";
  const jiraConnected = user.jiraIntegration?.connected;
  const githubConnected = user.githubIntegration?.connected;

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
        {/* User Info Left */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-white/40 shadow-md shrink-0">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xl font-black bg-white/20 text-white backdrop-blur-md">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1.5 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/20 hover:bg-white/25 text-white border-0 text-xs px-2.5 py-0.5 font-semibold backdrop-blur-md">
                <ShieldCheckIcon className="w-3.5 h-3.5 mr-1" />
                {ROLE_LABELS[user.role]}
              </Badge>

              {user.studentCode && (
                <Badge className="bg-emerald-500/20 text-white border-0 text-xs font-mono">
                  MSSV: {user.studentCode}
                </Badge>
              )}

              {user.adminClass && (
                <Badge className="bg-blue-500/20 text-white border-0 text-xs font-mono">
                  Lớp: {user.adminClass}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 pt-0.5">
              <span className="flex items-center gap-1.5">
                <MailIcon className="w-3.5 h-3.5 opacity-80" />
                {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1.5">
                  <PhoneIcon className="w-3.5 h-3.5 opacity-80" />
                  {user.phone}
                </span>
              )}
              {user.department && (
                <span className="flex items-center gap-1.5">
                  <GraduationCapIcon className="w-3.5 h-3.5 opacity-80" />
                  {user.department}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Integration status badges (for Student role) */}
        {isStudent && (
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            {/* Jira Integration status */}
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 px-4 text-white flex items-center justify-between gap-4 min-w-[200px]">
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

            {/* GitHub Integration status */}
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 px-4 text-white flex items-center justify-between gap-4 min-w-[200px]">
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
        )}
      </div>
    </div>
  );
}
