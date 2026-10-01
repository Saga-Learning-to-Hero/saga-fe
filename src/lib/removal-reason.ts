import { getApiErrorCode, getApiErrorMessage } from "@/lib/api-error";

export const REMOVAL_REASON_MAX_LENGTH = 500;

export function requireRemovalReason(reason: string): string {
  if (typeof reason !== "string") {
    throw new Error("Throw ValidationException: Reason is required");
  }

  const trimmed = reason.trim();
  if (!trimmed) {
    throw new Error("Throw ValidationException: Reason is required");
  }
  if (trimmed.length > REMOVAL_REASON_MAX_LENGTH) {
    throw new Error("Throw ValidationException: Reason must be at most 500 characters");
  }
  return trimmed;
}

export function getRemovalApiErrorMessage(error: unknown, fallback: string): string {
  const code = getApiErrorCode(error);
  if (code === "REQUEST_INVALID") {
    return "Lý do không hợp lệ. Hãy nhập lý do (tối đa 500 ký tự).";
  }
  if (code === "TEAM_LEADER_INVALID" || code === "TEAM_LEADER_REMOVAL_REQUIRES_REASSIGNMENT") {
    return "Hãy đổi trưởng nhóm trước.";
  }
  if (code === "LECTURER_COURSE_FORBIDDEN") {
    return "Bạn không có quyền thao tác trên lớp học phần này.";
  }
  if (code === "ROSTER_STUDENT_ALREADY_REMOVED") {
    return "Sinh viên này đã được rút tên trước đó.";
  }
  if (code === "ROSTER_STUDENT_NOT_FOUND") {
    return "Không tìm thấy thông tin sinh viên trong lớp học phần này.";
  }
  return getApiErrorMessage(error, fallback);
}
