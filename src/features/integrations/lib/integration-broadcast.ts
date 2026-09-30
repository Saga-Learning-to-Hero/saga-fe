export type IntegrationScope = "personal" | "project";
export type IntegrationProvider = "jira" | "github";
export type IntegrationEventStatus = "success" | "error";

export interface IntegrationBroadcastMessage {
  type: "SAGA_INTEGRATION_RESULT";
  status: IntegrationEventStatus;
  provider: IntegrationProvider;
  scope: IntegrationScope;
  projectId?: string;
  message?: string;
  timestamp?: number;
}

export const SAGA_INTEGRATION_CHANNEL_NAME = "SAGA_OAUTH_INTEGRATION_CHANNEL";
export const SAGA_STORAGE_FALLBACK_KEY = "saga_oauth_integration_result";

/**
 * Gửi tín hiệu hoàn tất kết quả OAuth từ Tab callback về lại Tab chính SAGA.
 * Sử dụng 3 kênh đồng thời: BroadcastChannel, window.opener.postMessage và localStorage fallback.
 */
export function sendIntegrationResult(result: Omit<IntegrationBroadcastMessage, "type" | "timestamp">): void {
  if (typeof window === "undefined") return;

  const payload: IntegrationBroadcastMessage = {
    ...result,
    type: "SAGA_INTEGRATION_RESULT",
    timestamp: Date.now(),
  };

  // 1. Gửi qua BroadcastChannel
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(SAGA_INTEGRATION_CHANNEL_NAME);
      channel.postMessage(payload);
      channel.close();
    }
  } catch {
    // Ignore channel error
  }

  // 2. Gửi qua window.opener (nếu mở dạng popup window)
  try {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(payload, window.location.origin);
    }
  } catch {
    // Ignore cross-origin error
  }

  // 3. Fallback qua localStorage event cho các tab cùng origin
  try {
    window.localStorage.setItem(SAGA_STORAGE_FALLBACK_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota error
  }
}

/**
 * Lắng nghe kết quả xác thực OAuth từ Tab mới.
 * Trả về hàm hủy đăng ký (unsubscribe) để cleanup.
 */
export function subscribeIntegrationResult(
  callback: (result: IntegrationBroadcastMessage) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  let channel: BroadcastChannel | null = null;

  // 1. BroadcastChannel Listener
  try {
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(SAGA_INTEGRATION_CHANNEL_NAME);
      channel.onmessage = (event: MessageEvent<IntegrationBroadcastMessage>) => {
        if (event.data?.type === "SAGA_INTEGRATION_RESULT") {
          callback(event.data);
        }
      };
    }
  } catch {
    // Fallback if BroadcastChannel fails
  }

  // 2. window.addEventListener("message") Listener (cho opener)
  const handleWindowMessage = (event: MessageEvent) => {
    // Chỉ chấp nhận message từ cùng origin hoặc payload đúng định dạng
    if (
      (event.origin === window.location.origin || !event.origin) &&
      event.data?.type === "SAGA_INTEGRATION_RESULT"
    ) {
      callback(event.data as IntegrationBroadcastMessage);
    }
  };
  window.addEventListener("message", handleWindowMessage);

  // 3. window.addEventListener("storage") Listener
  const handleStorage = (event: StorageEvent) => {
    if (event.key === SAGA_STORAGE_FALLBACK_KEY && event.newValue) {
      try {
        const data = JSON.parse(event.newValue) as IntegrationBroadcastMessage;
        if (data?.type === "SAGA_INTEGRATION_RESULT") {
          callback(data);
        }
      } catch {
        // Ignore parse error
      }
    }
  };
  window.addEventListener("storage", handleStorage);

  return () => {
    if (channel) {
      try {
        channel.close();
      } catch {
        // Ignore
      }
    }
    window.removeEventListener("message", handleWindowMessage);
    window.removeEventListener("storage", handleStorage);
  };
}
