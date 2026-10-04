"use client";

import { useEffect, useRef } from "react";
import { BotIcon, UserRoundIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import type { AssistantMessage } from "../types/project-assistant";
import { AssistantMessageBubble } from "./assistant-message-bubble";

interface AssistantMessageThreadProps {
  messages: AssistantMessage[];
  /** The question being answered right now: shown at once, with a typing bubble under it. */
  pendingQuestion?: string | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  role: "STUDENT" | "LECTURER";
  courseId: string;
  teamId: string | null;
  feedbackPendingId: string | null;
  followUpDisabled: boolean;
  reloadBanner: string | null;
  onReloadHistory: () => void;
  onFeedback: (messageId: string, helpful: boolean) => void;
  onFollowUp: (question: string) => void;
}

export function AssistantMessageThread({
  messages,
  pendingQuestion = null,
  isLoading,
  isError,
  error,
  onRetry,
  role,
  courseId,
  teamId,
  feedbackPendingId,
  followUpDisabled,
  reloadBanner,
  onReloadHistory,
  onFeedback,
  onFollowUp,
}: AssistantMessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastId = messages[messages.length - 1]?.id ?? "";

  useEffect(() => {
    if (typeof bottomRef.current?.scrollIntoView === "function") {
      bottomRef.current.scrollIntoView({ block: "end" });
    }
  }, [lastId, pendingQuestion]);

  if (isLoading) {
    return (
      <div className="min-h-0 flex-1 space-y-3 p-3" aria-label="Đang tải tin nhắn">
        <div className="ml-auto h-16 w-2/3 animate-pulse rounded-2xl bg-muted" />
        <div className="h-28 w-5/6 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="m-3 space-y-2 rounded-xl border border-dashed border-border p-4 text-center">
        <p className="text-sm text-destructive">
          {getApiErrorMessage(error, "Không tải được cuộc trò chuyện.")}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div
      className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-muted/15 p-3 sm:p-3.5"
      aria-label="Nội dung cuộc trò chuyện"
      aria-live="polite"
    >
      {reloadBanner ? (
        <div className="space-y-2 rounded-xl border border-border bg-muted/50 p-3">
          <p className="text-xs">{reloadBanner}</p>
          <Button type="button" variant="outline" size="sm" onClick={onReloadHistory}>
            Tải lại lịch sử
          </Button>
        </div>
      ) : null}
      {messages.length === 0 && !pendingQuestion ? (
        <div className="flex min-h-44 items-center justify-center rounded-2xl border border-dashed border-border/80 bg-background/70 p-5 text-center">
          <div>
            <p className="text-sm font-semibold">Bạn muốn kiểm tra thông tin gì?</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Hỏi về tiến độ Sprint, công việc trễ, hoạt động thành viên hoặc chi tiết một công việc.
            </p>
          </div>
        </div>
      ) : null}
      {messages.map((message) => (
        <AssistantMessageBubble
          key={message.id}
          message={message}
          role={role}
          courseId={courseId}
          teamId={teamId}
          feedbackPending={feedbackPendingId === message.id}
          followUpDisabled={followUpDisabled}
          onFeedback={onFeedback}
          onFollowUp={onFollowUp}
        />
      ))}
      {pendingQuestion ? (
        <>
          <article className="flex flex-row-reverse items-start gap-2" data-pending-question>
            <div
              className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              aria-hidden
            >
              <UserRoundIcon className="size-3.5" />
            </div>
            <div className="min-w-0 max-w-[84%] space-y-1.5 rounded-2xl rounded-tr-md border border-primary bg-primary px-3 py-2.5 text-primary-foreground shadow-xs">
              <span className="text-[11px] font-semibold text-primary-foreground/75">Bạn</span>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{pendingQuestion}</p>
            </div>
          </article>
          <article className="flex items-start gap-2" role="status" aria-label="Trợ lý đang trả lời">
            <div
              className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
              aria-hidden
            >
              <BotIcon className="size-4" />
            </div>
            <div className="rounded-2xl rounded-tl-md border border-border/70 bg-card px-3 py-2.5 shadow-2xs">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="flex gap-1" aria-hidden>
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
                </span>
                Trợ lý đang trả lời…
              </span>
            </div>
          </article>
        </>
      ) : null}
      <div ref={bottomRef} />
    </div>
  );
}
