import { describe, expect, vi, beforeEach } from "vitest";
import { ProjectAssistantService } from "@/features/assistant/api/project-assistant-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const projectId = "11111111-1111-1111-1111-111111111111";
const conversationId = "22222222-2222-2222-2222-222222222222";
const messageId = "33333333-3333-3333-3333-333333333333";
const date = "03/10/2026";

describe("ProjectAssistantService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  fptTest({ id: "UTCID01", type: "N", executedDate: date, description: "getStatus tra ve nguon khoa va luot con lai" }, async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { enabled: true, aiConfigured: true, keySource: "course", dailyLimit: 20, usedToday: 1, remainingToday: 19 },
    });
    const result = await ProjectAssistantService.getStatus(` ${projectId} `);
    expect(apiClient.get).toHaveBeenCalledWith(`/api/projects/${projectId}/assistant/status`);
    expect(result.keySource).toBe("COURSE");
    expect(result.remainingToday).toBe(19);
  });

  fptTest({ id: "UTCID02", type: "N", executedDate: date, description: "listConversations goi dung endpoint lich su" }, async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [{ id: conversationId, projectId, title: "Sprint", createdAt: "2026-10-03T00:00:00Z", lastMessageAt: "2026-10-03T01:00:00Z" }],
    });
    const result = await ProjectAssistantService.listConversations(projectId);
    expect(apiClient.get).toHaveBeenCalledWith(`/api/projects/${projectId}/assistant/conversations`);
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Sprint");
  });

  fptTest({ id: "UTCID03", type: "N", executedDate: date, description: "startConversation tao cuoc tro chuyen moi" }, async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { id: conversationId, projectId, title: "Moi", createdAt: "2026-10-03T00:00:00Z", lastMessageAt: null },
    });
    const result = await ProjectAssistantService.startConversation(projectId);
    expect(apiClient.post).toHaveBeenCalledWith(`/api/projects/${projectId}/assistant/conversations`);
    expect(result.id).toBe(conversationId);
  });

  fptTest({ id: "UTCID04", type: "N", executedDate: date, description: "listMessages giu thu tu backend tra ve" }, async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [
        { id: "q", conversationId, role: "user", content: "Hoi", createdAt: "2026-10-03T00:00:00Z" },
        { id: "a", conversationId, role: "assistant", content: "Tra loi", createdAt: "2026-10-03T00:01:00Z" },
      ],
    });
    const result = await ProjectAssistantService.listMessages(projectId, conversationId);
    expect(result.map((item) => item.role)).toEqual(["USER", "ASSISTANT"]);
  });

  fptTest({ id: "UTCID05", type: "N", executedDate: date, description: "ask gui dung question va timeout 60 giay" }, async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        question: { id: "q", conversationId, role: "USER", content: "Tien do?" },
        answer: { id: "a", conversationId, role: "ASSISTANT", content: "On" },
      },
    });
    const result = await ProjectAssistantService.ask(projectId, conversationId, "Tien do?");
    expect(apiClient.post).toHaveBeenCalledWith(
      `/api/projects/${projectId}/assistant/conversations/${conversationId}/messages`,
      { question: "Tien do?" },
      { timeout: 60000 }
    );
    expect(result.question.content).toBe("Tien do?");
    expect(result.answer.role).toBe("ASSISTANT");
  });

  fptTest({ id: "UTCID06", type: "N", executedDate: date, description: "submitFeedback chi gui helpful" }, async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { id: messageId, conversationId, role: "ASSISTANT", content: "On", feedback: { helpful: true, at: "2026-10-03T00:00:00Z" } },
    });
    const result = await ProjectAssistantService.submitFeedback(projectId, messageId, true);
    expect(apiClient.post).toHaveBeenCalledWith(
      `/api/projects/${projectId}/assistant/messages/${messageId}/feedback`,
      { helpful: true }
    );
    expect(result.feedback?.helpful).toBe(true);
  });

  fptTest({ id: "UTCID07", type: "A", executedDate: date, description: "projectId rong thi khong goi API" }, async () => {
    await expect(ProjectAssistantService.getStatus("  ")).rejects.toThrow(/Project ID is required/);
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  fptTest({ id: "UTCID08", type: "A", executedDate: date, description: "conversationId rong khi lay tin nhan" }, async () => {
    await expect(ProjectAssistantService.listMessages(projectId, "")).rejects.toThrow(/Conversation ID is required/);
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  fptTest({ id: "UTCID09", type: "A", executedDate: date, description: "conversationId rong khi hoi" }, async () => {
    await expect(ProjectAssistantService.ask(projectId, " ", "Hoi")).rejects.toThrow(/Conversation ID is required/);
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  fptTest({ id: "UTCID10", type: "A", executedDate: date, description: "messageId rong khi gui feedback" }, async () => {
    await expect(ProjectAssistantService.submitFeedback(projectId, "", false)).rejects.toThrow(/Message ID is required/);
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  fptTest({ id: "UTCID11", type: "A", executedDate: date, description: "loi 400 duoc nem lai" }, async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(Object.assign(new Error("bad"), { status: 400, code: "ASSISTANT_INPUT_INVALID" }));
    await expect(ProjectAssistantService.ask(projectId, conversationId, "x")).rejects.toMatchObject({ status: 400 });
  });

  fptTest({ id: "UTCID12", type: "A", executedDate: date, description: "loi 401 duoc nem lai" }, async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(Object.assign(new Error("unauthorized"), { status: 401 }));
    await expect(ProjectAssistantService.getStatus(projectId)).rejects.toMatchObject({ status: 401 });
  });

  fptTest({ id: "UTCID13", type: "A", executedDate: date, description: "loi 403 duoc nem lai" }, async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(Object.assign(new Error("forbidden"), { status: 403 }));
    await expect(ProjectAssistantService.listConversations(projectId)).rejects.toMatchObject({ status: 403 });
  });

  fptTest({ id: "UTCID14", type: "A", executedDate: date, description: "loi 404 duoc nem lai" }, async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(Object.assign(new Error("missing"), { status: 404, code: "ASSISTANT_CONVERSATION_NOT_FOUND" }));
    await expect(ProjectAssistantService.listMessages(projectId, conversationId)).rejects.toMatchObject({ code: "ASSISTANT_CONVERSATION_NOT_FOUND" });
  });

  fptTest({ id: "UTCID15", type: "A", executedDate: date, description: "loi 429 duoc nem lai" }, async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(Object.assign(new Error("limit"), { status: 429, code: "ASSISTANT_RATE_LIMITED" }));
    await expect(ProjectAssistantService.ask(projectId, conversationId, "x")).rejects.toMatchObject({ status: 429 });
  });

  fptTest({ id: "UTCID16", type: "A", executedDate: date, description: "loi 503 duoc nem lai" }, async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(Object.assign(new Error("off"), { status: 503, code: "ASSISTANT_DISABLED" }));
    await expect(ProjectAssistantService.getStatus(projectId)).rejects.toMatchObject({ status: 503 });
  });

  fptTest({ id: "UTCID17", type: "B", executedDate: date, description: "danh sach cuoc tro chuyen rong" }, async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });
    await expect(ProjectAssistantService.listConversations(projectId)).resolves.toEqual([]);
  });

  fptTest({ id: "UTCID18", type: "B", executedDate: date, description: "danh sach tin nhan rong" }, async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });
    await expect(ProjectAssistantService.listMessages(projectId, conversationId)).resolves.toEqual([]);
  });

  fptTest({ id: "UTCID19", type: "B", executedDate: date, description: "cat danh sach con 20 cuoc tro chuyen" }, async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: Array.from({ length: 21 }, (_, index) => ({ id: `c-${index}`, projectId, title: `C${index}` })),
    });
    const result = await ProjectAssistantService.listConversations(projectId);
    expect(result).toHaveLength(20);
    expect(result[0]?.id).toBe("c-0");
  });

  fptTest({ id: "UTCID20", type: "B", executedDate: date, description: "keySource la khong thi thanh UNKNOWN" }, async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { enabled: false, keySource: "NEW_SOURCE", remainingToday: 0, dailyLimit: 0 } });
    const result = await ProjectAssistantService.getStatus(projectId);
    expect(result.keySource).toBe("UNKNOWN");
    expect(result.remainingToday).toBe(0);
  });

  fptTest({ id: "UTCID21", type: "A", executedDate: date, description: "loi mang khi hoi duoc nem lai" }, async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(Object.assign(new Error("Network Error"), { code: "ERR_NETWORK" }));
    await expect(ProjectAssistantService.ask(projectId, conversationId, "x")).rejects.toMatchObject({ code: "ERR_NETWORK" });
  });

  fptTest({ id: "UTCID23", type: "B", executedDate: date, description: "id co ky tu dac biet duoc encode" }, async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { enabled: true, keySource: "COURSE" } });
    await ProjectAssistantService.getStatus("project/1");
    expect(apiClient.get).toHaveBeenCalledWith("/api/projects/project%2F1/assistant/status");
  });

  fptTest({ id: "UTCID22", type: "B", executedDate: date, description: "feedback helpful false van chi gui mot field" }, async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { id: messageId, role: "ASSISTANT", content: "On", feedback: { helpful: false } },
    });
    await ProjectAssistantService.submitFeedback(projectId, messageId, false);
    expect(apiClient.post).toHaveBeenCalledWith(expect.any(String), { helpful: false });
  });
});
