import { describe, expect, vi, beforeEach } from "vitest";
import { TaskEvidenceService } from "./task-evidence-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

function apiError(message: string, code: string, status: number) {
  const error = new Error(message) as Error & { code?: string; status?: number };
  error.code = code;
  error.status = status;
  return error;
}

describe("TaskEvidenceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTaskId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
  const mockSessionId = "4ba85f64-5717-4562-b3fc-2c963f66afb7";
  const mockLinkId = "5ca85f64-5717-4562-b3fc-2c963f66afc8";
  const mockFileId = "6da85f64-5717-4562-b3fc-2c963f66afd9";

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "09/09/2026",
      description: "POST /api/tasks/{taskId}/work-sessions/start tra ve id va status OPEN",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: { id: mockSessionId, status: "OPEN" },
      });

      const res = await TaskEvidenceService.startWorkSession(mockTaskId);

      expect(postSpy).toHaveBeenCalledWith(
        `/api/tasks/${mockTaskId}/work-sessions/start`
      );
      expect(res.id).toBe(mockSessionId);
      expect(res.status).toBe("OPEN");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "09/09/2026",
      description: "startWorkSession nem loi khi taskId rong hoac chi chua khoang trang",
    },
    async () => {
      await expect(TaskEvidenceService.startWorkSession("")).rejects.toThrow(
        "taskId is required"
      );
      await expect(TaskEvidenceService.startWorkSession("   ")).rejects.toThrow(
        "taskId is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "09/09/2026",
      description: "startWorkSession khong nuot loi khi Backend tra ve HTTP 404 Task Not Found",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(
        apiError("Task not found", "NOT_FOUND", 404)
      );

      await expect(TaskEvidenceService.startWorkSession(mockTaskId)).rejects.toThrow(
        "Task not found"
      );
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "09/09/2026",
      description: "POST /api/tasks/{taskId}/work-sessions/{sessionId}/stop tra ve status STOPPED",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: { id: mockSessionId, status: "STOPPED" },
      });

      const res = await TaskEvidenceService.stopWorkSession(mockTaskId, mockSessionId);

      expect(postSpy).toHaveBeenCalledWith(
        `/api/tasks/${mockTaskId}/work-sessions/${mockSessionId}/stop`
      );
      expect(res.status).toBe("STOPPED");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "09/09/2026",
      description: "stopWorkSession nem loi khi sessionId rong",
    },
    async () => {
      await expect(
        TaskEvidenceService.stopWorkSession(mockTaskId, "")
      ).rejects.toThrow("sessionId is required");
      await expect(
        TaskEvidenceService.stopWorkSession(mockTaskId, "   ")
      ).rejects.toThrow("sessionId is required");
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "09/09/2026",
      description: "stopWorkSession nem loi khi taskId rong",
    },
    async () => {
      await expect(
        TaskEvidenceService.stopWorkSession("", mockSessionId)
      ).rejects.toThrow("taskId is required");
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "09/09/2026",
      description: "GET /api/tasks/{taskId}/web-links tra ve danh sach lien ket hop le",
    },
    async () => {
      const mockLinks = [
        {
          id: "link-1",
          taskId: mockTaskId,
          url: "https://figma.com/file/123",
          title: "Figma UI Prototype",
          source: "WEB",
          createdByUserId: "user-1",
          createdAt: "2026-09-09T14:38:01.544Z",
        },
      ];
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: mockLinks,
      });

      const res = await TaskEvidenceService.getWebLinks(mockTaskId);

      expect(getSpy).toHaveBeenCalledWith(`/api/tasks/${mockTaskId}/web-links`);
      expect(res).toHaveLength(1);
      expect(res[0].url).toBe("https://figma.com/file/123");
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "09/09/2026",
      description: "GET web-links tra ve mang rong khi server tra ve null data",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: null });

      const res = await TaskEvidenceService.getWebLinks(mockTaskId);

      expect(res).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "A",
      executedDate: "09/09/2026",
      description: "getWebLinks nem loi khi taskId rong",
    },
    async () => {
      await expect(TaskEvidenceService.getWebLinks("")).rejects.toThrow(
        "taskId is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "N",
      executedDate: "09/09/2026",
      description: "POST /api/tasks/{taskId}/web-links them link moi thanh cong",
    },
    async () => {
      const mockCreated = {
        id: "link-created",
        taskId: mockTaskId,
        url: "https://docs.google.com/document/d/123",
        title: "SRS Specification Document",
        source: "WEB",
        createdByUserId: "user-1",
        createdAt: "2026-09-09T14:38:01.544Z",
      };
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: mockCreated,
      });

      const res = await TaskEvidenceService.addWebLink(mockTaskId, {
        url: "  https://docs.google.com/document/d/123  ",
        title: "  SRS Specification Document  ",
      });

      expect(postSpy).toHaveBeenCalledWith(
        `/api/tasks/${mockTaskId}/web-links`,
        {
          url: "https://docs.google.com/document/d/123",
          title: "SRS Specification Document",
        }
      );
      expect(res.id).toBe("link-created");
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "B",
      executedDate: "09/09/2026",
      description: "addWebLink hoat dong hop le khi khong truyen title",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          id: "link-no-title",
          taskId: mockTaskId,
          url: "https://example.com",
          title: "",
          source: "WEB",
          createdByUserId: "user-1",
          createdAt: "2026-09-09T14:38:01.544Z",
        },
      });

      const res = await TaskEvidenceService.addWebLink(mockTaskId, {
        url: "https://example.com",
      });

      expect(postSpy).toHaveBeenCalledWith(
        `/api/tasks/${mockTaskId}/web-links`,
        {
          url: "https://example.com",
          title: "",
        }
      );
      expect(res.title).toBe("");
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "A",
      executedDate: "09/09/2026",
      description: "addWebLink nem loi khi url rong hoac chi co khoang trang",
    },
    async () => {
      await expect(
        TaskEvidenceService.addWebLink(mockTaskId, { url: "" })
      ).rejects.toThrow("URL is required");
      await expect(
        TaskEvidenceService.addWebLink(mockTaskId, { url: "   " })
      ).rejects.toThrow("URL is required");
    }
  );

  fptTest(
    {
      id: "UTCID13",
      type: "A",
      executedDate: "09/09/2026",
      description: "addWebLink nem loi khi taskId rong",
    },
    async () => {
      await expect(
        TaskEvidenceService.addWebLink("", { url: "https://example.com" })
      ).rejects.toThrow("taskId is required");
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "N",
      executedDate: "09/09/2026",
      description: "GET /api/tasks/{taskId}/files tra ve danh sach files dinh kem",
    },
    async () => {
      const mockFiles = [
        {
          id: "file-1",
          taskId: mockTaskId,
          filename: "architecture-diagram.png",
          mimeType: "image/png",
          sizeBytes: 1048576,
          source: "UPLOAD",
          createdByUserId: "user-1",
          createdAt: "2026-09-09T14:38:33.906Z",
        },
      ];
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: mockFiles,
      });

      const res = await TaskEvidenceService.getFiles(mockTaskId);

      expect(getSpy).toHaveBeenCalledWith(`/api/tasks/${mockTaskId}/files`);
      expect(res).toHaveLength(1);
      expect(res[0].filename).toBe("architecture-diagram.png");
    }
  );

  fptTest(
    {
      id: "UTCID15",
      type: "B",
      executedDate: "09/09/2026",
      description: "GET files tra ve mang rong khi server tra ve data null",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: null });

      const res = await TaskEvidenceService.getFiles(mockTaskId);

      expect(res).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID16",
      type: "A",
      executedDate: "09/09/2026",
      description: "getFiles nem loi khi taskId rong",
    },
    async () => {
      await expect(TaskEvidenceService.getFiles("")).rejects.toThrow(
        "taskId is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID17",
      type: "N",
      executedDate: "09/09/2026",
      description: "POST /api/tasks/{taskId}/files upload tep tin thanh cong",
    },
    async () => {
      const mockFileResponse = {
        id: mockFileId,
        taskId: mockTaskId,
        filename: "srs.pdf",
        mimeType: "application/pdf",
        sizeBytes: 2048,
        source: "UPLOAD",
        createdByUserId: "user-1",
        createdAt: "2026-09-09T14:44:28.780Z",
      };
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: mockFileResponse,
      });

      const dummyFile = new File(["test content"], "srs.pdf", {
        type: "application/pdf",
      });
      const res = await TaskEvidenceService.uploadFile(mockTaskId, dummyFile);

      expect(postSpy).toHaveBeenCalledWith(
        `/api/tasks/${mockTaskId}/files`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      expect(res.id).toBe(mockFileId);
      expect(res.filename).toBe("srs.pdf");
    }
  );

  fptTest(
    {
      id: "UTCID18",
      type: "A",
      executedDate: "09/09/2026",
      description: "uploadFile nem loi khi file null hoac undefined",
    },
    async () => {
      await expect(
        TaskEvidenceService.uploadFile(mockTaskId, null as unknown as File)
      ).rejects.toThrow("file is required");
    }
  );

  fptTest(
    {
      id: "UTCID19",
      type: "A",
      executedDate: "09/09/2026",
      description: "uploadFile nem loi khi taskId rong",
    },
    async () => {
      const dummyFile = new File(["data"], "test.txt");
      await expect(TaskEvidenceService.uploadFile("", dummyFile)).rejects.toThrow(
        "taskId is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID20",
      type: "N",
      executedDate: "09/09/2026",
      description: "GET /api/tasks/{taskId}/files/{fileId} tai file ve duoi dang Blob",
    },
    async () => {
      const mockBlob = new Blob(["file bytes"], { type: "application/pdf" });
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: mockBlob,
      });

      const res = await TaskEvidenceService.downloadFile(mockTaskId, mockFileId);

      expect(getSpy).toHaveBeenCalledWith(
        `/api/tasks/${mockTaskId}/files/${mockFileId}`,
        {
          responseType: "blob",
        }
      );
      expect(res).toBe(mockBlob);
    }
  );

  fptTest(
    {
      id: "UTCID21",
      type: "A",
      executedDate: "09/09/2026",
      description: "downloadFile nem loi khi fileId rong",
    },
    async () => {
      await expect(
        TaskEvidenceService.downloadFile(mockTaskId, "")
      ).rejects.toThrow("fileId is required");
    }
  );

  fptTest(
    {
      id: "UTCID22",
      type: "A",
      executedDate: "09/09/2026",
      description: "downloadFile nem loi khi taskId rong",
    },
    async () => {
      await expect(
        TaskEvidenceService.downloadFile("", mockFileId)
      ).rejects.toThrow("taskId is required");
    }
  );

  fptTest(
    {
      id: "UTCID23",
      type: "N",
      executedDate: "09/09/2026",
      description: "DELETE /api/tasks/{taskId}/files/{fileId} xoa tep dinh kem",
    },
    async () => {
      const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValueOnce({
        data: null,
      });

      await TaskEvidenceService.deleteFile(mockTaskId, mockFileId);

      expect(deleteSpy).toHaveBeenCalledWith(
        `/api/tasks/${mockTaskId}/files/${mockFileId}`
      );
    }
  );

  fptTest(
    {
      id: "UTCID24",
      type: "A",
      executedDate: "09/09/2026",
      description: "deleteFile nem loi khi fileId rong",
    },
    async () => {
      await expect(
        TaskEvidenceService.deleteFile(mockTaskId, "")
      ).rejects.toThrow("fileId is required");
    }
  );

  fptTest(
    {
      id: "UTCID25",
      type: "N",
      executedDate: "09/09/2026",
      description: "DELETE /api/tasks/{taskId}/web-links/{linkId} xoa link thanh cong",
    },
    async () => {
      const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValueOnce({
        data: null,
      });

      await TaskEvidenceService.deleteWebLink(mockTaskId, mockLinkId);

      expect(deleteSpy).toHaveBeenCalledWith(
        `/api/tasks/${mockTaskId}/web-links/${mockLinkId}`
      );
    }
  );

  fptTest(
    {
      id: "UTCID26",
      type: "A",
      executedDate: "09/09/2026",
      description: "deleteWebLink nem loi khi linkId rong",
    },
    async () => {
      await expect(
        TaskEvidenceService.deleteWebLink(mockTaskId, "")
      ).rejects.toThrow("linkId is required");
    }
  );

  fptTest(
    {
      id: "UTCID27",
      type: "A",
      executedDate: "09/09/2026",
      description: "deleteWebLink nem loi khi taskId rong",
    },
    async () => {
      await expect(
        TaskEvidenceService.deleteWebLink("", mockLinkId)
      ).rejects.toThrow("taskId is required");
    }
  );

  fptTest(
    {
      id: "UTCID28",
      type: "N",
      executedDate: "09/09/2026",
      description: "POST /api/tasks/{taskId}/contribution-confirmations tao bao chung dong gop",
    },
    async () => {
      const mockConfirmation = {
        id: "conf-1",
        evidenceHash: "hash-abc123xyz",
        state: "CONFIRMED",
      };
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: mockConfirmation,
      });

      const res = await TaskEvidenceService.confirmContribution(mockTaskId, {
        commitShas: ["c1a2b3c"],
        pullRequests: ["https://github.com/org/repo/pull/1"],
      });

      expect(postSpy).toHaveBeenCalledWith(
        `/api/tasks/${mockTaskId}/contribution-confirmations`,
        {
          commitShas: ["c1a2b3c"],
          pullRequests: ["https://github.com/org/repo/pull/1"],
        }
      );
      expect(res.id).toBe("conf-1");
      expect(res.evidenceHash).toBe("hash-abc123xyz");
      expect(res.state).toBe("CONFIRMED");
    }
  );

  fptTest(
    {
      id: "UTCID29",
      type: "B",
      executedDate: "09/09/2026",
      description: "confirmContribution mac dinh commitShas va pullRequests mang rong khi khong truyen",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          id: "conf-empty",
          evidenceHash: "hash-empty",
          state: "CONFIRMED",
        },
      });

      const res = await TaskEvidenceService.confirmContribution(mockTaskId, {});

      expect(postSpy).toHaveBeenCalledWith(
        `/api/tasks/${mockTaskId}/contribution-confirmations`,
        {
          commitShas: [],
          pullRequests: [],
        }
      );
      expect(res.state).toBe("CONFIRMED");
    }
  );

  fptTest(
    {
      id: "UTCID30",
      type: "A",
      executedDate: "09/09/2026",
      description: "confirmContribution nem loi khi taskId rong",
    },
    async () => {
      await expect(
        TaskEvidenceService.confirmContribution("", {})
      ).rejects.toThrow("taskId is required");
    }
  );
});
