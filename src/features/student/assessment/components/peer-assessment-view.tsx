"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarIcon,
  InfoIcon,
  LockIcon,
  SendIcon,
  UsersIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircle2Icon,
  ShieldCheckIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { CustomSelect } from "@/components/common/custom-select";
import { Label } from "@/components/ui/label";
import {
  useRefreshStudentCourses,
  useStudentMyTeam,
} from "@/features/student/courses/hooks/use-student-courses";
import { useStudentCourseContext } from "@/features/student/courses/hooks/use-student-course-context";
import {
  sortStudentTeamMembers,
} from "@/features/student/courses/types/student-course";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { PeerAssessmentHeader } from "./peer-assessment-header";
import { getPeerAssessmentState } from "../lib/peer-assessment-state";

export function PeerAssessmentView() {
  const refreshCourses = useRefreshStudentCourses();
  const {
    course: effectiveCourse,
    courseId,
    isLoading: isCoursesLoading,
    isInvalidCourse,
  } = useStudentCourseContext();
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

  const assessmentState = getPeerAssessmentState({
    courseId,
    isCoursesLoading,
    isInvalidCourse,
    isTeamLoading,
    isWaitingForTeam,
    forbidden,
    isTeamError,
  });

  if (assessmentState === "LOADING_COURSE") {
    return (
      <div className="mx-auto max-w-[1600px] space-y-4 pb-12">
        <div className="h-16 animate-pulse rounded-3xl bg-muted/60" />
        <div className="h-48 animate-pulse rounded-3xl bg-muted/60" />
      </div>
    );
  }

  if (assessmentState === "NO_COURSE") {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
        <PeerAssessmentHeader />
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-8 text-center shadow-2xs backdrop-blur-xs">
          <p className="text-sm font-bold text-foreground">Chưa chọn lớp học phần</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Hãy chọn lớp đang học trước khi xem đánh giá chéo theo Sprint.
          </p>
          <Link
            href="/student/courses"
            prefetch={true}
            className={cn(buttonVariants({ size: "sm" }), "mt-4 text-xs rounded-xl font-semibold")}
          >
            Chọn lớp học phần
          </Link>
        </div>
      </div>
    );
  }

  if (assessmentState === "INVALID_COURSE") {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
        <PeerAssessmentHeader />
        <div className="rounded-3xl border border-dashed border-amber-500/40 bg-amber-500/5 p-8 text-center shadow-2xs">
          <p className="text-sm font-bold text-foreground">Lớp học phần không còn khả dụng</p>
          <p className="mt-1 text-xs text-muted-foreground">Hãy chọn lại lớp học phần trước khi xem đánh giá chéo.</p>
          <Link href="/student/courses" prefetch={true} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-4 text-xs rounded-xl font-semibold")}>
            Chọn lớp học phần
          </Link>
        </div>
      </div>
    );
  }

  if (assessmentState === "LOADING_TEAM") {
    return (
      <div className="mx-auto max-w-[1600px] space-y-4 pb-12">
        <PeerAssessmentHeader courseCode={effectiveCourse?.code} />
        <div className="h-20 animate-pulse rounded-3xl bg-muted/60" />
        <div className="h-56 animate-pulse rounded-3xl bg-muted/60" />
      </div>
    );
  }

  if (assessmentState === "WAITING_FOR_TEAM") {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
        <PeerAssessmentHeader courseCode={effectiveCourse?.code} />
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-8 text-center shadow-2xs backdrop-blur-xs">
          <UsersIcon className="mx-auto mb-3 size-8 text-muted-foreground/40" />
          <p className="text-sm font-bold text-foreground">Đang chờ giảng viên phân nhóm</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Bạn đã ghi danh nhưng chưa được gán vào nhóm. Đây không phải lỗi hệ thống.
          </p>
        </div>
      </div>
    );
  }

  if (assessmentState === "FORBIDDEN") {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
        <PeerAssessmentHeader />
        <div className="rounded-3xl border border-dashed border-destructive/30 bg-destructive/5 p-8 text-center shadow-2xs">
          <p className="text-sm font-bold text-destructive">Bạn không thuộc lớp học phần này</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Danh sách lớp sẽ được làm mới. Không thử ID của sinh viên khác.
          </p>
          <Link
            href="/student/courses"
            prefetch={true}
            className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-4 text-xs rounded-xl font-semibold")}
          >
            Về danh sách lớp
          </Link>
        </div>
      </div>
    );
  }

  if (assessmentState === "TEAM_ERROR") {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
        <PeerAssessmentHeader courseCode={effectiveCourse?.code} />
        <div className="rounded-3xl border border-dashed border-destructive/30 bg-destructive/5 p-8 text-center shadow-2xs">
          <p className="text-sm font-bold text-destructive">Không tải được nhóm</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {getApiErrorMessage(teamError, "Vui lòng thử lại.")}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-4 cursor-pointer text-xs rounded-xl font-semibold"
            onClick={() => void refetchTeam()}
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 pb-12">
      <PeerAssessmentHeader
        teamName={team?.teamName}
        courseCode={effectiveCourse?.code}
      />

      <div className="rounded-3xl border border-primary/25 bg-primary/5 p-4.5 backdrop-blur-xs shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <SparklesIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                  Quy trình đánh giá đồng đẳng (Peer Review Flow)
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/10">
                  Đang chờ API
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Backend chưa công bố API mở biểu mẫu, nộp điểm và quản lý thời hạn đánh giá chéo. Danh sách nhóm bên dưới chỉ để tham khảo; chưa có điểm nào được ghi nhận từ màn hình này.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/80 bg-background/80 text-[11px] font-mono text-muted-foreground shrink-0">
            <ClockIcon className="w-3 h-3 text-primary" />
            <span>Chưa sẵn sàng</span>
          </div>
        </div>
      </div>

      <ol className="grid gap-3.5 sm:grid-cols-3">
        <li className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs p-4 shadow-2xs hover:border-primary/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">
                01
              </span>
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/70">
                Bước khởi đầu
              </Badge>
            </div>
            <h2 className="mt-2.5 text-sm font-bold text-foreground">Chọn Sprint Đã Hoàn Thành</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Chọn đợt nghiệm thu Sprint đã đóng để mở danh sách thành viên cần đánh giá.
            </p>
            <div className="mt-3.5 space-y-1.5">
              <Label htmlFor="peer-sprint" className="text-[11px] font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarIcon className="size-3 text-primary" />
                  Sprint Nghiệm Thu
                </span>
              </Label>
              <CustomSelect
                id="peer-sprint"
                value=""
                onChange={() => undefined}
                disabled
                placeholder="Chưa có API Sprint đánh giá chéo"
                options={[]}
              />
            </div>
          </div>
          <p className="mt-3 text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <CheckCircle2Icon className="w-3 h-3 text-muted-foreground/60" />
            Yêu cầu trạng thái: CLOSED
          </p>
        </li>

        <li className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs p-4 shadow-2xs hover:border-primary/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="w-6 h-6 rounded-lg bg-muted text-muted-foreground font-mono text-xs font-bold flex items-center justify-center">
                02
              </span>
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/70">
                Chấm điểm chéo
              </Badge>
            </div>
            <h2 className="mt-2.5 text-sm font-bold text-foreground">Xác Định Thành Viên Đánh Giá</h2>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Biểu mẫu thang điểm 10 theo tiêu chí năng lực và thái độ làm việc sẽ tự động mở tương ứng từng thành viên nhóm.
            </p>
          </div>
          <div className="mt-4 p-2.5 rounded-xl border border-dashed border-border bg-muted/20 text-center">
            <p className="text-[11px] text-muted-foreground font-medium">Biểu mẫu sẽ khả dụng khi backend công bố API đánh giá chéo</p>
          </div>
        </li>

        <li className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs p-4 shadow-2xs hover:border-primary/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="w-6 h-6 rounded-lg bg-muted text-muted-foreground font-mono text-xs font-bold flex items-center justify-center">
                03
              </span>
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/70">
                Nộp kết quả
              </Badge>
            </div>
            <h2 className="mt-2.5 text-sm font-bold text-foreground">Gửi Đánh Giá Chéo</h2>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Chức năng gửi đánh giá sẽ chỉ mở khi có contract backend về quyền riêng tư, thời hạn và dữ liệu chấm điểm.
            </p>
          </div>
          <div className="mt-4 space-y-2">
            <Button
              type="button"
              size="sm"
              className="w-full h-8.5 rounded-xl text-xs font-bold cursor-not-allowed opacity-60 bg-primary/50 text-primary-foreground gap-1.5"
              disabled
            >
              <SendIcon className="size-3.5" />
              <span>Chưa thể gửi đánh giá</span>
            </Button>
            <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1 font-mono">
              <ShieldCheckIcon className="w-3 h-3 text-emerald-500" />
              Dữ liệu được lưu vết bảo mật
            </p>
          </div>
        </li>
      </ol>

      <div className="rounded-3xl border border-border/70 bg-card/60 backdrop-blur-xs p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UsersIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-foreground">{team?.teamName || "Nhóm của tôi"}</h2>
                <Badge variant="secondary" className="font-mono text-[10px] font-bold border border-border/60">
                  Mã nhóm: {team?.teamNo ?? "—"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Tổng số {teamMembers.length} thành viên trong nhóm đồ án môn học
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-[11px] font-semibold self-start sm:self-auto",
              team?.myRole === "LEADER"
                ? "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                : "border-border/80 text-muted-foreground"
            )}
          >
            {team?.myRole === "LEADER" ? "Trưởng nhóm" : "Thành viên"}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <InfoIcon className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Danh sách thành viên chỉ dùng để tham khảo. SAGA chưa mở API tạo hoặc gửi đánh giá chéo cho sinh viên.</span>
        </div>

        {teamMembers.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground rounded-2xl border border-dashed border-border">
            Nhóm chưa có dữ liệu thành viên.
          </div>
        ) : (
          <div className="grid gap-2">
            {teamMembers.map((member) => (
              <div
                key={`${member.studentCode}-${member.role}`}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 px-3.5 py-2.5 hover:bg-muted/40 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-background border border-border/80 overflow-hidden relative shrink-0 shadow-2xs">
                    <Image
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.fullName || member.studentCode)}`}
                      alt={member.fullName}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {member.fullName}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">{member.studentCode}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold",
                      member.role === "LEADER"
                        ? "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                        : "border-border/70 text-muted-foreground"
                    )}
                  >
                    {member.role === "LEADER" ? "Trưởng nhóm" : "Thành viên"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-border/70 bg-muted/60 text-[10px] font-medium text-muted-foreground gap-1"
                  >
                    <LockIcon className="size-2.5" />
                    <span>Chưa mở chấm điểm</span>
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
