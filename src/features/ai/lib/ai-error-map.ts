export const AI_ERROR_MESSAGES: Record<string, string> = {
  AI_PROVIDER_AUTH_FAILED:
    "Xác thực khóa API thất bại. Khóa bị từ chối, vui lòng kiểm tra lại cấu hình khóa API.",
  AI_PROVIDER_RATE_LIMITED:
    "Nhà cung cấp AI hiện đang bị giới hạn tần suất gọi tạm thời (Rate Limited).",
  AI_PROVIDER_QUOTA_EXHAUSTED:
    "Hạn mức sử dụng hoặc tín dụng của tài khoản trên nhà cung cấp AI đã cạn kiệt (Quota Exhausted).",
  AI_PROVIDER_TIMEOUT:
    "Nhà cung cấp AI không hoàn thành yêu cầu trong thời gian cho phép (Timeout).",
  AI_PROVIDER_UNAVAILABLE:
    "Nhà cung cấp hoặc mô hình AI tạm thời không khả dụng.",
  AI_PROVIDER_FAILED:
    "Lỗi hệ thống trong quá trình yêu cầu nhà cung cấp AI (Provider Failed).",
  AI_PROVIDER_MODEL_NOT_FOUND:
    "Mô hình AI đã cấu hình không tồn tại hoặc không khả dụng.",
  AI_PROVIDER_RESULT_INVALID:
    "Phản hồi từ nhà cung cấp AI không đáp ứng cấu trúc phân tích được yêu cầu.",
  AI_PROVIDER_NOT_CONFIGURED:
    "Chưa cấu hình API Key cho mô hình LLM. Vui lòng thiết lập tại tab BYOK hoặc liên hệ quản trị viên.",
  AI_RUNTIME_NOT_CONFIGURED:
    "Hạ tầng thực thi AI trên Backend chưa được kích hoạt.",
  AI_CREDENTIAL_UNAVAILABLE:
    "Không tìm thấy API Key hợp lệ cho môn học hoặc dự án này.",
  AI_PROMPT_CONSTRUCTION_FAILED:
    "Không thể tạo prompt do thiếu dữ liệu task Jira hoặc git commit.",
  AI_TASK_TIMEOUT:
    "Tác vụ phân tích chạy quá thời gian tối đa cho phép (Task Timeout).",
  AI_DEPENDENCY_ANALYSIS_FAILED:
    "Lỗi đồng bộ dữ liệu phụ thuộc từ Jira hoặc GitHub.",
};

export function getAiErrorMessage(errorCode?: string | null): string {
  if (!errorCode) {
    return "Phân tích AI chưa hoàn tất do gián đoạn kết nối hoặc chưa có đủ dữ liệu hoạt động.";
  }

  const normalized = errorCode.trim().toUpperCase();
  if (AI_ERROR_MESSAGES[normalized]) {
    return AI_ERROR_MESSAGES[normalized];
  }

  return `Lỗi chưa xác định từ hệ thống AI: ${errorCode}.`;
}
