"use client";

import { useTaskCommits } from "@/features/student/project/hooks/useProjectSync";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitCommitIcon, RotateCwIcon, GitBranchIcon } from "lucide-react";

interface TaskLinkedCommitsListProps {
  projectId?: string;
  taskId?: string;
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

export function TaskLinkedCommitsList({ projectId, taskId }: TaskLinkedCommitsListProps) {
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

  return (
    <div className="space-y-2.5 pt-2 border-t border-border/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCommitIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-bold text-foreground">
            Git Commits Đối Soát (Task Links)
          </h4>
          <Badge
            variant="outline"
            className="font-mono text-[10px] bg-background border-border"
          >
            {commits.length} commits
          </Badge>
        </div>

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

      {isLoading ? (
        <div className="p-4 rounded-xl bg-muted/20 border border-border/60 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <RotateCwIcon className="w-4 h-4 animate-spin text-primary" />
          <span>Đang truy xuất danh sách commits đã liên kết...</span>
        </div>
      ) : commits.length === 0 ? (
        <div className="p-4 rounded-xl bg-muted/20 border border-dashed border-border/80 text-center space-y-1 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Chưa có Git Commit nào liên kết</p>
          <p className="text-[11px]">
            Hệ thống tự động liên kết commit khi message chứa mã Task Jira (ví dụ: <code className="font-mono text-primary font-bold">feat: [FE][SAGA-xx] ...</code>).
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/30">
          {commits.map((commit) => {
            const shortSha = commit.sha ? commit.sha.slice(0, 7) : "commit";
            return (
              <div
                key={commit.id}
                className="p-3 rounded-xl bg-card border border-border/70 hover:border-primary/40 hover:bg-muted/20 transition-all space-y-1.5"
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

                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                    {formatDateTime(commit.committedAt)}
                  </span>
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
    </div>
  );
}
