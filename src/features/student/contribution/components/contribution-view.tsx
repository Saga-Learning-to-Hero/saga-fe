"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  PieChartIcon,
  ShieldCheckIcon,
  LockIcon,
  KanbanIcon,
  NetworkIcon,
  AlertTriangleIcon,
  FolderGit2Icon,
  RotateCwIcon,
  HelpCircleIcon,
  ArrowRightIcon,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useStudentCourseContext } from "@/features/student/courses/hooks/use-student-course-context";
import { useStudentMyTeam } from "@/features/student/courses/hooks/use-student-courses";
import { useContributionEvaluation } from "@/features/lecturer/contribution/hooks/use-lecturer-contribution";
import {
  appliedContributionModeLabel,
  formatContributionWarning,
} from "@/features/lecturer/contribution/lib/contribution-utils";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { groupWarningsByMember } from "../lib/contribution-view-utils";
import { ContributionKPICards } from "./contribution-kpi-cards";
import { ContributionCharts } from "./contribution-charts";
import { ContributionTable } from "./contribution-table";
import { LeaderBadge } from "@/components/common/leader-badge";
import { cn } from "@/lib/utils";

export function ContributionView() {
  const authUser = useAuthStore((state) => state.user);
  const { courseId, isLoading: isCoursesLoading } = useStudentCourseContext();
  const currentStudentCode = authUser?.studentCode || "";

  const teamQuery = useStudentMyTeam(courseId, { enabled: Boolean(courseId) });
  const myRole = teamQuery.data?.myRole;
  const teamId = teamQuery.data?.teamId;
  const projectId = teamQuery.data?.projectId;
  const teamName = teamQuery.data?.teamName || (teamQuery.data?.teamNo ? `Nhóm ${teamQuery.data.teamNo}` : "Nhóm đồ án");
  const isLeader = myRole === "LEADER";

  const evaluationQuery = useContributionEvaluation(teamId || "", {
    enabled: isLeader && Boolean(teamId),
  });

  const evaluation = evaluationQuery.data;

  const memberWarnings = useMemo(
    () => groupWarningsByMember(evaluation?.members ?? [], courseId),
    [evaluation?.members, courseId]
  );

  if (isCoursesLoading || (courseId && teamQuery.isLoading)) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="max-w-[1600px] mx-auto py-16">
        <Card className="rounded-2xl border border-dashed border-border/80 p-8 text-center shadow-xs">
          <p className="text-sm font-semibold text-foreground">
            Vui lòng chọn một môn học để xem thông tin đóng góp
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Bạn có thể chọn môn học từ thanh điều hướng trên cùng hoặc trang danh sách môn học.
          </p>
          <Link
            href="/student/courses"
            className={cn(buttonVariants({ size: "sm" }), "mt-4 text-xs font-bold shadow-xs")}
          >
            Đến danh sách môn học
          </Link>
        </Card>
      </div>
    );
  }

  if (teamQuery.isWaitingForTeam || (!teamQuery.isLoading && !teamId)) {
    return (
      <div className="max-w-[1600px] mx-auto py-16">
        <Card className="rounded-2xl border border-dashed border-border/80 p-8 text-center shadow-xs">
          <p className="text-sm font-semibold text-foreground">
            Bạn chưa được phân vào nhóm đồ án trong lớp học phần này
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Vui lòng liên hệ Giảng viên phụ trách để được phân nhóm trước khi truy cập bảng điểm đóng góp Slicing Pie.
          </p>
          <Link
            href="/student/dashboard"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 text-xs font-bold shadow-xs")}
          >
            Quay lại Tổng quan
          </Link>
        </Card>
      </div>
    );
  }

  if (!isLeader) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
        <div className="space-y-4 pb-2 border-b border-border/70">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs font-bold text-lg">
                <PieChartIcon className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                    Đóng góp nhóm · Slicing Pie ({teamName})
                  </h1>
                  <Badge className="bg-primary/15 text-primary border-primary/30 font-bold text-xs">
                    SLICING PIE
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mô hình tính toán cổ phần đóng góp theo DEC-092 từ Jira Tasks, Git Commits và Đánh giá đồng đẳng.
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className="bg-muted text-muted-foreground border-border/70 font-mono font-bold text-xs gap-1.5 self-start md:self-auto py-1 px-3"
            >
              VAI TRÒ: THÀNH VIÊN
            </Badge>
          </div>
        </div>

        <Card className="rounded-2xl border border-border/80 bg-card p-8 shadow-xs text-center max-w-2xl mx-auto space-y-4 my-8">
          <div className="size-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-2xs">
            <LockIcon className="size-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-extrabold text-foreground">
              Chỉ Trưởng Nhóm (Leader) Mới Có Quyền Xem Bảng Đánh Giá Đóng Góp
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Theo quy chuẩn phân quyền của hệ thống SAGA, bảng đánh giá tổng hợp tỷ lệ cổ phần Slicing Pie chỉ hiển thị cho Trưởng nhóm và Giảng viên để quản trị công bằng.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Các thành viên đóng góp công sức bằng cách <strong className="text-foreground">nộp minh chứng</strong> (Tài liệu SRS/SDS, liên kết Figma, báo cáo kiểm thử) trực tiếp tại từng đầu việc (Task) trong bảng tiến độ Sprint.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              href={`/student/sprint-progress?courseId=${courseId}`}
              className={cn(buttonVariants({ size: "sm" }), "text-xs font-bold gap-1.5 shadow-xs cursor-pointer")}
            >
              <KanbanIcon className="size-3.5" />
              Đến Bảng Tiến Độ Sprint
            </Link>
            <Link
              href={`/student/graph?courseId=${courseId}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
              )}
            >
              <NetworkIcon className="size-3.5 text-primary" />
              Xem Đồ Thị Traceability
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="max-w-[1600px] mx-auto py-16">
        <Card className="rounded-2xl border border-dashed border-border/80 p-8 text-center shadow-xs">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <FolderGit2Icon className="size-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Nhóm chưa liên kết dự án Jira và GitHub
          </p>
          <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
            Để hệ thống tự động tính toán tỷ lệ đóng góp Slicing Pie, Trưởng nhóm cần thiết lập kết nối Jira và kho lưu trữ GitHub cho nhóm.
          </p>
          <Link
            href={`/student/project-info?courseId=${courseId}`}
            className={cn(buttonVariants({ size: "sm" }), "mt-4 text-xs font-bold shadow-xs")}
          >
            Đến trang Thiết lập Dự án
          </Link>
        </Card>
      </div>
    );
  }

  if (evaluationQuery.isLoading) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (evaluationQuery.isError || !evaluation) {
    return (
      <div className="max-w-[1600px] mx-auto py-16">
        <Card className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center shadow-xs">
          <p className="text-sm font-semibold text-destructive">
            Không thể tải dữ liệu đánh giá đóng góp của nhóm
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Hệ thống tính toán gặp lỗi hoặc nhóm chưa có dữ liệu công việc hợp lệ trên máy chủ.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => void evaluationQuery.refetch()}
            className="mt-4 text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCwIcon className="size-3.5" />
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <div className="space-y-4 pb-2 border-b border-border/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs font-bold text-lg">
              <PieChartIcon className="size-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  Đóng góp nhóm · Slicing Pie ({teamName})
                </h1>
                <div className="flex items-center gap-1.5">
                  <Badge className="bg-primary/15 text-primary border-primary/30 font-bold text-xs">
                    SLICING PIE
                  </Badge>
                  <Tooltip>
                    <TooltipTrigger
                      type="button"
                      className="inline-flex size-5 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Tìm hiểu khái niệm Slice score"
                    >
                      <HelpCircleIcon className="size-3.5" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="start"
                      sideOffset={8}
                      className="flex-col items-start w-84 p-3.5 bg-foreground text-background shadow-2xl rounded-2xl space-y-2.5 z-50 text-left border border-background/10"
                    >
                      <div className="w-full space-y-2.5 text-left">
                        <div className="flex items-center justify-between gap-2 border-b border-background/20 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex size-6 items-center justify-center rounded-lg bg-background/15 text-background shrink-0">
                              <PieChartIcon className="size-3.5" />
                            </div>
                            <span className="text-xs font-bold text-background">
                              Khái niệm Slice Score
                            </span>
                          </div>
                          <span className="rounded-full bg-background/20 px-2 py-0.5 font-mono text-[10px] font-bold text-background">
                            Slicing Pie
                          </span>
                        </div>

                        <p className="text-xs leading-relaxed text-background/90">
                          <strong className="font-bold text-background">Slice score</strong> là đơn vị công sức quy đổi chuẩn hóa trong mô hình Slicing Pie, được tính toán từ các nhiệm vụ Jira, commits mã nguồn và minh chứng nghiệm thu nhân với trọng số của từng tiêu chuẩn.
                        </p>

                        <div className="rounded-xl border border-background/15 bg-background/10 p-2.5 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-background">
                            <span>Nguyên lý tính toán</span>
                            <span className="font-mono font-bold text-emerald-400 dark:text-emerald-300">
                              ∑ (Effort × Trọng số)
                            </span>
                          </div>
                          <p className="text-[10px] leading-tight text-background/70">
                            Dữ liệu đối soát khách quan từ Jira & GitHub, bảo đảm tính minh bạch và công bằng cho toàn nhóm.
                          </p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Badge variant="outline" className="border-primary/25 bg-primary/10 font-mono text-xs font-bold text-primary">
                  {appliedContributionModeLabel(evaluation.configMode ?? "COURSE")}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tỷ lệ được quy đổi từ Jira tasks, Git commits, minh chứng và điều chỉnh đánh giá đồng đẳng.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <LeaderBadge size="md" showEnglish />
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold text-xs gap-1.5 py-1 px-3"
            >
              <ShieldCheckIcon className="size-4" />
              Minh bạch dữ liệu 100%
            </Badge>
          </div>
        </div>
      </div>

      <ContributionKPICards sliceWeights={evaluation.sliceWeights} />

      {memberWarnings.length > 0 && (
        <Card className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
              <AlertTriangleIcon className="size-5" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                    Cảnh báo đối soát minh chứng theo thành viên ({memberWarnings.length})
                  </h4>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-800 dark:text-amber-300">
                    Cần hoàn thiện
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {memberWarnings.map((group) => {
                  return (
                    <div
                      key={group.studentProfileId || group.studentCode}
                      className="rounded-xl border border-amber-500/30 bg-card p-3 shadow-2xs space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-1.5">
                          <span className="text-xs font-bold text-foreground">
                            {group.fullName}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {group.studentCode}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {group.warnings.map((w) => {
                            const parsed = formatContributionWarning(w);
                            return (
                              <div key={w} className="text-xs space-y-0.5">
                                <p className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                                  <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                                  <span>{parsed.title}</span>
                                </p>
                                <p className="text-[11px] text-muted-foreground pl-3 leading-relaxed">
                                  {parsed.description}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-1 border-t border-border/40">
                        <Link
                          href={group.ctaHref}
                          prefetch={true}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                            className: "w-full h-7 text-[11px] font-bold gap-1 text-primary border-primary/30 hover:bg-primary/10 cursor-pointer justify-between",
                          })}
                        >
                          <span>{group.ctaLabel}</span>
                          <ArrowRightIcon className="size-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      <ContributionCharts members={evaluation.members} />

      <ContributionTable
        members={evaluation.members}
        currentStudentCode={currentStudentCode}
        courseId={courseId}
      />
    </div>
  );
}
