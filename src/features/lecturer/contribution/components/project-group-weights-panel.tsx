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
      <Card className="rounded-2xl border border-dashed border-border p-5">
        <h2 className="text-sm font-bold">{teamName || "Nhóm đã chọn"}</h2>
        <p className="mt-2 text-sm text-muted-foreground">Nhóm chưa khởi tạo dự án</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Không mở biểu mẫu và không gọi trọng số nhóm khi dự án chưa được khởi tạo.
        </p>
      </Card>
    );
  }

  const missingConfig = isGroupWeightsNotConfigured(groupQuery.error);
  if (groupQuery.isError && !missingConfig) {
    return (
      <CourseQueryError
        title="Không tải được trọng số nhóm"
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
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-bold">{teamName || "Trọng số riêng của nhóm"}</h2>
        {serverMode === "COURSE" ? (
          <Badge variant="outline" className="text-[10px]">
            Đang chuẩn bị — áp dụng khi lớp chuyển sang cấu hình riêng
          </Badge>
        ) : null}
        {missingConfig ? (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/15 text-[10px] text-amber-700 dark:text-amber-300"
          >
            Chưa cấu hình
          </Badge>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        {missingConfig
          ? "Nhóm chưa có cấu hình riêng. Biểu mẫu được điền sẵn trọng số chung của lớp để chỉnh sửa. Chỉ đánh dấu đã cấu hình sau khi lưu thành công."
          : "Chỉnh bốn tiêu chí tổng 100%. Máy chủ nhận tỷ lệ 0–1 sau khi lưu."}
      </p>
      <SliceWeightsForm
        key={`${teamId}-${String(groupQuery.dataUpdatedAt)}-${missingConfig ? "new" : "saved"}`}
        initialWeights={displayWeights}
        initialNote={groupQuery.data?.note ?? ""}
        showNote
        isSaving={updateMutation.isPending}
        saveLabel="Lưu trọng số nhóm"
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
