"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  ActivityIcon,
  AlertTriangleIcon,
  FolderKanbanIcon,
  RefreshCwIcon,
  UsersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useLecturerCourseAccess,
  useLecturerCourseDashboard,
} from "../hooks/use-lecturer-courses";
import {
  filterAttentionTeams,
  formatDashboardGeneratedAt,
  formatNullablePercent,
  getAtRiskTeamCount,
  sortDashboardTeamsByRisk,
} from "../lib/lecturer-dashboard-format";
import { LecturerPageShell } from "./lecturer-page-shell";
import { CourseDashboardTeamCard } from "./course-dashboard-team-card";
import { CourseActivityHeatmap } from "./course-activity-heatmap";
import { cn } from "@/lib/utils";

const CourseAnalyticsCharts = dynamic(
  () => import("./course-analytics-charts").then((mod) => mod.CourseAnalyticsCharts),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-2xl bg-muted/60" /> }
);

interface CourseOverviewPageProps {
  courseId: string;
}

export function CourseOverviewPage({ courseId }: CourseOverviewPageProps) {
  const dashboardQuery = useLecturerCourseDashboard(courseId);
  const { isAccessDenied } = useLecturerCourseAccess(dashboardQuery.isError, dashboardQuery.error);
  const [activeTab, setActiveTab] = useState<"attention" | "all">("attention");
  const [highlightedTeamIds, setHighlightedTeamIds] = useState<string[]>([]);

  const dashboard = dashboardQuery.data;
  const teams = useMemo(() => dashboard?.teams ?? [], [dashboard?.teams]);
  const attentionTeams = useMemo(
    () => sortDashboardTeamsByRisk(filterAttentionTeams(teams)),
    [teams]
  );
  const displayedTeams = useMemo(
    () => (activeTab === "attention" ? attentionTeams : sortDashboardTeamsByRisk(teams)),
    [activeTab, attentionTeams, teams]
  );
  const generatedAtLabel = formatDashboardGeneratedAt(dashboard?.generatedAt);
  const atRisk = dashboard ? getAtRiskTeamCount(dashboard.summary) : 0;
  const highlightedTeamIdSet = useMemo(
    () => new Set(highlightedTeamIds),
    [highlightedTeamIds]
  );

  if (isAccessDenied) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Đang chuyển về danh sách lớp...
      </div>
    );
  }

  return (
    <LecturerPageShell
      title="Tổng quan lớp học phần"
      description={
        dashboard
          ? `${dashboard.subjectName || "Lớp học phần"} · Theo dõi tiến độ và các nhóm cần chú ý trong Sprint hiện tại.`
          : "Đang tải tổng quan lớp học phần."
      }
      badges={
        <>
          <Badge
            variant="outline"
            className="border-primary/25 bg-primary/10 font-mono text-xs font-bold text-primary"
          >
            {dashboard?.courseCode || "Đang tải"}
          </Badge>
          {dashboard?.subjectCode ? (
            <Badge variant="secondary" className="font-mono text-xs">
              {dashboard.subjectCode}
            </Badge>
          ) : null}
          <Badge variant="secondary" className="font-mono text-xs">
            {dashboard?.classCode || "Chưa gắn lớp sinh viên"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {dashboard?.semesterCode || "Học kỳ hiện tại"}
          </Badge>
        </>
      }
      actions={
        <>
          {generatedAtLabel ? (
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Cập nhật lúc {generatedAtLabel}
            </p>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 cursor-pointer text-xs"
            disabled={dashboardQuery.isFetching}
            onClick={() => void dashboardQuery.refetch()}
          >
            <RefreshCwIcon className={cn("size-3.5", dashboardQuery.isFetching && "animate-spin")} />
            Làm mới
          </Button>
        </>
      }
      isLoading={dashboardQuery.isLoading && !dashboard}
      error={dashboardQuery.isError ? dashboardQuery.error : undefined}
      errorTitle="Không tải được tổng quan lớp học phần"
      onRetry={() => void dashboardQuery.refetch()}
    >
      {dashboard ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OverviewStatCard
              icon={<UsersIcon className="size-5" />}
              iconBoxClass="bg-primary/10 text-primary"
              label="Sinh viên đang học"
              value={dashboard.summary.enrolledStudents}
              subValue="sinh viên"
              badge={
                <Badge variant="outline" className="font-mono text-[11px]">
                  {dashboard.summary.unassignedStudents > 0
                    ? `${dashboard.summary.unassignedStudents} chưa có nhóm`
                    : "Đã phân nhóm đầy đủ"}
                </Badge>
              }
            />
            <OverviewStatCard
              icon={<FolderKanbanIcon className="size-5" />}
              iconBoxClass="bg-primary/10 text-primary"
              label="Nhóm trong lớp"
              value={dashboard.summary.totalTeams}
              subValue="nhóm"
              badge={
                <Badge variant="outline" className="font-mono text-[11px]">
                  {dashboard.summary.teamsWithoutProject > 0
                    ? `${dashboard.summary.teamsWithoutProject} chưa có dự án`
                    : "Đã có dự án đầy đủ"}
                </Badge>
              }
            />
            <OverviewStatCard
              icon={<AlertTriangleIcon className="size-5" />}
              iconBoxClass="bg-destructive/10 text-destructive"
              label="Nhóm cần theo dõi"
              value={atRisk}
              subValue="nhóm"
              badge={
                <Badge variant="outline" className="font-mono text-[11px]">
                  {dashboard.summary.criticalTeams} nghiêm trọng · {dashboard.summary.warningTeams} cần chú ý
                  {dashboard.summary.unknownTeams > 0
                    ? ` · ${dashboard.summary.unknownTeams} thiếu dữ liệu`
                    : ""}
                </Badge>
              }
            />
            <OverviewStatCard
              icon={<ActivityIcon className="size-5" />}
              iconBoxClass="bg-primary/10 text-primary"
              label="Tiến độ công việc"
              value={dashboard.taskStatusTotals.done}
              subValue={`/ ${dashboard.taskStatusTotals.total}`}
              badge={
                <Badge variant="outline" className="font-mono text-[11px] font-bold">
                  {formatNullablePercent(dashboard.taskStatusTotals.completionPercent)}
                  {dashboard.taskStatusTotals.overdue > 0
                    ? ` · ${dashboard.taskStatusTotals.overdue} quá hạn`
                    : ""}
                </Badge>
              }
            />
          </div>

          <CourseActivityHeatmap
            teams={teams}
            onHighlightedTeamIdsChange={setHighlightedTeamIds}
          />

          <CourseAnalyticsCharts
            riskPolicy={dashboard.riskPolicy}
            taskStatusTotals={dashboard.taskStatusTotals}
            teams={teams}
            onHighlightedTeamIdsChange={setHighlightedTeamIds}
          />

          <Card className="space-y-4 rounded-2xl border border-border/80 p-5 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-extrabold text-foreground">
                  Nhóm cần theo dõi
                </h2>
                <p className="text-xs text-muted-foreground">
                  Ưu tiên các nhóm chậm tiến độ, thiếu hoạt động hoặc đang có vấn đề cần xử lý.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-xl bg-muted/60 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab("attention")}
                    className={cn(
                      "cursor-pointer rounded-lg px-3 py-1 font-semibold transition-all",
                      activeTab === "attention"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Cần chú ý ({attentionTeams.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("all")}
                    className={cn(
                      "cursor-pointer rounded-lg px-3 py-1 font-semibold transition-all",
                      activeTab === "all"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Tất cả nhóm ({teams.length})
                  </button>
                </div>
              </div>
            </div>

            {displayedTeams.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-sm text-muted-foreground">
                {teams.length === 0
                  ? "Chưa có nhóm nào trong lớp học phần này."
                  : "Không có nhóm nào cần chú ý trong Sprint hiện tại."}
              </div>
            ) : (
              <div className="space-y-3">
                {displayedTeams.map((team) => (
                  <CourseDashboardTeamCard
                    key={team.teamId}
                    courseId={courseId}
                    team={team}
                    isHighlighted={highlightedTeamIdSet.has(team.teamId)}
                  />
                ))}
              </div>
            )}
          </Card>
        </>
      ) : null}
    </LecturerPageShell>
  );
}

interface OverviewStatCardProps {
  icon: ReactNode;
  iconBoxClass: string;
  label: string;
  value: ReactNode;
  subValue?: string;
  badge?: ReactNode;
}

function OverviewStatCard({
  icon,
  iconBoxClass,
  label,
  value,
  subValue,
  badge,
}: OverviewStatCardProps) {
  return (
    <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
      <CardContent className="flex items-center gap-3.5 p-0">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            iconBoxClass
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted-foreground truncate">{label}</p>
          <div className="mt-0.5 flex items-center justify-between gap-1.5">
            <div className="flex min-w-0 items-baseline gap-1.5">
              <span className="font-mono text-2xl font-black text-foreground">{value}</span>
              {subValue ? (
                <span className="truncate text-xs font-medium text-muted-foreground">{subValue}</span>
              ) : null}
            </div>
          </div>
          {badge ? <div className="mt-1.5">{badge}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
