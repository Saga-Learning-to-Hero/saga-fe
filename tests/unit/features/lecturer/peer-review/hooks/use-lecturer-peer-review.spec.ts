import { describe, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fptTest } from "@/testing/fpt-test-helper";

const getTeamRubric = vi.fn();
const getSprintReviews = vi.fn();

vi.mock("@/features/lecturer/peer-review/api/lecturer-peer-review-service", () => ({
  LecturerPeerReviewService: {
    getTeamRubric: (...args: unknown[]) => getTeamRubric(...args),
    getSprintReviews: (...args: unknown[]) => getSprintReviews(...args),
  },
}));

import { useLecturerPeerReviewRubric, useLecturerSprintPeerReviews } from "@/features/lecturer/peer-review/hooks/use-lecturer-peer-review";

describe("use-lecturer-peer-review", () => {
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    wrapper = ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children);
    getTeamRubric.mockResolvedValue({ teamId: "team-1", criteria: [] });
    getSprintReviews.mockResolvedValue({ reviews: [] });
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "15/09/2026",
      description: "Goi rubric va reviews khi co teamId sprintId",
    },
    async () => {
      renderHook(() => useLecturerPeerReviewRubric("team-1"), { wrapper });
      renderHook(() => useLecturerSprintPeerReviews("team-1", "sprint-1"), { wrapper });
      await waitFor(() => expect(getTeamRubric).toHaveBeenCalledWith("team-1"));
      await waitFor(() => expect(getSprintReviews).toHaveBeenCalledWith("team-1", "sprint-1"));
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "15/09/2026",
      description: "Khong goi reviews khi thieu sprintId",
    },
    () => {
      renderHook(() => useLecturerSprintPeerReviews("team-1", "", { enabled: true }), { wrapper });
      expect(getSprintReviews).not.toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "15/09/2026",
      description: "Khong goi khi enabled false",
    },
    () => {
      renderHook(() => useLecturerPeerReviewRubric("team-1", { enabled: false }), { wrapper });
      renderHook(() => useLecturerSprintPeerReviews("team-1", "sprint-1", { enabled: false }), { wrapper });
      expect(getTeamRubric).not.toHaveBeenCalled();
      expect(getSprintReviews).not.toHaveBeenCalled();
    }
  );
});
