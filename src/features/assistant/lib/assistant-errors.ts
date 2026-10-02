import { getApiErrorCode, getApiErrorMessage, getApiErrorStatus } from "@/lib/api-error";

export const ASSISTANT_RATE_LIMIT_MESSAGE = "Bạn đã hết lượt hỏi hôm nay.";
export const ASSISTANT_RELOAD_HISTORY_MESSAGE =
  "Chưa nhận được phản hồi. Hãy tải lại lịch sử, không gửi lại câu hỏi.";
export const ASSISTANT_DISABLED_MESSAGE = "Trợ lý đang tắt. Hãy kiểm tra lại trạng thái.";

export type AssistantErrorAction =
  | { type: "INLINE"; message: string }
  | { type: "BACK_TO_HISTORY" }
  | { type: "RATE_LIMITED"; message: string }
  | { type: "DISABLED"; message: string }
  | { type: "RELOAD_HISTORY"; message: string }
  | { type: "GENERIC"; message: string };

function isTransportError(error: unknown): boolean {
  const status = getApiErrorStatus(error);
  if (typeof status === "number" && status > 0) return false;
  const raw = error as { code?: string; message?: string } | null;
  const code = raw?.code ?? "";
  if (code === "ERR_NETWORK" || code === "ECONNABORTED" || code === "ETIMEDOUT") return true;
  const message = raw?.message ?? "";
  return /network error|timeout|failed to fetch/i.test(message);
}

export function mapAssistantAskError(error: unknown): AssistantErrorAction {
  if (isTransportError(error)) {
    return { type: "RELOAD_HISTORY", message: ASSISTANT_RELOAD_HISTORY_MESSAGE };
  }

  const code = getApiErrorCode(error);
  const status = getApiErrorStatus(error);

  if (status === 400 || code === "ASSISTANT_INPUT_INVALID" || code === "REQUEST_INVALID") {
    return {
      type: "INLINE",
      message: getApiErrorMessage(error, "Câu hỏi chưa hợp lệ."),
    };
  }
  if (status === 404 && code === "ASSISTANT_CONVERSATION_NOT_FOUND") {
    return { type: "BACK_TO_HISTORY" };
  }
  if (status === 429 || code === "ASSISTANT_RATE_LIMITED") {
    return { type: "RATE_LIMITED", message: ASSISTANT_RATE_LIMIT_MESSAGE };
  }
  if (status === 503 || code === "ASSISTANT_DISABLED") {
    return { type: "DISABLED", message: ASSISTANT_DISABLED_MESSAGE };
  }
  return {
    type: "GENERIC",
    message: getApiErrorMessage(error, "Không gửi được câu hỏi. Hãy thử lại."),
  };
}
