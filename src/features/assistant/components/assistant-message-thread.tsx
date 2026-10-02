"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import type { AssistantMessage } from "../types/project-assistant";
import { AssistantMessageBubble } from "./assistant-message-bubble";

interface AssistantMessageThreadProps {
  messages: AssistantMessage[];
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
  }, [lastId]);

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
      {messages.length === 0 ? (
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
      <div ref={bottomRef} />
    </div>
  );
}
