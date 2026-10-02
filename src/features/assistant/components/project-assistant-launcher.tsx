"use client";

import { useId, useRef, useState } from "react";
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

  const openAssistant = () => {
    setHasOpened(true);
    setOpen(true);
    requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
  };

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
        <span className="sr-only">{open ? "Thu gọn trợ lý AI dự án" : "Mở trợ lý AI dự án"}</span>
      </Button>
    </>
  );
}
