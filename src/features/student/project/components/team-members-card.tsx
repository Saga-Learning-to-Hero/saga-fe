"use client";

import { CrownIcon, UsersIcon } from "lucide-react";
import type { StudentCourse, StudentTeamResponse } from "@/features/student/courses/types/student-course";
import { sortStudentTeamMembers } from "@/features/student/courses/types/student-course";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/api-error";

interface TeamMembersCardProps {
  course?: StudentCourse | null;
  team?: StudentTeamResponse;
  isLoading?: boolean;
  error?: unknown;
  isError?: boolean;
  onRetry?: () => void;
  onForbidden?: () => void;
}

export function TeamMembersCard({
  course,
  team,
  isLoading,
  error,
  isError,
  onRetry,
  onForbidden,
}: TeamMembersCardProps) {
  const waitingForTeam = isError && getApiErrorCode(error) === "TEAM_NOT_FOUND";
  const forbidden = getApiErrorCode(error) === "STUDENT_COURSE_FORBIDDEN";
  const members = sortStudentTeamMembers(team?.members ?? []);
  const hasTeam = Boolean(
    team?.teamId ||
    team?.teamName ||
    members.length > 0
  );

  return (
    <Card className="rounded-2xl border border-border/80 bg-card shadow-xs">
      <CardHeader className="border-b border-border/60 p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <UsersIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base font-bold text-foreground">
                  Thông tin nhóm và thành viên
                </CardTitle>
                {team?.teamName ? (
                  <Badge
                    variant="outline"
                    className="border-primary/25 bg-primary/10 font-mono text-xs font-bold text-primary"
                  >
                    Nhóm {team.teamNo} · {team.teamName}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25 font-semibold"
                  >
                    Chưa có nhóm
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Thành viên do giảng viên phân nhóm
                {course?.semesterCode ? ` · học kỳ ${course.semesterCode}` : ""}
                {team?.myRole ? ` · vai trò của tôi: ${team.myRole === "LEADER" ? "Leader" : "Member"}` : ""}
              </CardDescription>
            </div>
          </div>

          <Badge variant="secondary" className="w-fit font-mono text-xs">
            Sĩ số: {members.length} sinh viên
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-muted/60" />
            ))}
          </div>
        ) : waitingForTeam ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center">
            <UsersIcon className="mx-auto mb-3 size-8 text-muted-foreground/40" />
            <p className="text-sm font-semibold">Đang chờ giảng viên phân nhóm</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Bạn đã ghi danh ACTIVE nhưng chưa được gán nhóm. Đây không phải lỗi hệ thống.
            </p>
          </div>
        ) : forbidden ? (
          <div className="rounded-2xl border border-dashed border-destructive/30 p-6 text-center">
            <p className="text-sm font-semibold">Bạn không thuộc lớp học phần này</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Danh sách lớp sẽ được làm mới. Không thử ID của sinh viên khác.
            </p>
            {onForbidden && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3 cursor-pointer text-xs"
                onClick={onForbidden}
              >
                Làm mới danh sách lớp
              </Button>
            )}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-dashed border-destructive/30 p-6 text-center">
            <p className="text-sm font-semibold">Không tải được thông tin nhóm</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {getApiErrorMessage(error, "Vui lòng thử lại.")}
            </p>
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3 cursor-pointer text-xs"
                onClick={onRetry}
              >
                Thử lại
              </Button>
            )}
          </div>
        ) : !hasTeam || members.length === 0 ? (
          <div className="py-8 text-center space-y-1.5 border border-dashed border-border/70 rounded-2xl bg-muted/20 px-4">
            <p className="text-xs font-bold text-foreground">Chưa có nhóm</p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Bạn hiện tại chưa được xếp nhóm trong lớp học này. Vui lòng liên hệ Giảng viên bộ môn để được phân nhóm và chỉ định vai trò.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => {
              const isLeader = member.role === "LEADER";
              const initials = member.fullName.slice(0, 2).toUpperCase();

              return (
                <div
                  key={`${member.studentCode}-${member.role}`}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-border/70 bg-card/60 p-3.5 transition-all hover:bg-muted/40 md:flex-row md:items-center"
                >
                  <div className="flex min-w-[240px] items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0 border border-background shadow-xs">
                      <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-bold text-foreground">
                          {member.fullName}
                        </span>
                        {isLeader && (
                          <CrownIcon className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                        <span>MSSV: {member.studentCode}</span>
                        <span>•</span>
                        <span className="truncate">{member.studentCode.toLowerCase()}@fpt.edu.vn</span>
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={
                      isLeader
                        ? "bg-primary/10 text-[10px] font-semibold text-primary border-primary/25"
                        : "border-border bg-muted text-[10px] font-medium text-muted-foreground"
                    }
                  >
                    {isLeader ? "Trưởng nhóm (Leader)" : "Thành viên (Member)"}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
