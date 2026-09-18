import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/axios";
import { ActivityAnalyticsService } from "./activity-analytics-service";
import type {
  BurndownChartResponse,
  HeatmapResponse,
} from "../types/activity-analytics";

vi.mock("@/lib/axios", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("ActivityAnalyticsService", () => {
  const mockCourseId = "course-123";
  const mockTeamId = "team-456";
  const mockSprintId = "sprint-789";

  const mockHeatmapResponse: HeatmapResponse = {
    courseId: mockCourseId,
    teamId: mockTeamId,
    studentId: null,
    startDate: "2026-03-01",
    endDate: "2026-03-07",
    students: [
      {
        studentId: "student-01",
        studentCode: "SE170001",
        fullName: "Nguyen Van A",
        avatar: null,
        commits: 5,
        peerReviews: 2,
        documents: 1,
        tasks: 3,
        totalActivities: 11,
        cells: [
          {
            date: "2026-03-01",
            commits: 1,
            peerReviews: 0,
            documents: 0,
            tasks: 1,
            totalActivities: 2,
            actors: [],
          },
        ],
      },
    ],
    days: [
      {
        date: "2026-03-01",
        commits: 1,
        peerReviews: 0,
        documents: 0,
        tasks: 1,
        totalActivities: 2,
        actors: [],
      },
    ],
  };

  const mockBurndownResponse: BurndownChartResponse = {
    courseId: mockCourseId,
    teamId: mockTeamId,
    sprintId: mockSprintId,
    sprintName: "Sprint 1",
    startDate: "2026-03-01",
    endDate: "2026-03-14",
    totalScope: 10,
    points: [
      {
        date: "2026-03-01",
        actualRemaining: 10,
        doneCount: 0,
      },
      {
        date: "2026-03-02",
        actualRemaining: 8,
        doneCount: 2,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTCID01 - [N] Normal: Goi getTeamHeatmap voi tham so hop le va tra ve du lieu thanh cong", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockHeatmapResponse });

    const result = await ActivityAnalyticsService.getTeamHeatmap(mockCourseId, mockTeamId, {
      startDate: "2026-03-01",
      endDate: "2026-03-07",
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      `/api/courses/${mockCourseId}/teams/${mockTeamId}/heatmap?startDate=2026-03-01&endDate=2026-03-07`
    );
    expect(result).toEqual(mockHeatmapResponse);
  });

  it("UTCID02 - [N] Normal: Goi getTeamHeatmap co studentId hop le va truyen query param chinh xac", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockHeatmapResponse });

    const result = await ActivityAnalyticsService.getTeamHeatmap(mockCourseId, mockTeamId, {
      startDate: "2026-03-01",
      endDate: "2026-03-07",
      studentId: "student-01",
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      `/api/courses/${mockCourseId}/teams/${mockTeamId}/heatmap?startDate=2026-03-01&endDate=2026-03-07&studentId=student-01`
    );
    expect(result).toEqual(mockHeatmapResponse);
  });

  it("UTCID03 - [A] Abnormal: Throw ValidationException khi courseId bi rong", async () => {
    await expect(
      ActivityAnalyticsService.getTeamHeatmap("", mockTeamId, {
        startDate: "2026-03-01",
        endDate: "2026-03-07",
      })
    ).rejects.toThrow("Throw ValidationException: Course ID is required");
  });

  it("UTCID04 - [A] Abnormal: Throw ValidationException khi teamId bi rong", async () => {
    await expect(
      ActivityAnalyticsService.getTeamHeatmap(mockCourseId, "   ", {
        startDate: "2026-03-01",
        endDate: "2026-03-07",
      })
    ).rejects.toThrow("Throw ValidationException: Team ID is required");
  });

  it("UTCID05 - [A] Abnormal: Throw ValidationException khi startDate bi rong", async () => {
    await expect(
      ActivityAnalyticsService.getTeamHeatmap(mockCourseId, mockTeamId, {
        startDate: "",
        endDate: "2026-03-07",
      })
    ).rejects.toThrow("Throw ValidationException: Start date is required");
  });

  it("UTCID06 - [A] Abnormal: Throw ValidationException khi endDate bi rong", async () => {
    await expect(
      ActivityAnalyticsService.getTeamHeatmap(mockCourseId, mockTeamId, {
        startDate: "2026-03-01",
        endDate: "   ",
      })
    ).rejects.toThrow("Throw ValidationException: End date is required");
  });

  it("UTCID07 - [B] Boundary: Throw ValidationException khi startDate lon hon endDate", async () => {
    await expect(
      ActivityAnalyticsService.getTeamHeatmap(mockCourseId, mockTeamId, {
        startDate: "2026-03-10",
        endDate: "2026-03-01",
      })
    ).rejects.toThrow("Throw ValidationException: Start date cannot be after end date");
  });

  it("UTCID08 - [B] Boundary: Goi getTeamHeatmap khi startDate bang endDate (1 ngay duy nhat)", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockHeatmapResponse });

    const result = await ActivityAnalyticsService.getTeamHeatmap(mockCourseId, mockTeamId, {
      startDate: "2026-03-01",
      endDate: "2026-03-01",
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      `/api/courses/${mockCourseId}/teams/${mockTeamId}/heatmap?startDate=2026-03-01&endDate=2026-03-01`
    );
    expect(result).toEqual(mockHeatmapResponse);
  });

  it("UTCID09 - [A] Abnormal: Xu ly loi khi Backend tra ve HTTP 500 cho getTeamHeatmap", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("Internal Server Error"));

    await expect(
      ActivityAnalyticsService.getTeamHeatmap(mockCourseId, mockTeamId, {
        startDate: "2026-03-01",
        endDate: "2026-03-07",
      })
    ).rejects.toThrow("Internal Server Error");
  });

  it("UTCID10 - [N] Normal: Goi getSprintBurndown voi du lieu hop le va tra ve BurndownChartResponse", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockBurndownResponse });

    const result = await ActivityAnalyticsService.getSprintBurndown(
      mockCourseId,
      mockTeamId,
      mockSprintId
    );

    expect(apiClient.get).toHaveBeenCalledWith(
      `/api/courses/${mockCourseId}/teams/${mockTeamId}/sprints/${mockSprintId}/burndown`
    );
    expect(result).toEqual(mockBurndownResponse);
  });

  it("UTCID11 - [A] Abnormal: Throw ValidationException khi sprintId bi rong trong getSprintBurndown", async () => {
    await expect(
      ActivityAnalyticsService.getSprintBurndown(mockCourseId, mockTeamId, "")
    ).rejects.toThrow("Throw ValidationException: Sprint ID is required");
  });

  it("UTCID12 - [A] Abnormal: Xu ly loi khi Backend tra ve HTTP 404 cho getSprintBurndown", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("Sprint not found"));

    await expect(
      ActivityAnalyticsService.getSprintBurndown(mockCourseId, mockTeamId, mockSprintId)
    ).rejects.toThrow("Sprint not found");
  });

  it("UTCID13 - [B] Boundary: getSprintBurndown tra ve danh sach points rong [] khi sprint chua co task", async () => {
    const emptyPointsResponse: BurndownChartResponse = {
      ...mockBurndownResponse,
      totalScope: 0,
      points: [],
    };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: emptyPointsResponse });

    const result = await ActivityAnalyticsService.getSprintBurndown(
      mockCourseId,
      mockTeamId,
      mockSprintId
    );

    expect(result.points).toEqual([]);
    expect(result.totalScope).toBe(0);
  });
});
