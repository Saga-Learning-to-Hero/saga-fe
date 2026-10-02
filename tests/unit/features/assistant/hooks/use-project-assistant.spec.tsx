import { describe, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { fptTest } from "@/testing/fpt-test-helper";
import { ProjectAssistantService } from "@/features/assistant/api/project-assistant-service";
import {
  PROJECT_ASSISTANT_QUERY_KEYS,
  useAskAssistant,
  useAssistantFeedback,
} from "@/features/assistant/hooks/use-project-assistant";
import type { AssistantMessage } from "@/features/assistant/types/project-assistant";

vi.mock("@/features/assistant/api/project-assistant-service", () => ({
  ProjectAssistantService: {
    ask: vi.fn(),
    submitFeedback: vi.fn(),
  },
}));

const date = "03/10/2026";
const projectId = "p1";
const conversationId = "c1";

function message(id: string, role: AssistantMessage["role"], content: string): AssistantMessage {
  return {
    id,
    conversationId,
    role,
    content,
    createdAt: "2026-10-03T00:00:00Z",
    answerSource: role === "ASSISTANT" ? "AI" : null,
    insufficientData: false,
    outOfScope: false,
    verified: true,
    removedCitationCount: 0,
    citations: [],
    followUpQuestions: [],
    fallbackReason: null,
    feedback: null,
  };
}

describe("use-project-assistant", () => {
  let client: QueryClient;

  beforeEach(() => {
    client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    vi.clearAllMocks();
  });

  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  fptTest({ id: "UTCID01", type: "N", executedDate: date, description: "hoi xong them ca cau hoi va cau tra loi vao cache" }, async () => {
    const question = message("q1", "USER", "Tien do?");
    const answer = message("a1", "ASSISTANT", "Dang dung sprint");
    vi.mocked(ProjectAssistantService.ask).mockResolvedValueOnce({ question, answer });
    client.setQueryData(PROJECT_ASSISTANT_QUERY_KEYS.messages(projectId, conversationId), [message("old", "USER", "Cu")]);

    const { result } = renderHook(() => useAskAssistant(projectId, conversationId), { wrapper });
    await result.current.mutateAsync("Tien do?");

    await waitFor(() => {
      const cached = client.getQueryData<AssistantMessage[]>(PROJECT_ASSISTANT_QUERY_KEYS.messages(projectId, conversationId));
      expect(cached?.map((item) => item.id)).toEqual(["old", "q1", "a1"]);
    });
  });

  fptTest({ id: "UTCID02", type: "A", executedDate: date, description: "ask that bai khong tu goi lai" }, async () => {
    vi.mocked(ProjectAssistantService.ask).mockRejectedValueOnce(new Error("timeout"));
    const { result } = renderHook(() => useAskAssistant(projectId, conversationId), { wrapper });
    await expect(result.current.mutateAsync("Tien do?")).rejects.toThrow("timeout");
    expect(ProjectAssistantService.ask).toHaveBeenCalledTimes(1);
  });

  fptTest({ id: "UTCID03", type: "B", executedDate: date, description: "doi feedback thay dung mot tin nhan" }, async () => {
    const original = message("a1", "ASSISTANT", "Tra loi");
    const updated = { ...original, feedback: { helpful: false, comment: null, at: "2026-10-03T01:00:00Z" } };
    vi.mocked(ProjectAssistantService.submitFeedback).mockResolvedValueOnce(updated);
    client.setQueryData(PROJECT_ASSISTANT_QUERY_KEYS.messages(projectId, conversationId), [
      message("q1", "USER", "Hoi"),
      original,
    ]);
    const { result } = renderHook(() => useAssistantFeedback(projectId, conversationId), { wrapper });
    await result.current.mutateAsync({ messageId: "a1", helpful: false });
    const cached = client.getQueryData<AssistantMessage[]>(PROJECT_ASSISTANT_QUERY_KEYS.messages(projectId, conversationId));
    expect(cached?.[1]?.feedback?.helpful).toBe(false);
    expect(cached?.[0]?.id).toBe("q1");
  });
});
