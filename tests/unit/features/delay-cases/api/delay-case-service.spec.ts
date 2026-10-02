import { describe, expect, vi, beforeEach } from "vitest";
import { DelayCaseService } from "@/features/delay-cases/api/delay-case-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios", () => ({
  apiClient: { get: vi.fn() },
}));

const projectId = "11111111-1111-1111-1111-111111111111";
const caseId = "22222222-2222-2222-2222-222222222222";
const date = "03/10/2026";

describe("DelayCaseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  fptTest({ id: "UTCID01", type: "N", executedDate: date, description: "lay ho so tre han theo project va case" }, async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        id: caseId,
        projectId,
        status: "OPEN",
        task: { id: "task-1", externalKey: "SAGA-1", title: "Lam API" },
        student: { fullName: "An", studentCode: "SE1" },
        evidenceUrl: "https://example.com/evidence",
      },
    });
    const result = await DelayCaseService.getDelayCase(` ${projectId} `, ` ${caseId} `);
    expect(apiClient.get).toHaveBeenCalledWith(`/api/projects/${projectId}/delay-cases/${caseId}`);
    expect(result.task?.externalKey).toBe("SAGA-1");
    expect(result.evidenceUrl).toBe("https://example.com/evidence");
  });

  fptTest({ id: "UTCID02", type: "A", executedDate: date, description: "thieu projectId thi khong goi API" }, async () => {
    await expect(DelayCaseService.getDelayCase("", caseId)).rejects.toThrow(/Project ID is required/);
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  fptTest({ id: "UTCID03", type: "A", executedDate: date, description: "thieu caseId thi khong goi API" }, async () => {
    await expect(DelayCaseService.getDelayCase(projectId, " ")).rejects.toThrow(/Delay case ID is required/);
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  fptTest({ id: "UTCID04", type: "A", executedDate: date, description: "loi 403 duoc nem lai" }, async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(Object.assign(new Error("forbidden"), { status: 403 }));
    await expect(DelayCaseService.getDelayCase(projectId, caseId)).rejects.toMatchObject({ status: 403 });
  });

  fptTest({ id: "UTCID05", type: "A", executedDate: date, description: "loi 404 duoc nem lai" }, async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(Object.assign(new Error("missing"), { status: 404 }));
    await expect(DelayCaseService.getDelayCase(projectId, caseId)).rejects.toMatchObject({ status: 404 });
  });

  fptTest({ id: "UTCID06", type: "A", executedDate: date, description: "loi 500 duoc nem lai" }, async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(Object.assign(new Error("boom"), { status: 500 }));
    await expect(DelayCaseService.getDelayCase(projectId, caseId)).rejects.toMatchObject({ status: 500 });
  });

  fptTest({ id: "UTCID07", type: "B", executedDate: date, description: "thieu object long van map duoc" }, async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { id: caseId, task: null, signals: null } });
    const result = await DelayCaseService.getDelayCase(projectId, caseId);
    expect(result.task).toBeNull();
    expect(result.signals).toBeNull();
    expect(result.context).toBeNull();
  });
});
