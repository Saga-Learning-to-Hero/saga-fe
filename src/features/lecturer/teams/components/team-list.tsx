"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderKanbanIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLecturerCourseAccess } from "@/features/lecturer/courses/hooks/use-lecturer-courses";
import { CourseQueryError } from "@/features/lecturer/courses/components/course-query-error";
import {
  lecturerCourseTeamEvaluationPath,
  lecturerCourseTeamPath,
  lecturerCoursesPath,
} from "@/features/lecturer/courses/lib/course-routes";
import { useLecturerTeams } from "../hooks/use-lecturer-teams";
import { sortTeamMembers, teamRoleLabel } from "../types/lecturer-team";
import { TeamImportDialog } from "./team-import-dialog";
import { cn } from "@/lib/utils";

interface TeamListProps {
  courseId: string;
  courseCode?: string;
  onForbidden?: () => void;
}

export function TeamList({ courseId, courseCode }: TeamListProps) {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useLecturerTeams(courseId);
  const { isAccessDenied } = useLecturerCourseAccess(isError, error);
  const [importOpen, setImportOpen] = useState(false);

  const sortedTeams = useMemo(
    () =>
      (data?.teams ?? []).map((team) => ({
        ...team,
        members: sortTeamMembers(team.members ?? []),
      })),
    [data?.teams]
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-48 animate-pulse rounded-2xl bg-muted/60" />
        ))}
      </div>
    );
  }

  if (isAccessDenied) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Đang chuyển về danh sách lớp...
      </div>
    );
  }

  if (isError) {
    return <CourseQueryError error={error} onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold">Dự án nhóm</h2>
          <p className="text-xs text-muted-foreground">
            Phân nhóm bằng Excel. Giảng viên không tạo dự án hộ nhóm.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setImportOpen(true)}
          className="h-8 cursor-pointer text-xs font-semibold"
        >
          Phân nhóm bằng Excel
        </Button>
      </div>

      {sortedTeams.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border p-8 text-center">
          <UsersIcon className="mx-auto mb-3 size-8 text-muted-foreground/40" />
          <p className="text-sm font-semibold">Chưa có nhóm trong lớp</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tải mẫu Excel, điền{" "}
            <span className="font-mono">TeamNo</span> / <span className="font-mono">TeamName</span> /{" "}
            <span className="font-mono">TeamRole</span>, preview rồi xác nhận để tạo nhóm.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {sortedTeams.map((team) => (
            <Card key={team.teamId} className="rounded-2xl border border-border p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground">TeamNo {team.teamNo}</p>
                  <h3 className="text-sm font-bold">{team.teamName}</h3>
                </div>
                <Badge
                  variant="outline"
                  className={
                    team.projectId
                      ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                  }
                >
                  {team.projectId ? "Đã có dự án nhóm" : "Chưa có dự án nhóm"}
                </Badge>
              </div>

              {team.projectId ? null : (
                <div className="mb-3 space-y-1 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Nhóm đã được phân công.</p>
                  <p>Chưa có dự án nhóm.</p>
                  <p>Trưởng nhóm cần đăng nhập bằng tài khoản sinh viên để khởi tạo dự án nhóm.</p>
                </div>
              )}

              <ul className="space-y-2">
                {team.members.map((member) => (
                  <li
                    key={member.courseEnrollmentId}
                    className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2"
                  >
                    <div>
                      <p className="text-xs font-semibold">{member.fullName}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {member.studentCode}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        member.role === "LEADER"
                          ? "border-primary/25 bg-primary/10 text-[10px] text-primary"
                          : "text-[10px]"
                      }
                    >
                      {teamRoleLabel(member.role)}
                    </Badge>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <FolderKanbanIcon className="size-3.5" />
                  {team.projectId
                    ? "Dự án nhóm đã được khởi tạo."
                    : "Không tạo dự án từ tài khoản giảng viên."}
                </p>
                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  <Link
                    href={lecturerCourseTeamEvaluationPath(courseId, team.teamId)}
                    prefetch={true}
                    className={cn(buttonVariants({ size: "sm", variant: "outline" }), "h-8 text-xs font-semibold")}
                  >
                    Đánh giá đóng góp
                  </Link>
                  <Link
                    href={lecturerCourseTeamPath(courseId, team.teamId)}
                    prefetch={true}
                    className={cn(
                      buttonVariants({
                        size: "sm",
                        variant: team.projectId ? "default" : "outline",
                      }),
                      "h-8 text-xs font-semibold"
                    )}
                  >
                    {team.projectId ? "Xem dự án nhóm" : "Xem thông tin nhóm"}
                  </Link>
                </div>
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
        onForbidden={() => router.replace(lecturerCoursesPath())}
      />
    </div>
  );
}
