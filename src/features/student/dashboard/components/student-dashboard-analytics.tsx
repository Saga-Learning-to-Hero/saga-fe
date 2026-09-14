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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MemberProgressDialog } from "@/features/progress/components/member-progress-dialog";
import {
  ProgressFactNote,
  ProjectProgressSummary,
} from "@/features/progress/components/project-progress-summary";
import { ProgressMemberTable } from "@/features/progress/components/progress-member-table";
import { useStudentCourseContext } from "@/features/student/courses/hooks/use-student-course-context";
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
import { StudentKPICards } from "./student-kpi-cards";
import { StudentTaskCommitCharts } from "./student-task-commit-charts";
import { TeamWorkloadComparisonChart } from "./team-workload-comparison-chart";

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

  const [isAllTeam, setIsAllTeam] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [detailStudentId, setDetailStudentId] = useState<string | null>(null);

  const progress = normalizeProjectProgress(progressQuery.data);
  const members = progress?.memberProgress ?? [];
  const selectedMember = members.find((member) => member.studentId === selectedStudentId) ?? null;

  const weeklyData = useMemo(
    () =>
      buildWeeklyCommitBuckets(commitsQuery.data ?? [], {
        studentId: isAllTeam ? null : selectedStudentId,
      }),
    [commitsQuery.data, isAllTeam, selectedStudentId]
  );

  const kpiTasks = (() => {
    if (!progress) {
      return {
        total: 0,
        todo: 0,
        inProgress: 0,
        inReview: 0,
        done: 0,
        blocked: 0,
        completionPercent: null,
      };
    }
    if (isAllTeam || !selectedMember) {
      return progress.taskSummary;
    }
    const assigned = selectedMember.tasks.assigned || selectedMember.tasks.assignedTotal || 0;
    return {
      total: assigned,
      todo: selectedMember.tasks.incomplete,
      inProgress: selectedMember.tasks.inProgress,
      inReview: 0,
      done: selectedMember.tasks.completed,
      blocked: selectedMember.tasks.blocked,
      completionPercent:
        assigned > 0 ? Math.round((selectedMember.tasks.completed / assigned) * 100) : null,
    };
  })();

  const kpiCommits = isAllTeam || !selectedMember
    ? {
        total: progress?.commitSummary.total ?? 0,
        linked: progress?.commitSummary.linked ?? 0,
      }
    : {
        total: selectedMember.commits.total,
        linked: selectedMember.commits.linkedToTasks,
      };

  const evidenceCount = isAllTeam || !selectedMember
    ? progress
      ? progress.evidenceSummary.workSessions +
        progress.evidenceSummary.files +
        progress.evidenceSummary.webLinks +
        progress.evidenceSummary.confirmations
      : 0
    : selectedMember.evidenceConfirmations;

  const openMemberDetail = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsAllTeam(false);
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
    return <div className="min-h-64 animate-pulse rounded-2xl bg-muted" />;
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
              Chỉ trưởng nhóm và giảng viên xem được bảng tiến độ nhóm
            </h2>
            <p className="text-xs text-muted-foreground">
              Máy chủ không mở API tiến độ dự án cho thành viên thường. Bạn vẫn xem được task và commit của nhóm.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/student/sprint-progress"
              prefetch={true}
              className={cn(buttonVariants({ size: "sm" }), "text-xs")}
            >
              <KanbanIcon className="size-3.5" />
              Xem task
            </Link>
            <Link
              href="/student/commits"
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
        href="/student/project-info"
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
    return <div className="min-h-64 animate-pulse rounded-2xl bg-muted" />;
  }

  if (!progress) {
    return (
      <EmptyPanel
        title="Chưa có dữ liệu tiến độ"
        description="Máy chủ chưa trả bảng tiến độ cho dự án này."
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
              <Badge className="border-0 bg-amber-500/15 text-[10px] font-semibold text-amber-900 dark:text-amber-300">
                Trưởng nhóm
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px]">
                Nhóm {progress.teamNo} · {progress.teamName}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Số liệu lấy từ API tiến độ dự án. Không tự cộng từ danh sách task hay commit.
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-muted/70 px-3 py-1.5 text-xs font-semibold text-foreground outline-none hover:bg-muted">
            <UsersIcon className="size-3.5 text-primary" />
            {isAllTeam || !selectedMember ? "Tổng quan cả nhóm" : selectedMember.fullName}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-xl p-1.5">
            <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Phạm vi theo dõi
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setIsAllTeam(true);
                setSelectedStudentId(null);
              }}
              className={cn("cursor-pointer rounded-lg text-xs", isAllTeam && "bg-primary/10 font-bold text-primary")}
            >
              Tổng quan cả nhóm
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {members.map((member) => (
              <DropdownMenuItem
                key={member.studentId}
                onClick={() => openMemberDetail(member.studentId)}
                className={cn(
                  "cursor-pointer rounded-lg text-xs",
                  !isAllTeam && selectedStudentId === member.studentId && "bg-primary/10 font-bold text-primary"
                )}
              >
                {member.fullName}
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  {member.studentCode}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ProjectProgressSummary progress={progress} />
      <ProgressFactNote />

      <StudentKPICards
        tasks={kpiTasks}
        commits={kpiCommits}
        evidenceCount={evidenceCount}
        isAllTeamSelected={isAllTeam || !selectedMember}
      />

      <StudentTaskCommitCharts tasks={kpiTasks} weeklyData={weeklyData} />

      <TeamWorkloadComparisonChart
        members={members}
        selectedStudentId={selectedStudentId}
        onSelectMember={openMemberDetail}
        currentSprintName={progress.currentSprint?.name}
      />

      <ProgressMemberTable
        members={members}
        selectedStudentId={selectedStudentId}
        onSelectMember={openMemberDetail}
      />

      <MemberProgressDialog
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
