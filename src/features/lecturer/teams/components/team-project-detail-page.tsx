"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRightLeftIcon,
  CheckCircle2Icon,
  ClockIcon,
  CrownIcon,
  EllipsisIcon,
  EyeIcon,
  GitCommitIcon,
  GitGraphIcon,
  ListTodoIcon,
  PieChartIcon,
  Users2Icon,
  UsersIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LeaderBadge, MemberRoleBadge } from "@/components/common/leader-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LecturerPageShell } from "@/features/lecturer/courses/components/lecturer-page-shell";
import { useLecturerCourse } from "@/features/lecturer/courses/hooks/use-lecturer-courses";
import {
  useLecturerTeams,
  useMoveTeamMember,
  useReplaceTeamLeader,
} from "../hooks/use-lecturer-teams";
import { sortTeamMembers, type LecturerTeamMember } from "../types/lecturer-team";
import {
  lecturerCourseGradesPath,
  lecturerCourseGraphPath,
  lecturerCoursePeerReviewsPath,
  lecturerCourseTeamMemberPath,
  lecturerCourseTeamsPath,
} from "@/features/lecturer/courses/lib/course-routes";
import { ReplaceTeamLeaderDialog } from "./replace-team-leader-dialog";
import { MoveTeamMemberDialog } from "./move-team-member-dialog";
import { ActivityHeatmapGrid, SprintBurndownChart } from "@/features/analytics";
import { useProjectSprints } from "@/features/student/sprint-progress/hooks/use-project-sprints";
import { useTaskOptions } from "@/features/student/sprint-progress/hooks/use-project-tasks";
import { scopeSprintsToJiraSource } from "@/features/student/sprint-progress/lib/jira-source-scope";
import { JiraSourceSwitcher } from "@/features/student/project/components/jira-source-switcher";
import { useProjectJiraSourceSelection } from "@/features/student/project/hooks/use-project-jira-source-selection";
import { useProjectProgress } from "@/features/student/project/hooks/useProjectSync";
import { formatDateTime, normalizeProjectProgress } from "@/features/progress/lib/progress-format";
import { ProjectProgressSummary } from "@/features/progress/components/project-progress-summary";
import { cn } from "@/lib/utils";

interface TeamProjectDetailPageProps {
  courseId: string;
  teamId: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "TV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TeamProjectDetailPage({ courseId, teamId }: TeamProjectDetailPageProps) {
  const courseQuery = useLecturerCourse(courseId);
  const teamsQuery = useLecturerTeams(courseId);
  const replaceLeader = useReplaceTeamLeader(courseId);
  const moveMember = useMoveTeamMember(courseId);
  const [leaderCandidate, setLeaderCandidate] = useState<LecturerTeamMember | null>(null);
  const [movingMember, setMovingMember] = useState<LecturerTeamMember | null>(null);

  const teams = teamsQuery.data?.teams ?? [];
  const team = teams.find((item) => item.teamId === teamId);
  const members = sortTeamMembers(team?.members ?? []);
  const hasProject = Boolean(team?.projectId);
  const projectId = team?.projectId ?? null;
  const hasOtherTeams = teams.some((item) => item.teamId !== team?.teamId);

  const progressQuery = useProjectProgress(projectId, {
    enabled: Boolean(projectId),
  });
  const progress = normalizeProjectProgress(progressQuery.data);

  const jiraSource = useProjectJiraSourceSelection(projectId, { readerMode: true });
  const { data: allSprints = [] } = useProjectSprints(projectId || "", jiraSource.effectiveSourceId, {
    enabled: Boolean(projectId),
  });
  const { data: taskOptions } = useTaskOptions(projectId, {
    enabled: Boolean(projectId && jiraSource.effectiveSourceId),
    jiraIntegrationId: jiraSource.effectiveSourceId,
  });
  const sprints = useMemo(
    () =>
      jiraSource.effectiveSourceId
        ? scopeSprintsToJiraSource(allSprints, taskOptions?.sprints)
        : allSprints,
    [allSprints, jiraSource.effectiveSourceId, taskOptions?.sprints]
  );

  const backLink = {
    href: lecturerCourseTeamsPath(courseId),
    label: "danh sách nhóm",
  };

  if (teamsQuery.isError) {
    return (
      <LecturerPageShell
        backLink={backLink}
        title="Dự án nhóm"
        error={teamsQuery.error}
        errorTitle="Không tải được danh sách nhóm"
        onRetry={() => void teamsQuery.refetch()}
      />
    );
  }

  if (!teamsQuery.isLoading && !team) {
    return (
      <LecturerPageShell backLink={backLink} title="Dự án nhóm">
        <Card className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border/80 p-8 text-center shadow-xs">
          <h2 className="text-lg font-bold">Không tìm thấy nhóm</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nhóm này không thuộc lớp học phần đang mở. Hãy quay lại danh sách nhóm.
          </p>
          <Link
            href={lecturerCourseTeamsPath(courseId)}
            prefetch={true}
            className={cn(buttonVariants({ size: "sm" }), "mt-4 text-xs font-bold")}
          >
            Về danh sách nhóm
          </Link>
        </Card>
      </LecturerPageShell>
    );
  }

  return (
    <LecturerPageShell
      backLink={backLink}
      title={team?.teamName ? `Chi tiết nhóm: ${team.teamName}` : "Dự án nhóm"}
      description="Quản lý thành viên, theo dõi tiến độ Burndown và phân tích nhịp độ hoạt động mã nguồn của nhóm."
      isLoading={courseQuery.isLoading || teamsQuery.isLoading}
    >
      {team && (
        <Card className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/10 font-mono text-xs font-bold text-primary"
                >
                  Team #{team.teamNo}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    hasProject
                      ? "border-emerald-500/30 bg-emerald-500/10 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400"
                      : "border-amber-500/30 bg-amber-500/10 font-mono text-xs font-bold text-amber-600 dark:text-amber-400"
                  }
                >
                  {hasProject ? (
                    <>
                      <CheckCircle2Icon className="mr-1 size-3" />
                      Dự án đã kết nối
                    </>
                  ) : (
                    <>
                      <ClockIcon className="mr-1 size-3" />
                      Chưa thiết lập dự án
                    </>
                  )}
                </Badge>
              </div>

              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                  {team.teamName}
                </h1>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {hasProject
                    ? "Theo dõi Sprint, task, commit và tiến độ làm việc của nhóm."
                    : "Trưởng nhóm cần tạo dự án trên SAGA, sau đó kết nối Jira và GitHub trong phân hệ Sinh viên."}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link
                href={`${lecturerCourseGraphPath(courseId)}?teamId=${team.teamId}`}
                prefetch={true}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-1.5 text-xs font-bold cursor-pointer"
                )}
              >
                <GitGraphIcon className="size-3.5 text-primary" />
                Đồ thị đối soát
              </Link>
              <Link
                href={lecturerCourseGradesPath(courseId, team.teamId)}
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
                href={lecturerCoursePeerReviewsPath(courseId, { teamId: team.teamId })}
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
        </Card>
      )}

      <div className="space-y-6">
        {hasProject && progress && (
          <ProjectProgressSummary progress={progress} />
        )}

        <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UsersIcon className="size-5 text-primary" />
              <h2 className="text-base font-extrabold text-foreground">
                Danh sách thành viên ({members.length})
              </h2>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {team?.teamName}
            </span>
          </div>

          <div className="space-y-2.5">
            {members.map((member) => {
              const isLeader = member.role === "LEADER";
              const canReplaceLeader = Boolean(member.teamMemberId) && !isLeader;
              const canMoveMember = Boolean(member.teamMemberId) && !isLeader && hasOtherTeams;
              const memberStats = progress?.memberProgress.find(
                (p) => p.studentId === member.studentProfileId || p.studentCode === member.studentCode
              );

              return (
                <div
                  key={member.teamMemberId || member.courseEnrollmentId || member.studentProfileId}
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border p-3 transition-colors sm:flex-row sm:items-center sm:justify-between",
                    isLeader
                      ? "border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10"
                      : "border-border/60 bg-muted/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar size="sm" className="border border-border/60">
                      <AvatarFallback
                        className={cn(
                          "font-mono text-[11px] font-bold",
                          isLeader
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {getInitials(member.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground">
                          {member.fullName}
                        </span>
                        {isLeader && <LeaderBadge variant="icon-only" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {member.studentCode}
                        </span>
                        <span className="text-[11px] text-muted-foreground/60 hidden sm:inline">•</span>
                        <span className="text-[11px] text-muted-foreground/80 truncate hidden sm:inline">
                          {member.email}
                        </span>
                      </div>
                      {memberStats && (
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                            <ListTodoIcon className="size-3" />
                            {memberStats.tasks.completed}/{memberStats.tasks.assigned || memberStats.tasks.assignedTotal} tasks
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
                            <GitCommitIcon className="size-3" />
                            {memberStats.commits.total} commits
                          </span>
                          {memberStats.commits.lastCommitAt && (
                            <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                              <ClockIcon className="size-3" />
                              {formatDateTime(memberStats.commits.lastCommitAt)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <MemberRoleBadge role={member.role} />

                    {Boolean(member.studentProfileId) && hasProject && (
                      <Link
                        href={lecturerCourseTeamMemberPath(
                          courseId,
                          teamId,
                          member.studentProfileId || member.studentCode
                        )}
                        prefetch={true}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 gap-1.5 text-xs font-semibold cursor-pointer"
                        )}
                      >
                        <EyeIcon className="size-3.5" />
                        Tiến độ
                      </Link>
                    )}

                    {isLeader && hasOtherTeams ? (
                      <Tooltip>
                        <TooltipTrigger className="cursor-help text-[11px] text-muted-foreground">
                          Đổi trưởng nhóm trước khi chuyển
                        </TooltipTrigger>
                        <TooltipContent>
                          Không thể chuyển trưởng nhóm trực tiếp sang nhóm khác. Hãy chọn thành viên khác làm trưởng nhóm trước.
                        </TooltipContent>
                      </Tooltip>
                    ) : null}

                    {(canReplaceLeader || canMoveMember) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label={`Thao tác với ${member.fullName || "thành viên"}`}
                          disabled={replaceLeader.isPending || moveMember.isPending}
                          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                        >
                          <EllipsisIcon className="size-4" />
                          <span className="sr-only">Thao tác thành viên</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-52">
                          {canReplaceLeader && (
                            <DropdownMenuItem
                              className="cursor-pointer text-xs font-semibold gap-2"
                              onClick={() => setLeaderCandidate(member)}
                            >
                              <CrownIcon className="size-4 text-amber-500" />
                              Đặt làm trưởng nhóm
                            </DropdownMenuItem>
                          )}
                          {canReplaceLeader && canMoveMember && <DropdownMenuSeparator />}
                          {canMoveMember && (
                            <DropdownMenuItem
                              className="cursor-pointer text-xs font-semibold gap-2"
                              onClick={() => setMovingMember(member)}
                            >
                              <ArrowRightLeftIcon className="size-4" />
                              Chuyển sang nhóm khác
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {hasProject ? (
          <div className="space-y-6">
            <JiraSourceSwitcher
              sources={jiraSource.activeSources}
              value={jiraSource.effectiveSourceId}
              onChange={jiraSource.selectSource}
            />

            <SprintBurndownChart
              key={`burndown-${jiraSource.effectiveSourceId || "default"}`}
              courseId={courseId}
              teamId={teamId}
              sprints={sprints.map((s) => ({
                id: s.id,
                name: s.name,
                startDate: s.startDate,
                endDate: s.endDate,
                state: s.state,
              }))}
            />

            <ActivityHeatmapGrid
              key={`heatmap-${jiraSource.effectiveSourceId || "default"}`}
              courseId={courseId}
              teamId={teamId}
              sprints={sprints.map((s) => ({
                id: s.id,
                name: s.name,
                startDate: s.startDate,
                endDate: s.endDate,
              }))}
              students={members.map((m) => ({
                studentId: m.studentProfileId,
                fullName: m.fullName,
                studentCode: m.studentCode,
              }))}
            />
          </div>
        ) : (
          <Card className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-8 text-center">
            <ClockIcon className="mx-auto mb-2 size-8 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-bold text-foreground">Nhóm chưa thiết lập dự án</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
              Biểu đồ tiến độ và hoạt động Git sẽ xuất hiện sau khi trưởng nhóm tạo dự án và kết nối Jira, GitHub trong phân hệ Sinh viên.
            </p>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
            <CardContent className="space-y-2 p-0">
              <div className="flex items-center gap-2 text-primary">
                <GitGraphIcon className="size-5" />
                <h3 className="text-sm font-extrabold text-foreground">
                  Trung tâm Giám sát Đồ thị SNA & Traceability
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Xem toàn cảnh mối quan hệ giữa Sinh viên, Task Jira và Git Commits trên không gian đồ thị Cytoscape. Tự động nhận diện các bất thường MSR Anomaly và cảnh báo thành viên bị cô lập.
              </p>
            </CardContent>

            <div className="mt-4 border-t border-border/60 pt-4">
              <Link
                href={`${lecturerCourseGraphPath(courseId)}?teamId=${teamId}`}
                prefetch={true}
                className={cn(
                  buttonVariants({ size: "sm", variant: "outline" }),
                  "gap-1.5 text-xs font-bold cursor-pointer"
                )}
              >
                <GitGraphIcon className="size-3.5 text-primary" />
                Mở đồ thị giám sát nhóm
              </Link>
            </div>
          </Card>

          <Card className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
            <CardContent className="space-y-2 p-0">
              <div className="flex items-center gap-2 text-primary">
                <PieChartIcon className="size-5" />
                <h3 className="text-sm font-extrabold text-foreground">
                  Bảng điểm Tổng kết & Tỷ lệ Đóng góp
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Xem bảng điểm tổng kết môn học, tỷ lệ chia cổ phần Slicing Pie và đối soát điểm số đóng góp của từng thành viên trong nhóm.
              </p>
            </CardContent>

            <div className="mt-4 border-t border-border/60 pt-4">
              <Link
                href={lecturerCourseGradesPath(courseId, teamId)}
                prefetch={true}
                className={cn(
                  buttonVariants({ size: "sm", variant: "default" }),
                  "gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
                )}
              >
                <PieChartIcon className="size-3.5" />
                Xem bảng điểm nhóm
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <ReplaceTeamLeaderDialog
        open={leaderCandidate !== null}
        member={leaderCandidate}
        isSaving={replaceLeader.isPending}
        onOpenChange={(open) => {
          if (replaceLeader.isPending && !open) return;
          if (!open) setLeaderCandidate(null);
        }}
        onConfirm={() => {
          if (!leaderCandidate?.teamMemberId || !team) return;
          replaceLeader.mutate(
            { teamId: team.teamId, teamMemberId: leaderCandidate.teamMemberId },
            { onSuccess: () => setLeaderCandidate(null) }
          );
        }}
      />

      <MoveTeamMemberDialog
        open={movingMember !== null}
        member={movingMember}
        currentTeam={team ?? null}
        teams={teams}
        isSaving={moveMember.isPending}
        onOpenChange={(open) => {
          if (moveMember.isPending && !open) return;
          if (!open) setMovingMember(null);
        }}
        onConfirm={(targetTeamId) => {
          if (!movingMember?.teamMemberId) return;
          moveMember.mutate(
            { teamMemberId: movingMember.teamMemberId, targetTeamId },
            { onSuccess: () => setMovingMember(null) }
          );
        }}
      />
    </LecturerPageShell>
  );
}
