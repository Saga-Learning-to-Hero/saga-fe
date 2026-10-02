import { describe, it, expect, vi, beforeEach } from "vitest";
import { delayCasesApi } from "./delay-cases-api";
import { apiClient } from "@/lib/axios";

vi.mock("@/lib/axios", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("delayCasesApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDelayCases", () => {
    it("UTCID01 - [N] Normal: Lay danh sach ho so hop le", async () => {
      const mockData = [{ id: "1", taskId: "task1" }];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: mockData } });
      const result = await delayCasesApi.getDelayCases("proj1", { taskId: "task1" });
      expect(result).toEqual(mockData);
      expect(apiClient.get).toHaveBeenCalledWith("/projects/proj1/delay-cases", {
        params: expect.any(URLSearchParams),
      });
    });

    it("UTCID02 - [A] Abnormal: Throw loi khi lay danh sach that bai", async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("Lỗi API"));
      await expect(delayCasesApi.getDelayCases("proj1")).rejects.toThrow();
    });
  });

  describe("getDelayCaseDetails", () => {
    it("UTCID03 - [N] Normal: Lay chi tiet ho so hop le", async () => {
      const mockData = { id: "1", taskId: "task1" };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: mockData } });
      const result = await delayCasesApi.getDelayCaseDetails("proj1", "1");
      expect(result).toEqual(mockData);
    });
  });

  describe("getLecturerQueue", () => {
    it("UTCID04 - [N] Normal: Lay hang cho giang vien hop le", async () => {
      const mockData = [{ id: "1" }];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: mockData } });
      const result = await delayCasesApi.getLecturerQueue();
      expect(result).toEqual(mockData);
    });
  });

  describe("explainDelayCase", () => {
    it("UTCID05 - [N] Normal: Sinh vien giai trinh hop le", async () => {
      const mockData = { id: "1" };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { data: mockData } });
      const result = await delayCasesApi.explainDelayCase("proj1", "1", { category: "TECHNICAL_ISSUE" });
      expect(result).toEqual(mockData);
    });

    it("UTCID06 - [B] Boundary: Sinh vien giai trinh kem note va evidence", async () => {
      const mockData = { id: "1" };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { data: mockData } });
      const result = await delayCasesApi.explainDelayCase("proj1", "1", { category: "TECHNICAL_ISSUE", note: "Lỗi", evidenceUrl: "http" });
      expect(result).toEqual(mockData);
    });
  });

  describe("leaderReview", () => {
    it("UTCID07 - [N] Normal: Truong nhom review hop le", async () => {
      const mockData = { id: "1" };
      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: { data: mockData } });
      const result = await delayCasesApi.leaderReview("proj1", "1", { decision: "APPROVED" });
      expect(result).toEqual(mockData);
    });
  });

  describe("lecturerReview", () => {
    it("UTCID08 - [N] Normal: Giang vien review hop le", async () => {
      const mockData = { id: "1" };
      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: { data: mockData } });
      const result = await delayCasesApi.lecturerReview("proj1", "1", { outcome: "PENALIZED" });
      expect(result).toEqual(mockData);
    });
  });

  describe("reopenDelayCase", () => {
    it("UTCID09 - [N] Normal: Giang vien mo lai ho so hop le", async () => {
      const mockData = { id: "1" };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { data: mockData } });
      const result = await delayCasesApi.reopenDelayCase("proj1", "1");
      expect(result).toEqual(mockData);
    });
  });

  describe("getOnTimeRate", () => {
    it("UTCID10 - [N] Normal: Lay ty le dung han du an hop le", async () => {
      const mockData = { onTimeTasks: 5, lateTasks: 1, onTimeRate: 83.33 };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: mockData } });
      const result = await delayCasesApi.getOnTimeRate("proj1");
      expect(result).toEqual(mockData);
    });

    it("UTCID11 - [B] Boundary: Du an chua co task nao", async () => {
      const mockData = { onTimeTasks: 0, lateTasks: 0, onTimeRate: 0 };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: mockData } });
      const result = await delayCasesApi.getOnTimeRate("proj2");
      expect(result).toEqual(mockData);
    });
  });
});
