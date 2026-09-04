"use client";

import { useState, useMemo } from "react";
import {
  UsersIcon,
  CrownIcon,
  GitCommitIcon,
  CheckSquareIcon,
  GitGraphIcon,
  PieChartIcon,
  ChevronRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  CalendarIcon,
  SparklesIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomSelect, type CustomSelectOption } from "@/components/common/custom-select";
import type { MemberAnalytics } from "../types/student-analytics";

interface TeamWorkloadComparisonChartProps {
  members: MemberAnalytics[];
  selectedMemberId: string;
  onSelectMember: (memberId: string) => void;
}

// Danh sách TẤT CẢ các Sprint trong kỳ (Active, Completed, Planned)
const SPRINT_OPTIONS: CustomSelectOption[] = [
  {
    value: "all-sprints",
    label: "Tất cả Sprint (Toàn bộ đồ án)",
    subLabel: "Dữ liệu lũy kế toàn bộ quá trình phát triển",
  },
  {
    value: "sprint-03",
    label: "Sprint 3 - Core Graph Engine & Integration Link",
    subLabel: "Đang diễn ra (Active) • 26/08 - 08/09/2026",
  },
  {
    value: "sprint-02",
    label: "Sprint 2 - Course Selection & Dashboard Analytics",
    subLabel: "Đã hoàn thành (Done) • 25/08/2026",
  },
  {
    value: "sprint-01",
    label: "Sprint 1 - Authentication & System Setup",
    subLabel: "Đã hoàn thành (Done) • 14/08/2026",
  },
  {
    value: "sprint-04",
    label: "Sprint 4 - AI Progress Evaluation & Capstone Defense",
    subLabel: "Kế hoạch (Planned) • 09/09 - 22/09/2026",
  },
];

interface SprintDetailInfo {
  name: string;
  status: "ACTIVE" | "COMPLETED" | "PLANNED";
  goal: string;
  timeline: string;
  totalCommits: number;
  totalTasksDone: number;
  memberMetrics: Record<
    string,
    {
      commits: number;
      tasksDone: number;
      totalTasks: number;
      traceabilityScore: number;
      contributionPercentage: number;
    }
  >;
}

const SPRINT_DETAILS: Record<string, SprintDetailInfo> = {
  "sprint-01": {
    name: "Sprint 1 - Authentication & System Setup",
    status: "COMPLETED",
    goal: "Khởi tạo hệ thống, cấu hình Google SSO, phân quyền 3 roles và khung giao diện gốc.",
    timeline: "Đã đóng: 14/08/2026",
    totalCommits: 140,
    totalTasksDone: 19,
    memberMetrics: {
      "sv-01": { commits: 39, tasksDone: 5, totalTasks: 5, traceabilityScore: 88.5, contributionPercentage: 27.5 },
      "sv-02": { commits: 32, tasksDone: 4, totalTasks: 5, traceabilityScore: 84.0, contributionPercentage: 22.0 },
      "sv-03": { commits: 28, tasksDone: 4, totalTasks: 4, traceabilityScore: 83.5, contributionPercentage: 21.5 },
      "sv-04": { commits: 22, tasksDone: 3, totalTasks: 4, traceabilityScore: 77.5, contributionPercentage: 15.5 },
      "sv-05": { commits: 19, tasksDone: 3, totalTasks: 3, traceabilityScore: 79.5, contributionPercentage: 13.5 },
    },
  },
  "sprint-02": {
    name: "Sprint 2 - Course Selection & Dashboard Analytics",
    status: "COMPLETED",
    goal: "Xây dựng luồng chọn khóa học theo kỳ và đồ thị phân tích kết quả học tập cho Sinh viên & Leader.",
    timeline: "Đã đóng: 25/08/2026",
    totalCommits: 210,
    totalTasksDone: 25,
    memberMetrics: {
      "sv-01": { commits: 60, tasksDone: 7, totalTasks: 7, traceabilityScore: 94.0, contributionPercentage: 29.5 },
      "sv-02": { commits: 47, tasksDone: 6, totalTasks: 7, traceabilityScore: 89.0, contributionPercentage: 24.0 },
      "sv-03": { commits: 42, tasksDone: 5, totalTasks: 6, traceabilityScore: 88.0, contributionPercentage: 20.0 },
      "sv-04": { commits: 33, tasksDone: 4, totalTasks: 5, traceabilityScore: 82.5, contributionPercentage: 14.5 },
      "sv-05": { commits: 28, tasksDone: 3, totalTasks: 4, traceabilityScore: 83.0, contributionPercentage: 12.0 },
    },
  },
  "sprint-03": {
    name: "Sprint 3 - Core Graph Engine & Integration Link",
    status: "ACTIVE",
    goal: "Phát triển đồ thị Traceability Graph, kết nối tài khoản Jira/GitHub và hiển thị trang thông tin dự án.",
    timeline: "26/08 - 08/09/2026 (Còn 5 ngày)",
    totalCommits: 98,
    totalTasksDone: 10,
    memberMetrics: {
      "sv-01": { commits: 28, tasksDone: 3, totalTasks: 5, traceabilityScore: 92.0, contributionPercentage: 28.0 },
      "sv-02": { commits: 22, tasksDone: 2, totalTasks: 4, traceabilityScore: 88.0, contributionPercentage: 23.5 },
      "sv-03": { commits: 20, tasksDone: 2, totalTasks: 4, traceabilityScore: 87.0, contributionPercentage: 21.0 },
      "sv-04": { commits: 15, tasksDone: 2, totalTasks: 4, traceabilityScore: 82.0, contributionPercentage: 15.0 },
      "sv-05": { commits: 13, tasksDone: 1, totalTasks: 3, traceabilityScore: 83.0, contributionPercentage: 12.5 },
    },
  },
  "sprint-04": {
    name: "Sprint 4 - AI Progress Evaluation & Capstone Defense",
    status: "PLANNED",
    goal: "Hệ thống AI đánh giá tiến độ và cảnh báo thiếu commit/SNA, tổng kết điểm và chuẩn bị hội đồng bảo vệ đồ án.",
    timeline: "Dự kiến: 09/09 - 22/09/2026",
    totalCommits: 0,
    totalTasksDone: 0,
    memberMetrics: {
      "sv-01": { commits: 0, tasksDone: 0, totalTasks: 4, traceabilityScore: 0, contributionPercentage: 20.0 },
      "sv-02": { commits: 0, tasksDone: 0, totalTasks: 4, traceabilityScore: 0, contributionPercentage: 20.0 },
      "sv-03": { commits: 0, tasksDone: 0, totalTasks: 3, traceabilityScore: 0, contributionPercentage: 20.0 },
      "sv-04": { commits: 0, tasksDone: 0, totalTasks: 3, traceabilityScore: 0, contributionPercentage: 20.0 },
      "sv-05": { commits: 0, tasksDone: 0, totalTasks: 2, traceabilityScore: 0, contributionPercentage: 20.0 },
    },
  },
};

export function TeamWorkloadComparisonChart({
  members,
  selectedMemberId,
  onSelectMember,
}: TeamWorkloadComparisonChartProps) {
  // Mặc định chọn Sprint đang diễn ra: sprint-03
  const [selectedSprint, setSelectedSprint] = useState<string>("sprint-03");

  const isAll = selectedSprint === "all-sprints";
  const activeSprintInfo = !isAll ? SPRINT_DETAILS[selectedSprint] : null;

  // Tính toán số liệu từng thành viên theo Sprint được chọn
  const memberDisplayData = useMemo(() => {
    return members.map((m) => {
      if (!isAll && activeSprintInfo && activeSprintInfo.memberMetrics[m.id]) {
        const sm = activeSprintInfo.memberMetrics[m.id];
        return {
          member: m,
          commits: sm.commits,
          tasksDone: sm.tasksDone,
          totalTasks: sm.totalTasks,
          traceabilityScore: sm.traceabilityScore,
          contributionPercentage: sm.contributionPercentage,
        };
      }

      // Mặc định: All Sprints (Toàn bộ đồ án)
      const tasksDone = m.tasksStatus.done;
      const totalTasks =
        m.tasksStatus.done + m.tasksStatus.inProgress + m.tasksStatus.toDo + m.tasksStatus.blocked;
      return {
        member: m,
        commits: m.totalCommits,
        tasksDone,
        totalTasks,
        traceabilityScore: m.traceabilityScore,
        contributionPercentage: m.contributionPercentage,
      };
    });
  }, [members, isAll, activeSprintInfo]);

  const maxCommits = useMemo(() => {
    return Math.max(...memberDisplayData.map((d) => d.commits), 20);
  }, [memberDisplayData]);

  return (
    <Card className="rounded-2xl border border-border/80 shadow-xs bg-card overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title & Badge */}
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
                So sánh số lượng Commits, Tasks Jira và chỉ số Traceability của 5 thành viên trong nhóm theo từng Sprint
              </CardDescription>
            </div>
          </div>

          {/* Sprint Filter Dropdown */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <span className="text-xs font-semibold text-muted-foreground shrink-0 hidden sm:inline">
              Lọc theo Sprint:
            </span>
            <div className="w-full sm:w-80">
              <CustomSelect
                id="sprint-workload-filter"
                value={selectedSprint}
                onChange={setSelectedSprint}
                options={SPRINT_OPTIONS}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Sprint Status Context Banner */}
        <div className="bg-muted/30 border border-border/70 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            {activeSprintInfo?.status === "COMPLETED" && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold shrink-0">
                <CheckCircle2Icon className="w-3 h-3 mr-1" />
                ĐÃ HOÀN THÀNH (DONE)
              </Badge>
            )}
            {activeSprintInfo?.status === "ACTIVE" && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] font-bold shrink-0">
                <ClockIcon className="w-3 h-3 mr-1 animate-spin" />
                ĐANG DIỄN RA (ACTIVE)
              </Badge>
            )}
            {activeSprintInfo?.status === "PLANNED" && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold shrink-0">
                <CalendarIcon className="w-3 h-3 mr-1" />
                KẾ HOẠCH (PLANNED)
              </Badge>
            )}
            {isAll && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px] font-bold shrink-0">
                <SparklesIcon className="w-3 h-3 mr-1" />
                TOÀN BỘ ĐỒ ÁN (ALL SPRINTS)
              </Badge>
            )}

            <span className="text-muted-foreground truncate font-medium">
              {activeSprintInfo
                ? activeSprintInfo.goal
                : "Toàn bộ dữ liệu tổng hợp qua tất cả các chu kỳ Sprint trong đồ án"}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-muted-foreground font-mono text-[11px] pt-1 sm:pt-0 border-t sm:border-t-0 border-border/50">
            {activeSprintInfo && (
              <span>Thời gian: <strong className="text-foreground">{activeSprintInfo.timeline}</strong></span>
            )}
            <span>
              Tổng Commits:{" "}
              <strong className="text-primary font-bold">
                {activeSprintInfo
                  ? activeSprintInfo.totalCommits
                  : memberDisplayData.reduce((acc, d) => acc + d.commits, 0)}
              </strong>
            </span>
            <span>
              Tasks Hoàn thành:{" "}
              <strong className="text-cyan-600 dark:text-cyan-400 font-bold">
                {activeSprintInfo
                  ? activeSprintInfo.totalTasksDone
                  : memberDisplayData.reduce((acc, d) => acc + d.tasksDone, 0)}
              </strong>
            </span>
          </div>
        </div>

        {/* Visual comparison list for each team member */}
        <div className="space-y-3">
          {memberDisplayData.map(({ member: m, commits, tasksDone, totalTasks, traceabilityScore, contributionPercentage }) => {
            const isSelected = selectedMemberId === m.id;
            const isLeader = m.role === "LEADER";
            const commitPercent = maxCommits > 0 ? Math.round((commits / maxCommits) * 100) : 0;
            const taskPercent = totalTasks > 0 ? Math.round((tasksDone / totalTasks) * 100) : 0;

            return (
              <div
                key={m.id}
                onClick={() => onSelectMember(m.id)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${isSelected
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
                      <span className="font-mono font-bold text-foreground">{commits}</span>
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
                        <CheckSquareIcon className="w-3 h-3 text-cyan-500" />
                        Tasks Done
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {tasksDone}/{totalTasks}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${taskPercent}%` }}
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
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {traceabilityScore}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${traceabilityScore}%` }}
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
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {contributionPercentage}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(contributionPercentage * 3, 100)}%` }}
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
