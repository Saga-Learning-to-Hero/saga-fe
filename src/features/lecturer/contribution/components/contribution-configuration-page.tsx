"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CourseQueryError } from "@/features/lecturer/courses/components/course-query-error";
import {
  useLecturerCourse,
  useLecturerCourseAccess,
} from "@/features/lecturer/courses/hooks/use-lecturer-courses";
import {
  lecturerCourseDashboardPath,
  lecturerCourseTeamsPath,
  lecturerCoursesPath,
} from "@/features/lecturer/courses/lib/course-routes";
import {
  useContributionSliceWeights,
  useContributionTeamWeights,
  useUpdateContributionConfigMode,
  useUpdateContributionSliceWeights,
} from "../hooks/use-lecturer-contribution";
import { EMPTY_SLICE_WEIGHTS, type ContributionConfigMode } from "../types/contribution";
import {
  contributionModeLabel,
  detectSliceWeightScale,
  toApiSliceWeights,
  toDisplaySliceWeights,
} from "../lib/contribution-utils";
import { SliceWeightsForm } from "./slice-weights-form";
import { ContributionModeCards } from "./contribution-mode-cards";
import { ContributionTeamWeightsTable } from "./contribution-team-weights-table";

interface ContributionConfigurationPageProps {
  courseId: string;
}

export function ContributionConfigurationPage({ courseId }: ContributionConfigurationPageProps) {
  const courseQuery = useLecturerCourse(courseId);
  const sliceQuery = useContributionSliceWeights(courseId);
  const teamQuery = useContributionTeamWeights(courseId);
  const courseAccess = useLecturerCourseAccess(courseQuery.isError, courseQuery.error);
  const sliceAccess = useLecturerCourseAccess(sliceQuery.isError, sliceQuery.error);
  const teamAccess = useLecturerCourseAccess(teamQuery.isError, teamQuery.error);
  const updateMode = useUpdateContributionConfigMode(courseId);
  const updateWeights = useUpdateContributionSliceWeights(courseId);
  const [pendingMode, setPendingMode] = useState<ContributionConfigMode | null>(null);

  const mode = sliceQuery.data?.mode ?? teamQuery.data?.mode ?? "COURSE";
  const scale = sliceQuery.data ? detectSliceWeightScale(sliceQuery.data) : 100;
  const displayWeights = useMemo(
    () => (sliceQuery.data ? toDisplaySliceWeights(sliceQuery.data, scale) : EMPTY_SLICE_WEIGHTS),
    [scale, sliceQuery.data]
  );
  const incompleteProjectTeams = useMemo(
    () =>
      (teamQuery.data?.teams ?? []).filter(
        (team) => Boolean(team.projectId) && !team.configured
      ),
    [teamQuery.data?.teams]
  );
  const isProjectGroupModeBlocked =
    pendingMode === "PROJECT_GROUP" && incompleteProjectTeams.length > 0;

  if (courseAccess.isAccessDenied || sliceAccess.isAccessDenied || teamAccess.isAccessDenied) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Đang chuyển về danh sách lớp...
      </div>
    );
  }

  if (courseQuery.isError) {
    return <CourseQueryError error={courseQuery.error} onRetry={() => void courseQuery.refetch()} />;
  }

  if (sliceQuery.isError) {
    return <CourseQueryError error={sliceQuery.error} onRetry={() => void sliceQuery.refetch()} />;
  }

  if (teamQuery.isError) {
    return <CourseQueryError error={teamQuery.error} onRetry={() => void teamQuery.refetch()} />;
  }

  if (courseQuery.isLoading || sliceQuery.isLoading || teamQuery.isLoading) {
    return (
      <div className="mx-auto max-w-[1100px] space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link
          href={lecturerCourseDashboardPath(courseId)}
          prefetch={true}
          aria-label="Quay lại tổng quan lớp"
          className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 rounded-lg" })}
        >
          <ArrowLeftIcon className="size-4" />
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href={lecturerCoursesPath()} prefetch={true} className="transition-colors hover:text-foreground">
            Lớp học phần của tôi
          </Link>
          <span>/</span>
          <Link
            href={lecturerCourseDashboardPath(courseId)}
            prefetch={true}
            className="font-mono font-semibold text-foreground"
          >
            {courseQuery.data?.courseCode}
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">Cấu hình trọng số</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
          Trọng số lát cắt đóng góp
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-tight">Cấu hình trọng số</h1>
          <Badge variant="outline">{contributionModeLabel(mode)}</Badge>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Kiểu cấu hình là nguồn quyết định duy nhất. Chỉ một chế độ được chọn tại một thời điểm.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold">1. Kiểu cấu hình</h2>
        <ContributionModeCards
          value={mode}
          disabled={updateMode.isPending}
          onRequestChange={(next) => {
            if (next !== mode) setPendingMode(next);
          }}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold">2. Trọng số dùng chung cho lớp</h2>
        {mode === "PROJECT_GROUP" ? (
          <Card className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
            Lớp đang dùng trọng số riêng theo dự án nhóm. Bộ trọng số cấp lớp chỉ xem, không chỉnh tại đây.
          </Card>
        ) : null}
        <SliceWeightsForm
          key={String(sliceQuery.dataUpdatedAt)}
          initialWeights={displayWeights}
          disabled={mode !== "COURSE" || updateWeights.isPending}
          isSaving={updateWeights.isPending}
          onSave={(weights) => {
            updateWeights.mutate(toApiSliceWeights(weights, scale));
          }}
        />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-bold">3. Trạng thái cấu hình từng nhóm</h2>
            <p className="text-xs text-muted-foreground">
              {mode === "COURSE"
                ? "Khi dùng chung cho lớp, danh sách nhóm chỉ để theo dõi, không sửa trọng số riêng."
                : "Mở chi tiết dự án nhóm khi máy chủ đã có projectId."}
            </p>
          </div>
          <Link
            href={lecturerCourseTeamsPath(courseId)}
            prefetch={true}
            className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs" })}
          >
            Phân nhóm
          </Link>
        </div>
        <ContributionTeamWeightsTable
          courseId={courseId}
          mode={mode}
          teams={teamQuery.data?.teams ?? []}
        />
      </section>

      <AlertDialog open={pendingMode !== null} onOpenChange={(open) => !open && setPendingMode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isProjectGroupModeBlocked
                ? "Chưa thể dùng cấu hình riêng theo từng dự án nhóm"
                : "Đổi kiểu đánh giá của cả lớp?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isProjectGroupModeBlocked
                ? `${incompleteProjectTeams.length} nhóm đã có dự án chưa lưu trọng số riêng. Hãy mở từng dự án nhóm, lưu đủ bốn tiêu chí rồi quay lại đổi kiểu cấu hình.`
                : pendingMode === "PROJECT_GROUP"
                ? "Mọi nhóm sẽ chuyển sang dùng trọng số riêng theo dự án nhóm. Cách tính đóng góp của cả lớp sẽ thay đổi."
                : "Mọi nhóm sẽ dùng lại một bộ trọng số chung của lớp. Cách tính đóng góp của cả lớp sẽ thay đổi."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={updateMode.isPending && !isProjectGroupModeBlocked}
              onClick={() => {
                if (!pendingMode) return;
                if (isProjectGroupModeBlocked) {
                  setPendingMode(null);
                  return;
                }
                updateMode.mutate(
                  { mode: pendingMode },
                  {
                    onSuccess: () => setPendingMode(null),
                  }
                );
              }}
            >
              {isProjectGroupModeBlocked ? "Đã hiểu" : "Xác nhận đổi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
