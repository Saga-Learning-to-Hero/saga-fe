"use client";

import { Card } from "@/components/ui/card";
import { CourseQueryError } from "@/features/lecturer/courses/components/course-query-error";
import { getApiErrorStatus } from "@/lib/api-error";
import {
  useContributionSliceWeights,
  useProjectGroupWeights,
  useUpdateProjectGroupWeights,
} from "../hooks/use-lecturer-contribution";
import { EMPTY_SLICE_WEIGHTS } from "../types/contribution";
import {
  canEditProjectGroupWeights,
  detectSliceWeightScale,
  toApiSliceWeights,
  toDisplaySliceWeights,
} from "../lib/contribution-utils";
import { SliceWeightsForm } from "./slice-weights-form";

interface ProjectGroupWeightsPanelProps {
  courseId: string;
  teamId: string;
  projectId: string | null;
}

export function ProjectGroupWeightsPanel({
  courseId,
  teamId,
  projectId,
}: ProjectGroupWeightsPanelProps) {
  const hasProject = Boolean(projectId && projectId.trim());
  const sliceQuery = useContributionSliceWeights(courseId);
  const mode = sliceQuery.data?.mode ?? "COURSE";
  const canEdit = canEditProjectGroupWeights(mode, projectId);
  const groupQuery = useProjectGroupWeights(projectId ?? "", { enabled: canEdit });
  const updateMutation = useUpdateProjectGroupWeights({
    courseId,
    projectId: projectId ?? "",
    teamId,
  });

  if (!hasProject) {
    return (
      <Card className="rounded-2xl border border-dashed border-border p-5">
        <h2 className="text-sm font-bold">Trọng số dự án nhóm</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Nhóm chưa có dự án nhóm để thiết lập trọng số.
        </p>
      </Card>
    );
  }

  if (sliceQuery.isError) {
    return <CourseQueryError error={sliceQuery.error} onRetry={() => void sliceQuery.refetch()} />;
  }

  if (sliceQuery.isLoading) {
    return <div className="h-36 animate-pulse rounded-2xl bg-muted/60" />;
  }

  if (mode === "COURSE") {
    const scale = sliceQuery.data ? detectSliceWeightScale(sliceQuery.data) : 100;
    const displayWeights = sliceQuery.data
      ? toDisplaySliceWeights(sliceQuery.data, scale)
      : EMPTY_SLICE_WEIGHTS;

    return (
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-bold">Trọng số dự án nhóm</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Lớp đang dùng bộ trọng số chung. Không lưu trọng số riêng khi mode là dùng chung cho cả lớp.
          </p>
        </div>
        <SliceWeightsForm
          key={`course-${sliceQuery.dataUpdatedAt}`}
          initialWeights={displayWeights}
          disabled
          hideSave
          onSave={() => undefined}
        />
      </div>
    );
  }

  const missingConfig = getApiErrorStatus(groupQuery.error) === 404;
  if (groupQuery.isError && !missingConfig) {
    return <CourseQueryError error={groupQuery.error} onRetry={() => void groupQuery.refetch()} />;
  }

  if (groupQuery.isLoading) {
    return <div className="h-36 animate-pulse rounded-2xl bg-muted/60" />;
  }

  const source = groupQuery.data ?? EMPTY_SLICE_WEIGHTS;
  const scale = detectSliceWeightScale(source);
  const displayWeights = toDisplaySliceWeights(source, scale);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-bold">Trọng số riêng của dự án nhóm</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {missingConfig
            ? "Nhóm chưa có cấu hình riêng. Lưu bốn tiêu chí tổng 100% để tạo bộ trọng số này."
            : "Chỉnh bốn tiêu chí và ghi chú. Máy chủ là nguồn tính đóng góp sau khi lưu."}
        </p>
      </div>
      <SliceWeightsForm
        key={`${projectId}-${groupQuery.dataUpdatedAt}-${missingConfig ? "new" : "edit"}`}
        initialWeights={displayWeights}
        initialNote={groupQuery.data?.note ?? ""}
        showNote
        isSaving={updateMutation.isPending}
        saveLabel="Lưu trọng số dự án nhóm"
        onSave={(weights, extras) => {
          const apiWeights = toApiSliceWeights(weights, scale);
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
