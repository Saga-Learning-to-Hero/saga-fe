"use client";

import { useMemo, useState } from "react";
import { FolderKanbanIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLecturerTeams } from "../hooks/use-lecturer-teams";
import { sortTeamMembers } from "../types/lecturer-team";
import { TeamImportDialog } from "./team-import-dialog";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/api-error";

interface TeamListProps {
  courseId: string;
  courseCode?: string;
  onForbidden?: () => void;
}

export function TeamList({ courseId, courseCode, onForbidden }: TeamListProps) {
  const { data, isLoading, isError, error, refetch } = useLecturerTeams(courseId);
  const [importOpen, setImportOpen] = useState(false);
  const forbidden = getApiErrorCode(error) === "LECTURER_COURSE_FORBIDDEN";

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

  if (isError) {
    return (
      <Card className="rounded-2xl border border-dashed border-destructive/30 p-8 text-center">
        <p className="text-sm font-semibold">Không tải được danh sách nhóm</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {getApiErrorMessage(error, "Vui lòng thử lại.")}
        </p>
        {forbidden ? (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 cursor-pointer text-xs"
            onClick={onForbidden}
          >
            Quay về danh sách lớp
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 cursor-pointer text-xs"
            onClick={() => void refetch()}
          >
            Thử lại
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold">Nhóm đồ án</h2>
          <p className="text-xs text-muted-foreground">
            Phân nhóm bằng workflow Excel. Giảng viên không tạo dự án hộ nhóm.
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
            Tải mẫu Excel, điền TeamNo / TeamName / TeamRole, preview rồi xác nhận để tạo nhóm.
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
                  {team.projectId ? "Đã có dự án" : "Chưa có dự án"}
                </Badge>
              </div>

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
                      {member.role === "LEADER" ? "Leader" : "Member"}
                    </Badge>
                  </li>
                ))}
              </ul>

              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <FolderKanbanIcon className="size-3.5" />
                Định danh nhóm chỉ dùng để hiển thị. Không tạo dự án từ tài khoản giảng viên.
              </p>
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
        onForbidden={onForbidden}
      />
    </div>
  );
}
