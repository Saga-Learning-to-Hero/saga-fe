"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useLecturerCourse } from "@/features/lecturer/courses/hooks/use-lecturer-courses";
import { CourseQueryError } from "@/features/lecturer/courses/components/course-query-error";
import { LecturerPageShell } from "@/features/lecturer/courses/components/lecturer-page-shell";
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
import {
  EMPTY_SLICE_WEIGHTS,
  type ContributionConfigMode,
} from "../types/contribution";
import {
  appliedContributionModeLabel,
  canApplyProjectGroupMode,
  detectSliceWeightScale,
  getIncompleteProjectTeams,
  getProjectTeams,
  toApiSliceWeights,
  toDisplaySliceWeights,
} from "../lib/contribution-utils";
import { SliceWeightsForm } from "./slice-weights-form";
import { ContributionGroupWeightsWorkspace } from "./contribution-group-weights-workspace";

interface ContributionConfigurationPageProps {
  courseId: string;
}

export function ContributionConfigurationPage({
  courseId,
}: ContributionConfigurationPageProps) {
  const courseQuery = useLecturerCourse(courseId);
  const sliceQuery = useContributionSliceWeights(courseId);
  const [uiMode, setUiMode] = useState<ContributionConfigMode | null>(null);
  const [pendingMode, setPendingMode] = useState<ContributionConfigMode | null>(
    null,
  );
  const serverMode = sliceQuery.data?.mode ?? "COURSE";
  const activeTab = uiMode ?? serverMode;
  const teamQuery = useContributionTeamWeights(courseId, {
    enabled: activeTab === "PROJECT_GROUP",
  });
  const updateMode = useUpdateContributionConfigMode(courseId);
  const updateWeights = useUpdateContributionSliceWeights(courseId);

  const scale = sliceQuery.data ? detectSliceWeightScale(sliceQuery.data) : 100;
  const displayWeights = useMemo(
    () =>
      sliceQuery.data
        ? toDisplaySliceWeights(sliceQuery.data, scale)
        : EMPTY_SLICE_WEIGHTS,
    [scale, sliceQuery.data],
  );
  const projectTeams = useMemo(
    () => getProjectTeams(teamQuery.data?.teams ?? []),
    [teamQuery.data?.teams],
  );
  const incompleteProjectTeams = useMemo(
    () => getIncompleteProjectTeams(teamQuery.data?.teams ?? []),
    [teamQuery.data?.teams],
  );
  const canApplyProjectGroup =
    canApplyProjectGroupMode(teamQuery.data?.teams ?? []) &&
    serverMode !== "PROJECT_GROUP";
  const pageError = sliceQuery.isError ? sliceQuery.error : undefined;
  const errorTitle = "Không tải được trọng số lớp học phần";

  return (
    <LecturerPageShell
      breadcrumbItems={[
        { label: "Lớp học phần", href: lecturerCoursesPath() },
        {
          label: courseQuery.data?.courseCode || "Mã lớp",
          href: lecturerCourseDashboardPath(courseId),
        },
        { label: "Cấu hình trọng số" },
      ]}
      title="Cấu hình trọng số"
      description="Chọn vùng cài đặt để xem. Chỉ khi nhấn áp dụng và xác nhận thì lớp mới đổi chế độ trên máy chủ."
      badges={
        <Badge variant="outline">
          {appliedContributionModeLabel(serverMode)}
        </Badge>
      }
      actions={
        <Link
          href={lecturerCourseTeamsPath(courseId, "teams")}
          prefetch={true}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "text-xs",
          })}
        >
          Phân nhóm
        </Link>
      }
      isLoading={
        (!courseQuery.data && courseQuery.isLoading) || sliceQuery.isLoading
      }
      error={pageError}
      errorTitle={errorTitle}
      onRetry={() => {
        void sliceQuery.refetch();
      }}
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (value === "COURSE" || value === "PROJECT_GROUP") {
            setUiMode(value);
          }
        }}
      >
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="COURSE" className="flex-1 sm:flex-none">
            Dùng chung cho lớp
          </TabsTrigger>
          <TabsTrigger value="PROJECT_GROUP" className="flex-1 sm:flex-none">
            Riêng theo từng nhóm
          </TabsTrigger>
        </TabsList>

      <TabsContent value="COURSE" keepMounted className="space-y-4">
        {serverMode === "PROJECT_GROUP" ? (
          <Card className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
            Lớp đang dùng trọng số riêng theo từng nhóm. Bộ trọng số cấp lớp chỉ
            xem tại đây.
          </Card>
        ) : null}
        <SliceWeightsForm
          key={`course-${String(sliceQuery.dataUpdatedAt)}`}
          initialWeights={displayWeights}
          disabled={serverMode !== "COURSE" || updateWeights.isPending}
          isSaving={updateWeights.isPending}
          saveLabel="Lưu trọng số lớp"
          hideSave={serverMode !== "COURSE"}
          onSave={(weights) => {
            updateWeights.mutate(toApiSliceWeights(weights, scale));
          }}
        />
        {serverMode === "PROJECT_GROUP" ? (
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={updateMode.isPending}
              onClick={() => setPendingMode("COURSE")}
            >
              Áp dụng lại cấu hình chung
            </Button>
            <p className="text-xs text-muted-foreground">
              Mọi nhóm sẽ dùng lại một bộ trọng số chung. Cách tính đóng góp của
              cả lớp sẽ thay đổi.
            </p>
          </div>
        ) : null}
      </TabsContent>

      <TabsContent value="PROJECT_GROUP" keepMounted className="space-y-4">
        {teamQuery.isError ? (
          <CourseQueryError
            title="Không tải được trạng thái trọng số nhóm"
            error={teamQuery.error}
            onRetry={() => void teamQuery.refetch()}
          />
        ) : (
          <ContributionGroupWeightsWorkspace
            courseId={courseId}
            serverMode={serverMode}
            teams={teamQuery.data?.teams ?? []}
            fallbackWeights={displayWeights}
            isLoadingTeams={teamQuery.isLoading}
            queryEnabled={activeTab === "PROJECT_GROUP"}
          />
        )}

        {!teamQuery.isError && serverMode !== "PROJECT_GROUP" ? (
          <section className="space-y-2 rounded-2xl border border-border bg-card p-5">
            <Button
              type="button"
              className="cursor-pointer"
              disabled={
                !canApplyProjectGroup ||
                updateMode.isPending ||
                teamQuery.isLoading
              }
              onClick={() => setPendingMode("PROJECT_GROUP")}
            >
              Áp dụng cấu hình riêng
            </Button>
            {!canApplyProjectGroup ? (
              <div className="space-y-1 text-xs text-muted-foreground">
                {projectTeams.length === 0 ? (
                  <p>
                    Chưa có nhóm khởi tạo dự án nên chưa thể áp dụng cấu hình
                    riêng.
                  </p>
                ) : (
                  <>
                    <p>Nút bị khóa vì còn nhóm có dự án chưa lưu trọng số:</p>
                    <ul className="list-disc pl-5">
                      {incompleteProjectTeams.map((team) => (
                        <li key={team.teamId}>
                          {team.teamName || `Nhóm ${team.teamNo}`} (Mã nhóm{" "}
                          {team.teamNo})
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Mọi nhóm đã có dự án đều đã lưu trọng số riêng. Xác nhận để lớp
                chuyển sang cấu hình riêng.
              </p>
            )}
          </section>
        ) : !teamQuery.isError ? (
          <p className="text-xs text-muted-foreground">
            Lớp đang dùng trọng số riêng theo từng nhóm. Chỉnh từng nhóm ở khung
            bên phải.
          </p>
        ) : null}
      </TabsContent>
      </Tabs>

      <AlertDialog
        open={pendingMode !== null}
        onOpenChange={(open) => {
          if (updateMode.isPending && !open) return;
          if (!open) setPendingMode(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingMode === "PROJECT_GROUP"
                ? "Áp dụng cấu hình riêng cho từng nhóm?"
                : "Áp dụng lại cấu hình chung của lớp?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingMode === "PROJECT_GROUP"
                ? "Mọi nhóm sẽ chuyển sang dùng trọng số riêng theo dự án nhóm. Cách tính đóng góp của cả lớp sẽ thay đổi."
                : "Mọi nhóm sẽ dùng lại một bộ trọng số chung của lớp. Cách tính đóng góp của cả lớp sẽ thay đổi."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateMode.isPending}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={updateMode.isPending || !pendingMode}
              onClick={() => {
                if (!pendingMode) return;
                updateMode.mutate(
                  { mode: pendingMode },
                  {
                    onSuccess: () => setPendingMode(null),
                  },
                );
              }}
            >
              {updateMode.isPending ? "Đang áp dụng..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LecturerPageShell>
  );
}
