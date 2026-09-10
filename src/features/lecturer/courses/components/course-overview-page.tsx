"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  FolderKanbanIcon,
  PieChartIcon,
  RefreshCwIcon,
  SlidersHorizontalIcon,
  UsersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLecturerCourse, useLecturerRoster } from "../hooks/use-lecturer-courses";
import { useLecturerTeams } from "@/features/lecturer/teams/hooks/use-lecturer-teams";
import { useContributionTeamWeights } from "@/features/lecturer/contribution/hooks/use-lecturer-contribution";
import {
  lecturerCourseContributionPath,
  lecturerCourseTeamPath,
  lecturerCourseTeamsPath,
  lecturerCoursesPath,
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

  const course = courseQuery.data;
  const teams = useMemo(() => teamsQuery.data?.teams ?? [], [teamsQuery.data?.teams]);
  const summary = summarizeLecturerTeams(teams);
  const enrolledCount = rosterQuery.data?.enrolledCount ?? 0;
  const configuredCount = useMemo(
    () => (weightsQuery.data?.teams ?? []).filter((team) => team.configured).length,
    [weightsQuery.data?.teams]
  );
  const attentionTeams = useMemo(() => {
    const configuredById = new Map(
      (weightsQuery.data?.teams ?? []).map((team) => [team.teamId, team.configured])
    );
    return teams.filter((team) => !team.projectId || configuredById.get(team.teamId) === false);
  }, [teams, weightsQuery.data?.teams]);

  const updatedAt = formatQueryUpdatedAt([
    courseQuery.dataUpdatedAt,
    rosterQuery.dataUpdatedAt,
    teamsQuery.dataUpdatedAt,
    weightsQuery.dataUpdatedAt,
  ]);

  const handleRefresh = () => {
    void Promise.all([
      courseQuery.refetch(),
      rosterQuery.refetch(),
      teamsQuery.refetch(),
      weightsQuery.refetch(),
    ]);
  };

  const isRefreshing =
    courseQuery.isFetching ||
    rosterQuery.isFetching ||
    teamsQuery.isFetching ||
    weightsQuery.isFetching;

  return (
    <LecturerPageShell
      breadcrumbItems={[
        { label: "Lớp học phần", href: lecturerCoursesPath() },
        { label: course?.courseCode || "Mã lớp" },
        { label: "Tổng quan" },
      ]}
      title={course?.subjectName || course?.name || "Tổng quan lớp học phần"}
      description={`${course?.subjectCode || "Môn học"} · Sĩ số, nhóm và trạng thái cấu hình trọng số từ dữ liệu lớp hiện có.`}
      badges={
        <>
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/10 font-mono text-xs font-bold text-primary"
          >
            {course?.courseCode || "Đang tải"}
          </Badge>
          <Badge variant="secondary" className="font-mono text-xs">
            {course?.classCode || "Chưa có lớp sinh viên niên khóa"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {course?.semesterName || course?.semesterCode || "Chưa có học kỳ"}
          </Badge>
        </>
      }
      actions={
        <>
          {updatedAt ? (
            <p className="text-[11px] text-muted-foreground">Cập nhật lúc {updatedAt}</p>
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={<UsersIcon className="size-5" />}
          title={
            rosterQuery.isError ? "Không tải được sĩ số" : `${enrolledCount} sinh viên đang học`
          }
          hint="Lấy từ danh sách sinh viên đang học"
          loading={rosterQuery.isLoading}
        />
        <KpiCard
          icon={<FolderKanbanIcon className="size-5" />}
          title={`${summary.teamCount} nhóm`}
          hint={`${summary.withProjectCount} đã có dự án · ${summary.waitingProjectCount} chưa khởi tạo`}
          loading={teamsQuery.isLoading}
        />
        <KpiCard
          icon={<FolderKanbanIcon className="size-5" />}
          title={`${summary.withProjectCount} nhóm đã có dự án`}
          hint="Nhóm còn lại chờ trưởng nhóm khởi tạo dự án"
          loading={teamsQuery.isLoading}
        />
        <KpiCard
          icon={<PieChartIcon className="size-5" />}
          title={
            weightsQuery.isError
              ? "Không tải được trạng thái trọng số"
              : `${configuredCount} nhóm đã cấu hình trọng số`
          }
          hint="Theo dõi tiến độ cấu hình riêng trước khi áp dụng"
          loading={weightsQuery.isLoading}
        />
      </div>

      <CourseAnalyticsCharts teams={teams} />

      <Card className="space-y-4 rounded-2xl border border-border p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold">Nhóm cần chú ý</h2>
            <p className="text-xs text-muted-foreground">
              Nhóm chưa khởi tạo dự án hoặc chưa hoàn tất cấu hình trọng số riêng.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
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
          <div className="h-24 animate-pulse rounded-2xl bg-muted/60" />
        ) : attentionTeams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {teams.length === 0
              ? "Chưa có nhóm trong lớp. Hãy phân nhóm bằng Excel để bắt đầu theo dõi."
              : "Mọi nhóm đã có dự án và đã cấu hình trọng số."}
          </div>
        ) : (
          <ul className="space-y-2">
            {attentionTeams.map((team) => {
              const configured = weightsQuery.data?.teams.find((item) => item.teamId === team.teamId)?.configured;
              const reason = !team.projectId
                ? "Nhóm chưa khởi tạo dự án"
                : configured === false
                  ? "Chưa cấu hình trọng số riêng"
                  : "Cần theo dõi";
              return (
                <li
                  key={team.teamId}
                  className="flex flex-col gap-2 rounded-xl border border-border/80 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold">{team.teamName}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      TeamNo {team.teamNo} · {reason}
                    </p>
                  </div>
                  <Link
                    href={lecturerCourseTeamPath(courseId, team.teamId)}
                    prefetch={true}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Xem nhóm
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className="rounded-2xl border border-dashed border-border p-5">
        <h2 className="text-sm font-bold">Hoạt động GitHub và Jira</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Dữ liệu chưa sẵn sàng. Khi máy chủ công bố theo dõi commit và công việc, khu vực này sẽ hiển thị số liệu thật.
        </p>
      </Card>
    </LecturerPageShell>
  );
}

function KpiCard({
  icon,
  title,
  hint,
  loading,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  loading: boolean;
}) {
  return (
    <Card className="flex items-center gap-4 rounded-2xl border border-border p-4 shadow-xs">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold">{loading ? "Đang tải..." : title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </Card>
  );
}
