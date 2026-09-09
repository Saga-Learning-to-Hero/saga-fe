"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  FolderKanbanIcon,
  GitCommitIcon,
  KanbanIcon,
  PieChartIcon,
  UsersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AwaitingServerDataBadge } from "./awaiting-server-data-badge";
import { CourseQueryError } from "./course-query-error";
import {
  useLecturerCourse,
  useLecturerCourseAccess,
  useLecturerRoster,
} from "../hooks/use-lecturer-courses";
import { useLecturerTeams } from "@/features/lecturer/teams/hooks/use-lecturer-teams";
import {
  lecturerCourseTeamPath,
  lecturerCourseTeamsPath,
  lecturerCoursesPath,
} from "../lib/course-routes";
import { summarizeLecturerTeams, teamRoleLabel } from "@/features/lecturer/teams/types/lecturer-team";
import { getApiErrorCode } from "@/lib/api-error";
import type { ReactNode } from "react";

interface CourseOverviewPageProps {
  courseId: string;
}

export function CourseOverviewPage({ courseId }: CourseOverviewPageProps) {
  const courseQuery = useLecturerCourse(courseId);
  const rosterQuery = useLecturerRoster(courseId);
  const teamsQuery = useLecturerTeams(courseId);

  const courseAccess = useLecturerCourseAccess(courseQuery.isError, courseQuery.error);
  const rosterAccess = useLecturerCourseAccess(rosterQuery.isError, rosterQuery.error);
  const teamsAccess = useLecturerCourseAccess(teamsQuery.isError, teamsQuery.error);

  const course = courseQuery.data;
  const teams = teamsQuery.data?.teams ?? [];
  const summary = summarizeLecturerTeams(teams);
  const enrolledCount = rosterQuery.data?.enrolledCount ?? 0;

  if (courseAccess.isAccessDenied || rosterAccess.isAccessDenied || teamsAccess.isAccessDenied) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Đang chuyển về danh sách lớp...
      </div>
    );
  }

  if (courseQuery.isError) {
    return <CourseQueryError error={courseQuery.error} onRetry={() => void courseQuery.refetch()} />;
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link
          href={lecturerCoursesPath()}
          prefetch={true}
          aria-label="Quay lại danh sách lớp"
          className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 rounded-lg" })}
        >
          <ArrowLeftIcon className="size-4" />
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href={lecturerCoursesPath()} prefetch={true} className="transition-colors hover:text-foreground">
            Lớp học phần của tôi
          </Link>
          <span>/</span>
          <span className="font-mono font-semibold text-foreground">
            {courseQuery.isLoading ? "Đang tải..." : course?.courseCode}
          </span>
          <span>/</span>
          <span className="font-semibold text-foreground">Tổng quan</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        {courseQuery.isLoading && !course ? (
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="h-7 w-72 rounded bg-muted" />
          </div>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/10 font-mono text-xs font-bold text-primary"
              >
                {course?.courseCode}
              </Badge>
              <Badge variant="secondary" className="font-mono text-xs">
                {course?.classCode || "Chưa có lớp sinh viên niên khóa"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {course?.semesterName || course?.semesterCode || "Chưa có học kỳ"}
              </Badge>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              {course?.subjectName || course?.name}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {course?.subjectCode} · Tổng quan lớp học phần từ dữ liệu lớp, danh sách sinh viên đang học và
              phân nhóm.
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          icon={<UsersIcon className="size-5" />}
          title={
            rosterQuery.isError
              ? "Không tải được sĩ số"
              : `${enrolledCount} sinh viên đang học`
          }
          hint="Lấy từ danh sách sinh viên đang học"
          loading={rosterQuery.isLoading}
        />
        <KpiCard
          icon={<FolderKanbanIcon className="size-5" />}
          title={`${summary.teamCount} nhóm`}
          hint={`${summary.withProjectCount} đã có dự án nhóm · ${summary.waitingProjectCount} chưa khởi tạo`}
          loading={teamsQuery.isLoading}
        />
        <KpiCard
          icon={<PieChartIcon className="size-5" />}
          title="Theo dõi đóng góp"
          hint="Chưa có dữ liệu theo dõi"
          loading={false}
          awaiting
        />
      </div>

      <Card className="space-y-4 rounded-2xl border border-border p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold">Dự án nhóm trong lớp</h2>
            <p className="text-xs text-muted-foreground">
              Trạng thái dự án lấy từ <span className="font-mono">projectId</span> của từng nhóm. Giảng viên
              không tạo dự án hộ nhóm.
            </p>
          </div>
          <Link
            href={lecturerCourseTeamsPath(courseId)}
            prefetch={true}
            className={buttonVariants({ size: "sm", className: "h-8 text-xs font-semibold" })}
          >
            Quản lý danh sách sinh viên và phân nhóm
          </Link>
        </div>

        {teamsQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl bg-muted/60" />
            ))}
          </div>
        ) : teamsQuery.isError && getApiErrorCode(teamsQuery.error) !== "LECTURER_COURSE_FORBIDDEN" ? (
          <p className="text-xs text-muted-foreground">Không tải được danh sách nhóm. Hãy mở tab Dự án nhóm để thử lại.</p>
        ) : teams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center">
            <p className="text-sm font-semibold">Chưa có nhóm trong lớp</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Phân nhóm bằng Excel trong tab Dự án nhóm sau khi có danh sách sinh viên đang học.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {teams.map((team) => (
              <div key={team.teamId} className="rounded-2xl border border-border/80 bg-muted/20 p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] text-muted-foreground">TeamNo {team.teamNo}</p>
                    <h3 className="text-sm font-bold">{team.teamName}</h3>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      team.projectId
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    }
                  >
                    {team.projectId ? "Đã có dự án nhóm" : "Chưa có dự án nhóm"}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {team.members
                    .slice(0, 3)
                    .map((member) => `${member.fullName} (${teamRoleLabel(member.role)})`)
                    .join(" · ")}
                  {team.members.length > 3 ? ` · +${team.members.length - 3}` : ""}
                </p>
                <Link
                  href={lecturerCourseTeamPath(courseId, team.teamId)}
                  prefetch={true}
                  className="mt-3 inline-flex text-xs font-semibold text-primary hover:underline"
                >
                  {team.projectId ? "Xem dự án nhóm" : "Xem thông tin nhóm"}
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AwaitingPanel
          icon={<GitCommitIcon className="size-5" />}
          title="Hoạt động GitHub"
          description="Chưa có dữ liệu theo dõi commit cho giảng viên. Không điền số liệu giả."
        />
        <AwaitingPanel
          icon={<KanbanIcon className="size-5" />}
          title="Công việc Jira"
          description="Chưa có dữ liệu theo dõi Sprint/Kanban cho giảng viên từ máy chủ."
        />
        <AwaitingPanel
          icon={<PieChartIcon className="size-5" />}
          title="Điểm đóng góp"
          description="API đánh giá và trọng số chưa thuộc phạm vi đọc của giảng viên."
        />
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  title,
  hint,
  loading,
  awaiting,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  loading: boolean;
  awaiting?: boolean;
}) {
  return (
    <Card className="flex items-center gap-4 rounded-2xl border border-border p-4 shadow-xs">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold">{loading ? "Đang tải..." : title}</p>
          {awaiting && <AwaitingServerDataBadge />}
        </div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </Card>
  );
}

function AwaitingPanel({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-2xl border border-dashed border-border p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-primary">
          {icon}
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
        </div>
        <AwaitingServerDataBadge label="Chưa có dữ liệu máy chủ" />
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Card>
  );
}
