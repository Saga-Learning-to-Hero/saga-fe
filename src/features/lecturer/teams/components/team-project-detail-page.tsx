"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import {
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LecturerPageShell } from "@/features/lecturer/courses/components/lecturer-page-shell";
import { useLecturerCourse } from "@/features/lecturer/courses/hooks/use-lecturer-courses";
import { useLecturerTeams, useMoveTeamMember, useReplaceTeamLeader } from "../hooks/use-lecturer-teams";
import { sortTeamMembers, teamRoleLabel, type LecturerTeamMember } from "../types/lecturer-team";
import {
  lecturerCourseDashboardPath,
  lecturerCourseGradesPath,
  lecturerCourseTeamsPath,
  lecturerCoursesPath,
} from "@/features/lecturer/courses/lib/course-routes";
import { ReplaceTeamLeaderDialog } from "./replace-team-leader-dialog";
import { MoveTeamMemberDialog } from "./move-team-member-dialog";
import { cn } from "@/lib/utils";

interface TeamProjectDetailPageProps {
  courseId: string;
  teamId: string;
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
  const hasOtherTeams = teams.some((item) => item.teamId !== team?.teamId);

  const breadcrumbItems = [
    { label: "Lớp học phần", href: lecturerCoursesPath() },
    {
      label: courseQuery.data?.courseCode || "Mã lớp",
      href: lecturerCourseDashboardPath(courseId),
    },
    { label: "Dự án nhóm", href: lecturerCourseTeamsPath(courseId, "teams") },
    { label: team?.teamName || "Tên nhóm" },
  ];

  if (teamsQuery.isError) {
    return (
      <LecturerPageShell
        breadcrumbItems={breadcrumbItems}
        title="Dự án nhóm"
        error={teamsQuery.error}
        errorTitle="Không tải được danh sách nhóm"
        onRetry={() => void teamsQuery.refetch()}
      />
    );
  }

  if (!teamsQuery.isLoading && !team) {
    return (
      <LecturerPageShell breadcrumbItems={breadcrumbItems} title="Dự án nhóm">
        <Card className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border p-8 text-center">
          <h2 className="text-lg font-bold">Không tìm thấy nhóm</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nhóm này không thuộc lớp học phần đang mở. Hãy quay lại danh sách nhóm.
          </p>
          <Link
            href={lecturerCourseTeamsPath(courseId, "teams")}
            prefetch={true}
            className={cn(buttonVariants({ size: "sm" }), "mt-4 text-xs")}
          >
            Về danh sách nhóm
          </Link>
        </Card>
      </LecturerPageShell>
    );
  }

  return (
    <LecturerPageShell
      breadcrumbItems={breadcrumbItems}
      title={team?.teamName || "Dự án nhóm"}
      description={
        hasProject
          ? "Nhóm đã khởi tạo dự án. Liên kết công việc và commit sẽ xuất hiện khi dữ liệu sẵn sàng."
          : "Nhóm đã được phân công. Trưởng nhóm cần đăng nhập bằng tài khoản sinh viên để khởi tạo dự án."
      }
      badges={
        <>
          <Badge variant="outline" className="font-mono text-[11px]">
            TeamNo {team?.teamNo ?? "—"}
          </Badge>
          <Badge
            variant="outline"
            className={
              hasProject
                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300"
            }
          >
            {hasProject ? "Dự án nhóm đã được khởi tạo" : "Nhóm chưa khởi tạo dự án"}
          </Badge>
        </>
      }
      isLoading={courseQuery.isLoading || teamsQuery.isLoading}
    >
      <Card className="rounded-2xl border border-border p-5 shadow-xs">
        <h2 className="mb-4 text-base font-bold">Thành viên</h2>
        <ul className="space-y-2">
          {members.map((member) => {
            const isLeader = member.role === "LEADER";
            const canReplaceLeader = Boolean(member.teamMemberId) && !isLeader;
            const canMoveMember = Boolean(member.teamMemberId) && !isLeader && hasOtherTeams;
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
                  {isLeader && hasOtherTeams ? (
                    <Tooltip>
                      <TooltipTrigger className="cursor-help text-[11px] text-muted-foreground">
                        Đổi trưởng nhóm trước khi chuyển nhóm
                      </TooltipTrigger>
                      <TooltipContent>
                        Không chuyển trưởng nhóm sang nhóm khác trực tiếp. Hãy đặt thành viên khác làm trưởng nhóm trước.
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
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
          body="Dữ liệu chưa sẵn sàng. Tên, mô tả hay loại dự án sẽ xuất hiện khi máy chủ cung cấp cho giảng viên."
        />
        <EmptyIntegrationCard
          icon={<GitCommitIcon className="size-5" />}
          title="Hoạt động GitHub"
          body="Dữ liệu chưa sẵn sàng. Khu vực này chờ máy chủ công bố theo dõi commit."
        />
        <EmptyIntegrationCard
          icon={<KanbanIcon className="size-5" />}
          title="Công việc Jira"
          body="Dữ liệu chưa sẵn sàng. Liên kết công việc sẽ xuất hiện khi máy chủ công bố dữ liệu."
        />
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

      {team ? (
        <Card className="rounded-2xl border border-border p-5">
          <div className="mb-2 flex items-center gap-2 text-primary">
            <PieChartIcon className="size-5" />
            <h2 className="text-sm font-bold text-foreground">Bảng điểm đóng góp</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Xem tỷ lệ đóng góp của nhóm này trên bảng điểm lớp. Đây chưa phải điểm tổng kết môn học.
          </p>
          <Link
            href={lecturerCourseGradesPath(courseId, team.teamId)}
            prefetch={true}
            className={cn(buttonVariants({ size: "sm" }), "mt-3 text-xs")}
          >
            Xem bảng điểm nhóm
          </Link>
        </Card>
      ) : null}
    </LecturerPageShell>
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
      <div className="mb-2 flex items-center gap-2 text-primary">
        {icon}
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
    </Card>
  );
}
