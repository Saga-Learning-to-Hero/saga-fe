"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowUpRightIcon,
  CheckCircle2Icon,
  FolderKanbanIcon,
  NetworkIcon,
  RefreshCwIcon,
  SlidersHorizontalIcon,
  UsersIcon,
  ActivityIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useLecturerCourse,
  useLecturerRoster,
  useLecturerCourseProgress,
} from "../hooks/use-lecturer-courses";
import { useLecturerTeams } from "@/features/lecturer/teams/hooks/use-lecturer-teams";
import { useContributionTeamWeights } from "@/features/lecturer/contribution/hooks/use-lecturer-contribution";
import {
  lecturerCourseContributionPath,
  lecturerCourseGradesPath,
  lecturerCourseGraphPath,
  lecturerCourseTeamPath,
  lecturerCourseTeamsPath,
} from "../lib/course-routes";
import { formatQueryUpdatedAt } from "../lib/format-query-updated-at";
import { summarizeLecturerTeams } from "@/features/lecturer/teams/types/lecturer-team";
import { LecturerPageShell } from "./lecturer-page-shell";
import { cn } from "@/lib/utils";

const CourseAnalyticsCharts = dynamic(
  () => import("./course-analytics-charts").then((mod) => mod.CourseAnalyticsCharts),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-2xl bg-muted/60" /> }
);

interface CourseOverviewPageProps {
  courseId: string;
}

export function CourseOverviewPage({ courseId }: CourseOverviewPageProps) {
  const courseQuery = useLecturerCourse(courseId);
  const rosterQuery = useLecturerRoster(courseId);
  const teamsQuery = useLecturerTeams(courseId);
  const weightsQuery = useContributionTeamWeights(courseId);
  const progressQuery = useLecturerCourseProgress(courseId);

  const [activeTab, setActiveTab] = useState<"attention" | "all">("attention");

  const course = courseQuery.data;
  const teams = useMemo(() => teamsQuery.data?.teams ?? [], [teamsQuery.data?.teams]);
  const summary = summarizeLecturerTeams(teams);
  const enrolledCount = rosterQuery.data?.enrolledCount ?? 0;
  const configuredCount = useMemo(
    () => (weightsQuery.data?.teams ?? []).filter((team) => team.configured).length,
    [weightsQuery.data?.teams]
  );

  const configuredById = useMemo(
    () => new Map((weightsQuery.data?.teams ?? []).map((t) => [t.teamId, t.configured])),
    [weightsQuery.data?.teams]
  );

  const progressById = useMemo(
    () => new Map((progressQuery.data?.teams ?? []).map((p) => [p.teamId, p])),
    [progressQuery.data?.teams]
  );

  const totalClassTasks = useMemo(
    () => (progressQuery.data?.teams ?? []).reduce((acc, t) => acc + t.totalTasks, 0),
    [progressQuery.data?.teams]
  );
  const completedClassTasks = useMemo(
    () => (progressQuery.data?.teams ?? []).reduce((acc, t) => acc + t.completedTasks, 0),
    [progressQuery.data?.teams]
  );
  const classCompletionPercent = totalClassTasks > 0
    ? Math.round((completedClassTasks / totalClassTasks) * 100)
    : 0;

  const attentionTeams = useMemo(() => {
    return teams.filter(
      (team) => !team.projectId || configuredById.get(team.teamId) === false
    );
  }, [teams, configuredById]);

  const displayedTeams = activeTab === "attention" ? attentionTeams : teams;

  const projectRatio = summary.teamCount > 0
    ? Math.round((summary.withProjectCount / summary.teamCount) * 100)
    : 0;

  const configRatio = summary.teamCount > 0
    ? Math.round((configuredCount / summary.teamCount) * 100)
    : 0;

  const updatedAt = formatQueryUpdatedAt([
    courseQuery.dataUpdatedAt,
    rosterQuery.dataUpdatedAt,
    teamsQuery.dataUpdatedAt,
    weightsQuery.dataUpdatedAt,
    progressQuery.dataUpdatedAt,
  ]);

  const handleRefresh = () => {
    void Promise.all([
      courseQuery.refetch(),
      rosterQuery.refetch(),
      teamsQuery.refetch(),
      weightsQuery.refetch(),
      progressQuery.refetch(),
    ]);
  };

  const isRefreshing =
    courseQuery.isFetching ||
    rosterQuery.isFetching ||
    teamsQuery.isFetching ||
    weightsQuery.isFetching ||
    progressQuery.isFetching;

  return (
    <LecturerPageShell
      title="Tổng quan tiến độ & Tình trạng lớp học phần"
      description={`${course?.subjectName || course?.name || "Lớp học phần"} · Theo dõi sĩ số, nhóm đồ án và các cảnh báo tiến độ.`}
      badges={
        <>
          <Badge
            variant="outline"
            className="border-primary/25 bg-primary/10 font-mono text-xs font-bold text-primary"
          >
            {course?.courseCode || "Đang tải"}
          </Badge>
          <Badge variant="secondary" className="font-mono text-xs">
            {course?.classCode || "Chưa gắn lớp sinh viên"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {course?.semesterName || course?.semesterCode || "Học kỳ hiện tại"}
          </Badge>
        </>
      }
      actions={
        <>
          {updatedAt ? (
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Cập nhật lúc {updatedAt}
            </p>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 cursor-pointer text-xs"
            disabled={isRefreshing}
            onClick={handleRefresh}
          >
            <RefreshCwIcon className={cn("size-3.5", isRefreshing && "animate-spin")} />
            Làm mới
          </Button>
        </>
      }
      isLoading={!course && courseQuery.isLoading}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <OverviewStatCard
          icon={<UsersIcon className="size-5" />}
          iconBoxClass="bg-primary/10 text-primary"
          label="Sĩ số sinh viên đang học"
          value={enrolledCount}
          subValue="sinh viên"
          loading={rosterQuery.isLoading}
        />
        <OverviewStatCard
          icon={<FolderKanbanIcon className="size-5" />}
          iconBoxClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          label="Tổng số nhóm đồ án"
          value={summary.teamCount}
          subValue="nhóm"
          badge={
            <Badge
              variant="outline"
              className="border-blue-500/30 bg-blue-500/10 font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400"
            >
              {summary.withProjectCount} có dự án
            </Badge>
          }
          loading={teamsQuery.isLoading}
        />
        <OverviewStatCard
          icon={<CheckCircle2Icon className="size-5" />}
          iconBoxClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          label="Đã khởi tạo dự án"
          value={summary.withProjectCount}
          subValue={`/ ${summary.teamCount}`}
          badge={
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400"
            >
              {projectRatio}%
            </Badge>
          }
          loading={teamsQuery.isLoading}
        />
        <OverviewStatCard
          icon={<ActivityIcon className="size-5" />}
          iconBoxClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          label="Tiến độ công việc cả lớp"
          value={completedClassTasks}
          subValue={`/ ${totalClassTasks} tasks`}
          badge={
            <Badge
              variant="outline"
              className="border-indigo-500/30 bg-indigo-500/10 font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400"
            >
              {classCompletionPercent}%
            </Badge>
          }
          loading={progressQuery.isLoading}
        />
        <OverviewStatCard
          icon={<SlidersHorizontalIcon className="size-5" />}
          iconBoxClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          label="Cấu hình trọng số riêng"
          value={configuredCount}
          subValue={`/ ${summary.teamCount}`}
          badge={
            <Badge
              variant="outline"
              className="border-purple-500/30 bg-purple-500/10 font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400"
            >
              {configRatio}%
            </Badge>
          }
          loading={weightsQuery.isLoading}
        />
      </div>

      <CourseAnalyticsCharts teams={teams} />

      <Card className="space-y-4 rounded-2xl border border-border/80 p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-foreground">
              Bảng quản trị tình trạng & Rủi ro nhóm
            </h2>
            <p className="text-xs text-muted-foreground">
              Đối soát tình trạng khởi tạo dự án, tiến độ tasks Jira và mức độ cấu hình trọng số đánh giá của các nhóm.
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
            <Link
              href={lecturerCourseTeamsPath(courseId, "teams")}
              prefetch={true}
              className={cn(buttonVariants({ size: "sm", variant: "outline" }), "h-8 text-xs")}
            >
              Phân nhóm
            </Link>
            <Link
              href={lecturerCourseContributionPath(courseId)}
              prefetch={true}
              className={cn(buttonVariants({ size: "sm" }), "h-8 text-xs")}
            >
              <SlidersHorizontalIcon className="size-3.5" />
              Cấu hình trọng số
            </Link>
          </div>
        </div>

        {teamsQuery.isLoading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-muted/60" />
        ) : displayedTeams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-sm text-muted-foreground">
            {teams.length === 0
              ? "Chưa có nhóm nào trong lớp. Hãy vào mục Phân nhóm để thiết lập danh sách nhóm."
              : "Tất cả các nhóm đều hoạt động bình thường, đã có dự án và hoàn tất cấu hình trọng số."}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Mã nhóm & Tên</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái dự án</th>
                  <th className="px-4 py-3 font-semibold">Tiến độ Tasks & Sprint</th>
                  <th className="px-4 py-3 font-semibold">Trọng số Slicing Pie</th>
                  <th className="px-4 py-3 font-semibold">Mức độ rủi ro</th>
                  <th className="px-4 py-3 text-right font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {displayedTeams.map((team) => {
                  const isConfigured = configuredById.get(team.teamId) ?? false;
                  const hasProject = Boolean(team.projectId);
                  const prog = progressById.get(team.teamId);

                  let healthStatus: "healthy" | "warning" | "critical" = "healthy";
                  let healthLabel = "Hoạt động tốt";
                  let healthBadgeClass =
                    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";

                  if (!hasProject) {
                    healthStatus = "critical";
                    healthLabel = "Chưa có dự án";
                    healthBadgeClass =
                      "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30";
                  } else if (!isConfigured) {
                    healthStatus = "warning";
                    healthLabel = "Chưa cấu hình trọng số";
                    healthBadgeClass =
                      "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30";
                  } else if (prog && prog.totalTasks > 0 && (prog.taskCompletionPercent ?? 0) < 20) {
                    healthStatus = "warning";
                    healthLabel = "Tiến độ chậm";
                    healthBadgeClass =
                      "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30";
                  }

                  return (
                    <tr
                      key={team.teamId}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-bold text-foreground">
                            Team #{team.teamNo}
                          </span>
                          <span className="font-bold text-foreground">
                            {team.teamName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {hasProject ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[11px] text-emerald-600 dark:text-emerald-400"
                          >
                            Đã kết nối
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-amber-500/30 bg-amber-500/10 font-mono text-[11px] text-amber-600 dark:text-amber-400"
                          >
                            Chờ khởi tạo
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {!hasProject || !prog ? (
                          <span className="font-mono text-xs text-muted-foreground">—</span>
                        ) : (
                          <div className="space-y-1 max-w-[170px]">
                            <div className="flex items-center justify-between gap-1 text-[11px]">
                              <span className="font-bold text-foreground truncate max-w-[105px]" title={prog.currentSprintName || "Chưa có Sprint"}>
                                {prog.currentSprintName || "Chưa có Sprint"}
                              </span>
                              <span className="font-mono text-muted-foreground font-semibold shrink-0">
                                {prog.completedTasks}/{prog.totalTasks}
                              </span>
                            </div>
                            <div className="w-full bg-muted/80 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-primary h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, Math.max(0, Math.round(prog.taskCompletionPercent ?? 0)))}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {isConfigured ? (
                          <span className="font-mono text-xs text-foreground">
                            Đã tùy biến riêng
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground">
                            Theo đề cương chung
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            healthBadgeClass
                          )}
                        >
                          {healthStatus !== "healthy" && (
                            <AlertTriangleIcon className="size-3" />
                          )}
                          {healthLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={lecturerCourseTeamPath(courseId, team.teamId)}
                            prefetch={true}
                            className={cn(
                              buttonVariants({ size: "sm", variant: "ghost" }),
                              "h-7 px-2 text-xs font-semibold hover:bg-muted"
                            )}
                          >
                            Xem nhóm
                          </Link>
                          <Link
                            href={lecturerCourseGraphPath(courseId)}
                            prefetch={true}
                            title="Mở đồ thị giám sát SNA"
                            className={cn(
                              buttonVariants({ size: "sm", variant: "ghost" }),
                              "h-7 size-7 p-0 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <NetworkIcon className="size-3.5" />
                          </Link>
                          <Link
                            href={lecturerCourseGradesPath(courseId, team.teamId)}
                            prefetch={true}
                            title="Bảng điểm chi tiết"
                            className={cn(
                              buttonVariants({ size: "sm", variant: "ghost" }),
                              "h-7 size-7 p-0 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <ArrowUpRightIcon className="size-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
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
  loading?: boolean;
}

function OverviewStatCard({
  icon,
  iconBoxClass,
  label,
  value,
  subValue,
  badge,
  loading,
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
          <div className="flex items-center justify-between gap-1.5 mt-0.5">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-mono text-2xl font-black text-foreground">
                {loading ? "…" : value}
              </span>
              {subValue && (
                <span className="text-xs font-medium text-muted-foreground truncate">
                  {subValue}
                </span>
              )}
            </div>
            {badge}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
