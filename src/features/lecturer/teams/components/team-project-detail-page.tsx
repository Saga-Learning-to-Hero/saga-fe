"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightLeftIcon,
  CrownIcon,
  EllipsisIcon,
  FolderKanbanIcon,
  GitCommitIcon,
  KanbanIcon,
  PieChartIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AwaitingServerDataBadge } from "@/features/lecturer/courses/components/awaiting-server-data-badge";
import { CourseQueryError } from "@/features/lecturer/courses/components/course-query-error";
import {
  useLecturerCourse,
  useLecturerCourseAccess,
} from "@/features/lecturer/courses/hooks/use-lecturer-courses";
import { useLecturerTeams, useMoveTeamMember, useReplaceTeamLeader } from "../hooks/use-lecturer-teams";
import { sortTeamMembers, teamRoleLabel, type LecturerTeamMember } from "../types/lecturer-team";
import {
  lecturerCourseDashboardPath,
  lecturerCourseTeamEvaluationPath,
  lecturerCourseTeamsPath,
  lecturerCoursesPath,
} from "@/features/lecturer/courses/lib/course-routes";
import { ProjectGroupWeightsPanel } from "@/features/lecturer/contribution/components/project-group-weights-panel";
import { ReplaceTeamLeaderDialog } from "./replace-team-leader-dialog";
import { MoveTeamMemberDialog } from "./move-team-member-dialog";

interface TeamProjectDetailPageProps {
  courseId: string;
  teamId: string;
}

export function TeamProjectDetailPage({ courseId, teamId }: TeamProjectDetailPageProps) {
  const courseQuery = useLecturerCourse(courseId);
  const teamsQuery = useLecturerTeams(courseId);
  const courseAccess = useLecturerCourseAccess(courseQuery.isError, courseQuery.error);
  const teamsAccess = useLecturerCourseAccess(teamsQuery.isError, teamsQuery.error);

  const replaceLeader = useReplaceTeamLeader(courseId);
  const moveMember = useMoveTeamMember(courseId);
  const [leaderCandidate, setLeaderCandidate] = useState<LecturerTeamMember | null>(null);
  const [movingMember, setMovingMember] = useState<LecturerTeamMember | null>(null);

  const teams = teamsQuery.data?.teams ?? [];
  const team = teams.find((item) => item.teamId === teamId);
  const members = sortTeamMembers(team?.members ?? []);
  const hasProject = Boolean(team?.projectId);

  if (courseAccess.isAccessDenied || teamsAccess.isAccessDenied) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Đang chuyển về danh sách lớp...
      </div>
    );
  }

  if (courseQuery.isError) {
    return <CourseQueryError error={courseQuery.error} onRetry={() => void courseQuery.refetch()} />;
  }

  if (teamsQuery.isError) {
    return <CourseQueryError error={teamsQuery.error} onRetry={() => void teamsQuery.refetch()} />;
  }

  if (courseQuery.isLoading || teamsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-[1100px] space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    );
  }

  if (!team) {
    return (
      <Card className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border p-8 text-center">
        <h1 className="text-lg font-bold">Không tìm thấy nhóm</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Định danh nhóm không thuộc lớp học phần này. Không dùng mock ID để mở chi tiết dự án nhóm.
        </p>
        <Link
          href={lecturerCourseTeamsPath(courseId)}
          prefetch={true}
          className={buttonVariants({ size: "sm", className: "mt-4 text-xs" })}
        >
          Về danh sách nhóm
        </Link>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link
          href={lecturerCourseTeamsPath(courseId)}
          prefetch={true}
          aria-label="Quay lại danh sách nhóm"
          className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 rounded-lg" })}
        >
          <ArrowLeftIcon className="size-4" />
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href={lecturerCoursesPath()} prefetch={true} className="transition-colors hover:text-foreground">
            Lớp học phần của tôi
          </Link>
          <span>/</span>
          <Link
            href={lecturerCourseDashboardPath(courseId)}
            prefetch={true}
            className="font-mono font-semibold text-foreground"
          >
            {courseQuery.data?.courseCode}
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">{team.teamName}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <p className="font-mono text-[11px] text-muted-foreground">TeamNo {team.teamNo}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-tight">{team.teamName}</h1>
          <Badge
            variant="outline"
            className={
              hasProject
                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300"
            }
          >
            {hasProject ? "Dự án nhóm đã được khởi tạo" : "Chưa có dự án nhóm"}
          </Badge>
        </div>
        {hasProject ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Máy chủ xác nhận nhóm đã có dự án. Tên, mô tả, GitHub và Jira chưa được công bố cho tài khoản
            giảng viên.
          </p>
        ) : (
          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Nhóm đã được phân công.</p>
            <p>Chưa có dự án nhóm.</p>
            <p>Trưởng nhóm cần đăng nhập bằng tài khoản sinh viên để khởi tạo dự án nhóm.</p>
          </div>
        )}
      </div>

      <Card className="rounded-2xl border border-border p-5 shadow-xs">
        <h2 className="mb-4 text-base font-bold">Thành viên</h2>
        <ul className="space-y-2">
          {members.map((member) => {
            const isLeader = member.role === "LEADER";
            const canReplaceLeader = Boolean(member.teamMemberId) && !isLeader;
            const canMoveMember =
              Boolean(member.teamMemberId) && teams.some((item) => item.teamId !== team.teamId);
            return (
              <li
                key={member.teamMemberId || member.courseEnrollmentId || member.studentProfileId}
                className="flex flex-col gap-2 rounded-xl bg-muted/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs font-semibold">{member.fullName}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{member.studentCode}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      isLeader
                        ? "border-primary/25 bg-primary/10 text-[10px] text-primary"
                        : "text-[10px]"
                    }
                  >
                    {teamRoleLabel(member.role)}
                  </Badge>
                  {canReplaceLeader || canMoveMember ? (
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
                        {canReplaceLeader ? (
                          <DropdownMenuItem onClick={() => setLeaderCandidate(member)}>
                            <CrownIcon className="size-4 text-primary" />
                            Đặt làm trưởng nhóm
                          </DropdownMenuItem>
                        ) : null}
                        {canReplaceLeader && canMoveMember ? <DropdownMenuSeparator /> : null}
                        {canMoveMember ? (
                          <DropdownMenuItem onClick={() => setMovingMember(member)}>
                            <ArrowRightLeftIcon className="size-4" />
                            Chuyển sang nhóm khác
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <EmptyIntegrationCard
          icon={<FolderKanbanIcon className="size-5" />}
          title="Thông tin dự án"
          body="Backend chưa công bố tên, mô tả hay loại dự án cho giảng viên. Không gọi API sinh viên để vượt phạm vi quyền."
        />
        <EmptyIntegrationCard
          icon={<GitCommitIcon className="size-5" />}
          title="Hoạt động GitHub"
          body="Không có API chỉ đọc GitHub cho giảng viên. Khu vực này chờ máy chủ công bố dữ liệu."
        />
        <EmptyIntegrationCard
          icon={<KanbanIcon className="size-5" />}
          title="Công việc Jira"
          body="Không có API chỉ đọc Jira cho giảng viên. Không tự đoán đường dẫn tích hợp."
        />
      </div>

      <ProjectGroupWeightsPanel
        courseId={courseId}
        teamId={team.teamId}
        projectId={team.projectId}
      />

      <ReplaceTeamLeaderDialog
        open={leaderCandidate !== null}
        member={leaderCandidate}
        isSaving={replaceLeader.isPending}
        onOpenChange={(open) => {
          if (!open) setLeaderCandidate(null);
        }}
        onConfirm={() => {
          if (!leaderCandidate?.teamMemberId) return;
          replaceLeader.mutate(
            { teamId: team.teamId, teamMemberId: leaderCandidate.teamMemberId },
            { onSuccess: () => setLeaderCandidate(null) }
          );
        }}
      />

      <MoveTeamMemberDialog
        open={movingMember !== null}
        member={movingMember}
        currentTeam={team}
        teams={teams}
        isSaving={moveMember.isPending}
        onOpenChange={(open) => {
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

      <Card className="rounded-2xl border border-border p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-primary">
            <PieChartIcon className="size-5" />
            <h2 className="text-sm font-bold text-foreground">Đánh giá đóng góp</h2>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Tỷ lệ đóng góp lấy từ máy chủ theo nhóm hiện tại. Giao diện không tự cộng trừ số liệu.
        </p>
        <Link
          href={lecturerCourseTeamEvaluationPath(courseId, team.teamId)}
          prefetch={true}
          className={buttonVariants({ size: "sm", className: "mt-3 text-xs" })}
        >
          Xem đánh giá đóng góp
        </Link>
      </Card>
    </div>
  );
}

function EmptyIntegrationCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card className="rounded-2xl border border-dashed border-border p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-primary">
          {icon}
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
        </div>
        <AwaitingServerDataBadge />
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
    </Card>
  );
}
