"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  subscribeIntegrationResult,
  type IntegrationBroadcastMessage,
  type IntegrationProvider,
  type IntegrationScope,
} from "../lib/integration-broadcast";
import { USER_INTEGRATIONS_QUERY_KEY } from "./useUserIntegrations";
import { showSuccessToast, showErrorToast } from "@/lib/api-error";

interface UseIntegrationPopupFlowOptions {
  onSuccess?: (message: IntegrationBroadcastMessage) => void;
  onError?: (message: IntegrationBroadcastMessage) => void;
}

export function useIntegrationPopupFlow(options: UseIntegrationPopupFlowOptions = {}) {
  const { onSuccess, onError } = options;
  const queryClient = useQueryClient();

  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [provider, setProvider] = useState<IntegrationProvider>("jira");
  const [scope, setScope] = useState<IntegrationScope>("personal");
  const [authUrl, setAuthUrl] = useState<string>("");
  const [projectId, setProjectId] = useState<string | undefined>(undefined);

  const newWindowRef = useRef<Window | null>(null);
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopWaiting = useCallback(() => {
    setIsWaiting(false);
    setAuthUrl("");
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  const handleSuccessResult = useCallback(
    (msg: IntegrationBroadcastMessage) => {
      stopWaiting();

      // Cập nhật lại query cache
      void queryClient.invalidateQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
      void queryClient.refetchQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });

      if (msg.projectId) {
        void queryClient.invalidateQueries({ queryKey: ["project", msg.projectId] });
        void queryClient.invalidateQueries({ queryKey: ["jira-sources", msg.projectId] });
      }

      showSuccessToast(
        msg.provider === "jira"
          ? "Liên kết tài khoản Jira Atlassian thành công!"
          : "Liên kết tài khoản GitHub thành công!"
      );

      onSuccess?.(msg);
    },
    [onSuccess, queryClient, stopWaiting]
  );

  const handleErrorResult = useCallback(
    (msg: IntegrationBroadcastMessage) => {
      stopWaiting();
      showErrorToast(msg.message || "Xác thực tài khoản thất bại. Vui lòng thử lại.");
      onError?.(msg);
    },
    [onError, stopWaiting]
  );

  // Mở tab mới và bật popup chờ
  const startFlow = useCallback(
    (params: {
      provider: IntegrationProvider;
      scope?: IntegrationScope;
      authorizationUrl: string;
      projectId?: string;
    }) => {
      const targetScope = params.scope || "personal";
      setProvider(params.provider);
      setScope(targetScope);
      setAuthUrl(params.authorizationUrl);
      setProjectId(params.projectId);
      setIsWaiting(true);

      if (typeof window !== "undefined") {
        // Mở trong tab/popup mới
        const newWin = window.open(params.authorizationUrl, "_blank");
        newWindowRef.current = newWin;

        // Fallback polling mỗi 2.5s phòng khi browser chặn broadcast hoặc user đóng tab bằng tay
        if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = setInterval(async () => {
          if (targetScope === "personal") {
            try {
              await queryClient.refetchQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
            } catch {
              // Ignore polling errors
            }
          }
        }, 2500);
      }
    },
    [queryClient]
  );

  const retryOpenTab = useCallback(() => {
    if (authUrl && typeof window !== "undefined") {
      const newWin = window.open(authUrl, "_blank");
      newWindowRef.current = newWin;
    }
  }, [authUrl]);

  const checkNow = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
    await queryClient.refetchQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
    if (projectId) {
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["jira-sources", projectId] });
    }
    stopWaiting();
    showSuccessToast("Đã làm mới dữ liệu liên kết tích hợp!");
  }, [projectId, queryClient, stopWaiting]);

  // Lắng nghe kết quả từ BroadcastChannel / window.opener
  useEffect(() => {
    if (!isWaiting) return;

    const unsubscribe = subscribeIntegrationResult((msg) => {
      if (msg.provider === provider && msg.scope === scope) {
        if (msg.status === "success") {
          handleSuccessResult(msg);
        } else {
          handleErrorResult(msg);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [handleErrorResult, handleSuccessResult, isWaiting, provider, scope]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, []);

  return {
    isWaiting,
    provider,
    scope,
    authUrl,
    projectId,
    startFlow,
    cancelFlow: stopWaiting,
    retryOpenTab,
    checkNow,
  };
}
