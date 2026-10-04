import { getApiErrorCode, getApiErrorMessage, getApiErrorStatus } from "@/lib/api-error";

export function describeGraphLoadError(error: unknown): string {
  const code = getApiErrorCode(error);
  const status = getApiErrorStatus(error);
  if (
    status === 403 ||
    code === "INTEGRATION_FORBIDDEN" ||
    code === "LECTURER_COURSE_FORBIDDEN" ||
    code === "ACCESS_DENIED"
  ) {
    return "Bạn không có quyền xem dữ liệu đồ thị của nhóm dự án này.";
  }
  if (code === "ROSTER_STUDENT_NOT_FOUND") {
    return "Không tìm thấy sinh viên trên danh sách lớp. Hãy dùng mã hồ sơ sinh viên, không dùng mã tài khoản.";
  }
  if (code === "PROJECT_NOT_FOUND") {
    return "Sprint đã chọn không còn trong dự án. Bộ lọc Sprint đã được bỏ.";
  }
  return getApiErrorMessage(error, "Đã xảy ra lỗi khi kết nối máy chủ đồ thị.");
}
