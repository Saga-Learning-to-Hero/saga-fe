"use client";

import { useEffect } from "react";
import { UsersIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRefreshStudentCourses, useStudentMyTeam } from "../hooks/use-student-courses";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/api-error";

interface StudentMyTeamPanelProps {
  courseId: string | null;
  onClose: () => void;
}

export function StudentMyTeamPanel({ courseId, onClose }: StudentMyTeamPanelProps) {
  const refreshCourses = useRefreshStudentCourses();
  const enabled = Boolean(courseId);
  const { data: team, isLoading, isError, error, refetch, isWaitingForTeam: waitingForTeam } = useStudentMyTeam(courseId ?? "", {
    enabled,
  });

  const errorCode = getApiErrorCode(error);
  const forbidden = errorCode === "STUDENT_COURSE_FORBIDDEN";

  useEffect(() => {
    if (forbidden) {
      void refreshCourses();
    }
  }, [forbidden, refreshCourses]);

  if (!courseId) return null;

  const handleForbiddenRetry = () => {
    void refreshCourses();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 bg-muted/20 p-5">
          <h3 className="text-base font-extrabold">Nhóm của tôi</h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl p-1.5 hover:bg-muted"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-6 w-40 rounded bg-muted" />
              <div className="h-24 rounded-2xl bg-muted/60" />
            </div>
          ) : waitingForTeam ? (
            <Card className="rounded-2xl border border-dashed border-border p-6 text-center">
              <UsersIcon className="mx-auto mb-3 size-8 text-muted-foreground/40" />
              <p className="text-sm font-semibold">Đang chờ giảng viên phân nhóm</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Bạn đã ghi danh ACTIVE nhưng chưa được gán vào nhóm. Đây không phải lỗi hệ thống.
              </p>
            </Card>
          ) : forbidden ? (
            <Card className="rounded-2xl border border-dashed border-destructive/30 p-6 text-center">
              <p className="text-sm font-semibold">Bạn không thuộc lớp học phần này</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Danh sách lớp sẽ được làm mới. Không thử ID của sinh viên khác.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 cursor-pointer text-xs"
                onClick={handleForbiddenRetry}
              >
                Làm mới danh sách lớp
              </Button>
            </Card>
          ) : isError ? (
            <Card className="rounded-2xl border border-dashed border-destructive/30 p-6 text-center">
              <p className="text-sm font-semibold">Không tải được nhóm</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {getApiErrorMessage(error, "Vui lòng thử lại.")}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 cursor-pointer text-xs"
                onClick={() => void refetch()}
              >
                Thử lại
              </Button>
            </Card>
          ) : team ? (
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[11px] text-muted-foreground">TeamNo {team.teamNo}</p>
                <h4 className="text-lg font-bold">{team.teamName}</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={
                      team.myRole === "LEADER"
                        ? "border-primary/25 bg-primary/10 text-primary"
                        : ""
                    }
                  >
                    Vai trò của tôi: {team.myRole === "LEADER" ? "Leader" : "Member"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      team.projectId
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    }
                  >
                    {team.projectId ? "Dự án đã được khởi tạo" : "Đã có nhóm, chưa có dự án"}
                  </Badge>
                </div>
              </div>

              <ul className="space-y-2">
                {team.members.map((member) => (
                  <li
                    key={`${member.studentCode}-${member.role}`}
                    className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2"
                  >
                    <div>
                      <p className="text-xs font-semibold">{member.fullName}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {member.studentCode}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {member.role === "LEADER" ? "Leader" : "Member"}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 justify-end border-t border-border/60 bg-muted/20 p-4">
          <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer text-xs">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
