"use client";

import { useTaskCommits } from "@/features/student/project/hooks/useProjectSync";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GitCommitIcon,
  RotateCwIcon,
  GitBranchIcon,
  PlusIcon,
  CheckIcon,
  ShieldCheckIcon,
} from "lucide-react";

interface TaskLinkedCommitsListProps {
  projectId?: string;
  taskId?: string;
  onSelectCommit?: (sha: string) => void;
  onSelectAllCommits?: (shas: string[]) => void;
  onContinueToConfirmation?: () => void;
  selectedShas?: string[];
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour12: false,
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function TaskLinkedCommitsList({
  projectId,
  taskId,
  onSelectCommit,
  onSelectAllCommits,
  onContinueToConfirmation,
  selectedShas = [],
}: TaskLinkedCommitsListProps) {
  const {
    data: commits = [],
    isLoading,
    isRefetching,
    refetch,
  } = useTaskCommits(projectId, taskId, {
    enabled: Boolean(projectId && taskId),
  });

  if (!projectId || !taskId) {
    return null;
  }

  const validShas = commits.map((c) => c.sha).filter(Boolean);
  const isAllSelected =
    validShas.length > 0 && validShas.every((sha) => selectedShas.includes(sha));

  return (
    <div className="space-y-2.5 pt-2 border-t border-border/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCommitIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-bold text-foreground">
            Git commits đã tự động liên kết
          </h4>
          <Badge
            variant="outline"
            className="font-mono text-[10px] bg-background border-border"
          >
            {commits.length} commits
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          {onSelectAllCommits && validShas.length > 0 && (
            <Button
              type="button"
              variant={isAllSelected ? "secondary" : "outline"}
              size="sm"
              onClick={() => onSelectAllCommits(validShas)}
              className={`h-7 px-2 text-[11px] font-semibold gap-1 cursor-pointer transition-colors ${isAllSelected
                  ? "bg-violet-600 text-white hover:bg-violet-700 border-0"
                  : "text-violet-600 dark:text-violet-400 border-violet-500/30 hover:bg-violet-500/10"
                }`}
            >
              <ShieldCheckIcon className="w-3 h-3" />
              <span>{isAllSelected ? "Bỏ chọn tất cả" : `Dùng tất cả (${validShas.length})`}</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoading || isRefetching}
            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
          >
            <RotateCwIcon className={`w-3 h-3 ${isRefetching ? "animate-spin text-primary" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 rounded-xl bg-muted/20 border border-border/60 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <RotateCwIcon className="w-4 h-4 animate-spin text-primary" />
          <span>Đang truy xuất danh sách commits đã liên kết...</span>
        </div>
      ) : commits.length === 0 ? (
        <div className="p-4 rounded-xl bg-muted/20 border border-dashed border-border/80 text-center space-y-1 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Chưa có commit nào được tự động liên kết</p>
          <p className="text-[11px]">
            Hệ thống tự động liên kết khi đợt đồng bộ đã nhận được commit có mã Jira (ví dụ: <code className="font-mono text-primary font-bold">feat: [FE][SAGA-xx] ...</code>). Bạn vẫn có thể bổ sung SHA hoặc Pull Request thủ công khi xác nhận đóng góp.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/30">
          {commits.map((commit) => {
            const shortSha = commit.sha ? commit.sha.slice(0, 7) : "commit";
            const isSelected = Boolean(commit.sha && selectedShas.includes(commit.sha));

            return (
              <div
                key={commit.id}
                className={`p-3 rounded-xl bg-card border transition-all space-y-1.5 ${isSelected
                    ? "border-violet-500/50 bg-violet-500/[0.04]"
                    : "border-border/70 hover:border-primary/40 hover:bg-muted/20"
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-md shrink-0">
                      {shortSha}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px] flex items-center gap-1 shrink-0">
                      <GitBranchIcon className="w-3 h-3 text-muted-foreground/70" />
                      {commit.repositoryFullName || "repo"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {formatDateTime(commit.committedAt)}
                    </span>

                    {onSelectCommit && commit.sha && (
                      <Button
                        type="button"
                        variant={isSelected ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => onSelectCommit(commit.sha)}
                        className={`h-6 px-2 text-[10px] font-semibold gap-1 rounded-md cursor-pointer transition-all ${isSelected
                            ? "bg-violet-600 text-white hover:bg-violet-700 border-0"
                            : "text-violet-600 dark:text-violet-400 border-violet-500/30 hover:bg-violet-500/10"
                          }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckIcon className="w-3 h-3" />
                            <span>Đã chọn làm minh chứng</span>
                          </>
                        ) : (
                          <>
                            <PlusIcon className="w-3 h-3" />
                            <span>Dùng làm minh chứng</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-xs font-medium text-foreground line-clamp-2 leading-relaxed">
                  {commit.message}
                </p>

                {commit.authorExternalId && (
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                    <span>Tác giả:</span>
                    <strong className="text-foreground">{commit.authorExternalId}</strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedShas.length > 0 && onContinueToConfirmation && (
        <div className="flex flex-col gap-2 rounded-xl border border-violet-500/25 bg-violet-500/[0.06] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-foreground">
              {selectedShas.length} commit đang chờ xác nhận
            </p>
            <p className="text-[11px] text-muted-foreground">
              Lựa chọn này mới chỉ được lưu tạm trên màn hình, chưa gửi lên máy chủ.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={onContinueToConfirmation}
            className="h-8 shrink-0 rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white hover:bg-violet-700"
          >
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            Tiếp tục xác nhận ({selectedShas.length})
          </Button>
        </div>
      )}
    </div>
  );
}
