import { API_BASE_URL } from "@/lib/axios";

export interface AccountDisabledEventPayload {
  type: string;
  occurredAt?: string;
  reason?: string;
}

let activeEventSource: EventSource | null = null;
let accountDisabled = false;

/**
 * Trả về trạng thái tài khoản có đang bị gắn cờ vô hiệu hóa (disabled) hay không.
 */
export function isAccountDisabled(): boolean {
  return accountDisabled;
}

/**
 * Đặt lại cờ vô hiệu hóa khi người dùng chủ động đăng nhập mới thành công.
 */
export function resetAccountDisabledState(): void {
  accountDisabled = false;
}

/**
 * Đóng kết nối EventSource SSE hiện tại một cách an toàn.
 */
export function closeUserEvents(): void {
  if (activeEventSource) {
    try {
      activeEventSource.close();
    } catch {
      // Bỏ qua lỗi khi đóng EventSource
    }
    activeEventSource = null;
  }
}

/**
 * Khởi tạo kết nối SSE duy nhất tới GET /api/users/me/events trong phiên đăng nhập.
 * Bắt sự kiện ACCOUNT_DISABLED và đóng kết nối ngay lập tức.
 */
export function connectUserEvents(options?: {
  onAccountDisabled?: (payload?: AccountDisabledEventPayload) => void;
}): EventSource | null {
  if (typeof window === "undefined") return null;

  // Nếu tài khoản đã bị đánh dấu vô hiệu hóa trong phiên này, không tạo kết nối lại
  if (accountDisabled) {
    return null;
  }

  // Nếu đã có kết nối đang mở, trả về kết nối hiện tại để tránh tạo trùng lặp
  if (activeEventSource && activeEventSource.readyState !== EventSource.CLOSED) {
    return activeEventSource;
  }

  const sseUrl = `${API_BASE_URL}/api/users/me/events`;

  try {
    const source = new EventSource(sseUrl, { withCredentials: true });
    activeEventSource = source;

    const handleAccountDisabled = (payload?: AccountDisabledEventPayload) => {
      accountDisabled = true;
      closeUserEvents();

      // Kích hoạt callback nếu có
      options?.onAccountDisabled?.(payload);

      // Phát CustomEvent toàn cục để fallback interceptor và Zustand store xử lý
      window.dispatchEvent(
        new CustomEvent("saga:account-disabled", {
          detail: {
            payload,
            message:
              "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên nếu bạn cần hỗ trợ.",
          },
        })
      );
    };

    // 1. Lắng nghe event chuyên biệt ACCOUNT_DISABLED
    source.addEventListener("ACCOUNT_DISABLED", (event: MessageEvent) => {
      let parsedPayload: AccountDisabledEventPayload | undefined;
      try {
        parsedPayload = JSON.parse(event.data);
      } catch {
        parsedPayload = { type: "ACCOUNT_DISABLED" };
      }
      handleAccountDisabled(parsedPayload);
    });

    // 2. Lắng nghe onmessage chuẩn (phòng trường hợp backend gửi qua generic event)
    source.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.type === "ACCOUNT_DISABLED") {
          handleAccountDisabled(data);
        }
      } catch {
        // Không phải JSON hợp lệ hoặc message khác
      }
    };

    // 3. Xử lý lỗi kết nối
    source.onerror = () => {
      // Nếu đã bị vô hiệu hóa, đóng ngay lập tức và không cho phép trình duyệt auto-reconnect
      if (accountDisabled) {
        closeUserEvents();
      }
    };

    return source;
  } catch {
    return null;
  }
}
