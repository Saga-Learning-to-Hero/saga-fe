"use client";

import {
  BotIcon,
  CircleAlertIcon,
  ShieldCheckIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  UserRoundIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatAssistantTime } from "../lib/assistant-labels";
import type { AssistantMessage } from "../types/project-assistant";
import { AssistantCitationChip } from "./assistant-citation-chip";
import { AssistantMarkdown } from "./assistant-markdown";

interface AssistantMessageBubbleProps {
  message: AssistantMessage;
  role: "STUDENT" | "LECTURER";
  courseId: string;
  teamId: string | null;
  feedbackPending: boolean;
  followUpDisabled: boolean;
  onFeedback: (messageId: string, helpful: boolean) => void;
  onFollowUp: (question: string) => void;
}

export function AssistantMessageBubble({
  message,
  role,
  courseId,
  teamId,
  feedbackPending,
  followUpDisabled,
  onFeedback,
  onFollowUp,
}: AssistantMessageBubbleProps) {
  const isUser = message.role === "USER";
  const time = formatAssistantTime(message.createdAt);

  return (
    <article
      className={cn("flex items-start gap-2", isUser && "flex-row-reverse")}
      data-message-id={message.id}
    >
      <div
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
          isUser ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
        )}
        aria-hidden
      >
        {isUser ? <UserRoundIcon className="size-3.5" /> : <BotIcon className="size-4" />}
      </div>

      <div
        className={cn(
          "min-w-0 max-w-[84%] space-y-2.5 rounded-2xl border px-3 py-2.5",
          isUser
            ? "rounded-tr-md border-primary bg-primary text-primary-foreground shadow-xs"
            : message.outOfScope
              ? "rounded-tl-md border-amber-500/35 bg-amber-500/8"
              : "rounded-tl-md border-border/70 bg-card shadow-2xs"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-3 text-[11px]",
            isUser ? "text-primary-foreground/75" : "text-muted-foreground"
          )}
        >
          <span className={cn("font-semibold", !isUser && "text-foreground")}>
            {isUser ? "Bạn" : "Trợ lý AI"}
          </span>
          {time ? <time dateTime={message.createdAt ?? undefined}>{time}</time> : null}
        </div>

        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        ) : (
          <AssistantMarkdown content={message.content} />
        )}

        {!isUser ? (
          <div className="space-y-2 border-t border-border/60 pt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {message.answerSource === "FALLBACK" ? (
                <Badge variant="outline" className="text-[10px]">
                  Tóm tắt tự động · AI chưa khả dụng
                </Badge>
              ) : null}
              {message.verified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                  <ShieldCheckIcon className="size-3.5" aria-hidden />
                  Đã kiểm chứng nguồn
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300">
                  <CircleAlertIcon className="size-3.5" aria-hidden />
                  Nguồn chưa được kiểm chứng đầy đủ
                </span>
              )}
            </div>

            {message.outOfScope ? (
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                Câu hỏi nằm ngoài phạm vi trợ lý.
              </p>
            ) : null}
            {message.insufficientData ? (
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Dữ liệu chưa đủ để trả lời chắc chắn.
              </p>
            ) : null}
            {message.removedCitationCount > 0 ? (
              <p className="text-[11px] text-muted-foreground">
                Đã loại {message.removedCitationCount} nguồn không hợp lệ.
              </p>
            ) : null}

            {message.citations.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Nguồn tham khảo
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {message.citations.map((citation, index) => (
                    <AssistantCitationChip
                      key={`${citation.kind}-${citation.id ?? citation.sha ?? index}`}
                      citation={citation}
                      role={role}
                      courseId={courseId}
                      teamId={teamId}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {message.followUpQuestions.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Có thể bạn muốn hỏi
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {message.followUpQuestions.map((question) => (
                    <Button
                      key={question}
                      type="button"
                      variant="outline"
                      size="xs"
                      className="h-auto max-w-full whitespace-normal py-1 text-left text-[11px]"
                      disabled={followUpDisabled}
                      onClick={() => onFollowUp(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-0.5">
              <span className="mr-1 text-[10px] text-muted-foreground">Câu trả lời này có hữu ích?</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Hữu ích"
                aria-pressed={message.feedback?.helpful === true}
                disabled={feedbackPending}
                onClick={() => onFeedback(message.id, true)}
              >
                <ThumbsUpIcon className={cn(message.feedback?.helpful === true && "text-primary")} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Chưa hữu ích"
                aria-pressed={message.feedback?.helpful === false}
                disabled={feedbackPending}
                onClick={() => onFeedback(message.id, false)}
              >
                <ThumbsDownIcon className={cn(message.feedback?.helpful === false && "text-primary")} />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
