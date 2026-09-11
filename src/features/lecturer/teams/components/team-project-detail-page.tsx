"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRightLeftIcon,
  CheckCircle2Icon,
  ClockIcon,
  CrownIcon,
  EllipsisIcon,
  FolderKanbanIcon,
  NetworkIcon,
  PieChartIcon,
  UsersIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { useLecturerTeams, useMoveTeamMember, useReplaceTeamLeader } from "../hooks/use-lecturer-teams";
import { sortTeamMembers, teamRoleLabel, type LecturerTeamMember } from "../types/lecturer-team";
import {
  lecturerCourseGradesPath,
  lecturerCourseGraphPath,
  lecturerCourseTeamsPath,
} from "@/features/lecturer/courses/lib/course-routes";
import { ReplaceTeamLeaderDialog } from "./replace-team-leader-dialog";
import { MoveTeamMemberDialog } from "./move-team-member-dialog";
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
  const hasOtherTeams = teams.some((item) => item.teamId !== team?.teamId);

  const backLink = {
    href: lecturerCourseTeamsPath(courseId, "teams"),
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
            href={lecturerCourseTeamsPath(courseId, "teams")}
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
      description={
        hasProject
          ? "Nhóm đã khởi tạo dự án. Giảng viên có thể theo dõi danh sách thành viên, mở đồ thị đối soát và chấm điểm đóng góp."
          : "Nhóm đã được phân công. Trưởng nhóm cần đăng nhập bằng tài khoản sinh viên để khởi tạo dự án."
      }
      badges={
        <>
          <Badge
            variant="outline"
            className="border-primary/25 bg-primary/10 font-mono text-xs font-bold text-primary"
          >
            Team #{team?.teamNo ?? "—"}
          </Badge>
          <Badge
            variant="outline"
            className={
              hasProject
                ? "border-emerald-500/30 bg-emerald-500/10 font-mono text-xs text-emerald-600 dark:text-emerald-400"
                : "border-amber-500/30 bg-amber-500/10 font-mono text-xs text-amber-600 dark:text-amber-400"
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
                Chờ khởi tạo dự án
              </>
            )}
          </Badge>
        </>
      }
      isLoading={courseQuery.isLoading || teamsQuery.isLoading}
    >
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
                      {isLeader && (
                        <CrownIcon className="size-3 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {member.studentCode}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-[10px] font-bold",
                      isLeader
                        ? "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        : "border-border/60 bg-muted/60 text-muted-foreground"
                    )}
                  >
                    {teamRoleLabel(member.role)}
                  </Badge>

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
                          <DropdownMenuItem onClick={() => setLeaderCandidate(member)}>
                            <CrownIcon className="size-4 text-amber-500" />
                            Đặt làm trưởng nhóm
                          </DropdownMenuItem>
                        )}
                        {canReplaceLeader && canMoveMember && <DropdownMenuSeparator />}
                        {canMoveMember && (
                          <DropdownMenuItem onClick={() => setMovingMember(member)}>
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          <CardContent className="space-y-4 p-0">
            <div className="flex items-center gap-2 text-primary">
              <FolderKanbanIcon className="size-5" />
              <h2 className="text-sm font-extrabold text-foreground">
                Thông tin & Phương pháp đồ án
              </h2>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">Chủ đề đề tài:</span>
                <span className="font-bold text-foreground">
                  {team?.teamName ? `Đồ án ${team.teamName}` : "Kỹ thuật phần mềm Capstone"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">Mô hình phát triển:</span>
                <span className="font-bold text-foreground">Agile / Scrum Framework</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">Chu kỳ Sprint:</span>
                <span className="font-mono font-bold text-foreground">2 tuần / Sprint</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trạng thái khởi tạo:</span>
                <Badge
                  variant="outline"
                  className={
                    hasProject
                      ? "border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] text-emerald-600 dark:text-emerald-400"
                      : "border-amber-500/30 bg-amber-500/10 font-mono text-[10px] text-amber-600 dark:text-amber-400"
                  }
                >
                  {hasProject ? "Đã sẵn sàng" : "Chờ trưởng nhóm"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          <CardContent className="space-y-3 p-0">
            <div className="flex items-center gap-2 text-primary">
              <NetworkIcon className="size-5" />
              <h2 className="text-sm font-extrabold text-foreground">
                Không gian giám sát & Đánh giá
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Truy cập trực tiếp đồ thị minh chứng Traceability, tương tác SNA và bảng điểm đóng góp Slicing Pie của nhóm này.
            </p>
          </CardContent>

          <div className="mt-4 flex flex-wrap gap-2.5 border-t border-border/60 pt-4">
            <Link
              href={lecturerCourseGraphPath(courseId)}
              prefetch={true}
              className={cn(buttonVariants({ size: "sm" }), "gap-1.5 text-xs font-bold shadow-xs")}
            >
              <NetworkIcon className="size-3.5" />
              Mở đồ thị đối soát
            </Link>
            {team ? (
              <Link
                href={lecturerCourseGradesPath(courseId, team.teamId)}
                prefetch={true}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-1.5 text-xs font-bold"
                )}
              >
                <PieChartIcon className="size-3.5" />
                Xem bảng điểm nhóm
              </Link>
            ) : null}
          </div>
        </Card>
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
