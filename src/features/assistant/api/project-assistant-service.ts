import { apiClient } from "@/lib/axios";
import { requireProjectId } from "@/lib/api-error";
import {
  mapAskResult,
  mapConversation,
  mapConversations,
  mapMessage,
  mapMessages,
  mapStatus,
  type AssistantAskResult,
  type AssistantConversation,
  type AssistantMessage,
  type AssistantStatus,
} from "../types/project-assistant";

const ASK_TIMEOUT_MS = 60_000;

function requireResourceId(value: string, label: string): string {
  if (!value || !value.trim()) {
    throw new Error(`Throw ValidationException: ${label} is required`);
  }
  return value.trim();
}

function assistantPath(projectId: string, suffix = ""): string {
  return `/api/projects/${encodeURIComponent(projectId)}/assistant${suffix}`;
}

export class ProjectAssistantService {
  static async getStatus(projectId: string): Promise<AssistantStatus> {
    const id = requireProjectId(projectId);
    const response = await apiClient.get(assistantPath(id, "/status"));
    return mapStatus(response.data);
  }

  static async listConversations(projectId: string): Promise<AssistantConversation[]> {
    const id = requireProjectId(projectId);
    const response = await apiClient.get(assistantPath(id, "/conversations"));
    return mapConversations(response.data);
  }

  static async startConversation(projectId: string): Promise<AssistantConversation> {
    const id = requireProjectId(projectId);
    const response = await apiClient.post(assistantPath(id, "/conversations"));
    return mapConversation(response.data);
  }

  static async listMessages(projectId: string, conversationId: string): Promise<AssistantMessage[]> {
    const id = requireProjectId(projectId);
    const conversation = requireResourceId(conversationId, "Conversation ID");
    const response = await apiClient.get(
      assistantPath(id, `/conversations/${encodeURIComponent(conversation)}/messages`)
    );
    return mapMessages(response.data);
  }

  static async ask(
    projectId: string,
    conversationId: string,
    question: string
  ): Promise<AssistantAskResult> {
    const id = requireProjectId(projectId);
    const conversation = requireResourceId(conversationId, "Conversation ID");
    const response = await apiClient.post(
      assistantPath(id, `/conversations/${encodeURIComponent(conversation)}/messages`),
      { question },
      { timeout: ASK_TIMEOUT_MS }
    );
    return mapAskResult(response.data);
  }

  static async submitFeedback(
    projectId: string,
    messageId: string,
    helpful: boolean
  ): Promise<AssistantMessage> {
    const id = requireProjectId(projectId);
    const message = requireResourceId(messageId, "Message ID");
    const response = await apiClient.post(
      assistantPath(id, `/messages/${encodeURIComponent(message)}/feedback`),
      { helpful }
    );
    return mapMessage(response.data);
  }
}
