"use client";

import { useState } from "react";
import {
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FolderGit2Icon,
  GitCommitIcon,
  GitMergeIcon,
  RefreshCwIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommitDetailModal } from "@/features/student/commits/components/commit-detail-modal";
import { useTaskCommits } from "@/features/student/project/hooks/useProjectSync";
import type { TaskLinkedCommitItem } from "@/features/student/project/types/student-project";
import { cn } from "@/lib/utils";

interface TaskCommitsTabProps {
  projectId?: string | null;
  taskId: string;
  issueKey?: string;
  linkedCommitCount?: number;
}

const PAGE_SIZE = 20;

function formatVietnamDateTime(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    let cleanStr = dateStr.trim();
    if (cleanStr.includes("T") && !cleanStr.endsWith("Z") && !/[+-]\d{2}(:\d{2})?$/.test(cleanStr)) {
      cleanStr += "Z";
    }
    const d = new Date(cleanStr);
    return Number.isNaN(d.getTime())
      ? dateStr
      : new Intl.DateTimeFormat("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(d);
  } catch {
    return dateStr;
  }
}

export function TaskCommitsTab({
  projectId,
  taskId,
  issueKey,
  linkedCommitCount,
}: TaskCommitsTabProps) {
  // Merge commits only join existing work: hidden by default, like the backend.
  const [includeMerges, setIncludeMerges] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCommit, setSelectedCommit] = useState<TaskLinkedCommitItem | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useTaskCommits(
    projectId,
    taskId,
    {
      page: currentPage,
      size: PAGE_SIZE,
      // Khi includeMerges = true, gửi lên backend includeMerges=true
      // Khi includeMerges = false, không gửi param để backend áp dụng mặc định (bỏ merge)
      includeMerges: includeMerges ? true : undefined,
      enabled: Boolean(projectId && taskId),
    }
  );

  const commits = data?.items || [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-muted/20">
        <div className="flex items-center gap-2">
          <GitCommitIcon className="size-4 text-primary" />
          <span className="text-xs font-bold text-foreground">
            Danh sách Commits liên kết {issueKey ? `[${issueKey}]` : ""}
          </span>
          <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5">
            {total} commit
          </Badge>
          {typeof linkedCommitCount === "number" && linkedCommitCount > 0 && (
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              (Tổng đối soát task: {linkedCommitCount} commit)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle includeMerges */}
          <Button
            type="button"
            variant={includeMerges ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setIncludeMerges((prev) => !prev);
              setCurrentPage(0);
            }}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <GitMergeIcon className="size-3.5" />
            <span>Bao gồm Merge Commits</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="h-8 w-8 p-0 cursor-pointer"
            title="Tải lại danh sách"
          >
            <RefreshCwIcon className={cn("size-3.5", isFetching && "animate-spin text-primary")} />
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-2 py-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-muted/40 animate-pulse border border-border/40"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="py-8 text-center space-y-3 bg-red-500/5 rounded-xl border border-red-500/20 p-6">
          <AlertCircleIcon className="size-8 mx-auto text-red-500" />
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            Không thể tải danh sách commits của nhiệm vụ này.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            className="text-xs"
          >
            Thử lại
          </Button>
        </div>
      ) : commits.length === 0 ? (
        <div className="py-10 text-center space-y-2 border border-dashed border-border/60 rounded-xl bg-muted/10 p-6">
          <GitCommitIcon className="size-8 mx-auto text-muted-foreground/60" />
          <p className="text-xs text-foreground font-semibold">
            Chưa có commit nào được liên kết với nhiệm vụ này.
          </p>
          <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
            {includeMerges
              ? "Hãy thêm mã nhiệm vụ vào Git commit message (ví dụ: 'feat: [SAGA-xx] ...') để hệ thống tự động liên kết."
              : "Không tìm thấy commit thông thường. Hãy thử bật 'Bao gồm Merge Commits' để kiểm tra commit merge."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {commits.map((commit) => {
            const isMerge = Boolean(commit.isMerge || (commit.parentCount && commit.parentCount > 1));
            const shortSha = commit.sha ? commit.sha.slice(0, 7) : "—";

            return (
              <div
                key={commit.id || commit.sha}
                onClick={() => setSelectedCommit(commit)}
                className="group p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/40 hover:border-primary/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                title="Bấm để xem chi tiết commit"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {isMerge ? (
                      <GitMergeIcon className="size-3.5 text-purple-500 shrink-0" />
                    ) : (
                      <GitCommitIcon className="size-3.5 text-primary shrink-0" />
                    )}
                    <span className="font-mono text-xs font-bold text-primary">
                      {shortSha}
                    </span>
                    {isMerge && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4 bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 font-bold"
                      >
                        Merge
                      </Badge>
                    )}
                    {commit.headRef && (
                      <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 h-4">
                        {commit.headRef}
                      </Badge>
                    )}
                    {commit.repositoryFullName && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/80 font-mono">
                        <FolderGit2Icon className="size-3 shrink-0" />
                        <span>{commit.repositoryFullName}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground font-medium group-hover:text-primary transition-colors line-clamp-1">
                    {commit.message}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground self-end sm:self-center font-mono">
                  <span>{formatVietnamDateTime(commit.committedAt)}</span>
                </div>
              </div>
            );
          })}

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs">
              <span className="text-muted-foreground">
                Trang {currentPage + 1} / {totalPages} (Tổng số {total} commits)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 0 || isFetching}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="h-7 text-xs gap-1 cursor-pointer"
                >
                  <ChevronLeftIcon className="size-3.5" />
                  <span>Trước</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages - 1 || isFetching}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="h-7 text-xs gap-1 cursor-pointer"
                >
                  <span>Sau</span>
                  <ChevronRightIcon className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal chi tiết commit */}
      {selectedCommit && (
        <CommitDetailModal
          isOpen={Boolean(selectedCommit)}
          onClose={() => setSelectedCommit(null)}
          projectId={projectId}
          gitCommitId={selectedCommit.id}
          fallbackShortHash={selectedCommit.sha ? selectedCommit.sha.slice(0, 7) : undefined}
          fallbackMessage={selectedCommit.message}
          fallbackCommit={{
            commitHash: selectedCommit.sha,
            commitMessage: selectedCommit.message,
            authorName: selectedCommit.authorStudentId || undefined,
            committedDate: selectedCommit.committedAt,
          }}
        />
      )}
    </div>
  );
}
