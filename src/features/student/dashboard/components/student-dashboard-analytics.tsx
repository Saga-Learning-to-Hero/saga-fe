"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CrownIcon,
  FolderKanbanIcon,
  GitCommitIcon,
  KanbanIcon,
  UsersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MemberProgressSheet } from "@/features/progress/components/member-progress-sheet";
import {
  ProgressFactNote,
  ProjectProgressSummary,
} from "@/features/progress/components/project-progress-summary";
import {
  studentCoursePath,
  useStudentCourseContext,
} from "@/features/student/courses/hooks/use-student-course-context";
import { useStudentMyTeam } from "@/features/student/courses/hooks/use-student-courses";
import { useProjectRealtime } from "@/features/student/project/hooks/use-project-realtime";
import {
  useProjectCommits,
  useProjectProgress,
} from "@/features/student/project/hooks/useProjectSync";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import {
  buildWeeklyCommitBuckets,
  normalizeProjectProgress,
} from "@/features/progress/lib/progress-format";
import { StudentTaskCommitCharts } from "./student-task-commit-charts";
import { TeamWorkloadComparisonChart } from "./team-workload-comparison-chart";
import { StudentDashboardSkeleton } from "./student-dashboard-skeleton";
import { LeaderBadge } from "@/components/common/leader-badge";

export function StudentDashboardAnalytics() {
  const { course, courseId, isLoading: isCoursesLoading, isInvalidCourse } = useStudentCourseContext();
  const teamQuery = useStudentMyTeam(courseId, { enabled: Boolean(courseId) });
  const team = teamQuery.data;
  const isLeader = (team?.myRole || "").toUpperCase() === "LEADER";
  const projectId = team?.projectId || null;
  const canLoadProgress = isLeader && Boolean(projectId);

  const progressQuery = useProjectProgress(projectId, { enabled: canLoadProgress });
  const commitsQuery = useProjectCommits(projectId, { enabled: canLoadProgress });
  useProjectRealtime(projectId, { enabled: canLoadProgress });

  const [detailStudentId, setDetailStudentId] = useState<string | null>(null);

  const progress = normalizeProjectProgress(progressQuery.data);
  const members = progress?.memberProgress ?? [];

  const commits = useMemo(() => {
    if (!commitsQuery.data) return [];
    if (Array.isArray(commitsQuery.data)) return commitsQuery.data;
    return commitsQuery.data.items ?? [];
  }, [commitsQuery.data]);

  const weeklyData = useMemo(
    () => buildWeeklyCommitBuckets(commits),
    [commits]
  );

  const openMemberDetail = (studentId: string) => {
    setDetailStudentId(studentId);
  };

  if (isInvalidCourse) {
    return (
      <EmptyPanel
        title="Lớp học phần không còn khả dụng"
        description="Hãy chọn lại lớp học phần trước khi xem tiến độ nhóm."
      />
    );
  }

  if (isCoursesLoading || (Boolean(courseId) && teamQuery.isLoading && !team)) {
    return <StudentDashboardSkeleton />;
  }

  if (!courseId || !course) {
    return (
      <EmptyPanel
        title="Chưa chọn lớp học phần"
        description="Hãy chọn lớp đang học để xem tiến độ dự án nhóm."
        href="/student/courses"
        action="Chọn lớp học phần"
      />
    );
  }

  if (teamQuery.isWaitingForTeam) {
    return (
      <EmptyPanel
        title="Đang chờ giảng viên phân nhóm"
        description="Bạn đã ghi danh nhưng chưa được gán nhóm nên chưa có bảng tiến độ dự án."
      />
    );
  }

  if (teamQuery.isError) {
    return (
      <EmptyPanel
        title="Không tải được thông tin nhóm"
        description={getApiErrorMessage(teamQuery.error, "Vui lòng thử lại.")}
        onRetry={() => void teamQuery.refetch()}
      />
    );
  }

  if (!isLeader) {
    return (
      <Card className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-8 text-center shadow-xs">
        <CardContent className="space-y-4 p-0">
          <UsersIcon className="mx-auto size-8 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">
              Bảng tiến độ tổng quan giới hạn cho Trưởng nhóm & Giảng viên
            </h2>
            <p className="text-xs text-muted-foreground max-w-xl mx-auto">
              Quyền xem tổng quan tiến độ dự án chỉ dành cho trưởng nhóm và giảng viên. Bạn có thể xem biểu đồ tiến độ và lưới hoạt động chi tiết tại trang Tiến độ Sprint.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Link
              href={studentCoursePath("/student/sprint-progress", courseId)}
              prefetch={true}
              className={cn(buttonVariants({ size: "sm" }), "text-xs")}
            >
              <KanbanIcon className="size-3.5" />
              Xem tiến độ Sprint & Nhịp độ
            </Link>
            <Link
              href={studentCoursePath("/student/commits", courseId)}
              prefetch={true}
              className={cn(buttonVariants({ size: "sm", variant: "outline" }), "text-xs")}
            >
              <GitCommitIcon className="size-3.5" />
              Xem commit
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!projectId) {
    return (
      <EmptyPanel
        title="Nhóm chưa khởi tạo dự án"
        description="Bảng tiến độ chỉ mở khi nhóm đã có dự án. Hãy vào trang Dự án để khởi tạo."
        href={studentCoursePath("/student/project-info", courseId)}
        action="Mở trang dự án"
      />
    );
  }

  if (progressQuery.isError) {
    return (
      <EmptyPanel
        title="Không tải được bảng tiến độ"
        description={getApiErrorMessage(progressQuery.error, "Vui lòng thử lại.")}
        onRetry={() => void progressQuery.refetch()}
      />
    );
  }

  if (progressQuery.isLoading && !progress) {
    return <StudentDashboardSkeleton />;
  }

  if (!progress) {
    return (
      <EmptyPanel
        title="Chưa có dữ liệu tiến độ"
        description="Hiện tại chưa có dữ liệu tiến độ cho dự án này."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border/80 bg-card/90 p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-400">
            <CrownIcon className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-foreground">
                Bảng tiến độ dự án nhóm
              </h2>
              <LeaderBadge size="sm" />
              <Badge variant="outline" className="font-mono text-[10px]">
                Nhóm {progress.teamNo} · {progress.teamName}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Số liệu tổng hợp tự động từ tiến độ thực tế các tasks và commits của toàn nhóm.
            </p>
          </div>
        </div>

      </div>

      <ProjectProgressSummary progress={progress} />
      <ProgressFactNote />

      <StudentTaskCommitCharts tasks={progress.taskSummary} weeklyData={weeklyData} />

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
