"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  CrownIcon,
  FileSpreadsheetIcon,
  FolderKanbanIcon,
  RefreshCwIcon,
  UsersIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CourseQueryError } from "@/features/lecturer/courses/components/course-query-error";
import {
  lecturerCourseGradesPath,
  lecturerCourseTeamPath,
} from "@/features/lecturer/courses/lib/course-routes";
import { formatQueryUpdatedAt } from "@/features/lecturer/courses/lib/format-query-updated-at";
import { useLecturerTeams } from "../hooks/use-lecturer-teams";
import { sortTeamMembers, teamRoleLabel } from "../types/lecturer-team";
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
  const { data, isLoading, isError, error, refetch, dataUpdatedAt, isFetching } = useLecturerTeams(courseId);
  const [importOpen, setImportOpen] = useState(false);
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="h-20 animate-pulse rounded-2xl bg-muted/60" />
          <div className="h-20 animate-pulse rounded-2xl bg-muted/60" />
          <div className="h-20 animate-pulse rounded-2xl bg-muted/60" />
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-2xl bg-muted/60" />
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <CardContent className="flex items-center gap-4 p-0">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderKanbanIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Tổng số nhóm</p>
              <p className="font-mono text-2xl font-black text-foreground">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <CardContent className="flex items-center gap-4 p-0">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2Icon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Đã khởi tạo dự án</p>
              <p className="font-mono text-2xl font-black text-foreground">{stats.withProject}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <CardContent className="flex items-center gap-4 p-0">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <UsersIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Sinh viên đã vào nhóm</p>
              <p className="font-mono text-2xl font-black text-foreground">{stats.totalMembers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-extrabold text-foreground">Danh sách nhóm đồ án</h2>
          <p className="text-xs text-muted-foreground">
            Quản lý thành viên từng nhóm và theo dõi tiến độ khởi tạo dự án thực tế.
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
          <Button
            size="sm"
            onClick={() => setImportOpen(true)}
            className="mt-4 cursor-pointer gap-2 text-xs font-bold"
          >
            <FileSpreadsheetIcon className="size-3.5" />
            Bắt đầu phân nhóm
          </Button>
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
                      <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 font-mono text-xs font-extrabold text-primary">
                        Team #{team.teamNo}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {team.members.length} thành viên
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-foreground">
                      {team.teamName}
                    </h3>
                  </div>
                  {team.projectId ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/10 font-mono text-xs text-emerald-600 dark:text-emerald-400"
                    >
                      <CheckCircle2Icon className="mr-1 size-3" />
                      Đã có dự án
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 font-mono text-xs text-amber-600 dark:text-amber-400"
                    >
                      <ClockIcon className="mr-1 size-3" />
                      Chờ khởi tạo
                    </Badge>
                  )}
                </div>

                {!team.projectId && (
                  <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-300">
                    <p className="font-bold">Nhóm chưa khởi tạo dự án</p>
                    <p className="mt-0.5 text-[11px] text-amber-700/90 dark:text-amber-300/80">
                      Trưởng nhóm cần đăng nhập vào phân hệ Sinh viên để khởi tạo Workspace Jira & kết nối GitHub.
                    </p>
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
                            ? "border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10"
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
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-2 border-t border-border/60 pt-4">
                <Link
                  href={lecturerCourseGradesPath(courseId, team.teamId)}
                  prefetch={true}
                  className={cn(
                    buttonVariants({ size: "sm", variant: "ghost" }),
                    "h-8.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  )}
                >
                  Bảng điểm nhóm
                </Link>

                <Link
                  href={lecturerCourseTeamPath(courseId, team.teamId)}
                  prefetch={true}
                  className={cn(
                    buttonVariants({
                      size: "sm",
                      variant: team.projectId ? "default" : "outline",
                    }),
                    "h-8.5 gap-1.5 text-xs font-bold shadow-xs"
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
