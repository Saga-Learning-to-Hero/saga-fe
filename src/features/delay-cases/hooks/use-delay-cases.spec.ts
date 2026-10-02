import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { delayCasesApi } from "../api/delay-cases-api";
import {
  useDelayCases,
  useDelayCaseDetail,
  useLecturerDelayQueue,
  useExplainDelayCase,
  useLeaderReviewDelayCase,
  useLecturerReviewDelayCase,
  useReopenDelayCase,
} from "./use-delay-cases";
import React from "react";

vi.mock("../api/delay-cases-api", () => ({
  delayCasesApi: {
    getDelayCases: vi.fn(),
    getDelayCaseDetails: vi.fn(),
    getLecturerQueue: vi.fn(),
    explainDelayCase: vi.fn(),
    leaderReview: vi.fn(),
    lecturerReview: vi.fn(),
    reopenDelayCase: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
  Wrapper.displayName = "Wrapper";
  return Wrapper;
};

describe("use-delay-cases hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useDelayCases", () => {
    it("UTCID12 - [N] Normal: Fetch delay cases cho 1 task", async () => {
      const mockData = [{ id: "1" }];
      vi.mocked(delayCasesApi.getDelayCases).mockResolvedValueOnce(mockData as never);

      const { result } = renderHook(() => useDelayCases("proj1", { taskId: "task1" }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe("useDelayCaseDetail", () => {
    it("UTCID13 - [N] Normal: Fetch detail delay case", async () => {
      const mockData = { id: "1" };
      vi.mocked(delayCasesApi.getDelayCaseDetails).mockResolvedValueOnce(mockData as never);

      const { result } = renderHook(() => useDelayCaseDetail("proj1", "1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe("useLecturerDelayQueue", () => {
    it("UTCID14 - [N] Normal: Fetch lecturer queue", async () => {
      const mockData = [{ id: "1" }];
      vi.mocked(delayCasesApi.getLecturerQueue).mockResolvedValueOnce(mockData as never);

      const { result } = renderHook(() => useLecturerDelayQueue(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe("Mutations", () => {
    it("UTCID15 - [N] Normal: useExplainDelayCase", async () => {
      const { result } = renderHook(() => useExplainDelayCase(), { wrapper: createWrapper() });
      vi.mocked(delayCasesApi.explainDelayCase).mockResolvedValueOnce({} as never);

      result.current.mutate({ projectId: "proj1", caseId: "1", payload: { category: "TECHNICAL_ISSUE" } });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it("UTCID16 - [N] Normal: useLeaderReviewDelayCase", async () => {
      const { result } = renderHook(() => useLeaderReviewDelayCase(), { wrapper: createWrapper() });
      vi.mocked(delayCasesApi.leaderReview).mockResolvedValueOnce({} as never);

      result.current.mutate({ projectId: "proj1", caseId: "1", payload: { decision: "APPROVED" } });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it("UTCID17 - [N] Normal: useLecturerReviewDelayCase", async () => {
      const { result } = renderHook(() => useLecturerReviewDelayCase(), { wrapper: createWrapper() });
      vi.mocked(delayCasesApi.lecturerReview).mockResolvedValueOnce({} as never);

      result.current.mutate({ projectId: "proj1", caseId: "1", payload: { outcome: "EXCUSED" } });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it("UTCID18 - [N] Normal: useReopenDelayCase", async () => {
      const { result } = renderHook(() => useReopenDelayCase(), { wrapper: createWrapper() });
      vi.mocked(delayCasesApi.reopenDelayCase).mockResolvedValueOnce({} as never);

      result.current.mutate({ projectId: "proj1", caseId: "1" });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });
});
