"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ASSISTANT_ANSWERED_EVENT, ASSISTANT_OPEN_EVENT } from "../lib/assistant-events";
import { usePathname, useSearchParams } from "next/navigation";
import { BotIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { cn } from "@/lib/utils";
import type { AssistantRouteContext } from "../lib/assistant-route-context";
import { resolveAssistantRouteContext } from "../lib/assistant-route-context";
import { AssistantPanel } from "./assistant-panel";

export function ProjectAssistantLauncher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const context = resolveAssistantRouteContext({
    role: user?.role,
    pathname,
    searchParams,
  });

  if (!context) return null;

  const sessionKey = [context.role, pathname, context.courseId, context.teamId ?? "course"].join(":");

  return <ProjectAssistantWidget key={sessionKey} context={context} />;
}

function ProjectAssistantWidget({ context }: { context: AssistantRouteContext }) {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const panelId = useId();
  const titleId = `${panelId}-title`;

  const [hasUnread, setHasUnread] = useState(false);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const openAssistant = () => {
    setHasOpened(true);
    setOpen(true);
    setHasUnread(false);
    requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
  };

  // A toast's "Xem" opens the assistant, and an answer that arrived unseen marks the button.
  useEffect(() => {
    const onOpen = () => {
      setHasOpened(true);
      setOpen(true);
      setHasUnread(false);
      requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
    };
    const onAnswered = () => {
      if (!openRef.current) setHasUnread(true);
    };
    window.addEventListener(ASSISTANT_OPEN_EVENT, onOpen);
    window.addEventListener(ASSISTANT_ANSWERED_EVENT, onAnswered);
    return () => {
      window.removeEventListener(ASSISTANT_OPEN_EVENT, onOpen);
      window.removeEventListener(ASSISTANT_ANSWERED_EVENT, onAnswered);
    };
  }, []);

  const minimizeAssistant = () => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus({ preventScroll: true }));
  };

  const toggleAssistant = () => {
    if (open) {
      minimizeAssistant();
      return;
    }
    openAssistant();
  };

  return (
    <>
      {hasOpened ? (
        <section
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          aria-hidden={!open}
          tabIndex={-1}
          hidden={!open}
          className="fixed inset-0 z-50 flex min-h-0 flex-col overflow-hidden bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] outline-none sm:inset-auto sm:right-6 sm:bottom-20 sm:h-[min(680px,calc(100dvh-7rem))] sm:w-[420px] sm:rounded-2xl sm:border sm:border-border/80 sm:bg-popover sm:pt-0 sm:pb-0 sm:shadow-2xl"
          onKeyDown={(event) => {
            if (event.key === "Escape") minimizeAssistant();
          }}
        >
          <AssistantPanel
            context={context}
            active={hasOpened}
            visible={open}
            titleId={titleId}
            onMinimize={minimizeAssistant}
          />
        </section>
      ) : null}

      <Button
        ref={launcherRef}
        type="button"
        size="icon"
        aria-label={open ? "Thu gọn trợ lý AI dự án" : "Mở trợ lý AI dự án"}
        aria-expanded={open}
        aria-controls={hasOpened ? panelId : undefined}
        title={open ? "Thu gọn trợ lý AI dự án" : "Trợ lý AI dự án"}
        className={cn(
          "fixed right-5 bottom-5 z-[60] size-12 rounded-full border border-primary-foreground/20 shadow-lg transition-transform hover:scale-105 sm:right-6 sm:bottom-6",
          open && "max-sm:hidden"
        )}
        onClick={toggleAssistant}
      >
        {open ? <ChevronDownIcon className="size-5" aria-hidden /> : <BotIcon className="size-5" aria-hidden />}
        {hasUnread && !open ? (
          <span
            className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-destructive ring-2 ring-background"
            aria-label="Trợ lý có câu trả lời mới"
          />
        ) : null}
        <span className="sr-only">{open ? "Thu gọn trợ lý AI dự án" : "Mở trợ lý AI dự án"}</span>
      </Button>
    </>
  );
}
