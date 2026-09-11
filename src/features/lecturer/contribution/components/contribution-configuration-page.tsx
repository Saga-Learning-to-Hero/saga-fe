"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
  LayersIcon,
  SlidersHorizontalIcon,
  UsersIcon,
} from "lucide-react";
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
import { lecturerCourseTeamsPath } from "@/features/lecturer/courses/lib/course-routes";
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
  const [pendingMode, setPendingMode] = useState<ContributionConfigMode | null>(null);
  const [modeInfoOpen, setModeInfoOpen] = useState(false);
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
    [scale, sliceQuery.data]
  );
  const projectTeams = useMemo(
    () => getProjectTeams(teamQuery.data?.teams ?? []),
    [teamQuery.data?.teams]
  );
  const incompleteProjectTeams = useMemo(
    () => getIncompleteProjectTeams(teamQuery.data?.teams ?? []),
    [teamQuery.data?.teams]
  );
  const canApplyProjectGroup =
    canApplyProjectGroupMode(teamQuery.data?.teams ?? []) &&
    serverMode !== "PROJECT_GROUP";
  const pageError = sliceQuery.isError ? sliceQuery.error : undefined;
  const errorTitle = "Không tải được trọng số lớp học phần";

  return (
    <LecturerPageShell
      title="Cấu hình trọng số Slicing Pie"
      description="Thiết lập tỷ lệ trọng số các tiêu chí đóng góp Slicing Pie (Code, Testing, Document, Research) áp dụng chung cho lớp hoặc riêng theo từng nhóm đồ án."
      badges={
        <button
          type="button"
          onClick={() => setModeInfoOpen(true)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary transition-colors hover:bg-primary/20"
        >
          <span>{appliedContributionModeLabel(serverMode)}</span>
          <InfoIcon className="size-3 text-primary/70" />
        </button>
      }
      actions={
        <Link
          href={lecturerCourseTeamsPath(courseId, "teams")}
          prefetch={true}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "h-8.5 text-xs font-bold shadow-xs",
          })}
        >
          Phân nhóm đồ án
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
        className="space-y-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-fit">
            <TabsTrigger value="COURSE" className="gap-2 text-xs font-bold flex-1 sm:flex-none cursor-pointer">
              <LayersIcon className="size-3.5" />
              Áp dụng chung cho lớp
            </TabsTrigger>
            <TabsTrigger value="PROJECT_GROUP" className="gap-2 text-xs font-bold flex-1 sm:flex-none cursor-pointer">
              <UsersIcon className="size-3.5" />
              Áp dụng riêng từng nhóm
            </TabsTrigger>
          </TabsList>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setModeInfoOpen(true)}
            className="h-9 cursor-pointer gap-2 rounded-xl border-border/80 bg-card px-3 text-xs font-bold shadow-xs hover:bg-muted/50 w-full sm:w-fit justify-between sm:justify-start"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontalIcon className="size-3.5 text-primary" />
              <span className="text-muted-foreground">Chế độ hiện tại:</span>
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-extrabold text-primary">
                {serverMode === "COURSE" ? "Chung toàn lớp" : "Riêng theo nhóm"}
              </span>
            </div>
            <InfoIcon className="size-3.5 text-muted-foreground" />
          </Button>
        </div>

        <TabsContent value="COURSE" keepMounted className="space-y-4">
          {serverMode === "PROJECT_GROUP" && (
            <Card className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-800 dark:text-amber-300">
              <div className="flex items-start gap-2.5">
                <AlertTriangleIcon className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <p className="font-bold">Lớp đang vận hành theo trọng số riêng từng nhóm</p>
                  <p className="text-muted-foreground">
                    Bộ trọng số chung dưới đây hiện chỉ mang tính chất tham khảo hoặc làm mẫu mặc định cho các nhóm mới.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <SliceWeightsForm
            key={`course-${String(sliceQuery.dataUpdatedAt)}`}
            initialWeights={displayWeights}
            disabled={serverMode !== "COURSE" || updateWeights.isPending}
            isSaving={updateWeights.isPending}
            saveLabel="Lưu trọng số chung của lớp"
            hideSave={serverMode !== "COURSE"}
            onSave={(weights) => {
              updateWeights.mutate(toApiSliceWeights(weights, scale));
            }}
          />

          {serverMode === "PROJECT_GROUP" && (
            <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">
                    Đổi về chế độ Dùng chung cho cả lớp
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Khi chuyển đổi, tất cả các nhóm sẽ tính điểm theo một bộ trọng số duy nhất này.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 shrink-0 cursor-pointer text-xs font-bold shadow-xs"
                  disabled={updateMode.isPending}
                  onClick={() => setPendingMode("COURSE")}
                >
                  Áp dụng lại cấu hình chung
                </Button>
              </div>
            </Card>
          )}
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
            <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">
                      Kích hoạt chế độ Cấu hình riêng cho từng nhóm
                    </h4>
                    {canApplyProjectGroup ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[11px] text-emerald-600 dark:text-emerald-400"
                      >
                        <CheckCircle2Icon className="mr-1 size-3" />
                        Đủ điều kiện kích hoạt
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-amber-500/30 bg-amber-500/10 font-mono text-[11px] text-amber-600 dark:text-amber-400"
                      >
                        Chưa hoàn tất thiết lập
                      </Badge>
                    )}
                  </div>

                  {!canApplyProjectGroup ? (
                    <div className="text-xs text-muted-foreground space-y-1">
                      {projectTeams.length === 0 ? (
                        <p>Chưa có nhóm nào khởi tạo dự án trên hệ thống.</p>
                      ) : (
                        <div>
                          <p>Còn các nhóm sau đây có dự án nhưng chưa lưu trọng số riêng:</p>
                          <ul className="mt-1 list-disc pl-5 font-mono text-[11px] text-amber-700 dark:text-amber-300">
                            {incompleteProjectTeams.map((team) => (
                              <li key={team.teamId}>
                                Team #{team.teamNo}: {team.teamName || "Chưa đặt tên"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Tất cả các nhóm có dự án đều đã lưu cấu hình trọng số riêng. Bạn có thể kích hoạt ngay bây giờ.
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  className="h-10 shrink-0 cursor-pointer text-xs font-bold shadow-xs"
                  disabled={
                    !canApplyProjectGroup ||
                    updateMode.isPending ||
                    teamQuery.isLoading
                  }
                  onClick={() => setPendingMode("PROJECT_GROUP")}
                >
                  Kích hoạt cấu hình riêng
                </Button>
              </div>
            </Card>
          ) : !teamQuery.isError ? (
            <p className="text-xs text-muted-foreground">
              Lớp đang áp dụng trọng số riêng theo từng nhóm. Bạn có thể chọn từng nhóm ở danh sách để tinh chỉnh.
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
        <AlertDialogContent className="rounded-3xl border border-border/80 p-6 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-extrabold text-foreground">
              {pendingMode === "PROJECT_GROUP"
                ? "Kích hoạt trọng số Slicing Pie riêng cho từng nhóm?"
                : "Chuyển về trọng số Slicing Pie dùng chung cho lớp?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {pendingMode === "PROJECT_GROUP"
                ? "Mỗi nhóm đồ án sẽ áp dụng bộ trọng số riêng theo dự án của mình. Điểm số và tỷ lệ đóng góp của sinh viên sẽ được tính toán lại ngay lập tức."
                : "Mọi nhóm đồ án sẽ đồng loạt quay về áp dụng chung một bộ trọng số của lớp. Điểm số và tỷ lệ đóng góp sẽ được tính toán lại theo chuẩn chung."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              disabled={updateMode.isPending}
              className="rounded-xl text-xs font-bold"
            >
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
                  }
                );
              }}
              className="rounded-xl text-xs font-bold"
            >
              {updateMode.isPending ? "Đang xử lý..." : "Xác nhận chuyển đổi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={modeInfoOpen} onOpenChange={setModeInfoOpen}>
        <DialogContent className="max-w-md rounded-3xl border border-border/80 p-6 shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <SlidersHorizontalIcon className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold text-foreground">
                  Chế độ cấu hình trọng số Slicing Pie
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Cơ chế tính điểm đóng góp và phân bổ trọng số trong lớp học phần
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  Trạng thái đang áp dụng:
                </span>
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/10 font-mono text-xs font-black text-primary"
                >
                  {serverMode === "COURSE" ? "Chung toàn lớp" : "Riêng theo nhóm"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {serverMode === "COURSE"
                  ? "Mọi nhóm trong lớp học phần đều áp dụng chung một bộ trọng số Slicing Pie chuẩn do giảng viên ban hành."
                  : "Mỗi nhóm đồ án được tự do tùy biến bộ trọng số riêng theo đặc thù kỹ thuật và phương pháp của dự án."}
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-foreground">
              <div className="rounded-2xl border border-border/60 p-3.5 space-y-1">
                <p className="font-bold text-primary">1. Chế độ Chung toàn lớp (COURSE)</p>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Áp dụng bộ 4 trọng số (Code, Testing, Document, Research) cố định cho tất cả sinh viên và nhóm trong lớp. Phù hợp cho giai đoạn đầu hoặc môn học có yêu cầu chuẩn hóa cao.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 p-3.5 space-y-1">
                <p className="font-bold text-purple-600 dark:text-purple-400">2. Chế độ Riêng theo nhóm (PROJECT_GROUP)</p>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Mỗi nhóm đồ án có thể tùy chỉnh trọng số riêng (ví dụ: nhóm nặng về kiểm thử, nhóm tập trung R&D). Giúp đánh giá công bằng theo tính chất thực tế của từng đề tài.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              className="w-full rounded-xl text-xs font-bold cursor-pointer"
              onClick={() => setModeInfoOpen(false)}
            >
              Đã hiểu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LecturerPageShell>
  );
}
