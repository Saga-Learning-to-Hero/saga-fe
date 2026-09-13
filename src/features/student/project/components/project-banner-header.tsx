"use client";

import { useMemo, useEffect, useRef } from "react";
import {
  FolderKanbanIcon,
  SparklesIcon,
  GraduationCapIcon,
  CheckCircle2Icon,
  UserCheck2Icon,
  RefreshCwIcon,
} from "lucide-react";
import type { StudentProjectDetails } from "../types/student-project";
import type { StudentCourse } from "@/features/student/courses/types/student-course";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useSyncProject, useProjectSyncStatus } from "../hooks/useProjectSync";
import { formatVietnamDateTime } from "@/lib/utils";

interface ProjectBannerHeaderProps {
  project: StudentProjectDetails;
  course?: StudentCourse | null;
  isLeader?: boolean;
  hasTeam?: boolean;
  isRoleLoading?: boolean;
}

export function ProjectBannerHeader({
  project,
  course,
  isLeader,
  hasTeam,
  isRoleLoading = false,
}: ProjectBannerHeaderProps) {
  const syncMutation = useSyncProject();

  const categoryLabel = project.projectType?.name || project.category;
  const projectId = project.projectId || project.id || "";

  const { data: syncStatuses = [] } = useProjectSyncStatus(projectId, {
    enabled: Boolean(projectId && projectId.trim()),
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasActive = data?.some((item) => {
        const s = (item.status || "").toUpperCase();
        return s === "IN_PROGRESS" || s === "RUNNING" || s === "SYNCING";
      });
      return hasActive ? 3000 : false;
    },
  });

  const hasActiveJob = useMemo(() => {
    return syncStatuses.some((item) => {
      const s = (item.status || "").toUpperCase();
      return s === "IN_PROGRESS" || s === "RUNNING" || s === "SYNCING";
    });
  }, [syncStatuses]);

  const hasFailure = useMemo(() => {
    return syncStatuses.some((item) => (item.status || "").toUpperCase() === "FAILED");
  }, [syncStatuses]);

  const prevActiveRef = useRef(hasActiveJob);
  useEffect(() => {
    if (prevActiveRef.current && !hasActiveJob) {
      if (hasFailure) {
        toast.error("Quá trình đồng bộ dữ liệu gặp lỗi từ phía Jira hoặc GitHub.");
      } else {
        toast.success("Đồng bộ Jira & GitHub hoàn tất! Dữ liệu đã được cập nhật mới nhất.");
      }
    }
    prevActiveRef.current = hasActiveJob;
  }, [hasActiveJob, hasFailure]);

  const latestCompletedAt = useMemo(() => {
    if (!syncStatuses.length) return null;
    const completedTimes = syncStatuses
      .map((s) => s.completedAt)
      .filter((t): t is string => Boolean(t))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return completedTimes[0] || null;
  }, [syncStatuses]);

  const jiraStatus = useMemo(() => {
    return syncStatuses.find((s) => (s.provider || "").toUpperCase() === "JIRA");
  }, [syncStatuses]);

  const githubStatus = useMemo(() => {
    return syncStatuses.find((s) => (s.provider || "").toUpperCase() === "GITHUB");
  }, [syncStatuses]);

  const handleSync = async () => {
    if (!projectId) {
      toast.error("Không tìm thấy mã dự án để kích hoạt đồng bộ.");
      return;
    }
    try {
      const res = await syncMutation.mutateAsync(projectId);
      toast.info("Đã gửi yêu cầu đồng bộ. Máy chủ đang tải dữ liệu trong nền...", {
        description: `Trạng thái hàng đợi: Jira [${res.jira}], GitHub [${res.github}]. Nút sẽ tự dừng xoay khi xong.`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể kích hoạt đồng bộ dự án.");
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-border/80 shadow-md"
      style={{
        background:
          "linear-gradient(135deg, oklch(from var(--saga-primary) calc(l + 0.05) c h), oklch(from var(--saga-accent) calc(l - 0.05) c h))",
      }}
    >
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-15"
        style={{ background: "oklch(1 0 0 / 20%)" }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10"
        style={{ background: "oklch(1 0 0 / 20%)" }}
      />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            {categoryLabel && (
              <Badge className="bg-white/20 hover:bg-white/25 text-white border-0 text-[11px] px-2.5 py-0.5 font-semibold backdrop-blur-md">
                <FolderKanbanIcon className="w-3 h-3 mr-1" />
                {categoryLabel}
              </Badge>
            )}

            {course?.semesterCode && (
              <Badge className="bg-emerald-500/20 text-white border-0 text-[11px] font-mono">
                Học kỳ: {course.semesterCode}
              </Badge>
            )}

            {course?.adminClassCode && (
              <Badge className="bg-blue-500/20 text-white border-0 text-[11px] font-mono">
                Lớp: {course.adminClassCode}
              </Badge>
            )}

            {project.name ? (
              <Badge className="bg-emerald-400 text-emerald-950 font-bold border-0 text-[11px] gap-1">
                <CheckCircle2Icon className="w-3 h-3" /> Đang phát triển
              </Badge>
            ) : (
              <Badge className="bg-amber-400 text-amber-950 font-bold border-0 text-[11px] gap-1">
                Chưa có dự án
              </Badge>
            )}

            {isRoleLoading ? (
              <Badge className="bg-white/20 text-white font-medium border-0 text-[11px] px-2 py-0.5 animate-pulse backdrop-blur-md">
                <UserCheck2Icon className="w-3 h-3 mr-1" />
                Đang xác thực vai trò...
              </Badge>
            ) : hasTeam === false ? (
              <Badge className="bg-amber-400/30 text-amber-100 font-bold border border-amber-300/40 text-[11px] px-2 py-0.5 backdrop-blur-md">
                Chưa có nhóm
              </Badge>
            ) : isLeader !== undefined ? (
              <Badge
                className={
                  isLeader
                    ? "bg-amber-300 text-amber-950 font-bold border-0 text-[11px] px-2 py-0.5 shadow-xs"
                    : "bg-white/20 text-white font-medium border-0 text-[11px] px-2 py-0.5 backdrop-blur-md"
                }
              >
                {isLeader ? "Trưởng nhóm (Leader)" : "Thành viên (Member)"}
              </Badge>
            ) : null}
          </div>

          <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
            {project.name || "Chưa khởi tạo dự án nhóm"}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/90">
            {project.groupName && (
              <span className="flex items-center gap-1 font-bold">
                <SparklesIcon className="w-3 h-3 text-amber-300" />
                {project.groupName}
              </span>
            )}
            {course?.lecturer?.fullName && (
              <span className="flex items-center gap-1">
                <GraduationCapIcon className="w-3 h-3 opacity-80" />
                GVHD: <strong className="text-white">{course.lecturer?.fullName}</strong> ({course.lecturer?.email})
              </span>
            )}
            {project.createdBy?.fullName && (
              <span className="flex items-center gap-1 opacity-90">
                <UserCheck2Icon className="w-3 h-3 text-sky-200" />
                Người tạo: <strong className="text-white">{project.createdBy.fullName}</strong>
              </span>
            )}
          </div>
        </div>

        {projectId && (
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            {isLeader && (
              <Button
                type="button"
                size="sm"
                onClick={() => void handleSync()}
                disabled={syncMutation.isPending || hasActiveJob}
                className="h-9 px-3.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/20 text-xs font-semibold backdrop-blur-md gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <RefreshCwIcon
                  className={`w-3.5 h-3.5 ${syncMutation.isPending || hasActiveJob ? "animate-spin text-amber-300" : ""
                    }`}
                />
                <span>
                  {syncMutation.isPending
                    ? "Đang gửi yêu cầu..."
                    : hasActiveJob
                      ? "Đang đồng bộ..."
                      : "Đồng bộ Jira & GitHub"}
                </span>
              </Button>
            )}

            <div className="text-[11px] text-white/95 bg-black/25 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-2 font-mono backdrop-blur-sm shadow-2xs">
              {hasActiveJob ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-sans text-amber-200 font-medium">Đang đồng bộ dữ liệu...</span>
                </>
              ) : latestCompletedAt ? (
                <>
                  <span
                    className={`w-2 h-2 rounded-full ${hasFailure ? "bg-red-400" : "bg-emerald-400"
                      }`}
                  />
                  <span className="font-sans text-white/80">Lần cuối:</span>
                  <span className="text-white font-medium">
                    {formatVietnamDateTime(latestCompletedAt)}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-white/40" />
                  <span className="font-sans text-white/70">Chưa có lượt đồng bộ</span>
                </>
              )}
            </div>

            {(jiraStatus?.completedAt || githubStatus?.completedAt) && !hasActiveJob && (
              <div className="text-[10px] text-white/75 flex items-center gap-2 font-mono">
                {jiraStatus?.completedAt && (
                  <span>
                    Jira:{" "}
                    <span className="text-white font-medium">
                      {formatVietnamDateTime(jiraStatus.completedAt).split(" ")[0]}
                    </span>
                  </span>
                )}
                {jiraStatus?.completedAt && githubStatus?.completedAt && <span>•</span>}
                {githubStatus?.completedAt && (
                  <span>
                    GitHub:{" "}
                    <span className="text-white font-medium">
                      {formatVietnamDateTime(githubStatus.completedAt).split(" ")[0]}
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
