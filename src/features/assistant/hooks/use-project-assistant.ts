"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProjectAssistantService } from "../api/project-assistant-service";
import type { AssistantConversation, AssistantMessage } from "../types/project-assistant";

export const PROJECT_ASSISTANT_QUERY_KEYS = {
  status: (projectId: string) => ["projectAssistant", projectId, "status"] as const,
  conversations: (projectId: string) => ["projectAssistant", projectId, "conversations"] as const,
  messages: (projectId: string, conversationId: string) =>
    ["projectAssistant", projectId, ["messages", conversationId]] as const,
};

function hasProject(projectId?: string | null): projectId is string {
  return Boolean(projectId && projectId.trim());
}

export function useAssistantStatus(projectId?: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PROJECT_ASSISTANT_QUERY_KEYS.status(projectId || ""),
    queryFn: () => ProjectAssistantService.getStatus(projectId as string),
    enabled: (options?.enabled ?? true) && hasProject(projectId),
  });
}

export function useAssistantConversations(projectId?: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PROJECT_ASSISTANT_QUERY_KEYS.conversations(projectId || ""),
    queryFn: () => ProjectAssistantService.listConversations(projectId as string),
    enabled: (options?.enabled ?? true) && hasProject(projectId),
  });
}

export function useAssistantMessages(
  projectId?: string | null,
  conversationId?: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PROJECT_ASSISTANT_QUERY_KEYS.messages(projectId || "", conversationId || ""),
    queryFn: () => ProjectAssistantService.listMessages(projectId as string, conversationId as string),
    enabled: (options?.enabled ?? true) && hasProject(projectId) && Boolean(conversationId?.trim()),
  });
}

export function useStartAssistantConversation(projectId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    retry: 0,
    mutationFn: () => ProjectAssistantService.startConversation(projectId as string),
    onSuccess: (conversation) => {
      if (!hasProject(projectId) || !conversation.id) return;
      queryClient.setQueryData<AssistantConversation[]>(
        PROJECT_ASSISTANT_QUERY_KEYS.conversations(projectId),
        (current) => {
          const list = current ?? [];
          return [conversation, ...list.filter((item) => item.id !== conversation.id)].slice(0, 20);
        }
      );
    },
  });
}

export function useAskAssistant(projectId?: string | null, conversationId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    retry: 0,
    mutationFn: (question: string) =>
      ProjectAssistantService.ask(projectId as string, conversationId as string, question),
    onSuccess: (result) => {
      if (!hasProject(projectId) || !conversationId?.trim()) return;
      queryClient.setQueryData<AssistantMessage[]>(
        PROJECT_ASSISTANT_QUERY_KEYS.messages(projectId, conversationId),
        (current) => {
          const list = current ?? [];
          const incoming = [result.question, result.answer].filter((item) => item.id);
          const incomingIds = new Set(incoming.map((item) => item.id));
          return [...list.filter((item) => !incomingIds.has(item.id)), ...incoming];
        }
      );
      void queryClient.invalidateQueries({
        queryKey: PROJECT_ASSISTANT_QUERY_KEYS.conversations(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: PROJECT_ASSISTANT_QUERY_KEYS.status(projectId),
      });
    },
  });
}

export function useAssistantFeedback(projectId?: string | null, conversationId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    retry: 0,
    mutationFn: (input: { messageId: string; helpful: boolean }) =>
      ProjectAssistantService.submitFeedback(projectId as string, input.messageId, input.helpful),
    onSuccess: (message) => {
      if (!hasProject(projectId) || !conversationId?.trim() || !message.id) return;
      queryClient.setQueryData<AssistantMessage[]>(
        PROJECT_ASSISTANT_QUERY_KEYS.messages(projectId, conversationId),
        (current) => (current ?? []).map((item) => (item.id === message.id ? message : item))
      );
    },
  });
}
