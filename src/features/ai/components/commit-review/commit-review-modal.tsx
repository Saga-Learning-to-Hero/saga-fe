"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  XIcon,
  SparklesIcon,
  Loader2Icon,
  RefreshCwIcon,
  GitMergeIcon,
  KeyRoundIcon,
  MessageSquareTextIcon,
  FileCodeIcon,
  ListChecksIcon,
  CopyIcon,
  CheckIcon,
  Link2Icon,
  Trash2Icon,
  InfoIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { showErrorToast, showSuccessToast } from "@/lib/api-error";
import { useProjectTasks } from "@/features/student/project/hooks/useProjectSync";
import {
  useCommitReview,
  useLinkCommitTask,
  useRequestCommitReview,
  useUnlinkCommitTask,
} from "../../hooks/use-commit-review";
import type { CommitAiReviewDetail, CommitAiReviewFinding, CommitAiReviewLocation } from "../../types";
import { COMMIT_REVIEW_TONE_CLASS, commitReviewTone } from "../../lib/commit-review-style";
import { CommitReviewBadge } from "./commit-review-badge";

const emptySubscribe = () => () => {};

interface CommitReviewModalProps {
  projectId: string;
  commitId: string;
  shortSha?: string;
  isOpen: boolean;
  onClose: () => void;
}

function DiffSnippet({ snippet }: { snippet: string }) {
  return (
    <div className="overflow-x-auto text-[11px] font-mono leading-5 p-2 rounded-lg bg-muted/30 border border-border/50 max-h-64 overflow-y-auto">
      {snippet.split("\n").map((line, idx) => {
        const header = line.startsWith("@@");
        const added = line.startsWith("+") && !header;
        const removed = line.startsWith("-") && !header;
        return (
          <div
            key={idx}
            className={cn(
              "px-1.5 whitespace-pre rounded-xs",
              header && "text-indigo-600 dark:text-indigo-400 font-bold",
              added && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
              removed && "bg-rose-500/15 text-rose-700 dark:text-rose-300",
              !header && !added && !removed && "text-muted-foreground"
            )}
          >
            {line || " "}
          </div>
        );
      })}
    </div>
  );
}

function LocationBlock({ location }: { location: CommitAiReviewLocation }) {
  return (
    <div className="space-y-1">
      {location.label && (
        <div className="text-[11px] font-mono font-semibold text-muted-foreground">{location.label}</div>
      )}
      {location.snippet &&
        (location.kind === "DIFF_HUNK" ? (
          <DiffSnippet snippet={location.snippet} />
        ) : (
          <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/30 border border-border/50 rounded-lg p-2">
            {location.snippet}
          </p>
        ))}
    </div>
  );
}

function FindingList({ findings, empty }: { findings: CommitAiReviewFinding[]; empty: string }) {
  if (!findings.length) {
    return <p className="text-xs text-muted-foreground italic">{empty}</p>;
  }
  return (
    <ol className="space-y-3">
      {findings.map((finding, idx) => (
        <li key={`${finding.code}-${idx}`} className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
          <div className="flex items-start gap-2">
            <span className="shrink-0 mt-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
              {finding.code}
            </span>
            <p className="text-xs text-foreground leading-relaxed">{finding.message}</p>
          </div>
          {finding.locations.map((location, i) => (
            <LocationBlock key={i} location={location} />
          ))}
        </li>
      ))}
    </ol>
  );
}

function Section({
  icon: Icon,
  title,
  verdict,
  children,
}: {
  icon: typeof SparklesIcon;
  title: string;
  verdict?: string | null;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/70 p-4 space-y-3 bg-card">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold flex items-center gap-2">
          <Icon className="size-4 text-primary" />
          {title}
        </h4>
        {verdict && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-muted text-foreground border border-border">
            {verdict}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

export function CommitReviewModal({ projectId, commitId, shortSha, isOpen, onClose }: CommitReviewModalProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [copied, setCopied] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const reviewQuery = useCommitReview(projectId, commitId, { enabled: isOpen });
  const review = reviewQuery.data;
  const requestReview = useRequestCommitReview(projectId, commitId);
  const linkTask = useLinkCommitTask(projectId, commitId);
  const unlinkTask = useUnlinkCommitTask(projectId, commitId);
  const tasksQuery = useProjectTasks(projectId, { enabled: isOpen && Boolean(review?.canManageLinks) });

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const handleRequest = () =>
    requestReview.mutate(undefined, {
      onError: (error) => showErrorToast("Không gửi được yêu cầu đánh giá AI.", error),
    });

  const handleLink = () => {
    if (!selectedTaskId) return;
    linkTask.mutate(selectedTaskId, {
      onSuccess: () => {
        setSelectedTaskId("");
        showSuccessToast("Đã gắn commit vào task. Bấm \"Đánh giá lại\" để AI kiểm tra commit có khớp task không.");
      },
      onError: (error) => showErrorToast("Không gắn được task.", error),
    });
  };

  const handleUnlink = (taskId: string) =>
    unlinkTask.mutate(taskId, {
      onError: (error) => showErrorToast("Không gỡ được task.", error),
    });

  const linkedIds = new Set(review?.taskReview.linkedTasks.map((task) => task.taskId) ?? []);
  const taskOptions = (tasksQuery.data ?? []).filter(
    (task) => !linkedIds.has(task.id) && task.issueTypeLevel !== "EPIC" && task.issueTypeLevel !== "ABOVE_EPIC"
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-label="Đánh giá AI cho commit"
        className="bg-card border border-border/80 rounded-xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-lg overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-border/60 flex items-center justify-between gap-3 bg-muted/20 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <SparklesIcon className="size-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold">Đánh giá AI cho commit</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs text-muted-foreground">{(review?.sha ?? shortSha ?? "").slice(0, 7)}</span>
                {review && (
                  <CommitReviewBadge
                    review={{
                      status: review.status,
                      label: review.label,
                      reasons: review.reasons,
                      taskLinked: review.taskReview.linkedTasks.length > 0,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-1.5 hover:bg-muted cursor-pointer" aria-label="Đóng">
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {reviewQuery.isLoading && (
            <div className="flex items-center justify-center gap-2 py-10 text-xs text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" /> Đang tải kết quả đánh giá...
            </div>
          )}

          {reviewQuery.isError && (
            <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/5 text-xs text-destructive">
              Không tải được kết quả đánh giá AI. Hãy thử lại sau.
            </div>
          )}

          {review && <ReviewBody review={review} copied={copied} onCopy={(text) => {
            void navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }} />}

          {review && !review.merge && (
            <Section icon={ListChecksIcon} title="Task của commit" verdict={review.taskReview.verdictLabel}>
              {review.taskReview.linkedTasks.length === 0 ? (
                <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5">
                  Commit chưa gắn task nào. Lần sau hãy ghi mã task (ví dụ SAGA-12) vào tên commit
                  {review.canManageLinks ? ", hoặc gắn thủ công bên dưới." : "."}
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {review.taskReview.linkedTasks.map((task) => (
                    <li key={task.taskId} className="flex items-center justify-between gap-2 text-xs rounded-lg border border-border/60 px-2.5 py-1.5">
                      <span className="min-w-0 truncate">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 mr-1.5">{task.externalKey}</span>
                        {task.title}
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                            task.source === "MANUAL" ? "bg-violet-500/15 text-violet-700 dark:text-violet-300" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {task.source === "MANUAL" ? "Gắn thủ công" : "Tự động"}
                        </span>
                        {task.canUnlink && (
                          <button
                            type="button"
                            onClick={() => handleUnlink(task.taskId)}
                            disabled={unlinkTask.isPending}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                            title="Gỡ task gắn thủ công"
                            aria-label={`Gỡ ${task.externalKey ?? "task"}`}
                          >
                            <Trash2Icon className="size-3.5" />
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {review.taskReview.alignments.length > 0 && (
                <div className="space-y-2">
                  {review.taskReview.alignments.map((alignment) => (
                    <div key={alignment.taskId} className="text-xs rounded-lg bg-muted/30 border border-border/50 p-2.5 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{alignment.externalKey}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted border border-border">{alignment.verdictLabel}</span>
                      </div>
                      {alignment.summary && <p className="text-muted-foreground leading-relaxed">{alignment.summary}</p>}
                    </div>
                  ))}
                </div>
              )}

              {review.canManageLinks && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2">
                    <select
                      aria-label="Chọn task để gắn"
                      value={selectedTaskId}
                      onChange={(event) => setSelectedTaskId(event.target.value)}
                      className="flex-1 min-w-0 h-8 rounded-lg border border-border bg-background px-2 text-xs"
                      disabled={tasksQuery.isLoading}
                    >
                      <option value="">{tasksQuery.isLoading ? "Đang tải task..." : "Chọn task để gắn thủ công"}</option>
                      {taskOptions.map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.externalKey} — {task.title}
                        </option>
                      ))}
                    </select>
                    <Button size="sm" onClick={handleLink} disabled={!selectedTaskId || linkTask.isPending} className="h-8 text-xs gap-1">
                      {linkTask.isPending ? <Loader2Icon className="size-3 animate-spin" /> : <Link2Icon className="size-3" />}
                      Gắn task
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-start gap-1">
                    <InfoIcon className="size-3 mt-0.5 shrink-0" />
                    Gắn thủ công chỉ để hiển thị và để AI kiểm tra commit có khớp task. Không được tính làm minh chứng hay vào điểm đóng góp.
                  </p>
                </div>
              )}
            </Section>
          )}
        </div>

        <div className="p-3.5 sm:p-4 border-t border-border/60 flex items-center justify-between gap-2 bg-muted/20 shrink-0">
          <span className="text-[11px] text-muted-foreground truncate">
            {review?.reviewedAt
              ? `Đánh giá lúc ${new Date(review.reviewedAt).toLocaleString("vi-VN")}${review.provider ? ` · ${review.provider}` : ""}${review.modelId ? ` / ${review.modelId}` : ""}`
              : review?.keySource === "TEAM"
                ? "Dùng key AI của nhóm"
                : review?.keySource === "COURSE"
                  ? "Dùng key AI của lớp"
                  : ""}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {review?.canRequestReview && review.status !== "PENDING" && (
              <Button size="sm" variant="outline" onClick={handleRequest} disabled={requestReview.isPending} className="h-8 text-xs gap-1.5">
                {requestReview.isPending ? <Loader2Icon className="size-3 animate-spin" /> : <RefreshCwIcon className="size-3" />}
                {review.status === "NOT_REVIEWED" ? "Đánh giá ngay" : "Đánh giá lại"}
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={onClose} className="h-8 text-xs">
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ReviewBody({
  review,
  copied,
  onCopy,
}: {
  review: CommitAiReviewDetail;
  copied: boolean;
  onCopy: (text: string) => void;
}) {
  const tone = commitReviewTone(review.status);
  return (
    <>
      <div className={cn("rounded-xl border p-3.5 space-y-2", COMMIT_REVIEW_TONE_CLASS[tone])}>
        <p className="text-sm font-semibold">{review.headline}</p>
        {review.reasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {review.reasons.map((reason) => (
              <span key={reason.code} className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-background/70 border border-current/20">
                {reason.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {review.merge && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground rounded-xl border border-border p-3">
          <GitMergeIcon className="size-4 shrink-0 text-purple-500" />
          <span>Merge commit chỉ gộp code từ các commit đã có. SAGA đánh giá từng commit gốc, không đánh giá merge commit.</span>
        </div>
      )}

      {review.reviewBlockedReason === "NO_KEY" && (
        <div className="flex items-start gap-2 text-xs rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-amber-800 dark:text-amber-200">
          <KeyRoundIcon className="size-4 shrink-0" />
          <span>
            Nhóm chưa nhập key AI và lớp chưa cho dùng key của giảng viên. Trưởng nhóm vào trang Dự án → &quot;Key AI của nhóm&quot; để nhập key.
          </span>
        </div>
      )}

      {review.status === "PENDING" && (
        <div className="flex items-center gap-2 text-xs text-sky-700 dark:text-sky-300 rounded-xl border border-sky-500/30 bg-sky-500/5 p-3">
          <Loader2Icon className="size-4 animate-spin" /> AI đang đọc commit, tự cập nhật khi có kết quả...
        </div>
      )}

      {review.status === "FAILED" && review.failure && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 space-y-1">
          <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{review.failure.title}</p>
          <p className="text-xs text-foreground">{review.failure.message}</p>
          <p className="text-xs text-muted-foreground">{review.failure.hint}</p>
          <p className="text-[10px] font-mono text-muted-foreground/70">{review.failure.code}</p>
        </div>
      )}

      {review.messageReview && (
        <Section
          icon={MessageSquareTextIcon}
          title="Tên commit"
          verdict={`${review.messageReview.verdictLabel ?? ""}${review.messageReview.score != null ? ` · ${review.messageReview.score}/100` : ""}`}
        >
          {review.message && (
            <p className="text-xs font-mono bg-muted/30 border border-border/50 rounded-lg p-2 whitespace-pre-wrap">{review.message}</p>
          )}
          {review.messageReview.summary && <p className="text-xs text-muted-foreground leading-relaxed">{review.messageReview.summary}</p>}
          {review.messageReview.suggestedMessage &&
            review.messageReview.suggestedMessage.trim().toLowerCase() !== (review.message ?? "").trim().toLowerCase() && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">Gợi ý tên commit</span>
                <button
                  type="button"
                  onClick={() => onCopy(review.messageReview!.suggestedMessage!)}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {copied ? <CheckIcon className="size-3 text-emerald-500" /> : <CopyIcon className="size-3" />}
                  {copied ? "Đã chép" : "Chép"}
                </button>
              </div>
              <p className="text-xs font-mono">{review.messageReview.suggestedMessage}</p>
            </div>
          )}
          <FindingList findings={review.messageReview.findings} empty="Không có vấn đề nào với tên commit." />
        </Section>
      )}

      {review.codeReview && (
        <Section icon={FileCodeIcon} title="Code trong commit" verdict={review.codeReview.verdictLabel}>
          {review.codeReview.coverage && !review.codeReview.coverage.complete && (
            <p className="text-[11px] text-muted-foreground flex items-start gap-1">
              <InfoIcon className="size-3 mt-0.5 shrink-0" />
              AI chỉ xem được một phần thay đổi
              {review.codeReview.coverage.filesTotal != null
                ? ` (${review.codeReview.coverage.filesAnalyzed ?? 0}/${review.codeReview.coverage.filesTotal} file)`
                : ""}
              {" "}nên không kết luận code tốt hoàn toàn.
            </p>
          )}
          <FindingList findings={review.codeReview.findings} empty="AI không thấy vấn đề cụ thể nào trong phần code đã đọc." />
        </Section>
      )}
    </>
  );
}
