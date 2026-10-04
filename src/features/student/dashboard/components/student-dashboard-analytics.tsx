"use client";

import { useState, useMemo, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2Icon,
  CalendarIcon,
  CrownIcon,
  FilterIcon,
  FolderKanbanIcon,
  GitCommitIcon,
  KanbanIcon,
  LayersIcon,
  RefreshCwIcon,
  RotateCcwIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeaderBadge } from "@/components/common/leader-badge";
import { MemberProgressSheet } from "@/features/progress/components/member-progress-sheet";
import { replaceWithoutSearchParams } from "@/features/assistant/lib/clear-search-params";
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
import { getApiErrorCode, getApiErrorMessage, getApiErrorStatus } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/common/custom-select";
import { useProjectSprints } from "@/features/student/sprint-progress/hooks/use-project-sprints";
import { useProjectJiraSourceSelection } from "@/features/student/project/hooks/use-project-jira-source-selection";
import { normalizeProjectProgress } from "@/features/progress/lib/progress-format";
import { useStudentDashboard } from "../hooks/use-student-dashboard";
import { formatStudentNullablePercent } from "../lib/student-dashboard-format";
import { getSprintSourceUserMessage } from "@/features/student/sprint-progress/lib/sprint-query-source";
import type { ProjectSprintResponse } from "@/features/student/sprint-progress/types/jira-task-types";
import { StudentActiveTasksCard } from "./student-active-tasks-card";
import { StudentAlertsBanner } from "./student-alerts-banner";
import { DelayCasesActionWidget } from "@/features/delay-cases/components/delay-cases-action-widget";
import { StudentRecentCommitsCard } from "./student-recent-commits-card";
import dynamic from "next/dynamic";
import { Loader2Icon } from "lucide-react";

const StudentWeeklyCommitsChart = dynamic(
  () => import("./student-weekly-commits-chart").then((mod) => mod.StudentWeeklyCommitsChart),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground bg-muted/10 rounded-xl">
        <Loader2Icon className="w-6 h-6 animate-spin" />
      </div>
    ),
  }
);
import { TeamWorkloadComparisonChart } from "./team-workload-comparison-chart";
import { StudentDashboardSkeleton } from "./student-dashboard-skeleton";

/**
 * Tìm sprint mới nhất của một site Jira:
 * 1. Ưu tiên sprint có trạng thái đang chạy (ACTIVE)
 * 2. Nếu không có sprint active, sắp xếp theo startDate mới nhất hoặc tên sprint
 */
function getLatestSprint(sprints: ProjectSprintResponse[]): ProjectSprintResponse | null {
  if (!sprints || sprints.length === 0) return null;

  const activeSprint = sprints.find((sp) => sp.state?.toLowerCase() === "active");
  if (activeSprint) return activeSprint;

  const sorted = [...sprints].sort((a, b) => {
    const timeA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const timeB = b.startDate ? new Date(b.startDate).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    return b.name.localeCompare(a.name, undefined, { numeric: true });
  });

  return sorted[0] || sprints[0];
}

export function StudentDashboardAnalytics() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedMemberId = searchParams.get("memberId")?.trim() || "";
  const { course, courseId, isLoading: isCoursesLoading, isInvalidCourse } = useStudentCourseContext();
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);

  // Trưởng nhóm có thể chọn xem tab Cá nhân (Cockpit) hoặc xem Toàn nhóm
  const [activeTab, setActiveTab] = useState<"personal" | "team">("personal");
  const [detailStudentId, setDetailStudentId] = useState<string | null>(null);
  const effectiveActiveTab = requestedMemberId ? "team" : activeTab;
  const effectiveDetailStudentId = requestedMemberId || detailStudentId;
  const [isManualRefresh, setIsManualRefresh] = useState(false);

  // State lưu projectId nếu có từ course hoặc từ query
  const [discoveredProjectId, setDiscoveredProjectId] = useState<string | null>(course?.projectId || null);

  // Lấy effectiveSourceId giống SprintProgressView để useProjectSprints resolve đúng nguồn Jira
  const jiraSource = useProjectJiraSourceSelection(discoveredProjectId);
  const effectiveSourceId = selectedIntegrationId || jiraSource.effectiveSourceId;

  const selectedJiraSource = useMemo(() => {
    const sources = jiraSource.activeSources || [];
    return sources.find(
      (source) => source.integrationId === effectiveSourceId
    );
  }, [jiraSource.activeSources, effectiveSourceId]);

  // Danh sách sprint: truyền effectiveSourceId để tránh trạng thái "needs_selection" khi có nhiều nguồn
  const { data: projectSprints } = useProjectSprints(discoveredProjectId, effectiveSourceId, { enabled: Boolean(discoveredProjectId) });

  // Lọc sprints thuộc Site (effectiveSourceId) đang chọn
  const siteFilteredProjectSprints = useMemo(() => {
    if (!projectSprints || projectSprints.length === 0) return [];
    if (!effectiveSourceId) return projectSprints;
    return projectSprints.filter((sp) => {
      const spSourceId = sp.source?.jiraIntegrationId || sp.jiraIntegrationId;
      return !spSourceId || spSourceId === effectiveSourceId;
    });
  }, [projectSprints, effectiveSourceId]);

  // Sprint được xác định hiệu lực: nếu sprint chọn thủ công thuộc site đang chọn thì giữ lại, ngược lại lấy sprint mới nhất của site đó
  const effectiveSelectedSprintId = useMemo(() => {
    if (selectedSprintId && siteFilteredProjectSprints.some((sp) => sp.id === selectedSprintId)) {
      return selectedSprintId;
    }
    const latest = getLatestSprint(siteFilteredProjectSprints);
    return latest ? latest.id : null;
  }, [selectedSprintId, siteFilteredProjectSprints]);

  const selectedSprintValue = effectiveSelectedSprintId || "";

  // Gọi dashboard với sprint và site cụ thể
  const dashboardQuery = useStudentDashboard(
    courseId,
    effectiveSelectedSprintId,
    effectiveSourceId,
    { enabled: Boolean(courseId) }
  );
  const data = dashboardQuery.data;

  // Cập nhật discoveredProjectId khi data trả về
  const currentProjectId = data?.team?.projectId || course?.projectId || null;
  if (currentProjectId && currentProjectId !== discoveredProjectId) {
    setDiscoveredProjectId(currentProjectId);
  }

  const isLeader = Boolean(
    (data?.student?.teamRole || "").toUpperCase() === "LEADER"
  );
  const projectId = discoveredProjectId || currentProjectId;
  const canLoadProgress = Boolean(isLeader && projectId && effectiveActiveTab === "team");

  // Tiến độ nhóm và SSE project chỉ khi Leader đang xem tab Toàn nhóm
  const progressQuery = useProjectProgress(projectId, { enabled: canLoadProgress });
  useProjectRealtime(projectId, { enabled: canLoadProgress, includeProgress: true });

  const handleManualRefresh = useCallback(async () => {
    setIsManualRefresh(true);
    try {
      await dashboardQuery.refetch();
      if (canLoadProgress) {
        await progressQuery.refetch();
      }
    } finally {
      setIsManualRefresh(false);
    }
  }, [canLoadProgress, dashboardQuery, progressQuery]);

  const progress = normalizeProjectProgress(progressQuery.data);
  const members = progress?.memberProgress ?? [];

  const openMemberDetail = (studentId: string) => {
    setDetailStudentId(studentId);
  };

  const handleSiteChange = useCallback((newSourceId: string) => {
    jiraSource.selectSource(newSourceId);
    setSelectedIntegrationId(newSourceId);
    setSelectedSprintId(null);
  }, [jiraSource]);

  const isJiraConnected = Boolean(data?.integrations?.jira?.connected || jiraSource.activeSources.length > 0);
  const currentJiraProjectKey = selectedJiraSource?.projectKey || data?.integrations?.jira?.projectKey || "JIRA";

  const siteSelectOptions = useMemo(() => {
    if (!jiraSource.activeSources || jiraSource.activeSources.length === 0) {
      if (isJiraConnected) {
        return [
          {
            value: "default",
            label: `${currentJiraProjectKey} · Kết nối mặc định`,
            subLabel: "Nguồn tích hợp Jira",
          },
        ];
      }
      return [
        {
          value: "",
          label: "Chưa kết nối Jira",
          subLabel: "Không tìm thấy nguồn Jira",
        },
      ];
    }
    return jiraSource.activeSources.map((source) => ({
      value: source.integrationId,
      label: `${source.projectKey || "JIRA"} · ${source.siteName}`,
      subLabel: source.boardId ? `Board: ${source.boardId}` : "Board mặc định",
    }));
  }, [jiraSource.activeSources, isJiraConnected, currentJiraProjectKey]);

  const currentSprint = data?.currentSprint;
  const sprintSelectOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: Array<{ value: string; label: string; subLabel?: string }> = [];

    // Chỉ đưa các sprint thuộc site đang chọn vào danh sách lựa chọn
    if (siteFilteredProjectSprints && siteFilteredProjectSprints.length > 0) {
      for (const sp of siteFilteredProjectSprints) {
        if (!sp.id || seen.has(sp.id)) continue;
        seen.add(sp.id);

        const isActive = sp.state?.toLowerCase() === "active";
        const stateLabel =
          isActive
            ? "Đang diễn ra"
            : sp.state?.toLowerCase() === "closed"
              ? "Đã đóng"
              : "Dự kiến";

        options.push({
          value: sp.id,
          label: sp.name,
          subLabel: isActive ? `Sprint đang chạy (${stateLabel})` : `Trạng thái: ${stateLabel}`,
        });
      }
    }

    return options;
  }, [siteFilteredProjectSprints]);

  const isSprintLoading =
    Boolean(dashboardQuery.isPlaceholderData) ||
    Boolean(dashboardQuery.isFetching && selectedSprintId);

  const displaySprint = useMemo(() => {
    const matched = siteFilteredProjectSprints.find((sp) => sp.id === selectedSprintValue);
    if (matched && currentSprint?.id !== selectedSprintValue) {
      return {
        id: matched.id,
        name: matched.name,
        state: matched.state,
        startDate: matched.startDate,
        endDate: matched.endDate,
        completedTasks: 0,
        totalTasks: 0,
        completionPercent: null,
      };
    }
    return currentSprint;
  }, [siteFilteredProjectSprints, selectedSprintValue, currentSprint]);

  const sprintDates = useMemo(() => {
    const rawStart =
      data?.sprintMetrics?.startDate ||
      displaySprint?.startDate ||
      currentSprint?.startDate;
    const rawEnd =
      data?.sprintMetrics?.endDate ||
      displaySprint?.endDate ||
      currentSprint?.endDate;

    if (!rawStart && !rawEnd) return null;

    const formatDate = (val?: string | null) => {
      if (!val) return "";
      try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return val;
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      } catch {
        return val;
      }
    };

    const startStr = formatDate(rawStart);
    const endStr = formatDate(rawEnd);

    if (startStr && endStr) {
      return `${startStr} – ${endStr}`;
    }
    return startStr || endStr;
  }, [data?.sprintMetrics, displaySprint, currentSprint]);

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
    const errorCode = getApiErrorCode(dashboardQuery.error);
    if (errorCode === "SPRINT_NOT_FOUND") {
      return (
        <EmptyPanel
          title="Không tìm thấy Sprint"
          description="Sprint đã chọn không thuộc dự án của nhóm bạn hoặc không tồn tại."
          action="Quay về Sprint hiện tại"
          onAction={() => setSelectedSprintId(null)}
        />
      );
    }
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

  // Lọc myActiveTasks theo Site đang chọn để đảm bảo không lẫn task từ site khác
  const activeSources = jiraSource.activeSources || [];
  const scopedActiveTasks =
    !myActiveTasks || myActiveTasks.length === 0
      ? []
      : !selectedJiraSource?.projectKey || activeSources.length <= 1
        ? myActiveTasks
        : myActiveTasks.filter((task) => {
            const targetKey = selectedJiraSource.projectKey.toUpperCase();
            const prefix = task.externalKey?.split("-")[0]?.toUpperCase();
            return prefix === targetKey;
          });

  // Lọc actionableAlerts theo Site/Sprint đang chọn
  const siteSprintIds = new Set(siteFilteredProjectSprints.map((sp) => sp.id));
  const scopedAlerts =
    !actionableAlerts || actionableAlerts.length === 0
      ? []
      : !siteFilteredProjectSprints || siteFilteredProjectSprints.length === 0
        ? actionableAlerts
        : actionableAlerts.filter((alert) => {
            const alertSprintId = alert.targetIds?.sprintId;
            return !alertSprintId || siteSprintIds.has(alertSprintId);
          });

  // Metrics của sprint đang xem cho biểu đồ
  const sprintTasksForChart = data.sprintMetrics?.tasks || myMetrics.tasks;

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
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-border/80 bg-card/90 p-5 shadow-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <Avatar className="size-11 rounded-xl border border-primary/25 shadow-xs" size="lg">
            <AvatarImage
              src={student.avatarUrl || undefined}
              alt={student.fullName}
              referrerPolicy="no-referrer"
              className="object-cover rounded-xl"
            />
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-sm font-mono">
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
                <Badge variant="secondary" className="text-xs font-bold">
                  Thành viên nhóm
                </Badge>
              )}
              <Badge variant="outline" className="font-mono text-xs">
                Nhóm {team.teamNo} · {team.teamName}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bảng điều khiển cá nhân hóa tự động cập nhật từ hoạt động Jira và GitHub của bạn.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center">
          {isLeader && (
            <div className="flex items-center rounded-xl border border-border/70 bg-muted/30 p-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("personal");
                  setDetailStudentId(null);
                  if (requestedMemberId) {
                    replaceWithoutSearchParams(router, pathname, searchParams, ["memberId"]);
                  }
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                  effectiveActiveTab === "personal"
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
                  effectiveActiveTab === "team"
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
            onClick={() => void handleManualRefresh()}
            disabled={isManualRefresh}
            className="h-8 gap-1.5 text-xs cursor-pointer"
          >
            <RefreshCwIcon className={cn("size-3.5", isManualRefresh && "animate-spin")} />
            <span className="hidden sm:inline">{isManualRefresh ? "Đang làm mới" : "Làm mới"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Nội dung Tab: Cá nhân (Cockpit) hay Toàn nhóm (Leader) */}
      {effectiveActiveTab === "personal" ? (
        <div className="space-y-6">
          {/* Actionable Alerts Banner */}
          <div className="space-y-4">
          <StudentAlertsBanner alerts={scopedAlerts} courseId={courseId} />
            {projectId && (
              <DelayCasesActionWidget
                projectId={projectId}
                mode="student"
              />
            )}
          </div>

          {/* Thanh Bộ Lọc Site & Sprint - Riêng 1 Hàng */}
          <div className="flex flex-col gap-3.5 rounded-xl border border-border/80 bg-card/90 p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <FilterIcon className="size-3.5 text-primary" />
                <span>Bộ lọc hiển thị:</span>
              </div>

              {/* Bộ lọc Site Jira */}
              <div className="flex items-center gap-1.5 min-w-[210px] sm:min-w-[250px]">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap flex items-center gap-1">
                  <LayersIcon className="size-3 text-sky-500" />
                  <span>Site:</span>
                </span>
                <div className="flex-1 min-w-0">
                  <CustomSelect
                    id="student-dashboard-site-select"
                    value={effectiveSourceId || siteSelectOptions[0]?.value || ""}
                    onChange={handleSiteChange}
                    options={siteSelectOptions}
                    placeholder="Chọn Site Jira..."
                    triggerClassName="h-8 text-xs font-semibold px-2.5 rounded-lg border-border/70 bg-muted/20 hover:bg-muted/40"
                    dropdownClassName="min-w-[260px] max-h-56 overflow-y-auto custom-scrollbar"
                    disabled={siteSelectOptions.length <= 1}
                  />
                </div>
              </div>

              {/* Bộ lọc Sprint */}
              <div className="flex items-center gap-1.5 min-w-[240px] sm:min-w-[300px]">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap flex items-center gap-1">
                  <KanbanIcon className="size-3 text-amber-500" />
                  <span>Sprint:</span>
                </span>
                <div className="flex-1 min-w-0">
                  <CustomSelect
                    id="student-dashboard-sprint-select"
                    value={selectedSprintValue}
                    onChange={(val) => setSelectedSprintId(val)}
                    options={sprintSelectOptions}
                    placeholder={currentSprint?.name || "Chọn Sprint..."}
                    triggerClassName="h-8 text-xs font-semibold px-2.5 rounded-lg border-border/70 bg-muted/20 hover:bg-muted/40"
                    dropdownClassName="min-w-[260px] sm:min-w-[340px] max-h-56 sm:max-h-60 overflow-y-auto custom-scrollbar"
                    disabled={sprintSelectOptions.length === 0}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {selectedSprintId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSprintId(null)}
                  className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                >
                  <RotateCcwIcon className="size-3" />
                  <span>Về Sprint hiện tại</span>
                </Button>
              )}
              {getSprintStateBadge(displaySprint?.state || currentSprint?.state)}
            </div>
          </div>

          {/* 3 Thẻ Chỉ Số KPI Cá Nhân Nổi Bật */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Thẻ 1: Nhiệm vụ phân công */}
            <Card className="rounded-xl border border-border/80 bg-card/90 p-4 shadow-xs">
              <CardContent className="p-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground font-medium">Nhiệm vụ của tôi</span>
                    <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground bg-muted/40 border-border/70 px-1.5 py-0">
                      Toàn dự án
                    </Badge>
                  </div>
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
                  <Badge variant="outline" className="font-mono text-xs bg-primary/10 text-primary border-primary/20">
                    {formatStudentNullablePercent(myMetrics.tasks.completionPercent)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <span>Story Points:</span>
                  <span className="font-mono font-bold text-foreground">
                    {myMetrics.tasks.completedStoryPoints || 0} / {myMetrics.tasks.totalStoryPoints || 0} SP
                  </span>
                </div>

                {(myMetrics.tasks.inProgress > 0 || myMetrics.tasks.inReview > 0 || myMetrics.tasks.blocked > 0) && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] text-muted-foreground font-mono">
                    {myMetrics.tasks.inProgress > 0 && (
                      <Badge variant="outline" className="px-1.5 py-0 border-sky-500/30 text-sky-700 dark:text-sky-300">
                        {myMetrics.tasks.inProgress} đang làm
                      </Badge>
                    )}
                    {myMetrics.tasks.inReview > 0 && (
                      <Badge variant="outline" className="px-1.5 py-0 border-purple-500/30 text-purple-700 dark:text-purple-300">
                        {myMetrics.tasks.inReview} chờ review
                      </Badge>
                    )}
                    {myMetrics.tasks.blocked > 0 && (
                      <Badge variant="outline" className="px-1.5 py-0 border-red-500/30 text-red-700 dark:text-red-300">
                        {myMetrics.tasks.blocked} bị chặn
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Thẻ 2: Minh chứng Git Commits */}
            <Card className="rounded-xl border border-border/80 bg-card/90 p-4 shadow-xs">
              <CardContent className="p-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground font-medium">Minh chứng Git</span>
                    <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground bg-muted/40 border-border/70 px-1.5 py-0">
                      Toàn dự án
                    </Badge>
                  </div>
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
                    className="font-mono text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  >
                    {Math.round(myMetrics.commits.traceabilityPercent || 0)}% Traceability
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <span>Lần commit gần nhất:</span>
                  <span className="font-mono font-medium text-foreground truncate max-w-[140px]">
                    {formattedLastCommit}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Thẻ 3: Sprint & Đồng bộ */}
            <Card className="rounded-xl border border-border/80 bg-card/90 p-4 shadow-xs">
              <CardContent className="p-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs text-muted-foreground font-medium">
                      Sprint đang xem
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                    <KanbanIcon className="size-4" />
                  </div>
                </div>

                {isSprintLoading ? (
                  <div className="flex items-center justify-center py-5 text-xs text-muted-foreground gap-2">
                    <Loader2Icon className="size-4 animate-spin text-primary" />
                    <span>Đang tải số liệu Sprint...</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <div
                          className="font-mono text-xl sm:text-2xl font-black text-foreground break-words leading-tight"
                          title={displaySprint?.name || currentSprint?.name || "Chưa có Sprint"}
                        >
                          {displaySprint?.name || currentSprint?.name || "Chưa bắt đầu"}
                        </div>
                        {data.sprintMetrics?.tasks?.completionPercent !== null && data.sprintMetrics?.tasks?.completionPercent !== undefined ? (
                          <Badge
                            variant="outline"
                            className="font-mono text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shrink-0"
                            title="Tiến độ cá nhân trong Sprint"
                          >
                            {formatStudentNullablePercent(data.sprintMetrics.tasks.completionPercent)}
                          </Badge>
                        ) : displaySprint && displaySprint.completionPercent !== null ? (
                          <Badge
                            variant="outline"
                            className="font-mono text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shrink-0"
                            title="Tiến độ cả nhóm trong Sprint"
                          >
                            {formatStudentNullablePercent(displaySprint.completionPercent)}
                          </Badge>
                        ) : null}
                      </div>
                      {sprintDates && (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                          <CalendarIcon className="size-3 text-amber-500 shrink-0" />
                          <span>{sprintDates}</span>
                        </div>
                      )}
                    </div>

                    {data.sprintMetrics ? (
                      <div className="space-y-1.5 pt-1 border-t border-border/50 text-xs">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Tiến độ cá nhân:</span>
                          <span className="font-mono font-bold text-foreground">
                            {data.sprintMetrics.tasks.done} / {data.sprintMetrics.tasks.totalAssigned} tasks
                            <span className="font-normal text-muted-foreground ml-1">
                              ({data.sprintMetrics.tasks.completedStoryPoints || 0}/{data.sprintMetrics.tasks.totalStoryPoints || 0} SP)
                            </span>
                          </span>
                        </div>

                        {(data.sprintMetrics.tasks.inProgress > 0 || data.sprintMetrics.tasks.inReview > 0 || data.sprintMetrics.tasks.blocked > 0) && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] text-muted-foreground font-mono">
                            {data.sprintMetrics.tasks.inProgress > 0 && (
                              <Badge variant="outline" className="px-1.5 py-0 border-sky-500/30 text-sky-700 dark:text-sky-300">
                                {data.sprintMetrics.tasks.inProgress} đang làm
                              </Badge>
                            )}
                            {data.sprintMetrics.tasks.inReview > 0 && (
                              <Badge variant="outline" className="px-1.5 py-0 border-purple-500/30 text-purple-700 dark:text-purple-300">
                                {data.sprintMetrics.tasks.inReview} chờ review
                              </Badge>
                            )}
                            {data.sprintMetrics.tasks.blocked > 0 && (
                              <Badge variant="outline" className="px-1.5 py-0 border-red-500/30 text-red-700 dark:text-red-300">
                                {data.sprintMetrics.tasks.blocked} bị chặn
                              </Badge>
                            )}
                          </div>
                        )}

                        {data.sprintMetrics.commits && (
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span>Commits cá nhân Sprint:</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {data.sprintMetrics.commits.totalCommits} commits ({Math.round(data.sprintMetrics.commits.traceabilityPercent || 0)}% hợp lệ)
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 pt-1 border-t border-border/40">
                          <span>Tiến độ cả nhóm:</span>
                          <span className="font-mono font-medium text-foreground/80">
                            {displaySprint
                              ? `${displaySprint.completedTasks} / ${displaySprint.totalTasks} tasks (${formatStudentNullablePercent(displaySprint.completionPercent)})`
                              : "Chưa ghi nhận"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                        <span>Tiến độ nhóm:</span>
                        <span className="font-mono font-bold text-foreground">
                          {displaySprint
                            ? `${displaySprint.completedTasks} / ${displaySprint.totalTasks} tasks`
                            : "Chưa ghi nhận"}
                        </span>
                      </div>
                    )}

                    {(integrations?.jira?.connected || integrations?.github?.connected) && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
                        {integrations?.jira?.connected && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 border-sky-500/30 text-sky-700 dark:text-sky-300"
                            title={integrations.jira.lastSyncedAt ? `Lần đồng bộ Jira gần nhất: ${new Date(integrations.jira.lastSyncedAt).toLocaleString("vi-VN")}` : undefined}
                          >
                            Jira: {integrations.jira.status === "ACTIVE" ? "Đã kết nối" : "Chưa kết nối"}
                          </Badge>
                        )}
                        {integrations?.github?.connected && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                            title={integrations.github.lastSyncedAt ? `Lần đồng bộ GitHub gần nhất: ${new Date(integrations.github.lastSyncedAt).toLocaleString("vi-VN")}` : undefined}
                          >
                            GitHub: {integrations.github.status === "ACTIVE" ? "Đã kết nối" : "Chưa kết nối"}
                          </Badge>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Biểu đồ Commit theo tuần & Phân bố Task của tôi */}
          <StudentWeeklyCommitsChart weeklyCommits={weeklyCommits} tasks={sprintTasksForChart} />

          {/* Grid 2 Cột: Nhiệm vụ đang làm & Nhật ký commit gần đây */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <StudentActiveTasksCard
              tasks={scopedActiveTasks}
              courseId={courseId}
              projectId={projectId}
            />
            <StudentRecentCommitsCard commits={recentCommits} courseId={courseId} />
          </div>
        </div>
      ) : (
        /* Tab Toàn Nhóm (Dành cho Trưởng nhóm) */
        <div className="space-y-6">
          {progressQuery.isLoading && !progress ? (
            <StudentDashboardSkeleton />
          ) : progressQuery.isError ? (
            <EmptyPanel
              title={getSprintSourceUserMessage({ error: progressQuery.error }).title}
              description={
                getApiErrorStatus(progressQuery.error) === 403 ||
                  getApiErrorCode(progressQuery.error) === "ACCESS_DENIED"
                  ? "Thành viên nhóm xem tiến độ cá nhân trên bảng điều khiển. Tiến độ toàn nhóm dành cho trưởng nhóm."
                  : getSprintSourceUserMessage({ error: progressQuery.error }).description
              }
              onRetry={() => void progressQuery.refetch()}
            />
          ) : progress ? (
            <>
              <ProjectProgressSummary progress={progress} />
              <ProgressFactNote />
              <TeamWorkloadComparisonChart
                members={members}
                selectedStudentId={effectiveDetailStudentId}
                onSelectMember={openMemberDetail}
                currentSprintName={progress.currentSprint?.name}
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
      {effectiveDetailStudentId ? (
        <MemberProgressSheet
          projectId={projectId}
          studentId={effectiveDetailStudentId}
          open
          onOpenChange={(open) => {
            if (!open) {
              setDetailStudentId(null);
              if (requestedMemberId) {
                replaceWithoutSearchParams(router, pathname, searchParams, ["memberId"]);
              }
            }
          }}
        />
      ) : null}
    </div>
  );
}

function getSprintStateBadge(state?: string | null) {
  if (!state) return null;
  const upper = state.toUpperCase();
  if (upper === "ACTIVE") {
    return (
      <Badge variant="outline" className="text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
        Đang chạy
      </Badge>
    );
  }
  if (upper === "CLOSED") {
    return (
      <Badge variant="outline" className="text-xs font-bold bg-muted text-muted-foreground border-border">
        Đã đóng
      </Badge>
    );
  }
  if (upper === "FUTURE") {
    return (
      <Badge variant="outline" className="text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">
        Dự kiến
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs font-bold uppercase">
      {state}
    </Badge>
  );
}

function EmptyPanel({
  title,
  description,
  href,
  action,
  onAction,
  onRetry,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
  onAction?: () => void;
  onRetry?: () => void;
}) {
  return (
    <Card className="rounded-xl border border-dashed border-border/80 p-8 text-center shadow-xs">
      <CardContent className="space-y-3 p-0">
        <FolderKanbanIcon className="mx-auto size-8 text-muted-foreground/50" />
        <h2 className="text-base font-bold">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
        {href && action ? (
          <Link href={href} prefetch={true} className={cn(buttonVariants({ size: "sm" }), "text-xs")}>
            {action}
          </Link>
        ) : onAction && action ? (
          <button
            type="button"
            onClick={onAction}
            className={cn(buttonVariants({ size: "sm" }), "cursor-pointer text-xs")}
          >
            {action}
          </button>
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
