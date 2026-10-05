"use client";

import { useEffect, useRef, useState } from "react";
import { announceAssistantAnswer, isAwayFromAssistant } from "../lib/assistant-events";
import { ArrowLeftIcon, BotIcon, MinusIcon } from "lucide-react";
import { CustomSelect } from "@/components/common/custom-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useAskAssistant,
  useAssistantConversations,
  useAssistantFeedback,
  useAssistantMessages,
  useAssistantStatus,
  useStartAssistantConversation,
} from "../hooks/use-project-assistant";
import { useAssistantProject } from "../hooks/use-assistant-project";
import { mapAssistantAskError } from "../lib/assistant-errors";
import { assistantKeySourceLabel, formatAssistantQuota } from "../lib/assistant-labels";
import type { AssistantRouteContext } from "../lib/assistant-route-context";
import { validateAssistantQuestion } from "../lib/question-input";
import { AssistantComposer } from "./assistant-composer";
import { AssistantConversationList } from "./assistant-conversation-list";
import { AssistantMessageThread } from "./assistant-message-thread";

interface AssistantPanelProps {
  context: AssistantRouteContext;
  active: boolean;
  /** The panel is on screen (not minimised). */
  visible?: boolean;
  titleId?: string;
  onMinimize?: () => void;
}

export function AssistantPanel({ context, active, visible = true, titleId, onMinimize }: AssistantPanelProps) {
  const project = useAssistantProject(context);
  return (
    <AssistantPanelBody
      key={`${context.courseId}:${project.projectId ?? "none"}:${project.teamId ?? "none"}`}
      context={context}
      project={project}
      active={active}
      visible={visible}
      titleId={titleId}
      onMinimize={onMinimize}
    />
  );
}

function AssistantPanelBody({
  context,
  project,
  active,
  visible,
  titleId,
  onMinimize,
}: {
  context: AssistantRouteContext;
  project: ReturnType<typeof useAssistantProject>;
  active: boolean;
  visible: boolean;
  titleId?: string;
  onMinimize?: () => void;
}) {
  // An answer can arrive after the person minimised the chat, switched tab or moved to another page.
  const visibleRef = useRef(visible);
  const mountedRef = useRef(true);
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const [screen, setScreen] = useState<"history" | "thread">("history");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [reloadBanner, setReloadBanner] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const inFlight = useRef(false);

  const canQuery = Boolean(active && project.projectId && !project.guidance);
  const statusQuery = useAssistantStatus(project.projectId, { enabled: canQuery });
  const assistantAvailable = statusQuery.isSuccess && statusQuery.data.enabled;
  const conversationsQuery = useAssistantConversations(project.projectId, {
    enabled: canQuery && assistantAvailable,
  });
  const messagesQuery = useAssistantMessages(project.projectId, conversationId, {
    enabled: canQuery && assistantAvailable && screen === "thread",
  });
  const { refetch: refetchConversations } = conversationsQuery;
  const startConversation = useStartAssistantConversation(project.projectId);
  const ask = useAskAssistant(project.projectId, conversationId);
  const feedback = useAssistantFeedback(project.projectId, conversationId);

  const enabled = assistantAvailable;
  const quota = formatAssistantQuota(
    statusQuery.data?.remainingToday ?? null,
    statusQuery.data?.dailyLimit ?? null
  );
  const sourceLabel = statusQuery.data ? assistantKeySourceLabel(statusQuery.data.keySource) : null;
  const composerLocked =
    !enabled || rateLimited || (statusQuery.data?.remainingToday === 0 && statusQuery.data.dailyLimit != null);

  const conversationMissing =
    screen === "thread" &&
    messagesQuery.isError &&
    mapAssistantAskError(messagesQuery.error).type === "BACK_TO_HISTORY";
  const visibleScreen = conversationMissing ? "history" : screen;
  const visibleConversations = (conversationsQuery.data ?? []).filter(
    (conversation) => !conversationMissing || conversation.id !== conversationId
  );

  const applyAskError = (error: unknown) => {
    const action = mapAssistantAskError(error);
    if (action.type === "INLINE" || action.type === "GENERIC") setInlineError(action.message);
    if (action.type === "BACK_TO_HISTORY") {
      setScreen("history");
      setConversationId(null);
      void refetchConversations();
    }
    if (action.type === "RATE_LIMITED") {
      setRateLimited(true);
      setInlineError(action.message);
      void statusQuery.refetch();
    }
    if (action.type === "DISABLED") {
      setInlineError(action.message);
      void statusQuery.refetch();
    }
    if (action.type === "RELOAD_HISTORY") setReloadBanner(action.message);
  };

  const sendQuestion = async (question: string) => {
    if (!conversationId || inFlight.current || ask.isPending || composerLocked) return;
    const parsed = validateAssistantQuestion(question);
    if (!parsed.ok) {
      setInlineError(parsed.message);
      return;
    }
    inFlight.current = true;
    setInlineError(null);
    // Show the question in the thread right away, with the assistant's "typing" bubble under it.
    setPendingQuestion(parsed.question);
    setDraft("");
    try {
      await ask.mutateAsync(parsed.question);
      if (isAwayFromAssistant(visibleRef.current, mountedRef.current)) announceAssistantAnswer();
      setReloadBanner(null);
    } catch (error) {
      // Give the question back so it is not lost.
      setDraft((current) => (current.trim() ? current : parsed.question));
      applyAskError(error);
    } finally {
      setPendingQuestion(null);
      inFlight.current = false;
    }
  };

  const handleComposerSend = () => {
    const parsed = validateAssistantQuestion(draft);
    if (!parsed.ok) {
      setInlineError(parsed.message);
      return false;
    }
    if (inFlight.current || ask.isPending || composerLocked) return false;
    void sendQuestion(parsed.question);
    return true;
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 space-y-2.5 border-b border-border/80 bg-card/80 px-3.5 py-3 backdrop-blur-sm sm:rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          {visibleScreen === "thread" ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Quay lại danh sách"
              onClick={() => {
                setScreen("history");
                setConversationId(null);
              }}
            >
              <ArrowLeftIcon />
            </Button>
          ) : null}
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <BotIcon className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="truncate text-sm font-bold sm:text-base">
              Trợ lý dự án
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {project.teamLabel || "Theo dự án đang chọn"}
            </p>
          </div>
          {onMinimize ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Thu gọn trợ lý AI dự án"
              title="Thu gọn"
              onClick={onMinimize}
            >
              <MinusIcon className="size-4" aria-hidden />
            </Button>
          ) : null}
        </div>
        {project.needsTeamPicker ? (
          <CustomSelect
            id="assistant-team"
            value={project.selectedTeamId}
            onChange={(teamId) => {
              project.setSelectedTeamId(teamId);
            }}
            placeholder="Chọn nhóm"
            options={project.teams.map((team) => ({
              value: team.teamId,
              label: team.teamName ? `Nhóm ${team.teamNo} - ${team.teamName}` : `Nhóm ${team.teamNo}`,
              subLabel: team.projectId ? "Đã có dự án" : "Chưa có dự án",
              disabled: !team.projectId,
            }))}
          />
        ) : null}
        {sourceLabel || quota ? (
          <div className="flex min-h-7 flex-wrap items-center justify-between gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1.5">
            {sourceLabel ? (
              <Badge variant="outline" className="h-5 bg-background/70 px-1.5 text-[10px] font-medium">
                {sourceLabel}
              </Badge>
            ) : (
              <span />
            )}
            {quota ? <span className="text-[11px] text-muted-foreground">{quota}</span> : null}
          </div>
        ) : null}
      </header>

      {project.isLoading ? (
        <div className="m-3 h-40 animate-pulse rounded-xl bg-muted" aria-label="Đang tải dự án" />
      ) : project.isError ? (
        <div className="m-3 space-y-2 rounded-xl border border-dashed border-border p-4 text-center">
          <p className="text-sm text-destructive">
            {getApiErrorMessage(project.error, "Không tải được dự án của lớp.")}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={project.refetch}>
            Thử lại
          </Button>
        </div>
      ) : project.guidance ? (
        <p className="m-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          {project.guidance}
        </p>
      ) : statusQuery.isLoading ? (
        <div className="m-3 h-40 animate-pulse rounded-xl bg-muted" aria-label="Đang kiểm tra trạng thái trợ lý" />
      ) : statusQuery.isError ? (
        <div className="m-3 space-y-2 rounded-xl border border-dashed border-border p-4 text-center">
          <p className="text-sm text-destructive">
            {getApiErrorMessage(statusQuery.error, "Không kiểm tra được trạng thái trợ lý.")}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => void statusQuery.refetch()}>
            Thử lại
          </Button>
        </div>
      ) : statusQuery.data?.enabled === false ? (
        <div className="m-3 space-y-2 rounded-xl border border-dashed border-border p-4">
          <p className="text-sm">Trợ lý đang tắt trong lớp này.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void statusQuery.refetch()}>
            Kiểm tra lại
          </Button>
        </div>
      ) : visibleScreen === "history" ? (
        <>
          {startError ? (
            <p className="mx-3 mt-3 text-sm text-destructive" role="alert">
              {startError}
            </p>
          ) : null}
          <AssistantConversationList
            conversations={visibleConversations}
            isLoading={conversationsQuery.isLoading}
            isError={conversationsQuery.isError}
            error={conversationsQuery.error}
            canStart={enabled && !composerLocked}
            starting={startConversation.isPending}
            onRetry={() => void conversationsQuery.refetch()}
            onStart={() => {
              setStartError(null);
              void startConversation.mutateAsync().then((conversation) => {
                if (!conversation.id) return;
                setConversationId(conversation.id);
                setScreen("thread");
                setInlineError(null);
                setReloadBanner(null);
              }).catch((error: unknown) => {
                setStartError(getApiErrorMessage(error, "Không tạo được cuộc trò chuyện."));
              });
            }}
            onOpen={(id) => {
              setConversationId(id);
              setScreen("thread");
              setInlineError(null);
              setReloadBanner(null);
              setStartError(null);
            }}
          />
        </>
      ) : (
        <>
          <AssistantMessageThread
            messages={messagesQuery.data ?? []}
            isLoading={messagesQuery.isLoading}
            isError={messagesQuery.isError}
            error={messagesQuery.error}
            onRetry={() => void messagesQuery.refetch()}
            role={context.role}
            courseId={context.courseId}
            teamId={project.teamId}
            pendingQuestion={pendingQuestion}
            feedbackPendingId={feedback.isPending ? feedback.variables?.messageId ?? null : null}
            followUpDisabled={ask.isPending || composerLocked}
            reloadBanner={reloadBanner}
            onReloadHistory={() => {
              setReloadBanner(null);
              void messagesQuery.refetch();
            }}
            onFeedback={(messageId, helpful) => {
              feedback.mutate({ messageId, helpful });
            }}
            onFollowUp={(question) => {
              void sendQuestion(question);
            }}
          />
          {enabled ? (
            <AssistantComposer
              value={draft}
              onChange={setDraft}
              onSend={handleComposerSend}
              pending={ask.isPending}
              disabled={composerLocked}
              error={inlineError}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
