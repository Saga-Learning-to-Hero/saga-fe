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

const POPUP_WIDTH = 620;
const POPUP_HEIGHT = 760;

function getPopupFeatures(): string {
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - POPUP_WIDTH) / 2));
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2));
  return [
    "popup=yes",
    `width=${POPUP_WIDTH}`,
    `height=${POPUP_HEIGHT}`,
    `left=${left}`,
    `top=${top}`,
    "resizable=yes",
    "scrollbars=yes",
  ].join(",");
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
  const lastHandledEventRef = useRef<string>("");

  const stopWaiting = useCallback((closePopup = false) => {
    setIsWaiting(false);
    setAuthUrl("");
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    if (closePopup && newWindowRef.current && !newWindowRef.current.closed) {
      newWindowRef.current.close();
    }
    newWindowRef.current = null;
  }, []);

  const preparePopup = useCallback((targetProvider: IntegrationProvider): boolean => {
    if (typeof window === "undefined") return false;

    if (newWindowRef.current && !newWindowRef.current.closed) {
      newWindowRef.current.close();
    }

    const popupName = `saga_personal_${targetProvider}_oauth`;
    const waitingUrl = `/integrations/popup?provider=${encodeURIComponent(targetProvider)}`;
    const popup = window.open(waitingUrl, popupName, getPopupFeatures());
    if (!popup) {
      showErrorToast("Trình duyệt đang chặn cửa sổ xác thực. Vui lòng cho phép popup rồi thử lại.");
      return false;
    }

    popup.focus();
    newWindowRef.current = popup;
    return true;
  }, []);

  const handleSuccessResult = useCallback(
    async (msg: IntegrationBroadcastMessage) => {
      stopWaiting(true);

      // Cập nhật lại query cache
      await queryClient.invalidateQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });

      if (msg.projectId) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["project", msg.projectId] }),
          queryClient.invalidateQueries({ queryKey: ["jira-sources", msg.projectId] }),
        ]);
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
      stopWaiting(false);
      showErrorToast(msg.message || "Xác thực tài khoản thất bại. Vui lòng thử lại.");
      onError?.(msg);
    },
    [onError, stopWaiting]
  );

  // Điều hướng popup đã được mở đồng bộ từ thao tác click sang trang OAuth.
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
        const popup = newWindowRef.current && !newWindowRef.current.closed
          ? newWindowRef.current
          : window.open(
              params.authorizationUrl,
              `saga_personal_${params.provider}_oauth`,
              getPopupFeatures()
            );

        if (!popup) {
          stopWaiting();
          showErrorToast("Không thể mở cửa sổ xác thực. Vui lòng cho phép popup rồi thử lại.");
          return;
        }

        popup.location.replace(params.authorizationUrl);
        popup.focus();
        newWindowRef.current = popup;

        // Fallback polling mỗi 2.5s phòng khi browser chặn broadcast hoặc user đóng tab bằng tay
        if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = setInterval(async () => {
          if (newWindowRef.current?.closed) {
            stopWaiting();
            return;
          }
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
    [queryClient, stopWaiting]
  );

  const retryOpenPopup = useCallback(() => {
    if (authUrl && typeof window !== "undefined") {
      const popup = window.open(
        authUrl,
        `saga_personal_${provider}_oauth`,
        getPopupFeatures()
      );
      if (!popup) {
        showErrorToast("Trình duyệt đang chặn cửa sổ xác thực. Vui lòng cho phép popup rồi thử lại.");
        return;
      }
      popup.focus();
      newWindowRef.current = popup;
    }
  }, [authUrl, provider]);

  const checkNow = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
    if (projectId) {
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["jira-sources", projectId] });
    }
    stopWaiting(true);
    showSuccessToast("Đã làm mới dữ liệu liên kết tích hợp!");
  }, [projectId, queryClient, stopWaiting]);

  // Lắng nghe kết quả từ BroadcastChannel / window.opener
  useEffect(() => {
    if (!isWaiting) return;

    const unsubscribe = subscribeIntegrationResult((msg) => {
      if (msg.provider === provider && msg.scope === scope) {
        const eventKey = `${msg.provider}:${msg.scope}:${msg.status}:${msg.timestamp || 0}`;
        if (lastHandledEventRef.current === eventKey) return;
        lastHandledEventRef.current = eventKey;
        if (msg.status === "success") {
          void handleSuccessResult(msg);
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
      if (newWindowRef.current && !newWindowRef.current.closed) {
        newWindowRef.current.close();
      }
    };
  }, []);

  return {
    isWaiting,
    provider,
    scope,
    authUrl,
    projectId,
    preparePopup,
    startFlow,
    cancelFlow: () => stopWaiting(true),
    retryOpenPopup,
    checkNow,
  };
}
