"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const emptySubscribe = () => () => { };
import {
  XIcon,
  GitCommitIcon,
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  FileCodeIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  FolderGit2Icon,
  SparklesIcon,
} from "lucide-react";
import { CommitAiIntelligenceModal } from "@/features/ai";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useProjectCommitDetail } from "@/features/student/project/hooks/use-project-commit-detail";
import { formatRelativeTime } from "../lib/commit-mapper";
import { cn } from "@/lib/utils";

interface CommitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string | null;
  gitCommitId?: string | null;
  fallbackShortHash?: string;
  fallbackMessage?: string;
  fallbackCommit?: {
    commitHash?: string;
    commitMessage?: string;
    authorName?: string;
    committedDate?: string;
  };
}

function renderDiffPatch(patch: string | null) {
  if (!patch) {
    return (
      <div className="p-4 text-xs text-muted-foreground italic text-center bg-muted/10">
        Tệp nhị phân hoặc không có nội dung văn bản diff từ GitHub.
      </div>
    );
  }

  const lines = patch.split("\n");
  return (
    <div className="overflow-x-auto text-[11px] font-mono leading-5 p-2 bg-muted/20">
      {lines.map((line, idx) => {
        const isHeader = line.startsWith("@@");
        const isAddition = line.startsWith("+") && !isHeader;
        const isDeletion = line.startsWith("-") && !isHeader;

        return (
          <div
            key={idx}
            className={cn(
              "px-2 py-0.5 rounded-xs whitespace-pre font-mono select-text",
              isHeader && "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 font-bold my-0.5",
              isAddition && "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15",
              isDeletion && "text-rose-700 dark:text-rose-300 bg-rose-500/15",
              !isHeader && !isAddition && !isDeletion && "text-muted-foreground"
            )}
          >
            {line || " "}
          </div>
        );
      })}
    </div>
  );
}

function getFileStatusBadge(status: string) {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "added":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-mono px-1.5 py-0">
          ADDED
        </Badge>
      );
    case "removed":
      return (
        <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[10px] font-mono px-1.5 py-0">
          DELETED
        </Badge>
      );
    case "renamed":
      return (
        <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] font-mono px-1.5 py-0">
          RENAMED
        </Badge>
      );
    default:
      return (
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-mono px-1.5 py-0">
          MODIFIED
        </Badge>
      );
  }
}

export function CommitDetailModal({
  isOpen,
  onClose,
  projectId,
  gitCommitId,
  fallbackShortHash,
  fallbackMessage,
  fallbackCommit,
}: CommitDetailModalProps) {
  const [copiedSha, setCopiedSha] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const {
    data: commit,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useProjectCommitDetail(projectId, gitCommitId, {
    enabled: isOpen && Boolean(projectId && gitCommitId),
  });

  if (!isOpen) return null;
  if (!mounted || typeof document === "undefined") return null;

  const handleCopySha = (shaText: string) => {
    navigator.clipboard.writeText(shaText);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const message =
    commit?.message ||
    fallbackMessage ||
    fallbackCommit?.commitMessage ||
    "Chi tiết commit";
  const messageLines = message.split("\n").filter((l) => l.trim().length > 0);
  const messageTitle = messageLines[0] || "Commit không có tiêu đề";
  const messageBody = messageLines.slice(1).join("\n");

  const sha =
    commit?.sha ||
    fallbackShortHash ||
    fallbackCommit?.commitHash ||
    "";
  const shortSha = sha ? sha.slice(0, 7) : "";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-card border border-border/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-border/60 flex items-center justify-between bg-muted/20 shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
              <GitCommitIcon className="size-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Chi tiết Git Commit
                </span>
                {commit?.repositoryFullName && (
                  <Badge variant="outline" className="text-[10px] font-mono gap-1 px-1.5 py-0">
                    <FolderGit2Icon className="size-3 text-muted-foreground" />
                    <span>{commit.repositoryFullName}</span>
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs font-bold text-foreground">
                  {shortSha || "Đang tải..."}
                </span>

                {sha && (
                  <button
                    type="button"
                    onClick={() => handleCopySha(sha)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-muted transition-colors"
                    title="Sao chép toàn bộ SHA"
                  >
                    {copiedSha ? (
                      <CheckIcon className="size-3 text-emerald-500" />
                    ) : (
                      <CopyIcon className="size-3" />
                    )}
                    <span className="text-[10px]">{copiedSha ? "Đã chép" : "Copy"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {projectId && gitCommitId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAiModal(true)}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-semibold text-primary border-primary/30 bg-primary/5 hover:bg-primary/10"
              >
                <SparklesIcon className="size-3" />
                <span>Đánh giá AI</span>
              </Button>
            )}

            {commit?.htmlUrl && (
              <a
                href={commit.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-semibold rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
              >
                <span>GitHub</span>
                <ExternalLinkIcon className="size-3" />
              </a>
            )}

            <button
              onClick={onClose}
              className="size-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              aria-label="Đóng"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {isLoading && (
            <div className="space-y-4 py-8">
              <div className="flex items-center gap-3 animate-pulse">
                <div className="size-10 rounded-full bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded-md w-2/3" />
                  <div className="h-3 bg-muted rounded-md w-1/3" />
                </div>
              </div>
              <div className="h-28 rounded-2xl bg-muted/40 animate-pulse" />
              <div className="h-44 rounded-2xl bg-muted/40 animate-pulse" />
            </div>
          )}

          {isError && !isLoading && (
            <div className="p-6 rounded-2xl border border-destructive/30 bg-destructive/5 text-center space-y-3 my-4">
              <AlertCircleIcon className="size-8 text-destructive mx-auto" />
              <div>
                <p className="text-sm font-bold text-destructive">
                  Không thể tải chi tiết commit từ GitHub
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {error instanceof Error ? error.message : "Đã xảy ra lỗi khi kết nối API."}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="h-8 text-xs gap-1.5 rounded-xl cursor-pointer"
              >
                <RefreshCwIcon className={cn("size-3.5", isFetching && "animate-spin")} />
                <span>Thử lại</span>
              </Button>
            </div>
          )}

          {!isLoading && !isError && commit && (
            <>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground leading-snug break-words">
                    {messageTitle}
                  </h4>
                  {messageBody && (
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed pt-1 border-t border-border/40">
                      {messageBody}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40 text-xs">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6 border border-border">
                      <AvatarImage
                        src={`https://github.com/${encodeURIComponent(commit.authorLogin || "github")}.png`}
                        alt={commit.authorLogin || "Author"}
                      />
                      <AvatarFallback className="text-[9px] font-bold">
                        {(commit.authorName || commit.authorLogin || "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <span className="font-semibold text-foreground">
                      {commit.authorName || commit.authorLogin}
                    </span>

                    {commit.authorLogin && (
                      <span className="text-muted-foreground font-mono text-[11px]">
                        @{commit.authorLogin}
                      </span>
                    )}

                    <span className="text-muted-foreground/40">•</span>

                    <Tooltip>
                      <TooltipTrigger className="text-muted-foreground font-mono text-[11px]">
                        {formatRelativeTime(commit.committedAt)}
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {new Date(commit.committedAt).toLocaleString("vi-VN")}
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="flex items-center gap-2 font-mono font-bold text-xs shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      +{commit.stats?.additions ?? 0}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                      -{commit.stats?.deletions ?? 0}
                    </span>
                    <span className="text-muted-foreground font-sans font-medium text-[11px]">
                      ({commit.files?.length ?? 0} tệp thay đổi)
                    </span>
                  </div>
                </div>
              </div>

              {commit.filesTruncated && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircleIcon className="size-4 shrink-0" />
                  <span>
                    Commit này có số lượng tệp rất lớn, hệ thống chỉ hiển thị tối đa 300 tệp đầu tiên. Hãy xem toàn bộ trên GitHub.
                  </span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileCodeIcon className="size-3.5" />
                    <span>Nội dung mã nguồn thay đổi ({commit.files?.length ?? 0})</span>
                  </h5>
                </div>

                <div className="space-y-3">
                  {commit.files?.map((file, fIdx) => (
                    <div
                      key={fIdx}
                      className="rounded-2xl border border-border/70 overflow-hidden bg-card shadow-xs"
                    >
                      <div className="px-3.5 py-2.5 bg-muted/40 border-b border-border/60 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {getFileStatusBadge(file.status)}
                          <span className="font-mono text-xs font-bold text-foreground truncate max-w-md sm:max-w-lg">
                            {file.filename}
                          </span>
                          {file.previousFilename && (
                            <span className="text-[10px] font-mono text-muted-foreground truncate">
                              (từ {file.previousFilename})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold shrink-0">
                          <span className="text-emerald-600 dark:text-emerald-400">
                            +{file.additions}
                          </span>
                          <span className="text-muted-foreground/50">/</span>
                          <span className="text-rose-600 dark:text-rose-400">
                            -{file.deletions}
                          </span>
                        </div>
                      </div>

                      {renderDiffPatch(file.patch)}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-3.5 sm:p-4 border-t border-border/60 flex items-center justify-between bg-muted/20 shrink-0">
          <div className="text-[11px] font-mono text-muted-foreground truncate max-w-sm hidden sm:block">
            {commit?.sha && `Mã SHA: ${commit.sha}`}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 px-4 text-xs rounded-xl cursor-pointer ml-auto"
          >
            Đóng
          </Button>
        </div>
      </div>

      {projectId && gitCommitId && (
        <CommitAiIntelligenceModal
          projectId={projectId}
          gitCommitId={gitCommitId}
          commitHash={sha}
          commitMessage={message}
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
        />
      )}
    </div>,
    document.body
  );
}
