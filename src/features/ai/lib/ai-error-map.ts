export const AI_ERROR_MESSAGES: Record<string, string> = {
  AI_ANALYSIS_RESULT_INVALID:
    "Phản hồi từ LLM không khớp định dạng schema yêu cầu hoặc server Backend chưa đăng ký cấu trúc schema phân tích.",
  AI_ANALYSIS_PROVIDER_FAILED:
    "Lỗi từ nhà cung cấp mô hình LLM trong quá trình xử lý yêu cầu.",
  AI_PROVIDER_NOT_CONFIGURED:
    "Chưa cấu hình API Key cho mô hình LLM. Vui lòng thiết lập tại tab BYOK hoặc liên hệ quản trị viên.",
  AI_PROVIDER_AUTH_FAILED:
    "Xác thực API Key thất bại (Authentication Failed). Khóa API không hợp lệ hoặc đã hết hạn.",
  AI_PROVIDER_RATE_LIMITED:
    "Tài khoản nhà cung cấp LLM (OpenAI/Gemini) bị giới hạn tần suất gọi hoặc đã hết số dư Credit (Insufficient Quota / Rate Limit). Vui lòng kiểm tra số dư tài khoản API hoặc thử lại sau.",
  AI_PROVIDER_TIMEOUT:
    "Hết thời gian chờ phản hồi từ LLM (Request Timeout). Vui lòng thử lại.",
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

  return `Lỗi hệ thống: ${errorCode}. Vui lòng thử lại hoặc kiểm tra lại cấu hình API Key.`;
}
