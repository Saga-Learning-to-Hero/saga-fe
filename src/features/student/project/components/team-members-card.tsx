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
    <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
      <CardHeader className="border-b border-border/60 p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <UsersIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Thành viên nhóm
                </CardTitle>
                {team?.teamName ? (
                  <Badge
                    variant="outline"
                    className="border-primary/25 bg-primary/10 font-mono text-[10px] font-bold text-primary"
                  >
                    Nhóm {team.teamNo} · {team.teamName}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25 font-semibold"
                  >
                    Chưa có nhóm
                  </Badge>
                )}
              </div>
              <CardDescription className="text-[11px] text-muted-foreground">
                Thành viên do giảng viên phân nhóm
                {course?.semesterCode ? ` · học kỳ ${course.semesterCode}` : ""}
                {team?.myRole ? ` · vai trò của tôi: ${team.myRole === "LEADER" ? "Leader" : "Member"}` : ""}
              </CardDescription>
            </div>
          </div>

          <Badge variant="secondary" className="w-fit font-mono text-[11px]">
            Sĩ số: {members.length} sinh viên
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 p-4 sm:p-5">
        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-xl bg-muted/60" />
            ))}
          </div>
        ) : waitingForTeam ? (
          <div className="rounded-xl border border-dashed border-border p-5 text-center">
            <UsersIcon className="mx-auto mb-2 size-6 text-muted-foreground/40" />
            <p className="text-xs font-semibold">Đang chờ giảng viên phân nhóm</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Bạn đã ghi danh ACTIVE nhưng chưa được gán nhóm.
            </p>
          </div>
        ) : forbidden ? (
          <div className="rounded-xl border border-dashed border-destructive/30 p-5 text-center">
            <p className="text-xs font-semibold">Bạn không thuộc lớp học phần này</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Danh sách lớp sẽ được làm mới.
            </p>
            {onForbidden && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2.5 cursor-pointer text-xs h-7 px-2.5"
                onClick={onForbidden}
              >
                Làm mới danh sách lớp
              </Button>
            )}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-dashed border-destructive/30 p-5 text-center">
            <p className="text-xs font-semibold">Không tải được thông tin nhóm</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {getApiErrorMessage(error, "Vui lòng thử lại.")}
            </p>
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2.5 cursor-pointer text-xs h-7 px-2.5"
                onClick={onRetry}
              >
                Thử lại
              </Button>
            )}
          </div>
        ) : !hasTeam || members.length === 0 ? (
          <div className="py-6 text-center space-y-1 border border-dashed border-border/70 rounded-xl bg-muted/20 px-3">
            <p className="text-xs font-bold text-foreground">Chưa có nhóm</p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Bạn chưa được xếp nhóm trong lớp học này. Vui lòng liên hệ Giảng viên để được phân nhóm.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => {
              const isLeader = member.role === "LEADER";
              const initials = member.fullName.slice(0, 2).toUpperCase();

              return (
                <div
                  key={`${member.studentCode}-${member.role}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 p-2.5 transition-all hover:bg-muted/40"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar className="h-8 w-8 shrink-0 border border-background shadow-2xs">
                      <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-bold text-foreground">
                          {member.fullName}
                        </span>
                        {isLeader && (
                          <CrownIcon className="h-3 w-3 shrink-0 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
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
                        ? "bg-primary/10 text-[10px] font-semibold text-primary border-primary/25 shrink-0"
                        : "border-border bg-muted text-[10px] font-medium text-muted-foreground shrink-0"
                    }
                  >
                    {isLeader ? "Leader" : "Member"}
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
