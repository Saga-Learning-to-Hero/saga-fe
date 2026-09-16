import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProjectGraphService } from "./project-graph-service";
import { apiClient } from "@/lib/axios";

vi.mock("@/lib/axios", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("ProjectGraphService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProjectOverviewGraph", () => {
    it("UTCID01 - [N] Normal: Goi thanh cong endpoint overview khong co sprintId", async () => {
      const mockData = { nodes: [], edges: [] };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await ProjectGraphService.getProjectOverviewGraph("p-123");
      expect(apiClient.get).toHaveBeenCalledWith("/api/projects/p-123/graph/overview", { signal: undefined });
      expect(result).toEqual(mockData);
    });

    it("UTCID02 - [N] Normal: Goi thanh cong endpoint overview co sprintId va signal", async () => {
      const mockData = { nodes: [], edges: [] };
      const controller = new AbortController();
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await ProjectGraphService.getProjectOverviewGraph("p 123", "sp 456", controller.signal);
      expect(apiClient.get).toHaveBeenCalledWith("/api/projects/p%20123/graph/overview?sprintId=sp%20456", {
        signal: controller.signal,
      });
      expect(result).toEqual(mockData);
    });

    it("UTCID03 - [A] Abnormal: Nem loi khi projectId bi rong", async () => {
      await expect(ProjectGraphService.getProjectOverviewGraph("   ")).rejects.toThrow("projectId is required");
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe("getStudentContributionGraph", () => {
    it("UTCID04 - [N] Normal: Strip prefix student: va goi dung endpoint contribution", async () => {
      const mockData = { nodes: [], edges: [] };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await ProjectGraphService.getStudentContributionGraph("p-1", "student:stu-99", "sp-1");
      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/projects/p-1/students/stu-99/graph/contribution?sprintId=sp-1",
        { signal: undefined }
      );
      expect(result).toEqual(mockData);
    });

    it("UTCID05 - [A] Abnormal: Nem loi khi studentId bi rong", async () => {
      await expect(ProjectGraphService.getStudentContributionGraph("p-1", "   ")).rejects.toThrow(
        "studentId is required"
      );
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe("getSprintActivityGraph", () => {
    it("UTCID06 - [N] Normal: Goi dung endpoint activity voi sprintId bat buoc", async () => {
      const mockData = { nodes: [], edges: [] };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await ProjectGraphService.getSprintActivityGraph("p-1", "sp-99");
      expect(apiClient.get).toHaveBeenCalledWith("/api/projects/p-1/sprints/sp-99/graph/activity", {
        signal: undefined,
      });
      expect(result).toEqual(mockData);
    });

    it("UTCID07 - [A] Abnormal: Nem loi khi thieu sprintId cho activity", async () => {
      await expect(ProjectGraphService.getSprintActivityGraph("p-1", "")).rejects.toThrow("sprintId is required");
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe("getProjectAttributionGraph", () => {
    it("UTCID08 - [N] Normal: Goi dung endpoint attribution voi sprintId", async () => {
      const mockData = { nodes: [], edges: [] };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await ProjectGraphService.getProjectAttributionGraph("p-1", "sp-1");
      expect(apiClient.get).toHaveBeenCalledWith("/api/projects/p-1/graph/attribution?sprintId=sp-1", {
        signal: undefined,
      });
      expect(result).toEqual(mockData);
    });

    it("UTCID09 - [B] Boundary: Goi attribution voi sprintId la chuoi khoang trang thi khong them query", async () => {
      const mockData = { nodes: [], edges: [] };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await ProjectGraphService.getProjectAttributionGraph("p-1", "   ");
      expect(apiClient.get).toHaveBeenCalledWith("/api/projects/p-1/graph/attribution", { signal: undefined });
      expect(result).toEqual(mockData);
    });
  });

  describe("getSprintPeerReviewGraph", () => {
    it("UTCID10 - [N] Normal: Goi dung endpoint peer-review voi sprintId bat buoc", async () => {
      const mockData = { nodes: [], edges: [] };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await ProjectGraphService.getSprintPeerReviewGraph("p-1", "sp-1");
      expect(apiClient.get).toHaveBeenCalledWith("/api/projects/p-1/sprints/sp-1/graph/peer-review", {
        signal: undefined,
      });
      expect(result).toEqual(mockData);
    });

    it("UTCID11 - [A] Abnormal: Nem loi khi thieu sprintId cho peer-review", async () => {
      await expect(ProjectGraphService.getSprintPeerReviewGraph("p-1", "")).rejects.toThrow("sprintId is required");
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe("Subgraph Filter Params", () => {
    it("UTCID12 - [N] Normal: Overview nhan GraphSubgraphFilterParams va serialize day du cac query params", async () => {
      const mockData = {
        nodes: [],
        edges: [],
        meta: {
          revision: "4",
          totalNodes: 850,
          totalEdges: 1200,
          returnedNodes: 200,
          returnedEdges: 310,
          truncated: true,
          nextCursor: "4:task:123",
        },
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await ProjectGraphService.getProjectOverviewGraph("p-100", {
        sprintId: "sp-1",
        focusNodeId: "task:123",
        depth: 2,
        nodeTypes: ["STUDENT", "TASK", "COMMIT"],
        edgeTypes: ["ASSIGNED_TO", "EVIDENCED_BY"],
        anomaliesOnly: true,
        maxNodes: 200,
        cursor: "4:task:123",
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/projects/p-100/graph/overview?sprintId=sp-1&focusNodeId=task%3A123&depth=2&nodeTypes=STUDENT%2CTASK%2CCOMMIT&edgeTypes=ASSIGNED_TO%2CEVIDENCED_BY&anomaliesOnly=true&maxNodes=200&cursor=4%3Atask%3A123",
        { signal: undefined }
      );
      expect(result.meta?.truncated).toBe(true);
      expect(result.meta?.returnedNodes).toBe(200);
    });

    it("UTCID13 - [N] Normal: Attribution voi anomaliesOnly=true tao query param chuan xac", async () => {
      const mockData = { nodes: [], edges: [] };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await ProjectGraphService.getProjectAttributionGraph("p-1", {
        sprintId: "sp-2",
        anomaliesOnly: true,
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/projects/p-1/graph/attribution?sprintId=sp-2&anomaliesOnly=true",
        { signal: undefined }
      );
      expect(result).toEqual(mockData);
    });

    it("UTCID14 - [N] Normal: Activity voi GraphSubgraphFilterParams tren ca sprintId va depth/nodeTypes", async () => {
      const mockData = { nodes: [], edges: [] };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await ProjectGraphService.getSprintActivityGraph("p-1", {
        sprintId: "sp-9",
        depth: 1,
        nodeTypes: "TASK,COMMIT,STUDENT",
        edgeTypes: "ASSIGNED_TO,EVIDENCED_BY",
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/projects/p-1/sprints/sp-9/graph/activity?depth=1&nodeTypes=TASK%2CCOMMIT%2CSTUDENT&edgeTypes=ASSIGNED_TO%2CEVIDENCED_BY",
        { signal: undefined }
      );
      expect(result).toEqual(mockData);
    });

    it("UTCID15 - [B] Boundary: EdgeTypes va NodeTypes chuoi rong hoac boolean false khong sinh query thua", async () => {
      const mockData = { nodes: [], edges: [] };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await ProjectGraphService.getProjectOverviewGraph("p-1", {
        anomaliesOnly: false,
        nodeTypes: "",
        edgeTypes: [],
      });

      expect(apiClient.get).toHaveBeenCalledWith("/api/projects/p-1/graph/overview", { signal: undefined });
      expect(result).toEqual(mockData);
    });

    it("UTCID16 - [N] Normal: includeCommits=true duoc serialize thanh query param chuan tren overview", async () => {
      const mockData = { nodes: [], edges: [] };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await ProjectGraphService.getProjectOverviewGraph("p-1", {
        includeCommits: true,
      });

      expect(apiClient.get).toHaveBeenCalledWith("/api/projects/p-1/graph/overview?includeCommits=true", {
        signal: undefined,
      });
      expect(result).toEqual(mockData);
    });

    it("UTCID17 - [N] Normal: continuationToken duoc chuyen thanh query cursor khi cursor bi rong", async () => {
      const mockData = { nodes: [], edges: [] };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await ProjectGraphService.getProjectOverviewGraph("p-1", {
        continuationToken: "rev-5:task:456",
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/projects/p-1/graph/overview?cursor=rev-5%3Atask%3A456",
        { signal: undefined }
      );
      expect(result).toEqual(mockData);
    });

    it("UTCID18 - [B] Boundary: includeCommits=false van sinh query param includeCommits=false tuong minh", async () => {
      const mockData = { nodes: [], edges: [] };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await ProjectGraphService.getProjectOverviewGraph("p-1", {
        includeCommits: false,
      });

      expect(apiClient.get).toHaveBeenCalledWith("/api/projects/p-1/graph/overview?includeCommits=false", {
        signal: undefined,
      });
      expect(result).toEqual(mockData);
    });
  });
});
