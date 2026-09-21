"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  FolderKanbanIcon,
  GitGraphIcon,
  MoreVerticalIcon,
  RefreshCwIcon,
  UserCheck2Icon,
  UsersIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  useDownloadTeamTemplate,
  useLecturerTeams,
  useReplaceTeamLeader,
} from "../hooks/use-lecturer-teams";
import { sortTeamMembers } from "../types/lecturer-team";
import { TeamImportDialog } from "./team-import-dialog";
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
  const downloadTemplateMutation = useDownloadTeamTemplate();
  const replaceLeaderMutation = useReplaceTeamLeader(courseId);
  const updatedAt = formatQueryUpdatedAt([dataUpdatedAt]);

  const sortedTeams = useMemo(
    () =>
      (data?.teams ?? []).map((team) => ({
        ...team,
        members: sortTeamMembers(team.members ?? []),
      })),
    [data?.teams]
  );

  const stats = useMemo(() => {
    const total = sortedTeams.length;
    const withProject = sortedTeams.filter((t) => Boolean(t.projectId)).length;
    const totalMembers = sortedTeams.reduce((acc, t) => acc + t.members.length, 0);
    return { total, withProject, waiting: total - withProject, totalMembers };
  }, [sortedTeams]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-muted/60" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-2xl bg-muted/60" />
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
      <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:divide-x sm:divide-border/60">
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
              <p className="text-xs font-semibold text-muted-foreground">Sinh viên trong nhóm</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-xl font-black text-foreground">{stats.totalMembers}</span>
                <span className="text-xs text-muted-foreground">thành viên</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-extrabold text-foreground">Danh sách nhóm dự án</h2>
          <p className="text-xs text-muted-foreground">
            Quản lý thành viên, thay đổi trưởng nhóm và theo dõi tiến độ khởi tạo dự án thực tế.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {updatedAt ? (
            <p className="hidden text-[11px] text-muted-foreground sm:block">
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
        <Card className="rounded-2xl border border-dashed border-border/80 p-10 text-center shadow-xs">
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
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-primary/25 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-black text-primary">
                        Team #{team.teamNo}
                      </span>
                      <Badge variant="secondary" className="font-mono text-[11px] font-semibold">
                        {team.members.length} thành viên
                      </Badge>
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
                    <p className="mt-0.5 text-[11px] text-amber-800/90 dark:text-amber-300/80">
                      Trưởng nhóm cần tạo dự án trên SAGA, sau đó kết nối Jira và GitHub trong phân hệ Sinh viên.
                    </p>
                  </div>
                ) : (
                  <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-2.5 text-xs">
                    <CheckCircle2Icon className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-bold text-foreground">Dự án đã kết nối</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
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
                        key={member.courseEnrollmentId}
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-colors",
                          isLeader
                            ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10"
                            : "border-border/60 bg-muted/20 hover:bg-muted/30"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar size="sm" className="border border-border/60 shrink-0">
                            <AvatarFallback
                              className={cn(
                                "font-mono text-[11px] font-bold",
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
                              <span className="font-mono text-[11px] font-medium text-muted-foreground">
                                {member.studentCode}
                              </span>
                              <span className="text-[11px] text-muted-foreground/60 hidden sm:inline">
                                •
                              </span>
                              <span className="text-[11px] text-muted-foreground/80 truncate hidden sm:inline">
                                {member.email}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <MemberRoleBadge role={member.role} />

                          {!isLeader && (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                className="inline-flex size-7 cursor-pointer items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                                aria-label="Tùy chọn thành viên"
                              >
                                <MoreVerticalIcon className="size-3.5" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-[11px] font-semibold">
                                  Thao tác thành viên
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
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
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
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

      <TeamImportDialog
        key={courseId}
        courseId={courseId}
        courseCode={courseCode}
        isOpen={importOpen}
        onOpenChange={setImportOpen}
      />
    </div>
  );
}
