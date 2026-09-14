"use client";

import { useMemo, type ReactNode } from "react";
import {
  CheckSquareIcon,
  ChevronRightIcon,
  GitCommitIcon,
  Link2Icon,
  UsersIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LeaderBadge } from "@/components/common/leader-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssigneeAvatarClass, getAssigneeInitials } from "@/features/student/sprint-progress/lib/assignee-avatar";
import type { ProjectProgressMemberSummary } from "@/features/student/project/types/student-project";
import { formatLinkedCommitRatio } from "@/features/progress/lib/progress-format";
import { cn } from "@/lib/utils";

interface TeamWorkloadComparisonChartProps {
  members: ProjectProgressMemberSummary[];
  selectedStudentId: string | null;
  onSelectMember: (studentId: string) => void;
  currentSprintName?: string | null;
}

export function TeamWorkloadComparisonChart({
  members,
  selectedStudentId,
  onSelectMember,
  currentSprintName,
}: TeamWorkloadComparisonChartProps) {
  const sorted = useMemo(
    () =>
      [...members].sort((a, b) => {
        const roleRank = (role: string) => (role.toUpperCase() === "LEADER" ? 0 : 1);
        const rankDiff = roleRank(a.teamRole) - roleRank(b.teamRole);
        if (rankDiff !== 0) return rankDiff;
        return a.studentCode.localeCompare(b.studentCode, "vi");
      }),
    [members]
  );

  const maxCommits = Math.max(...sorted.map((member) => member.commits?.total ?? 0), 1);

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
      <CardHeader className="border-b border-border/60 p-4 pb-3 sm:p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <UsersIcon className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-sm font-bold text-foreground sm:text-base">
                Tiến độ thành viên
              </CardTitle>
              <LeaderBadge size="sm">Chỉ trưởng nhóm</LeaderBadge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Task, commit và tỉ lệ commit đã liên kết task. Máy chủ không trả số liệu theo từng Sprint cho từng người.
              {currentSprintName ? ` Sprint hiện tại: ${currentSprintName}.` : " Chưa có Sprint đang hoạt động."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-5">
        {sorted.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground">
            Chưa có thành viên trong bảng tiến độ.
          </p>
        ) : (
          sorted.map((member) => {
            const isSelected = selectedStudentId === member.studentId;
            const isLeader = member.teamRole.toUpperCase() === "LEADER";
            const commitPercent = Math.round((member.commits.total / maxCommits) * 100);
            const assigned = member.tasks.assigned || member.tasks.assignedTotal || 0;
            const taskPercent =
              assigned > 0 ? Math.round((member.tasks.completed / assigned) * 100) : 0;
            const linkedRatio = formatLinkedCommitRatio(
              member.commits.linkedToTasks,
              member.commits.total
            );

            const rawMember = member as unknown as Record<string, unknown>;
            const avatarUrl =
              typeof rawMember?.avatarUrl === "string" && rawMember.avatarUrl.trim()
                ? rawMember.avatarUrl.trim()
                : typeof rawMember?.avatar === "string" && rawMember.avatar.trim()
                  ? rawMember.avatar.trim()
                  : null;

            return (
              <button
                key={member.studentId}
                type="button"
                onClick={() => onSelectMember(member.studentId)}
                className={cn(
                  "flex w-full cursor-pointer flex-col justify-between gap-4 rounded-2xl border p-3.5 text-left transition-all md:flex-row md:items-center",
                  isSelected
                    ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border/70 bg-card/60 hover:bg-muted/40"
                )}
              >
                <div className="flex min-w-[220px] items-center gap-3">
                  <Avatar className="size-9 shrink-0 border border-background shadow-xs">
                    {avatarUrl ? (
                      <AvatarImage
                        src={avatarUrl}
                        alt={member.fullName}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback
                      className={cn(
                        "font-mono text-xs font-bold",
                        getAssigneeAvatarClass(member.studentId || member.userId || member.studentCode)
                      )}
                    >
                      {getAssigneeInitials(member.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-bold text-foreground">
                        {member.fullName}
                      </span>
                      {isLeader ? <LeaderBadge variant="icon-only" /> : null}
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      MSSV: {member.studentCode}
                    </span>
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  <MetricBar
                    icon={<GitCommitIcon className="size-3 text-primary" />}
                    label="Commit"
                    value={String(member.commits.total)}
                    percent={commitPercent}
                    barClass="bg-primary"
                  />
                  <MetricBar
                    icon={<CheckSquareIcon className="size-3 text-cyan-500" />}
                    label="Task xong"
                    value={`${member.tasks.completed}/${assigned}`}
                    percent={taskPercent}
                    barClass="bg-cyan-500"
                  />
                  <MetricBar
                    icon={<Link2Icon className="size-3 text-emerald-500" />}
                    label="Commit đã liên kết task"
                    value={`${member.commits.linkedToTasks}/${member.commits.total} (${linkedRatio})`}
                    percent={member.commits.total > 0 ? Math.round((member.commits.linkedToTasks / member.commits.total) * 100) : 0}
                    barClass="bg-emerald-500"
                  />
                </div>

                <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                  {isSelected ? (
                    <Badge className="border-0 bg-primary text-[10px] text-primary-foreground">
                      Đang xem
                    </Badge>
                  ) : (
                    <span className="flex items-center text-[11px] text-muted-foreground">
                      Xem chi tiết <ChevronRightIcon className="ml-0.5 size-3.5" />
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function MetricBar({
  icon,
  label,
  value,
  percent,
  barClass,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  percent: number;
  barClass: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1 text-muted-foreground">
          {icon}
          {label}
        </span>
        <span className="font-mono font-bold text-foreground">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
