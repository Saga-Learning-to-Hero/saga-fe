"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2Icon,
  CrownIcon,
  FolderKanbanIcon,
  GitCommitIcon,
  KanbanIcon,
  RefreshCwIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeaderBadge } from "@/components/common/leader-badge";
import { MemberProgressSheet } from "@/features/progress/components/member-progress-sheet";
import {
  ProgressFactNote,
  ProjectProgressSummary,
} from "@/features/progress/components/project-progress-summary";
import {
  studentCoursePath,
  useStudentCourseContext,
} from "@/features/student/courses/hooks/use-student-course-context";
import { useProjectRealtime } from "@/features/student/project/hooks/use-project-realtime";
import { useProjectProgress } from "@/features/student/project/hooks/useProjectSync";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/common/custom-select";
import { useProjectSprints } from "@/features/student/sprint-progress/hooks/use-project-sprints";
import { normalizeProjectProgress } from "@/features/progress/lib/progress-format";
import { useStudentDashboard } from "../hooks/use-student-dashboard";
import { StudentActiveTasksCard } from "./student-active-tasks-card";
import { StudentAlertsBanner } from "./student-alerts-banner";
import { StudentRecentCommitsCard } from "./student-recent-commits-card";
import { StudentWeeklyCommitsChart } from "./student-weekly-commits-chart";
import { TeamWorkloadComparisonChart } from "./team-workload-comparison-chart";
import { StudentDashboardSkeleton } from "./student-dashboard-skeleton";

export function StudentDashboardAnalytics() {
  const { course, courseId, isLoading: isCoursesLoading, isInvalidCourse } = useStudentCourseContext();
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const dashboardQuery = useStudentDashboard(courseId, selectedSprintId, { enabled: Boolean(courseId) });
  const data = dashboardQuery.data;

  // Trưởng nhóm có thể chọn xem tab Cá nhân (Cockpit) hoặc xem Toàn nhóm
  const [activeTab, setActiveTab] = useState<"personal" | "team">("personal");
  const [detailStudentId, setDetailStudentId] = useState<string | null>(null);

  const isLeader = Boolean(
    (data?.student?.teamRole || "").toUpperCase() === "LEADER"
  );

  const projectId = data?.team?.projectId || null;
  const canLoadProgress = Boolean(isLeader && projectId && activeTab === "team");

  // Danh sách sprint của dự án để sinh viên chọn xem thống kê từng sprint
  const { data: projectSprints } = useProjectSprints(projectId, { enabled: Boolean(projectId) });

  // Dữ liệu mở rộng cho Trưởng nhóm khi chuyển sang tab Toàn nhóm
  const progressQuery = useProjectProgress(projectId, { enabled: canLoadProgress });
  useProjectRealtime(projectId, { enabled: Boolean(projectId) });

  const progress = normalizeProjectProgress(progressQuery.data);
  const members = progress?.memberProgress ?? [];

  const openMemberDetail = (studentId: string) => {
    setDetailStudentId(studentId);
  };

  const currentSprint = data?.currentSprint;
  const sprintSelectOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: Array<{ value: string; label: string; subLabel?: string }> = [];

    // 1. Thêm các sprint từ danh sách projectSprints
    if (projectSprints && projectSprints.length > 0) {
      for (const sp of projectSprints) {
        if (!sp.id || seen.has(sp.id)) continue;
        seen.add(sp.id);

        const isCurrent =
          (currentSprint?.id && sp.id === currentSprint.id) ||
          (currentSprint?.name && sp.name && currentSprint.name.toLowerCase().trim() === sp.name.toLowerCase().trim());

        const stateLabel =
          sp.state === "active"
            ? "Đang diễn ra"
            : sp.state === "closed"
              ? "Đã đóng"
              : "Dự kiến";

        options.push({
          value: sp.id,
          label: sp.name,
          subLabel: isCurrent ? `Sprint hiện tại (${stateLabel})` : `Trạng thái: ${stateLabel}`,
        });
      }
    }

    // 2. Nếu currentSprint từ dashboard chưa có trong options thì bổ sung vào đầu
    if (currentSprint?.id && !seen.has(currentSprint.id)) {
      seen.add(currentSprint.id);
      options.unshift({
        value: currentSprint.id,
        label: currentSprint.name || "Sprint hiện tại",
        subLabel: currentSprint.state
          ? `Sprint hiện tại (${currentSprint.state.toUpperCase() === "ACTIVE" ? "Đang diễn ra" : currentSprint.state})`
          : "Sprint hiện tại",
      });
    }

    // 3. Fallback an toàn: nếu selectedSprintId đang chọn mà chưa có trong options
    if (selectedSprintId && !seen.has(selectedSprintId)) {
      options.push({
        value: selectedSprintId,
        label: currentSprint?.name || "Sprint đã chọn",
        subLabel: "Đang xem",
      });
    }

    return options;
  }, [projectSprints, currentSprint, selectedSprintId]);

  const selectedSprintValue = useMemo(() => {
    if (selectedSprintId) return selectedSprintId;
    if (currentSprint?.id) return currentSprint.id;
    if (sprintSelectOptions.length > 0) return sprintSelectOptions[0].value;
    return "";
  }, [selectedSprintId, currentSprint, sprintSelectOptions]);

  const isViewingDifferentSprint = Boolean(
    selectedSprintId && currentSprint?.id && selectedSprintId !== currentSprint.id
  );

  if (isInvalidCourse) {
    return (
      <EmptyPanel
        title="Lớp học phần không còn khả dụng"
        description="Hãy chọn lại lớp học phần trước khi xem bảng điều khiển."
      />
    );
  }

  if (isCoursesLoading || (Boolean(courseId) && dashboardQuery.isLoading && !data)) {
    return <StudentDashboardSkeleton />;
  }

  if (!courseId || !course) {
    return (
      <EmptyPanel
        title="Chưa chọn lớp học phần"
        description="Hãy chọn lớp đang học để xem bảng điều khiển cá nhân."
        href="/student/courses"
        action="Chọn lớp học phần"
      />
    );
  }

  if (dashboardQuery.isError) {
    return (
      <EmptyPanel
        title="Không tải được dữ liệu bảng điều khiển"
        description={getApiErrorMessage(dashboardQuery.error, "Vui lòng thử lại.")}
        onRetry={() => void dashboardQuery.refetch()}
      />
    );
  }

  if (!data) {
    return (
      <EmptyPanel
        title="Chưa có dữ liệu"
        description="Hiện tại chưa có dữ liệu bảng điều khiển cho lớp học phần này."
      />
    );
  }

  if (!data.team) {
    return (
      <EmptyPanel
        title="Đang chờ giảng viên phân nhóm"
        description="Bạn đã ghi danh vào lớp học phần nhưng chưa được gán vào nhóm nào."
      />
    );
  }

  if (!data.team.projectId) {
    return (
      <EmptyPanel
        title="Nhóm chưa khởi tạo dự án"
        description="Bảng điều khiển sẽ hoạt động đầy đủ khi nhóm của bạn đã khởi tạo dự án và liên kết Jira/GitHub."
        href={studentCoursePath("/student/project-info", courseId)}
        action="Khởi tạo dự án"
      />
    );
  }

  const { student, team, myMetrics, myActiveTasks, recentCommits, weeklyCommits, actionableAlerts, integrations } = data;

  const formattedLastCommit = myMetrics.commits.lastCommittedAt
    ? new Date(myMetrics.commits.lastCommittedAt).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Chưa ghi nhận";

  return (
    <div className="space-y-6">
      {/* 1. Header Card: Định danh sinh viên, môn học, nhóm & Chuyển đổi tab nếu là Leader */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-border/80 bg-card/90 p-5 shadow-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <Avatar className="size-11 rounded-2xl border border-primary/25 shadow-xs" size="lg">
            <AvatarImage
              src={student.avatarUrl || undefined}
              alt={student.fullName}
              referrerPolicy="no-referrer"
              className="object-cover rounded-2xl"
            />
            <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold text-sm font-mono">
              {student.studentCode?.slice(0, 2) || "SV"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-foreground">
                {student.fullName}
              </h2>
              <span className="font-mono text-xs text-muted-foreground font-semibold">
                ({student.studentCode})
              </span>
              {isLeader ? (
                <LeaderBadge size="sm" />
              ) : (
                <Badge variant="secondary" className="text-[10px] font-bold">
                  Thành viên nhóm
                </Badge>
              )}
              <Badge variant="outline" className="font-mono text-[10px]">
                Nhóm {team.teamNo} · {team.teamName}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bảng điều khiển cá nhân hóa tự động cập nhật từ hoạt động Jira và GitHub của bạn.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center">
          {/* Dropdown chọn Sprint theo sprintId */}
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-2.5 py-1 transition-all border",
              isViewingDifferentSprint
                ? "bg-primary/10 border-primary/40 text-primary shadow-xs ring-1 ring-primary/20"
                : "bg-muted/40 border-border/70"
            )}
          >
            <KanbanIcon
              className={cn("size-3.5 shrink-0", isViewingDifferentSprint ? "text-primary" : "text-amber-500")}
            />
            <span
              className={cn(
                "text-xs font-semibold whitespace-nowrap",
                isViewingDifferentSprint ? "text-primary" : "text-muted-foreground"
              )}
            >
              Sprint:
            </span>
            <div className="w-48 sm:w-56">
              <CustomSelect
                id="student-dashboard-header-sprint-select"
                value={selectedSprintValue}
                onChange={(val) => setSelectedSprintId(val)}
                options={sprintSelectOptions}
                placeholder={currentSprint?.name || "Chọn Sprint..."}
                triggerClassName={cn(
                  "h-7 text-xs font-semibold py-0 px-2 rounded-lg border-transparent bg-transparent hover:bg-background/80",
                  isViewingDifferentSprint && "text-primary font-bold hover:bg-primary/15"
                )}
                dropdownClassName="min-w-[240px] sm:min-w-[280px] max-h-56 sm:max-h-60 overflow-y-auto custom-scrollbar sm:right-0 sm:left-auto"
              />
            </div>
          </div>

          {isLeader && (
            <div className="flex items-center rounded-xl border border-border/70 bg-muted/30 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("personal")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                  activeTab === "personal"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Cá nhân
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("team")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                  activeTab === "team"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CrownIcon className="size-3 text-amber-500" />
                <span>Tiến độ toàn nhóm</span>
              </button>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => void dashboardQuery.refetch()}
            disabled={dashboardQuery.isFetching}
            className="h-8 gap-1.5 text-xs cursor-pointer"
          >
            <RefreshCwIcon className={cn("size-3.5", dashboardQuery.isFetching && "animate-spin")} />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>
        </div>
      </div>

      {/* 2. Nội dung Tab: Cá nhân (Cockpit) hay Toàn nhóm (Leader) */}
      {activeTab === "personal" ? (
        <div className="space-y-6">
          {/* Actionable Alerts Banner */}
          <StudentAlertsBanner alerts={actionableAlerts} courseId={courseId} />

          {/* 3 Thẻ Chỉ Số KPI Cá Nhân Nổi Bật */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Thẻ 1: Nhiệm vụ phân công */}
            <Card className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-xs">
              <CardContent className="p-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Nhiệm vụ của tôi</span>
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <CheckCircle2Icon className="size-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="font-mono text-2xl font-black text-foreground">
                    {myMetrics.tasks.done}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      / {myMetrics.tasks.totalAssigned} tasks
                    </span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
                    {Math.round(myMetrics.tasks.completionPercent || 0)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                  <span>Story Points:</span>
                  <span className="font-mono font-bold text-foreground">
                    {myMetrics.tasks.completedStoryPoints || 0} / {myMetrics.tasks.totalStoryPoints || 0} SP
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Thẻ 2: Minh chứng Git Commits */}
            <Card className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-xs">
              <CardContent className="p-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Minh chứng Git</span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <GitCommitIcon className="size-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="font-mono text-2xl font-black text-foreground">
                    {myMetrics.commits.totalCommits}{" "}
                    <span className="text-sm font-normal text-muted-foreground">commits</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  >
                    {Math.round(myMetrics.commits.traceabilityPercent || 0)}% Traceability
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                  <span>Lần commit gần nhất:</span>
                  <span className="font-mono font-medium text-foreground truncate max-w-[140px]">
                    {formattedLastCommit}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Thẻ 3: Sprint hiện tại & Đồng bộ */}
            <Card className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-xs">
              <CardContent className="p-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    {isViewingDifferentSprint ? "Sprint đang xem" : "Sprint hiện tại"}
                  </span>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <KanbanIcon className="size-4" />
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="text-base font-bold text-foreground truncate max-w-[180px]" title={currentSprint?.name || "Chưa có Sprint"}>
                    {currentSprint?.name || "Chưa bắt đầu"}
                  </div>
                  {currentSprint?.state && (
                    <Badge variant="outline" className="text-[10px] uppercase font-bold">
                      {currentSprint.state}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                  <span>Tiến độ nhóm:</span>
                  <span className="font-mono font-bold text-foreground">
                    {currentSprint ? `${currentSprint.completedTasks}/${currentSprint.totalTasks} (${Math.round(currentSprint.completionPercent || 0)}%)` : "N/A"}
                  </span>
                </div>
                {(integrations?.jira?.connected || integrations?.github?.connected) && (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {integrations?.jira?.connected && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-sky-500/30 text-sky-700 dark:text-sky-300">
                        Jira: {integrations.jira.projectKey || "Đã kết nối"}
                      </Badge>
                    )}
                    {integrations?.github?.connected && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                        GitHub: {integrations.github.repositoryCount ?? 0} repos
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Biểu đồ Commit theo tuần & Phân bố Task của tôi */}
          <StudentWeeklyCommitsChart weeklyCommits={weeklyCommits} tasks={myMetrics.tasks} />

          {/* Grid 2 Cột: Nhiệm vụ đang làm & Nhật ký commit gần đây */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <StudentActiveTasksCard tasks={myActiveTasks} courseId={courseId} />
            <StudentRecentCommitsCard commits={recentCommits} courseId={courseId} />
          </div>
        </div>
      ) : (
        /* Tab Toàn Nhóm (Dành cho Trưởng nhóm) */
        <div className="space-y-6">
          {progressQuery.isLoading ? (
            <StudentDashboardSkeleton />
          ) : progress ? (
            <>
              <ProjectProgressSummary progress={progress} />
              <ProgressFactNote />
              <TeamWorkloadComparisonChart
                members={members}
                selectedStudentId={detailStudentId}
                onSelectMember={openMemberDetail}
                currentSprintName={progress.currentSprint?.name}
              />
              <MemberProgressSheet
                projectId={projectId}
                studentId={detailStudentId}
                open={Boolean(detailStudentId)}
                onOpenChange={(open) => {
                  if (!open) setDetailStudentId(null);
                }}
              />
            </>
          ) : (
            <EmptyPanel
              title="Chưa có dữ liệu tiến độ nhóm"
              description="Hệ thống chưa đồng bộ đủ dữ liệu tiến độ nhóm từ Jira và GitHub."
            />
          )}
        </div>
      )}
    </div>
  );
}

function EmptyPanel({
  title,
  description,
  href,
  action,
  onRetry,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="rounded-2xl border border-dashed border-border/80 p-8 text-center shadow-xs">
      <CardContent className="space-y-3 p-0">
        <FolderKanbanIcon className="mx-auto size-8 text-muted-foreground/50" />
        <h2 className="text-base font-bold">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
        {href && action ? (
          <Link href={href} prefetch={true} className={cn(buttonVariants({ size: "sm" }), "text-xs")}>
            {action}
          </Link>
        ) : null}
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className={cn(buttonVariants({ size: "sm", variant: "outline" }), "cursor-pointer text-xs")}
          >
            Thử lại
          </button>
        ) : null}
      </CardContent>
    </Card>
  );
}
