"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import {
  ClockIcon,
  GitCommitIcon,
  GitGraphIcon,
  LayersIcon,
  ListTodoIcon,
  Loader2Icon,
  PieChartIcon,
  SearchIcon,
  ShieldCheckIcon,
  Users2Icon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MemberRoleBadge } from "@/components/common/leader-badge";
import { TablePagination } from "@/components/common/table-pagination";
import { LecturerPageShell } from "@/features/lecturer/courses/components/lecturer-page-shell";
import { useLecturerCourse } from "@/features/lecturer/courses/hooks/use-lecturer-courses";
import { useLecturerTeams } from "../hooks/use-lecturer-teams";
import {
  lecturerCourseGradesPath,
  lecturerCourseGraphPath,
  lecturerCoursePeerReviewsPath,
  lecturerCourseTeamMemberPath,
  lecturerCourseTeamPath,
} from "@/features/lecturer/courses/lib/course-routes";
import { useMemberProgress } from "@/features/student/project/hooks/useProjectSync";
import { TaskWorkSessionTimelineDialog } from "@/features/student/sprint-progress/components/task-work-session-timeline-dialog";
import { getAssigneeAvatarClass, getAssigneeInitials } from "@/features/student/sprint-progress/lib/assignee-avatar";
import { formatDateTime, formatLinkedCommitRatio } from "@/features/progress/lib/progress-format";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

interface TeamMemberProgressPageProps {
  courseId: string;
  teamId: string;
  studentId: string;
}

export function TeamMemberProgressPage({
  courseId,
  teamId,
  studentId,
}: TeamMemberProgressPageProps) {
  const courseQuery = useLecturerCourse(courseId);
  const teamsQuery = useLecturerTeams(courseId);

  const teams = teamsQuery.data?.teams ?? [];
  const team = teams.find((item) => item.teamId === teamId);
  const member = team?.members.find(
    (m) => m.studentProfileId === studentId || m.studentCode === studentId
  );
  const projectId = team?.projectId ?? null;

  const progressQuery = useMemberProgress(projectId, studentId, {
    enabled: Boolean(projectId && studentId),
  });

  const progressData = progressQuery.data;
  const notInTeam = getApiErrorCode(progressQuery.error) === "TEAM_NOT_FOUND";

  const [taskFilter, setTaskFilter] = useState<"ALL" | "IN_PROGRESS" | "DONE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedTimelineTask, setSelectedTimelineTask] = useState<{
    id: string;
    title?: string | null;
    key?: string | null;
  } | null>(null);

  const backLink = {
    href: lecturerCourseTeamPath(courseId, teamId),
    label: team?.teamName ? `nhóm ${team.teamName}` : "chi tiết nhóm",
  };

  const totalAssigned =
    progressData?.taskSummary?.assigned ?? progressData?.taskSummary?.assignedTotal ?? 0;
  const completedTasks = progressData?.taskSummary?.completed ?? 0;
  const taskCompletionRate =
    totalAssigned > 0 ? Math.round((completedTasks / totalAssigned) * 100) : 0;

  const assignedTasks = useMemo(
    () => progressData?.assignedTasks ?? [],
    [progressData?.assignedTasks]
  );

  const inProgressFromSummary = progressData?.taskSummary?.inProgress;
  const inProgressTasks = useMemo(() => {
    if (typeof inProgressFromSummary === "number") {
      return inProgressFromSummary;
    }
    return assignedTasks.filter((t) => {
      const s = (t.status || "").toUpperCase();
      return (
        s === "IN_PROGRESS" ||
        s === "IN PROGRESS" ||
        s === "IN_REVIEW" ||
        s === "IN REVIEW"
      );
    }).length;
  }, [inProgressFromSummary, assignedTasks]);

  const filteredTasks = useMemo(() => {
    let result = assignedTasks;

    if (taskFilter === "DONE") {
      result = result.filter(
        (t) => (t.status || "").toUpperCase() === "DONE" || (t.status || "").toUpperCase() === "CLOSED"
      );
    } else if (taskFilter === "IN_PROGRESS") {
      result = result.filter(
        (t) => (t.status || "").toUpperCase() !== "DONE" && (t.status || "").toUpperCase() !== "CLOSED"
      );
    }

    const keyword = deferredSearch.trim().toLowerCase();
    if (keyword) {
      result = result.filter(
        (t) =>
          (t.title || "").toLowerCase().includes(keyword) ||
          (t.externalKey || "").toLowerCase().includes(keyword)
      );
    }

    return result;
  }, [assignedTasks, taskFilter, deferredSearch]);

  const totalFilteredTasks = filteredTasks.length;
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTasks.slice(startIndex, startIndex + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  const rawData = progressData as Record<string, unknown> | undefined;
  const avatarUrl =
    typeof rawData?.avatarUrl === "string" && rawData.avatarUrl.trim()
      ? rawData.avatarUrl.trim()
      : typeof rawData?.avatar === "string" && rawData.avatar.trim()
        ? rawData.avatar.trim()
        : null;

  const displayName = progressData?.fullName || member?.fullName || "Sinh viên";
  const displayCode = progressData?.studentCode || member?.studentCode || "...";
  const displayRole = progressData?.teamRole || member?.role;
  const initials = getAssigneeInitials(displayName);
  const avatarColorClass = getAssigneeAvatarClass(studentId || displayCode);

  if (teamsQuery.isError) {
    return (
      <LecturerPageShell
        backLink={backLink}
        title="Hồ sơ thành viên"
        error={teamsQuery.error}
        errorTitle="Không tải được thông tin nhóm"
        onRetry={() => void teamsQuery.refetch()}
      />
    );
  }

  if (!teamsQuery.isLoading && !team) {
    return (
      <LecturerPageShell backLink={backLink} title="Hồ sơ thành viên">
        <Card className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border/80 p-8 text-center shadow-xs">
          <h2 className="text-lg font-bold">Không tìm thấy nhóm</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nhóm này không tồn tại trong lớp học phần hoặc đã bị xóa.
          </p>
          <Link
            href={lecturerCourseTeamPath(courseId, teamId)}
            prefetch={true}
            className={cn(buttonVariants({ size: "sm" }), "mt-4 text-xs font-bold")}
          >
            Quay lại nhóm
          </Link>
        </Card>
      </LecturerPageShell>
    );
  }

  return (
    <LecturerPageShell
      backLink={backLink}
      title="Tiến độ & Minh chứng công sức"
      description={
        team?.teamName
          ? `Theo dõi chi tiết tiến độ công việc, nhật ký commit và bằng chứng đóng góp trong nhóm ${team.teamName}.`
          : "Theo dõi chi tiết tiến độ công việc, nhật ký commit và bằng chứng đóng góp."
      }
      isLoading={courseQuery.isLoading || teamsQuery.isLoading}
    >
      <Card className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 rounded-3xl border-2 border-border/80 shadow-sm">
              {avatarUrl ? (
                <AvatarImage
                  src={avatarUrl}
                  alt={displayName}
                  className="rounded-3xl object-cover"
                />
              ) : null}
              <AvatarFallback
                className={cn("rounded-3xl font-mono text-base font-bold", avatarColorClass)}
              >
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                  {displayName}
                </h1>
                <MemberRoleBadge role={displayRole} />
              </div>

              <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
                <span className="rounded-md bg-muted px-2 py-0.5 font-bold text-foreground">
                  {displayCode}
                </span>
                {member?.email && (
                  <>
                    <span className="text-muted-foreground/50 hidden sm:inline">•</span>
                    <span className="truncate hidden sm:inline">{member.email}</span>
                  </>
                )}
                <span className="text-muted-foreground/50 hidden sm:inline">•</span>
                <span className="font-sans font-medium text-foreground">
                  {team?.teamName} (#{team?.teamNo})
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              href={`${lecturerCourseGraphPath(courseId, teamId)}&studentId=${encodeURIComponent(studentId)}`}
              prefetch={true}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 text-xs font-bold cursor-pointer"
              )}
            >
              <GitGraphIcon className="size-3.5 text-primary" />
              Đồ thị đối soát cá nhân
            </Link>
            <Link
              href={lecturerCourseGradesPath(courseId, teamId)}
              prefetch={true}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 text-xs font-bold cursor-pointer"
              )}
            >
              <PieChartIcon className="size-3.5" />
              Bảng điểm nhóm
            </Link>
            <Link
              href={lecturerCoursePeerReviewsPath(courseId, { teamId, revieweeId: studentId })}
              prefetch={true}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
              )}
            >
              <Users2Icon className="size-3.5" />
              Đánh giá chéo
            </Link>
          </div>
        </div>

        {team?.members && team.members.length > 1 && (
          <div className="mt-6 border-t border-border/60 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Chuyển nhanh thành viên cùng nhóm:
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {team.members.length} thành viên
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {team.members.map((tm) => {
                const isCurrent = tm.studentProfileId === studentId || tm.studentCode === studentId;
                return (
                  <Link
                    key={tm.teamMemberId || tm.studentProfileId || tm.studentCode}
                    href={lecturerCourseTeamMemberPath(
                      courseId,
                      teamId,
                      tm.studentProfileId || tm.studentCode
                    )}
                    prefetch={true}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all",
                      isCurrent
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                        : "border-border/60 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Avatar className="size-4 rounded-full">
                      <AvatarFallback className="text-[9px] font-bold">
                        {getAssigneeInitials(tm.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{tm.fullName}</span>
                    <span className="font-mono text-[10px] opacity-70">({tm.studentCode})</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {!projectId ? (
        <Card className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-8 text-center shadow-xs">
          <ClockIcon className="mx-auto mb-2 size-8 text-amber-600 dark:text-amber-400" />
          <p className="text-sm font-bold text-foreground">Nhóm chưa kết nối dự án</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
            Trưởng nhóm cần tạo dự án và kết nối Jira, GitHub để hệ thống đồng bộ tiến độ và minh chứng của thành viên.
          </p>
        </Card>
      ) : progressQuery.isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-xs text-muted-foreground">
          <Loader2Icon className="size-8 animate-spin text-primary" />
          <span className="font-medium">Đang tải toàn bộ số liệu đối soát từ máy chủ...</span>
        </div>
      ) : notInTeam ? (
        <Card className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-8 text-center shadow-xs">
          <p className="text-sm font-bold text-foreground">Thành viên không còn thuộc nhóm</p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Hệ thống ghi nhận tài khoản này không còn là thành viên hoạt động của dự án nhóm.
          </p>
        </Card>
      ) : progressQuery.isError ? (
        <Card className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-8 text-center shadow-xs">
          <p className="text-sm font-bold text-destructive">Không thể tải thông tin đối soát của thành viên</p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {getApiErrorMessage(progressQuery.error, "Vui lòng kiểm tra lại đường truyền mạng.")}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-4 h-8 text-xs cursor-pointer"
            onClick={() => void progressQuery.refetch()}
          >
            Tải lại dữ liệu
          </Button>
        </Card>
      ) : progressData ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <ListTodoIcon className="size-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-foreground">
                    Tiến độ Đầu việc (Jira Tasks)
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold text-foreground">
                  {completedTasks}/{totalAssigned} SP ({taskCompletionRate}%)
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-muted border border-border/40">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, taskCompletionRate)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-1 text-center font-mono">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
                  <span className="block font-sans text-[11px] text-muted-foreground">Đã xong</span>
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                    {progressData.taskSummary.completed ?? 0}
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
                  <span className="block font-sans text-[11px] text-muted-foreground">Chưa xong</span>
                  <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                    {progressData.taskSummary.incomplete ?? 0}
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
                  <span className="block font-sans text-[11px] text-muted-foreground">Đang làm</span>
                  <span className="text-lg font-extrabold text-primary">
                    {inProgressTasks}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <GitCommitIcon className="size-4" />
                </div>
                <h3 className="text-sm font-extrabold text-foreground">
                  Minh chứng Kỹ thuật (GitHub Commits)
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <span className="block text-[11px] text-muted-foreground">Tổng Commits</span>
                  <span className="font-mono text-xl font-extrabold text-foreground">
                    {progressData.commitSummary.total}
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <span className="block text-[11px] text-muted-foreground">Gắn mã Jira</span>
                  <span className="font-mono text-xl font-extrabold text-foreground">
                    {progressData.commitSummary.linkedToTasks}
                  </span>
                  <span className="block font-mono text-[10px] text-muted-foreground">
                    ({formatLinkedCommitRatio(
                      progressData.commitSummary.linkedToTasks,
                      progressData.commitSummary.total
                    )})
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <span className="block text-[11px] text-muted-foreground">Task có commit</span>
                  <span className="font-mono text-xl font-extrabold text-foreground">
                    {progressData.commitSummary.tasksWithLinkedCommits}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <span>Lần commit gần nhất:</span>
                <span className="font-mono font-medium text-foreground">
                  {formatDateTime(
                    progressData.commitSummary.lastCommitAt ?? progressData.commitSummary.lastCommittedAt
                  )}
                </span>
              </div>
            </Card>

            <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <ShieldCheckIcon className="size-4" />
                </div>
                <h3 className="text-sm font-extrabold text-foreground">
                  Tài liệu & Phiên làm việc (Evidence)
                </h3>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
                  <span className="block font-sans text-[10px] text-muted-foreground">Phiên</span>
                  <span className="text-base font-extrabold text-foreground">
                    {progressData.evidenceSummary.workSessions}
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
                  <span className="block font-sans text-[10px] text-muted-foreground">Tệp</span>
                  <span className="text-base font-extrabold text-foreground">
                    {progressData.evidenceSummary.files}
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
                  <span className="block font-sans text-[10px] text-muted-foreground">Web</span>
                  <span className="text-base font-extrabold text-foreground">
                    {progressData.evidenceSummary.webLinks}
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
                  <span className="block font-sans text-[10px] text-muted-foreground">Xác nhận</span>
                  <span className="text-base font-extrabold text-foreground">
                    {progressData.evidenceSummary.confirmations}
                  </span>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Số liệu đối soát tự động từ các phiên làm việc và tài liệu bàn giao. Hệ thống không suy ra điểm số đóng góp thuần túy từ số lượng commit.
              </p>
            </Card>
          </div>

          <div className="space-y-4 lg:col-span-7">
            <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <LayersIcon className="size-5 text-primary" />
                  <h2 className="text-base font-extrabold text-foreground">
                    Danh sách Task được phân công ({assignedTasks.length})
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/30 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTaskFilter("ALL");
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                      taskFilter === "ALL"
                        ? "bg-card text-foreground shadow-2xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Tất cả ({assignedTasks.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTaskFilter("IN_PROGRESS");
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                      taskFilter === "IN_PROGRESS"
                        ? "bg-card text-foreground shadow-2xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Đang làm ({inProgressTasks})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTaskFilter("DONE");
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                      taskFilter === "DONE"
                        ? "bg-card text-foreground shadow-2xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Đã xong ({completedTasks})
                  </button>
                </div>
              </div>

              <div className="relative mt-4">
                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm task theo mã (SAGA-xx) hoặc tiêu đề công việc..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 rounded-xl pl-9 text-xs"
                />
              </div>

              <div className="mt-4 space-y-2.5">
                {paginatedTasks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
                    Không tìm thấy task nào phù hợp với bộ lọc hiện tại.
                  </div>
                ) : (
                  paginatedTasks.map((task) => {
                    const isDone =
                      (task.status || "").toUpperCase() === "DONE" ||
                      (task.status || "").toUpperCase() === "CLOSED";
                    return (
                      <div
                        key={task.id}
                        className="group rounded-2xl border border-border/70 bg-muted/10 p-4 transition-all hover:border-primary/50 hover:bg-card shadow-2xs"
                      >
                        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 flex-1 space-y-1 pr-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {task.externalKey && (
                                <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 shrink-0 whitespace-nowrap">
                                  {task.externalKey}
                                </span>
                              )}
                              <h4 className="text-xs font-bold text-foreground sm:text-sm group-hover:text-primary transition-colors leading-snug">
                                {task.title}
                              </h4>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-mono text-[10px]",
                                isDone
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "border-border bg-muted text-muted-foreground"
                              )}
                            >
                              {task.status || "TODO"}
                            </Badge>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 gap-1 rounded-lg px-2.5 text-[11px] font-semibold cursor-pointer"
                              onClick={() =>
                                setSelectedTimelineTask({
                                  id: task.id,
                                  title: task.title,
                                  key: task.externalKey,
                                })
                              }
                            >
                              <ClockIcon className="size-3 text-primary" />
                              <span>Phiên làm việc</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {totalFilteredTasks > 0 && (
                <div className="mt-4 border-t border-border/60 pt-3">
                  <TablePagination
                    page={currentPage}
                    pageSize={pageSize}
                    totalItems={totalFilteredTasks}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(newSize) => {
                      setPageSize(newSize);
                      setCurrentPage(1);
                    }}
                    pageSizeOptions={[10, 20, 50]}
                    itemLabel="task"
                  />
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : null}

      {selectedTimelineTask && projectId && (
        <TaskWorkSessionTimelineDialog
          open={Boolean(selectedTimelineTask)}
          onOpenChange={(open) => {
            if (!open) setSelectedTimelineTask(null);
          }}
          projectId={projectId}
          taskId={selectedTimelineTask.id}
          taskTitle={selectedTimelineTask.title}
          taskKey={selectedTimelineTask.key}
        />
      )}
    </LecturerPageShell>
  );
}
