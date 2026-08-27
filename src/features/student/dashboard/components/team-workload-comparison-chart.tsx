"use client";

import {
  UsersIcon,
  CrownIcon,
  GitCommitIcon,
  CheckSquareIcon,
  GitGraphIcon,
  PieChartIcon,
  ChevronRightIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MemberAnalytics } from "../types/student-analytics";

interface TeamWorkloadComparisonChartProps {
  members: MemberAnalytics[];
  selectedMemberId: string;
  onSelectMember: (memberId: string) => void;
}

export function TeamWorkloadComparisonChart({
  members,
  selectedMemberId,
  onSelectMember,
}: TeamWorkloadComparisonChartProps) {
  const maxCommits = Math.max(...members.map((m) => m.totalCommits), 100);

  return (
    <Card className="rounded-2xl border border-border/80 shadow-xs bg-card overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <UsersIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Bảng So sánh Mức độ Đóng góp & Tiến độ Thành viên
                </CardTitle>
                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-0 text-[10px] font-semibold">
                  Quyền Trưởng nhóm
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                So sánh số lượng Commits, Tasks Jira và chỉ số Traceability của 5 thành viên trong nhóm
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Visual comparison list for each team member */}
        <div className="space-y-3">
          {members.map((m) => {
            const isSelected = selectedMemberId === m.id;
            const isLeader = m.role === "LEADER";
            const tasksDone = m.tasksStatus.done;
            const totalTasks = m.tasksStatus.done + m.tasksStatus.inProgress + m.tasksStatus.toDo + m.tasksStatus.blocked;
            const commitPercent = Math.round((m.totalCommits / maxCommits) * 100);

            return (
              <div
                key={m.id}
                onClick={() => onSelectMember(m.id)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSelected
                    ? "bg-primary/5 border-primary/40 shadow-xs ring-1 ring-primary/20"
                    : "bg-card/60 hover:bg-muted/40 border-border/70"
                }`}
              >
                {/* Member Info */}
                <div className="flex items-center gap-3 min-w-[220px]">
                  <Avatar className="h-9 w-9 border border-background shadow-xs shrink-0">
                    <AvatarImage src={m.avatar} alt={m.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {m.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground truncate">
                        {m.name}
                      </span>
                      {isLeader && (
                        <CrownIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      MSSV: {m.studentCode}
                    </span>
                  </div>
                </div>

                {/* Metrics Breakdown Bar */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {/* Commits */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <GitCommitIcon className="w-3 h-3 text-primary" />
                        Commits
                      </span>
                      <span className="font-mono font-bold text-foreground">{m.totalCommits}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${commitPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Tasks Done */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <CheckSquareIcon className="w-3 h-3 text-blue-500" />
                        Tasks Done
                      </span>
                      <span className="font-mono font-bold text-foreground">{tasksDone}/{totalTasks}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.round((tasksDone / totalTasks) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Traceability Score */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <GitGraphIcon className="w-3 h-3 text-emerald-500" />
                        Traceability
                      </span>
                      <span className="font-mono font-bold text-emerald-600">{m.traceabilityScore}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${m.traceabilityScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Contribution % */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <PieChartIcon className="w-3 h-3 text-amber-500" />
                        Đóng góp
                      </span>
                      <span className="font-mono font-bold text-amber-600">{m.contributionPercentage}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${m.contributionPercentage * 3}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Select button indicator */}
                <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary">
                  {isSelected ? (
                    <Badge className="bg-primary text-primary-foreground border-0 text-[10px]">
                      Đang xem
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-[11px] group-hover:text-primary flex items-center">
                      Xem chi tiết <ChevronRightIcon className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
