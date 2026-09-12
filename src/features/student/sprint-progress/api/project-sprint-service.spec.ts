import { describe, expect, vi, beforeEach } from "vitest";
import { ProjectSprintService } from "./project-sprint-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

describe("ProjectSprintService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProjectId = "proj-123";
  const mockSprintId = "sprint-456";

  const mockSprint = {
    id: mockSprintId,
    externalSprintId: "101",
    name: "Sprint 1",
    state: "active" as const,
    goal: "Hoàn thiện MVP",
    startDate: "2026-09-01T00:00:00Z",
    endDate: "2026-09-15T00:00:00Z",
    completeDate: null,
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "12/09/2026",
      description: "Lay danh sach Sprint thanh cong",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: [mockSprint] });

      const res = await ProjectSprintService.getSprints(mockProjectId);

      expect(res).toHaveLength(1);
      expect(res[0].name).toBe("Sprint 1");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "12/09/2026",
      description: "Lay chi tiet mot Sprint thanh cong",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockSprint });

      const res = await ProjectSprintService.getSprint(mockProjectId, mockSprintId);

      expect(res.id).toBe(mockSprintId);
      expect(res.goal).toBe("Hoàn thiện MVP");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "12/09/2026",
      description: "Tao Sprint moi thanh cong",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: mockSprint });

      const res = await ProjectSprintService.createSprint(mockProjectId, {
        name: "Sprint 1",
        goal: "Hoàn thiện MVP",
      });

      expect(res.name).toBe("Sprint 1");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "12/09/2026",
      description: "Cap nhat thong tin Sprint thanh cong",
    },
    async () => {
      const updated = { ...mockSprint, name: "Sprint 1 - Cap nhat" };
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({ data: updated });

      const res = await ProjectSprintService.patchSprint(mockProjectId, mockSprintId, {
        name: "Sprint 1 - Cap nhat",
      });

      expect(res.name).toBe("Sprint 1 - Cap nhat");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "12/09/2026",
      description: "Xoa Sprint thanh cong",
    },
    async () => {
      const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValueOnce({ data: null });

      await ProjectSprintService.deleteSprint(mockProjectId, mockSprintId);

      expect(deleteSpy).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/sprints/${mockSprintId}`
      );
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "12/09/2026",
      description: "Gan task vao Sprint thanh cong",
    },
    async () => {
      const putSpy = vi.spyOn(apiClient, "put").mockResolvedValueOnce({ data: null });

      await ProjectSprintService.assignTaskToSprint(mockProjectId, "task-1", 101);

      expect(putSpy).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/tasks/task-1/sprint`,
        { sprintId: 101 }
      );
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "B",
      executedDate: "12/09/2026",
      description: "Dua task ve Backlog bang cach truyen sprintId bang null",
    },
    async () => {
      const putSpy = vi.spyOn(apiClient, "put").mockResolvedValueOnce({ data: null });

      await ProjectSprintService.assignTaskToSprint(mockProjectId, "task-1", null);

      expect(putSpy).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/tasks/task-1/sprint`,
        { sprintId: null }
      );
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "12/09/2026",
      description: "Nem ValidationException khi projectId hoac sprintId bi rong",
    },
    async () => {
      await expect(ProjectSprintService.getSprints("")).rejects.toThrow(
        "Throw ValidationException: Project ID is required"
      );

      await expect(ProjectSprintService.getSprint(mockProjectId, "")).rejects.toThrow(
        "Throw ValidationException: Sprint ID is required"
      );

      await expect(ProjectSprintService.deleteSprint("", mockSprintId)).rejects.toThrow(
        "Throw ValidationException: Project ID is required"
      );

      await expect(
        ProjectSprintService.assignTaskToSprint(mockProjectId, "", 101)
      ).rejects.toThrow("Throw ValidationException: Task ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "A",
      executedDate: "12/09/2026",
      description: "Nem ValidationException khi tao Sprint ma thieu ten",
    },
    async () => {
      await expect(
        ProjectSprintService.createSprint(mockProjectId, { name: "" })
      ).rejects.toThrow("Throw ValidationException: Sprint name is required");

      await expect(
        ProjectSprintService.createSprint(mockProjectId, { name: "   " })
      ).rejects.toThrow("Throw ValidationException: Sprint name is required");
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "A",
      executedDate: "12/09/2026",
      description: "Nem loi khi Backend tu choi do nguoi dung khong phai Team Leader",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(new Error("NOT_TEAM_LEADER"));

      await expect(
        ProjectSprintService.createSprint(mockProjectId, { name: "Sprint 2" })
      ).rejects.toThrow("NOT_TEAM_LEADER");
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "B",
      executedDate: "12/09/2026",
      description: "Trim khoang trang o cac tham so ID va ten Sprint truoc khi gui request",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: mockSprint });

      await ProjectSprintService.createSprint(`  ${mockProjectId}  `, {
        name: "   Sprint 1 Mới   ",
        goal: "   Mục tiêu   ",
      });

      expect(postSpy).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/sprints`,
        {
          name: "Sprint 1 Mới",
          goal: "Mục tiêu",
          startDate: undefined,
          endDate: undefined,
        }
      );
    }
  );
});
