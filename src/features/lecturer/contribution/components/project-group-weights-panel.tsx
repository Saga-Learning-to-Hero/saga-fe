"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CourseQueryError } from "@/features/lecturer/courses/components/course-query-error";
import { useProjectGroupWeights, useUpdateProjectGroupWeights } from "../hooks/use-lecturer-contribution";
import type { ContributionConfigMode, ContributionSliceWeightValues } from "../types/contribution";
import {
  canEditProjectGroupWeights,
  detectSliceWeightScale,
  isGroupWeightsNotConfigured,
  toApiSliceWeights,
  toDisplaySliceWeights,
} from "../lib/contribution-utils";
import { SliceWeightsForm } from "./slice-weights-form";

interface ProjectGroupWeightsPanelProps {
  courseId: string;
  teamId: string;
  teamName?: string;
  projectId: string | null;
  serverMode: ContributionConfigMode;
  fallbackWeights: ContributionSliceWeightValues;
  queryEnabled?: boolean;
}

export function ProjectGroupWeightsPanel({
  courseId,
  teamId,
  teamName,
  projectId,
  serverMode,
  fallbackWeights,
  queryEnabled = true,
}: ProjectGroupWeightsPanelProps) {
  const hasProject = canEditProjectGroupWeights(projectId);
  const groupQuery = useProjectGroupWeights(projectId ?? "", {
    enabled: queryEnabled && hasProject,
  });
  const updateMutation = useUpdateProjectGroupWeights({
    courseId,
    projectId: projectId ?? "",
    teamId,
  });

  if (!hasProject) {
    return (
      <Card className="rounded-2xl border border-dashed border-border/80 p-8 text-center shadow-xs">
        <h3 className="text-base font-bold text-foreground">{teamName || "Nhóm đã chọn"}</h3>
        <p className="mt-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
          Nhóm chưa khởi tạo dự án
        </p>
        <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
          Trưởng nhóm cần khởi tạo dự án trên hệ thống trước khi giảng viên có thể thiết lập trọng số riêng.
        </p>
      </Card>
    );
  }

  const missingConfig = isGroupWeightsNotConfigured(groupQuery.error);
  if (groupQuery.isError && !missingConfig) {
    return (
      <CourseQueryError
        title="Không tải được trọng số của nhóm"
        error={groupQuery.error}
        onRetry={() => void groupQuery.refetch()}
      />
    );
  }

  if (queryEnabled && groupQuery.isLoading) {
    return <div className="h-72 animate-pulse rounded-2xl bg-muted/60" />;
  }

  const source = groupQuery.data ?? fallbackWeights;
  const scale = groupQuery.data ? detectSliceWeightScale(groupQuery.data) : 100;
  const displayWeights = groupQuery.data
    ? toDisplaySliceWeights(source, scale)
    : { ...fallbackWeights };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-extrabold text-foreground">
            {teamName || "Cấu hình trọng số Slicing Pie của nhóm"}
          </h3>
          {missingConfig ? (
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/15 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300"
            >
              Chưa lưu cấu hình riêng
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/15 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
            >
              Đã tùy biến riêng
            </Badge>
          )}
        </div>

        {serverMode === "COURSE" && (
          <Badge variant="secondary" className="text-[11px]">
            Đang soạn trước — có hiệu lực khi chuyển sang chế độ riêng
          </Badge>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {missingConfig
          ? "Nhóm hiện đang kế thừa trọng số chung của lớp. Bạn có thể điều chỉnh các thanh trượt bên dưới và bấm Lưu để lưu cấu hình riêng cho nhóm này."
          : "Điều chỉnh tỷ lệ % của 4 tiêu chí SE sao cho tổng bằng 100% rồi bấm Lưu."}
      </p>

      <SliceWeightsForm
        key={`${teamId}-${String(groupQuery.dataUpdatedAt)}-${missingConfig ? "new" : "saved"}`}
        initialWeights={displayWeights}
        initialNote={groupQuery.data?.note ?? ""}
        showNote
        isSaving={updateMutation.isPending}
        saveLabel="Lưu trọng số Slicing Pie nhóm"
        onSave={(weights, extras) => {
          const apiWeights = toApiSliceWeights(weights, 1);
          updateMutation.mutate({
            teamId,
            ...apiWeights,
            note: extras?.note ?? "",
          });
        }}
      />
    </div>
  );
}
