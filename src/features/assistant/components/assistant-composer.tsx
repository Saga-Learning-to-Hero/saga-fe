"use client";

import { useEffect, useRef } from "react";
import { LoaderCircleIcon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ASSISTANT_QUESTION_MAX } from "../lib/question-input";

interface AssistantComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => boolean;
  pending: boolean;
  disabled: boolean;
  error: string | null;
}

export function AssistantComposer({
  value,
  onChange,
  onSend,
  pending,
  disabled,
  error,
}: AssistantComposerProps) {
  const lockedRef = useRef(false);

  useEffect(() => {
    if (!pending) {
      lockedRef.current = false;
    }
  }, [pending]);
  const isLocked = pending || disabled;
  const length = value.trim().length;
  const showCounter = length >= Math.floor(ASSISTANT_QUESTION_MAX * 0.8);

  const send = () => {
    if (lockedRef.current || pending || disabled) return;
    const started = onSend();
    if (!started) return;
    lockedRef.current = true;
  };

  return (
    <div className="shrink-0 space-y-2 border-t border-border/80 bg-card/85 p-3 backdrop-blur-sm sm:rounded-b-2xl">
      {pending ? (
        <p className="flex items-center gap-2 px-1 text-xs text-muted-foreground" role="status">
          <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden />
          Trợ lý đang trả lời…
        </p>
      ) : null}
      <div className="rounded-2xl border border-input bg-background p-1.5 shadow-xs transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
        <Textarea
          value={value}
          disabled={isLocked}
          aria-invalid={Boolean(error)}
          placeholder="Hỏi về tiến độ, công việc trễ hoặc hoạt động thành viên…"
          className="max-h-32 min-h-14 resize-none border-0 bg-transparent px-2 py-1.5 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
        />
        <div className="flex items-center justify-between gap-2 pl-2">
          <p className={cn("text-[10px] text-muted-foreground", showCounter && "font-medium text-amber-700 dark:text-amber-300")}>
            {showCounter ? `${length}/${ASSISTANT_QUESTION_MAX}` : "Enter để gửi · Shift+Enter để xuống dòng"}
          </p>
          <Button
            type="button"
            size="icon-sm"
            className="shrink-0 rounded-xl"
            aria-label="Gửi câu hỏi"
            disabled={isLocked}
            onClick={send}
          >
            <SendIcon className="size-3.5" aria-hidden />
          </Button>
        </div>
      </div>
      {error ? (
        <p className="px-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
