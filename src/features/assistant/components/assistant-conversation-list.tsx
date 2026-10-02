"use client";

import { BotIcon, Clock3Icon, LoaderCircleIcon, MessageSquareTextIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatAssistantTime } from "../lib/assistant-labels";
import type { AssistantConversation } from "../types/project-assistant";

interface AssistantConversationListProps {
  conversations: AssistantConversation[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  canStart: boolean;
  starting: boolean;
  onRetry: () => void;
  onStart: () => void;
  onOpen: (conversationId: string) => void;
}

export function AssistantConversationList({
  conversations,
  isLoading,
  isError,
  error,
  canStart,
  starting,
  onRetry,
  onStart,
  onOpen,
}: AssistantConversationListProps) {
  if (isLoading) {
    return (
      <div className="flex-1 space-y-2 p-3" aria-label="Đang tải cuộc trò chuyện">
        <div className="h-9 animate-pulse rounded-xl bg-muted" />
        <div className="h-16 animate-pulse rounded-xl bg-muted" />
        <div className="h-16 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="m-3 space-y-2 rounded-xl border border-dashed border-border p-4 text-center">
        <p className="text-sm text-destructive">
          {getApiErrorMessage(error, "Không tải được danh sách cuộc trò chuyện.")}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-3.5">
      {canStart ? (
        <Button type="button" className="h-10 w-full rounded-xl shadow-xs" disabled={starting} onClick={onStart}>
          {starting ? <LoaderCircleIcon className="size-4 animate-spin" /> : <PlusIcon className="size-4" />}
          Cuộc trò chuyện mới
        </Button>
      ) : null}
      {conversations.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
          <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BotIcon className="size-5" aria-hidden />
          </div>
          <p className="text-sm font-semibold">Bắt đầu hỏi về dự án</p>
          <p className="mt-1 max-w-64 text-xs leading-relaxed text-muted-foreground">
            Trợ lý có thể hỗ trợ tra cứu tiến độ Sprint, công việc trễ và hoạt động của thành viên.
          </p>
        </div>
      ) : (
        <ul className="space-y-2" aria-label="Lịch sử trò chuyện">
          {conversations.slice(0, 20).map((conversation) => (
            <li key={conversation.id}>
              <button
                type="button"
                className="group flex w-full items-center gap-3 rounded-xl border border-border/70 bg-card px-3 py-2.5 text-left shadow-2xs transition-colors hover:border-primary/35 hover:bg-primary/5 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                onClick={() => onOpen(conversation.id)}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <MessageSquareTextIcon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{conversation.title}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock3Icon className="size-3" aria-hidden />
                    {formatAssistantTime(conversation.lastMessageAt || conversation.createdAt) || "Chưa có tin nhắn"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
