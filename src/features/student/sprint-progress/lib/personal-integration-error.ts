/**
 * Helper tiện ích bóc tách và định dạng thông báo lỗi khi thiếu liên kết cá nhân (Jira / GitHub).
 * Backend mã lỗi: PERSONAL_INTEGRATION_REQUIRED
 * Response structure: { code: "PERSONAL_INTEGRATION_REQUIRED", message: "...", details: { missingProviders: ["JIRA", "GITHUB"] } }
 */
export function getPersonalIntegrationErrorMessage(
  error: unknown,
  fallback = "Bạn cần liên kết tài khoản cá nhân với Jira và GitHub để tiếp tục."
): string | null {
  if (!error) return null;

  const anyErr = error as {
    response?: {
      data?: {
        code?: string;
        message?: string;
        details?: {
          missingProviders?: string[];
        };
      };
    };
    code?: string;
    message?: string;
  };

  const data = anyErr?.response?.data;
  const errorCode = data?.code || anyErr?.code;

  if (errorCode === "PERSONAL_INTEGRATION_REQUIRED") {
    const missing = data?.details?.missingProviders;
    if (Array.isArray(missing) && missing.length > 0) {
      const formatted = missing
        .map((provider) => {
          const upper = String(provider).trim().toUpperCase();
          if (upper === "JIRA") return "Jira";
          if (upper === "GITHUB") return "GitHub";
          return provider;
        })
        .join(" và ");
      return `Bạn chưa liên kết tài khoản cá nhân với ${formatted}. Vui lòng liên kết để thực hiện tạo hoặc cập nhật task.`;
    }
    return data?.message || fallback;
  }

  return null;
}

/**
 * Bóc tách và định dạng thông báo lỗi khi Backend trả về mã lỗi TASK_LABEL_NOT_ALLOWED (HTTP 400).
 * Đảm bảo thông báo hiển thị rõ ràng 4 nhãn chuẩn của SAGA.
 */
export function getTaskLabelErrorMessage(error: unknown): string | null {
  if (!error) return null;

  const anyErr = error as {
    response?: {
      data?: {
        code?: string;
        message?: string;
      };
    };
    code?: string;
    message?: string;
  };

  const data = anyErr?.response?.data;
  const errorCode = data?.code || anyErr?.code;

  if (errorCode === "TASK_LABEL_NOT_ALLOWED") {
    return (
      data?.message ||
      "Nhãn task không hợp lệ. Hệ thống SAGA chỉ chấp nhận 4 nhãn quy định: saga:code, saga:test, saga:document, saga:research."
    );
  }

  return null;
}
