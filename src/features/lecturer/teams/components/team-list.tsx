"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowRightLeftIcon,
  CheckCircle2Icon,
  ClockIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  FolderKanbanIcon,
  GitGraphIcon,
  MoreVerticalIcon,
  RefreshCwIcon,
  UserCheck2Icon,
  UserMinusIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveHttpAvatarUrl } from "@/lib/avatar-url";
import { Badge } from "@/components/ui/badge";
import { LeaderBadge, MemberRoleBadge } from "@/components/common/leader-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CourseQueryError } from "@/features/lecturer/courses/components/course-query-error";
import {
  lecturerCourseGradesPath,
  lecturerCourseGraphPath,
  lecturerCourseTeamPath,
} from "@/features/lecturer/courses/lib/course-routes";
import { formatQueryUpdatedAt } from "@/features/lecturer/courses/lib/format-query-updated-at";
import { ReasonConfirmDialog } from "@/components/common/reason-confirm-dialog";
import { getRemovalApiErrorMessage } from "@/lib/removal-reason";
import {
  useAddTeamMember,
  useDownloadTeamTemplate,
  useLecturerTeams,
  useMoveTeamMember,
  useRemoveTeamMember,
  useReplaceTeamLeader,
} from "../hooks/use-lecturer-teams";
import {
  sortTeamMembers,
  type LecturerTeamItem,
  type LecturerTeamMember,
  type UnassignedStudent,
} from "../types/lecturer-team";
import { TeamImportDialog } from "./team-import-dialog";
import { AddTeamMemberDialog } from "./add-team-member-dialog";
import { MoveTeamMemberDialog } from "./move-team-member-dialog";
import { AssignUnassignedStudentDialog } from "./assign-unassigned-student-dialog";
import { cn } from "@/lib/utils";

interface TeamListProps {
  courseId: string;
  courseCode?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "TV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TeamList({ courseId, courseCode }: TeamListProps) {
  const { data, isLoading, isError, error, refetch, dataUpdatedAt, isFetching } =
    useLecturerTeams(courseId);
  const [importOpen, setImportOpen] = useState(false);
  const [addingStudentTeam, setAddingStudentTeam] = useState<LecturerTeamItem | null>(null);
  const [movingMember, setMovingMember] = useState<{
    member: LecturerTeamMember;
    currentTeam: LecturerTeamItem;
  } | null>(null);
  const [assigningStudent, setAssigningStudent] = useState<UnassignedStudent | null>(null);
  const [removingMember, setRemovingMember] = useState<LecturerTeamMember | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const downloadTemplateMutation = useDownloadTeamTemplate();
  const replaceLeaderMutation = useReplaceTeamLeader(courseId);
  const addTeamMemberMutation = useAddTeamMember(courseId);
  const moveTeamMemberMutation = useMoveTeamMember(courseId);
  const removeTeamMemberMutation = useRemoveTeamMember(courseId);

  const updatedAt = formatQueryUpdatedAt([dataUpdatedAt]);

  const sortedTeams = useMemo(
    () =>
      (data?.teams ?? []).map((team) => ({
        ...team,
        members: sortTeamMembers(team.members ?? []),
      })),
    [data?.teams]
  );

  const unassignedStudents = useMemo(
    () => data?.unassignedStudents ?? [],
    [data?.unassignedStudents]
  );

  const stats = useMemo(() => {
    const total = sortedTeams.length;
    const withProject = sortedTeams.filter((t) => Boolean(t.projectId)).length;
    const totalMembers = sortedTeams.reduce((acc, t) => acc + t.members.length, 0);
    const unassignedCount = unassignedStudents.length;
    return {
      total,
      withProject,
      waiting: total - withProject,
      totalMembers,
      unassignedCount,
    };
  }, [sortedTeams, unassignedStudents]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-xl bg-muted/60" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <CourseQueryError
        title="Không tải được danh sách nhóm"
        error={error}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-5">
      <Card className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 sm:divide-x sm:divide-border/60">
          <div className="flex items-center gap-3.5 sm:px-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderKanbanIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Tổng số nhóm</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-xl font-black text-foreground">{stats.total}</span>
                <span className="text-xs text-muted-foreground">nhóm</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:px-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2Icon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Đã có dự án</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {stats.withProject}
                </span>
                <span className="text-xs text-muted-foreground">/ {stats.total}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:px-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ClockIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Chờ khởi tạo</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-xl font-black text-amber-600 dark:text-amber-400">
                  {stats.waiting}
                </span>
                <span className="text-xs text-muted-foreground">nhóm</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:px-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <UsersIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Đã vào nhóm</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-xl font-black text-foreground">{stats.totalMembers}</span>
                <span className="text-xs text-muted-foreground">thành viên</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:px-3 col-span-2 sm:col-span-1">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                stats.unassignedCount > 0
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-muted/40 text-muted-foreground"
              )}
            >
              <UserMinusIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Chưa có nhóm</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span
                  className={cn(
                    "font-mono text-xl font-black",
                    stats.unassignedCount > 0
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-muted-foreground"
                  )}
                >
                  {stats.unassignedCount}
                </span>
                <span className="text-xs text-muted-foreground">sinh viên</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Khối hiển thị sinh viên chưa có nhóm */}
      {unassignedStudents.length > 0 && (
        <Card className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 shadow-xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-700 dark:text-rose-300">
                <UserMinusIcon className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-foreground">
                    Sinh viên chưa vào nhóm
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-rose-500/40 bg-rose-500/15 font-mono text-xs font-bold text-rose-700 dark:text-rose-300"
                  >
                    {unassignedStudents.length} sinh viên
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Các sinh viên đã đăng ký vào lớp học phần nhưng chưa được gán vào nhóm dự án.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {unassignedStudents.map((student) => (
              <div
                key={student.courseEnrollmentId}
                className="flex items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-card p-2.5 transition-colors hover:border-primary/40 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar size="sm" className="border border-border/60 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-mono text-xs font-bold">
                      {getInitials(student.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {student.fullName}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="font-mono font-medium">{student.studentCode}</span>
                      {student.email && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{student.email}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {sortedTeams.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-xs font-semibold text-primary hover:bg-primary/10 cursor-pointer shrink-0"
                    onClick={() => setAssigningStudent(student)}
                  >
                    Phân nhóm
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-extrabold text-foreground">Danh sách nhóm dự án</h2>
          <p className="text-xs text-muted-foreground">
            Quản lý thành viên, thay đổi trưởng nhóm và theo dõi tiến độ khởi tạo dự án thực tế.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {updatedAt ? (
            <p className="hidden text-xs text-muted-foreground sm:block">
              Cập nhật lúc {updatedAt}
            </p>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8.5 cursor-pointer text-xs"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            <RefreshCwIcon className={cn("size-3.5", isFetching && "animate-spin")} />
            Làm mới
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8.5 cursor-pointer gap-1.5 text-xs font-medium"
            disabled={downloadTemplateMutation.isPending}
            onClick={() => downloadTemplateMutation.mutate(courseId)}
          >
            <DownloadIcon className="size-3.5" />
            Tải mẫu Excel
          </Button>
          <Button
            size="sm"
            onClick={() => setImportOpen(true)}
            className="h-8.5 cursor-pointer gap-2 text-xs font-bold shadow-xs"
          >
            <FileSpreadsheetIcon className="size-3.5" />
            Phân nhóm bằng Excel
          </Button>
        </div>
      </div>

      {sortedTeams.length === 0 ? (
        <Card className="rounded-xl border border-dashed border-border/80 p-10 text-center shadow-xs">
          <UsersIcon className="mx-auto mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-bold text-foreground">Chưa có nhóm nào trong lớp</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
            Tải mẫu Excel, điền thông tin TeamNo, TeamName và danh sách mã số sinh viên, sau đó tải lên để phân nhóm.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadTemplateMutation.mutate(courseId)}
              className="cursor-pointer gap-1.5 text-xs font-semibold"
            >
              <DownloadIcon className="size-3.5" />
              Tải mẫu Excel
            </Button>
            <Button
              size="sm"
              onClick={() => setImportOpen(true)}
              className="cursor-pointer gap-2 text-xs font-bold shadow-xs"
            >
              <FileSpreadsheetIcon className="size-3.5" />
              Bắt đầu phân nhóm
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {sortedTeams.map((team) => (
            <Card
              key={team.teamId}
              className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-primary/25 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-black text-primary">
                        Team #{team.teamNo}
                      </span>
                      <Badge variant="secondary" className="font-mono text-xs font-semibold">
                        {team.members.length} thành viên
                      </Badge>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 gap-1 text-[11px] font-semibold cursor-pointer border-dashed hover:border-primary/50 hover:bg-primary/5"
                        onClick={() => setAddingStudentTeam(team)}
                      >
                        <UserPlusIcon className="size-3 text-primary" />
                        Thêm sinh viên
                      </Button>
                    </div>
                    <h3 className="text-base font-extrabold text-foreground">
                      {team.teamName}
                    </h3>
                  </div>

                  {team.projectId ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/10 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400"
                    >
                      <CheckCircle2Icon className="mr-1 size-3.5" />
                      Đã có dự án
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 font-mono text-xs font-bold text-amber-600 dark:text-amber-400"
                    >
                      <ClockIcon className="mr-1 size-3.5" />
                      Chờ khởi tạo
                    </Badge>
                  )}
                </div>

                {!team.projectId ? (
                  <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                    <p className="font-bold flex items-center gap-1.5">
                      <ClockIcon className="size-3.5 text-amber-600 dark:text-amber-400" />
                      Chưa thiết lập dự án nhóm
                    </p>
                    <p className="mt-0.5 text-xs text-amber-800/90 dark:text-amber-300/80">
                      Trưởng nhóm cần tạo dự án trên SAGA, sau đó kết nối Jira và GitHub trong phân hệ Sinh viên.
                    </p>
                  </div>
                ) : (
                  <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-2.5 text-xs">
                    <CheckCircle2Icon className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-bold text-foreground">Dự án đã kết nối</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Sẵn sàng theo dõi Sprint, task và commit của nhóm.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {team.members.map((member) => {
                    const isLeader = member.role === "LEADER";

                    return (
                      <div
                        key={member.courseEnrollmentId || member.teamMemberId}
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-colors",
                          isLeader
                            ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10"
                            : "border-border/60 bg-muted/20 hover:bg-muted/30"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar size="sm" className="border border-border/60 shrink-0">
                            <AvatarImage
                              src={resolveHttpAvatarUrl(member.avatarUrl)}
                              alt={member.fullName}
                            />
                            <AvatarFallback
                              className={cn(
                                "font-mono text-xs font-bold",
                                isLeader
                                  ? "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                                  : "bg-primary/10 text-primary"
                              )}
                            >
                              {getInitials(member.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-foreground truncate">
                                {member.fullName}
                              </span>
                              {isLeader && <LeaderBadge variant="icon-only" />}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-medium text-muted-foreground">
                                {member.studentCode}
                              </span>
                              <span className="text-xs text-muted-foreground/60 hidden sm:inline">
                                •
                              </span>
                              <span className="text-xs text-muted-foreground/80 truncate hidden sm:inline">
                                {member.email}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <MemberRoleBadge role={member.role} />

                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="inline-flex size-7 cursor-pointer items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                              aria-label="Tùy chọn thành viên"
                            >
                              <MoreVerticalIcon className="size-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuLabel className="text-xs font-semibold">
                                Thao tác thành viên
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {!isLeader && (
                                <DropdownMenuItem
                                  className="cursor-pointer text-xs font-semibold gap-2"
                                  disabled={replaceLeaderMutation.isPending}
                                  onClick={() =>
                                    replaceLeaderMutation.mutate({
                                      teamId: team.teamId,
                                      teamMemberId: member.teamMemberId,
                                    })
                                  }
                                >
                                  <UserCheck2Icon className="size-3.5 text-amber-500" />
                                  Chỉ định làm Trưởng nhóm
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="cursor-pointer text-xs font-semibold gap-2"
                                onClick={() => setMovingMember({ member, currentTeam: team })}
                              >
                                <ArrowRightLeftIcon className="size-3.5 text-primary" />
                                Chuyển sang nhóm khác
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer text-xs font-semibold gap-2 text-destructive focus:text-destructive"
                                disabled={isLeader || !member.teamMemberId || removeTeamMemberMutation.isPending}
                                onClick={() => {
                                  if (isLeader || !member.teamMemberId) return;
                                  setRemoveError(null);
                                  setRemovingMember(member);
                                }}
                              >
                                <UserMinusIcon className="size-3.5" />
                                Rút khỏi nhóm
                              </DropdownMenuItem>
                              {isLeader ? (
                                <p className="px-2 py-1 text-[11px] leading-relaxed text-muted-foreground">
                                  Hãy đổi trưởng nhóm trước
                                </p>
                              ) : null}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={lecturerCourseGraphPath(courseId, team.teamId)}
                    prefetch={true}
                    className={cn(
                      buttonVariants({ size: "sm", variant: "outline" }),
                      "h-8 gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                    )}
                  >
                    <GitGraphIcon className="size-3.5 text-primary" />
                    Đồ thị đối soát
                  </Link>

                  <Link
                    href={lecturerCourseGradesPath(courseId, team.teamId)}
                    prefetch={true}
                    className={cn(
                      buttonVariants({ size: "sm", variant: "ghost" }),
                      "h-8 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                    )}
                  >
                    Bảng điểm nhóm
                  </Link>
                </div>

                <Link
                  href={lecturerCourseTeamPath(courseId, team.teamId)}
                  prefetch={true}
                  className={cn(
                    buttonVariants({
                      size: "sm",
                      variant: team.projectId ? "default" : "outline",
                    }),
                    "h-8 gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
                  )}
                >
                  {team.projectId ? "Xem dự án nhóm" : "Xem thông tin nhóm"}
                  <ArrowRightIcon className="size-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Phân nhóm bằng Excel */}
      <TeamImportDialog
        key={courseId}
        courseId={courseId}
        courseCode={courseCode}
        isOpen={importOpen}
        onOpenChange={setImportOpen}
      />

      {/* Modal Thêm sinh viên vào nhóm cụ thể */}
      <AddTeamMemberDialog
        open={Boolean(addingStudentTeam)}
        team={addingStudentTeam}
        unassignedStudents={unassignedStudents}
        isSaving={addTeamMemberMutation.isPending}
        onOpenChange={(open) => !open && setAddingStudentTeam(null)}
        onConfirm={async (courseEnrollmentId) => {
          if (!addingStudentTeam) return;
          await addTeamMemberMutation.mutateAsync({
            teamId: addingStudentTeam.teamId,
            courseEnrollmentId,
          });
          setAddingStudentTeam(null);
        }}
      />

      {/* Modal Chuyển thành viên sang nhóm khác */}
      <MoveTeamMemberDialog
        open={Boolean(movingMember)}
        member={movingMember?.member ?? null}
        currentTeam={movingMember?.currentTeam ?? null}
        teams={sortedTeams}
        isSaving={moveTeamMemberMutation.isPending}
        onOpenChange={(open) => !open && setMovingMember(null)}
        onConfirm={async (targetTeamId, courseEnrollmentId) => {
          await moveTeamMemberMutation.mutateAsync({
            targetTeamId,
            courseEnrollmentId,
          });
          setMovingMember(null);
        }}
      />

      {/* Modal Phân sinh viên chưa có nhóm vào 1 nhóm đích */}
      <AssignUnassignedStudentDialog
        open={Boolean(assigningStudent)}
        student={assigningStudent}
        teams={sortedTeams}
        isSaving={addTeamMemberMutation.isPending}
        onOpenChange={(open) => !open && setAssigningStudent(null)}
        onConfirm={async (teamId, courseEnrollmentId) => {
          await addTeamMemberMutation.mutateAsync({
            teamId,
            courseEnrollmentId,
          });
          setAssigningStudent(null);
        }}
      />

      <ReasonConfirmDialog
        isOpen={Boolean(removingMember)}
        onClose={() => {
          if (removeTeamMemberMutation.isPending) return;
          setRemovingMember(null);
          setRemoveError(null);
        }}
        onConfirm={async (reason) => {
          if (!removingMember?.teamMemberId) return;
          setRemoveError(null);
          try {
            await removeTeamMemberMutation.mutateAsync({
              teamMemberId: removingMember.teamMemberId,
              reason,
            });
            setRemovingMember(null);
          } catch (mutationError: unknown) {
            setRemoveError(
              getRemovalApiErrorMessage(mutationError, "Không thể rút sinh viên khỏi nhóm.")
            );
          }
        }}
        isLoading={removeTeamMemberMutation.isPending}
        title="Rút sinh viên khỏi nhóm"
        description={
          removingMember
            ? `${removingMember.fullName} (${removingMember.studentCode}) sẽ được rút khỏi nhóm và chuyển về danh sách chưa phân nhóm.`
            : "Sinh viên sẽ được rút khỏi nhóm."
        }
        confirmText="Xác nhận rút khỏi nhóm"
        loadingText="Đang rút..."
        errorMessage={removeError}
        reasonDescription="Bắt buộc. Tối đa 500 ký tự. Hệ thống sẽ gửi thông báo cho sinh viên."
      />
    </div>
  );
}
