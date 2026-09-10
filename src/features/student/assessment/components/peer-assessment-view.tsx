"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CalendarIcon,
  InfoIcon,
  LockIcon,
  SendIcon,
  UsersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomSelect } from "@/components/common/custom-select";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import {
  useRefreshStudentCourses,
  useStudentCourses,
  useStudentMyTeam,
} from "@/features/student/courses/hooks/use-student-courses";
import {
  mapStudentCourseResponse,
  sortStudentTeamMembers,
} from "@/features/student/courses/types/student-course";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { PeerAssessmentHeader } from "./peer-assessment-header";

export function PeerAssessmentView() {
  const { user, selectedCourse, setSelectedCourse } = useAuthStore();
  const refreshCourses = useRefreshStudentCourses();
  const { data: apiCourses = [], isLoading: isCoursesLoading } = useStudentCourses({
    enabled: user?.role === "STUDENT" && !selectedCourse,
  });

  const effectiveCourse = useMemo(() => {
    if (selectedCourse) return selectedCourse;
    if (apiCourses.length > 0) return mapStudentCourseResponse(apiCourses[0]);
    return null;
  }, [selectedCourse, apiCourses]);

  useEffect(() => {
    if (!selectedCourse && effectiveCourse) setSelectedCourse(effectiveCourse);
  }, [selectedCourse, effectiveCourse, setSelectedCourse]);

  const courseId = effectiveCourse?.courseId || effectiveCourse?.id || "";
  const {
    data: team,
    isLoading: isTeamLoading,
    isError: isTeamError,
    error: teamError,
    refetch: refetchTeam,
    isWaitingForTeam,
  } = useStudentMyTeam(courseId, { enabled: Boolean(courseId) });

  const forbidden = getApiErrorCode(teamError) === "STUDENT_COURSE_FORBIDDEN";
  useEffect(() => {
    if (forbidden) void refreshCourses();
  }, [forbidden, refreshCourses]);

  const teamMembers = useMemo(
    () => sortStudentTeamMembers(team?.members ?? []),
    [team?.members],
  );

  if (!courseId && isCoursesLoading) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-4 pb-12">
        <div className="h-16 animate-pulse rounded-2xl bg-muted/60" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
        <PeerAssessmentHeader />
        <Card className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-semibold">Chưa chọn lớp học phần</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Hãy chọn lớp đang học trước khi xem đánh giá chéo theo Sprint.
          </p>
          <Link
            href="/student/courses"
            prefetch={true}
            className={cn(buttonVariants({ size: "sm" }), "mt-4 text-xs")}
          >
            Chọn lớp học phần
          </Link>
        </Card>
      </div>
    );
  }

  if (isTeamLoading) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-4 pb-12">
        <PeerAssessmentHeader courseCode={effectiveCourse?.code} />
        <div className="h-24 animate-pulse rounded-2xl bg-muted/60" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    );
  }

  if (isWaitingForTeam) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
        <PeerAssessmentHeader courseCode={effectiveCourse?.code} />
        <Card className="rounded-2xl border border-dashed border-border p-8 text-center">
          <UsersIcon className="mx-auto mb-3 size-8 text-muted-foreground/40" />
          <p className="text-sm font-semibold">Đang chờ giảng viên phân nhóm</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Bạn đã ghi danh nhưng chưa được gán vào nhóm. Đây không phải lỗi hệ thống.
          </p>
        </Card>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
        <PeerAssessmentHeader />
        <Card className="rounded-2xl border border-dashed border-destructive/30 p-8 text-center">
          <p className="text-sm font-semibold">Bạn không thuộc lớp học phần này</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Danh sách lớp sẽ được làm mới. Không thử ID của sinh viên khác.
          </p>
          <Link
            href="/student/courses"
            prefetch={true}
            className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-4 text-xs")}
          >
            Về danh sách lớp
          </Link>
        </Card>
      </div>
    );
  }

  if (isTeamError) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
        <PeerAssessmentHeader courseCode={effectiveCourse?.code} />
        <Card className="rounded-2xl border border-dashed border-destructive/30 p-8 text-center">
          <p className="text-sm font-semibold">Không tải được nhóm</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {getApiErrorMessage(teamError, "Vui lòng thử lại.")}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-4 cursor-pointer text-xs"
            onClick={() => void refetchTeam()}
          >
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
      <PeerAssessmentHeader
        teamName={team?.teamName}
        courseCode={effectiveCourse?.code}
      />

      <Card className="rounded-2xl border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <InfoIcon className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300" />
          <div>
            <p className="text-sm font-semibold">Tính năng đang chờ kết nối dữ liệu đánh giá chéo</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Máy chủ chưa cung cấp dữ liệu Sprint và chức năng gửi đánh giá chéo. Trang này giữ quy trình ba bước
              để tích hợp sau, không lưu đánh giá mẫu và không gửi dữ liệu giả.
            </p>
          </div>
        </div>
      </Card>

      <ol className="grid gap-4 lg:grid-cols-3">
        <li className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Bước 1</p>
          <h2 className="mt-1 text-sm font-bold">Chọn Sprint đã hoàn thành</h2>
          <div className="mt-3 space-y-2">
            <Label htmlFor="peer-sprint" className="text-xs">
              <span className="inline-flex items-center gap-1">
                <CalendarIcon className="size-3.5 text-primary" />
                Sprint
              </span>
            </Label>
            <CustomSelect
              id="peer-sprint"
              value=""
              onChange={() => undefined}
              disabled
              placeholder="Chưa có dữ liệu Sprint từ máy chủ"
              options={[]}
            />
          </div>
        </li>
        <li className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Bước 2</p>
          <h2 className="mt-1 text-sm font-bold">Xác định thành viên cần đánh giá</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Biểu mẫu chấm điểm sẽ mở khi máy chủ có Sprint hoàn thành và xác định được người cần đánh giá.
          </p>
        </li>
        <li className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Bước 3</p>
          <h2 className="mt-1 text-sm font-bold">Gửi đánh giá</h2>
          <Button type="button" size="sm" className="mt-3 cursor-not-allowed text-xs" disabled>
            <SendIcon className="mr-2 size-3.5" />
            Gửi đánh giá
          </Button>
        </li>
      </ol>

      <Card className="rounded-2xl border border-border p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">{team?.teamName || "Nhóm của tôi"}</h2>
            <p className="font-mono text-[11px] text-muted-foreground">Mã nhóm {team?.teamNo ?? "—"}</p>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {team?.myRole === "LEADER" ? "Trưởng nhóm" : "Thành viên"}
          </Badge>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Danh sách này chỉ dùng để tham khảo. Người cần đánh giá sẽ được xác định khi máy chủ cung cấp đủ dữ liệu.
        </p>
        {teamMembers.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nhóm chưa có dữ liệu thành viên.
          </p>
        ) : (
          <ul className="space-y-2">
            {teamMembers.map((member) => (
              <li
                key={`${member.studentCode}-${member.role}`}
                className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2"
              >
                <div>
                  <p className="text-xs font-semibold">{member.fullName}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{member.studentCode}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {member.role === "LEADER" ? "Trưởng nhóm" : "Thành viên"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/15 text-[10px] text-amber-700 dark:text-amber-300"
                  >
                    <LockIcon className="mr-1 size-3" />
                    Chưa mở chấm điểm
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
