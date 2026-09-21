"use client";

import { useState, useContext } from "react";
import {
  AlertTriangleIcon,
  CalendarIcon,
  CheckCircle2Icon,
  CheckSquareIcon,
  ClockIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileCodeIcon,
  FileTextIcon,
  FolderGit2Icon,
  GitBranchIcon,
  GitCommitIcon,
  Loader2Icon,
  MousePointerClickIcon,
  PaperclipIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { QueryClient, QueryClientContext, QueryClientProvider } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PipelineCommit, PipelineTask } from "../types/pipeline";
import { CommitDetailModal } from "@/features/student/commits/components/commit-detail-modal";
import { TaskWorkSessionTimelineDialog } from "@/features/student/sprint-progress/components/task-work-session-timeline-dialog";
import {
  useTaskFiles,
  useTaskWebLinks,
  useDownloadTaskFile,
} from "@/features/student/sprint-progress/hooks/use-task-evidence";
import type { TaskFileItem } from "@/features/student/sprint-progress/types/task-evidence";

interface PipelineTaskInspectorProps {
  selectedTask: PipelineTask | null;
  commits: PipelineCommit[];
  isLoadingCommits: boolean;
  errorMessage: string | null;
  onRetry?: () => void;
  onClearSelection: () => void;
  className?: string;
  projectId?: string | null;
}

function statusClass(status: string): string {
  const value = status.toUpperCase();
  if (value.includes("DONE") || value.includes("RESOLVED") || value.includes("CLOSED")) {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }
  if (value.includes("PROGRESS") || value.includes("REVIEW")) {
    return "bg-primary/15 text-primary";
  }
  if (value.includes("BLOCK")) {
    return "bg-destructive/15 text-destructive";
  }
  return "bg-muted text-muted-foreground";
}

function formatCommitDate(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);
  } catch {
    return isoString;
  }
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const INITIAL_COMMITS_LIMIT = 8;

const fallbackQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function PipelineTaskInspectorInternal({
  selectedTask,
  commits,
  isLoadingCommits,
  errorMessage,
  onRetry,
  onClearSelection,
  className,
  projectId,
}: PipelineTaskInspectorProps) {
  const [activeTab, setActiveTab] = useState<"COMMITS" | "DOCUMENTS">("COMMITS");
  const [showAllForTaskId, setShowAllForTaskId] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<PipelineCommit | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  const { data: files = [], isLoading: isFilesLoading } = useTaskFiles(selectedTask?.id);
  const { data: webLinks = [], isLoading: isLinksLoading } = useTaskWebLinks(selectedTask?.id);
  const downloadMutation = useDownloadTaskFile(selectedTask?.id || "");

  const showAllCommits = Boolean(selectedTask && showAllForTaskId === selectedTask.id);

  if (!selectedTask) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/60 p-8 text-center text-xs text-muted-foreground lg:min-h-[260px]",
          className
        )}
      >
        <div className="flex size-11 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/80">
          <MousePointerClickIcon className="size-5" />
        </div>
        <p className="mt-3 font-bold text-foreground">Chưa chọn Task</p>
        <p className="mt-1 max-w-[280px] leading-relaxed">
          Chọn một Task Jira trong danh sách hoặc bảng đối soát để xem các commit và tài liệu minh chứng đã liên kết.
        </p>
      </div>
    );
  }

  const isDone = selectedTask.status.toUpperCase().includes("DONE");
  const hasLinkedCommits = (selectedTask.linkedCommitCount ?? 0) > 0 || commits.length > 0;
  const hasEvidenceDocuments = files.length > 0 || webLinks.length > 0;
  const isDoneAnomaly = isDone && !hasLinkedCommits && !hasEvidenceDocuments;

  const displayedCommits = showAllCommits ? commits : commits.slice(0, INITIAL_COMMITS_LIMIT);
  const hasMoreCommits = commits.length > INITIAL_COMMITS_LIMIT;

  const handleDownloadFile = async (file: TaskFileItem) => {
    try {
      setDownloadingFileId(file.id);
      await downloadMutation.mutateAsync({ fileId: file.id, filename: file.filename });
    } finally {
      setDownloadingFileId(null);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs lg:max-h-[calc(100dvh-8.5rem)]",
        className
      )}
    >
      <div className="shrink-0 space-y-3 border-b border-border/60 p-5 pb-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <CheckSquareIcon className="size-4 text-emerald-500" />
            <span className="font-mono text-xs font-black text-primary">{selectedTask.key}</span>
            <Badge variant="outline" className="px-1.5 py-0 text-[10px] uppercase">
              {selectedTask.issueTypeName}
            </Badge>
            <Badge className={`text-[10px] font-bold ${statusClass(selectedTask.status)}`}>
              {selectedTask.status}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Bỏ chọn Task"
            onClick={onClearSelection}
            className="size-7 shrink-0 cursor-pointer rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-3.5" />
          </Button>
        </div>

        <h4 className="text-sm font-bold leading-snug text-foreground">{selectedTask.title}</h4>

        {selectedTask.parent && (selectedTask.parent.externalKey || selectedTask.parent.externalId) && (
          <div className="flex items-center gap-2 rounded-xl bg-muted/20 px-2.5 py-1 text-[11px] text-muted-foreground">
            <span className="font-medium">Thuộc Task cha:</span>
            <Badge variant="outline" className="font-mono text-[10px] font-bold text-primary">
              {selectedTask.parent.externalKey || selectedTask.parent.externalId}
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-1 gap-1.5 rounded-2xl bg-muted/30 p-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground/70" />
            <span className="truncate">{selectedTask.sprintName || "Chưa vào Sprint"}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <UserIcon className="size-3.5 shrink-0 text-muted-foreground/70" />
            <span className="truncate">{selectedTask.assigneeDisplayName || "Chưa phân công"}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <GitCommitIcon className="size-3.5 shrink-0 text-primary" />
              <span className="font-mono font-bold text-foreground">
                {selectedTask.linkedCommitCount} commit đã liên kết
              </span>
            </div>
            {files.length > 0 && (
              <span className="font-mono text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                {files.length} tệp tài liệu
              </span>
            )}
          </div>
        </div>

        {projectId && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsTimelineOpen(true)}
            className="w-full h-8 text-xs font-semibold gap-1.5 rounded-xl border-primary/25 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40 cursor-pointer transition-colors"
          >
            <ClockIcon className="size-3.5" />
            <span>Dòng thời gian phiên làm việc & commit</span>
          </Button>
        )}

        {isDoneAnomaly && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 text-xs font-semibold text-destructive">
            <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" />
            <span>Task đã hoàn thành nhưng chưa ghi nhận Commit đối soát hoặc Tệp minh chứng.</span>
          </div>
        )}

        {isDone && !hasLinkedCommits && hasEvidenceDocuments && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2Icon className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
            <span>
              Task đã hoàn thành với minh chứng tài liệu đối soát ({files.length} tệp, {webLinks.length} liên kết).
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 min-h-0 flex-col overflow-hidden p-5 pt-3">
        <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 text-xs font-bold shrink-0 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab("COMMITS")}
            className={`flex-1 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 transition-all ${activeTab === "COMMITS"
              ? "bg-card text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <GitCommitIcon className="size-3.5 text-primary" />
            <span>Commit ({commits.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("DOCUMENTS")}
            className={`flex-1 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 transition-all ${activeTab === "DOCUMENTS"
              ? "bg-card text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <FileTextIcon className="size-3.5 text-purple-600 dark:text-purple-400" />
            <span>Tài liệu ({files.length + webLinks.length})</span>
          </button>
        </div>

        {activeTab === "COMMITS" && (
          <>
            {isLoadingCommits ? (
              <div className="space-y-2 shrink-0" aria-label="Đang tải Commit liên kết">
                <div className="h-16 animate-pulse rounded-xl bg-muted/60" />
                <div className="h-16 animate-pulse rounded-xl bg-muted/60" />
              </div>
            ) : errorMessage ? (
              <div className="rounded-2xl border border-dashed border-destructive/30 p-4 text-center text-xs text-muted-foreground shrink-0">
                <p className="font-medium text-destructive">{errorMessage}</p>
                {onRetry && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="mt-2 h-7 cursor-pointer text-xs"
                  >
                    Thử lại
                  </Button>
                )}
              </div>
            ) : commits.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 p-5 text-center text-xs text-muted-foreground shrink-0">
                <p>Chưa có commit được liên kết với task này.</p>
              </div>
            ) : (
              <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1">
                {displayedCommits.map((commit) => (
                  <div
                    key={commit.id}
                    className="group rounded-2xl border border-border/70 bg-card/90 p-3 shadow-2xs transition-colors hover:border-border hover:bg-muted/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="font-mono text-[11px] font-bold text-primary shrink-0">
                          {commit.shortHash}
                        </span>
                        {commit.headRef && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 px-1.5 py-0 text-[10px] font-mono text-muted-foreground truncate max-w-[130px] shrink-0"
                            title={commit.headRef}
                          >
                            <GitBranchIcon className="size-2.5 shrink-0 text-muted-foreground/70" />
                            <span className="truncate">{commit.headRef}</span>
                          </Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCommit(commit)}
                        className="h-6 px-2 text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/25 hover:bg-purple-500/20 hover:border-purple-500/40 cursor-pointer gap-1 shrink-0 rounded-lg shadow-2xs transition-colors"
                        title="Xem chi tiết thay đổi code diff"
                      >
                        <FileCodeIcon className="size-3" />
                        <span>Diff</span>
                      </Button>
                    </div>

                    {commit.repositoryFullName && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground min-w-0">
                        <FolderGit2Icon className="size-2.5 shrink-0 opacity-70" />
                        <span className="truncate font-mono" title={commit.repositoryFullName}>
                          {commit.repositoryFullName}
                        </span>
                      </div>
                    )}

                    <p className="mt-1.5 line-clamp-2 text-xs font-semibold text-foreground leading-snug">
                      {commit.message}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
                      <span className="truncate font-medium max-w-[180px]" title={commit.authorLabel}>
                        {commit.authorLabel}
                      </span>
                      {commit.committedAt && (
                        <span className="text-[10px] font-mono shrink-0 ml-2">
                          {formatCommitDate(commit.committedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {hasMoreCommits && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setShowAllForTaskId((curr) =>
                        curr === selectedTask.id ? null : selectedTask.id
                      )
                    }
                    className="w-full mt-2 text-xs font-semibold text-primary hover:bg-primary/10 cursor-pointer"
                  >
                    {showAllCommits
                      ? "Thu gọn danh sách"
                      : `Xem thêm (còn ${commits.length - INITIAL_COMMITS_LIMIT} commit)`}
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === "DOCUMENTS" && (
          <div className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1">
            {isFilesLoading || isLinksLoading ? (
              <div className="space-y-2 shrink-0">
                <div className="h-14 animate-pulse rounded-xl bg-muted/60" />
                <div className="h-14 animate-pulse rounded-xl bg-muted/60" />
              </div>
            ) : files.length === 0 && webLinks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 p-5 text-center text-xs text-muted-foreground shrink-0">
                <PaperclipIcon className="size-5 mx-auto mb-1.5 opacity-50" />
                <p>Chưa có tệp tài liệu hoặc liên kết minh chứng nào được đính kèm cho task này.</p>
              </div>
            ) : (
              <>
                {files.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block px-1">
                      Tệp đính kèm ({files.length})
                    </span>
                    {files.map((file) => {
                      const isDownloading = downloadMutation.isPending && downloadingFileId === file.id;
                      return (
                        <div
                          key={file.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border/70 bg-card/90 shadow-2xs hover:border-border hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                              <FileTextIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-foreground truncate" title={file.filename}>
                                {file.filename}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {formatFileSize(file.sizeBytes)} · {formatCommitDate(file.createdAt)}
                              </p>
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isDownloading}
                            onClick={() => void handleDownloadFile(file)}
                            className="h-7 px-2.5 text-xs font-semibold gap-1.5 shrink-0 rounded-xl cursor-pointer"
                            title="Tải tệp minh chứng"
                          >
                            {isDownloading ? (
                              <Loader2Icon className="w-3.5 h-3.5 animate-spin text-primary" />
                            ) : (
                              <DownloadIcon className="w-3.5 h-3.5 text-primary" />
                            )}
                            <span>Tải về</span>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {webLinks.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block px-1">
                      Liên kết ngoài ({webLinks.length})
                    </span>
                    {webLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2.5 p-3 rounded-2xl border border-border/70 bg-card/90 shadow-2xs hover:border-border hover:bg-muted/30 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                            <ExternalLinkIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {link.title || link.url}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono truncate">
                              {link.url}
                            </p>
                          </div>
                        </div>
                        <ExternalLinkIcon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {selectedCommit && (
        <CommitDetailModal
          isOpen={Boolean(selectedCommit)}
          onClose={() => setSelectedCommit(null)}
          projectId={projectId}
          gitCommitId={selectedCommit.id}
          fallbackCommit={{
            commitHash: selectedCommit.sha,
            commitMessage: selectedCommit.message,
            authorName: selectedCommit.authorLabel,
            committedDate: selectedCommit.committedAt,
          }}
        />
      )}

      {projectId && selectedTask && (
        <TaskWorkSessionTimelineDialog
          open={isTimelineOpen}
          onOpenChange={setIsTimelineOpen}
          projectId={projectId}
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
          taskKey={selectedTask.key}
        />
      )}
    </div>
  );
}

export function PipelineTaskInspector(props: PipelineTaskInspectorProps) {
  const queryClient = useContext(QueryClientContext);
  if (!queryClient) {
    return (
      <QueryClientProvider client={fallbackQueryClient}>
        <PipelineTaskInspectorInternal {...props} />
      </QueryClientProvider>
    );
  }
  return <PipelineTaskInspectorInternal {...props} />;
}
