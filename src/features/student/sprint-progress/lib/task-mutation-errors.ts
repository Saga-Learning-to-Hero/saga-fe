import type { TaskFormField } from "./task-form-validation";

type TaskApiErrorData = {
  code?: string;
  message?: string;
  usedPercent?: number;
  requestedPercent?: number;
  maxPercent?: number;
  minPoints?: number;
  maxPoints?: number;
};

type TaskApiError = {
  response?: { data?: TaskApiErrorData };
  data?: TaskApiErrorData;
  code?: string;
  message?: string;
};

function getTaskApiErrorData(error: unknown): TaskApiErrorData | undefined {
  const apiError = error as TaskApiError;
  return apiError.data ?? apiError.response?.data;
}

export function getTaskApiErrorCode(error: unknown): string | undefined {
  const data = getTaskApiErrorData(error);
  return data?.code ?? (error as TaskApiError).code;
}

function formatSubtaskPercentInvalidMessage(error: unknown): string {
  const data = getTaskApiErrorData(error);
  if (typeof data?.minPoints === "number" && typeof data.maxPoints === "number") {
    return `Tỷ trọng phải nằm trong khoảng ${data.minPoints}–${data.maxPoints}.`;
  }
  if (
    typeof data?.usedPercent === "number" &&
    typeof data.requestedPercent === "number" &&
    typeof data.maxPercent === "number"
  ) {
    return `Không thể phân bổ ${data.requestedPercent}% vì task cha đã dùng ${data.usedPercent}% (tối đa ${data.maxPercent}%).`;
  }
  return "Tỷ trọng Subtask không hợp lệ. Tổng các Subtask không được vượt 100%.";
}

export function getTaskMutationErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as TaskApiError;
  const code = getTaskApiErrorCode(error);
  switch (code) {
    case "TASK_NOT_ASSIGNED_TO_YOU":
      return "Bạn chỉ có thể thay đổi Task được giao cho mình.";
    case "NOT_TEAM_LEADER":
      return "Chỉ Leader được bỏ gán hoặc giao Task cho thành viên khác.";
    case "PERSONAL_INTEGRATION_REQUIRED":
      return "Vui lòng liên kết tài khoản Jira và GitHub cá nhân trước khi tạo Task.";
    case "JIRA_ACCOUNT_NOT_LINKED_TO_CURRENT_USER":
      return "Vui lòng liên kết tài khoản Jira cá nhân trước khi tạo Task.";
    case "TASK_DELETE_BLOCKED_BY_EVIDENCE":
      return "Không thể xóa Task đã có phiên làm việc hoặc xác nhận đóng góp.";
    case "TASK_DELETE_BLOCKED_BY_SUBTASKS":
      return "Không thể xóa vì còn Task con. Hãy xóa hoặc chuyển các Subtask trước.";
    case "TASK_ISSUE_TYPE_CHANGE_NOT_ALLOWED":
      return "Không thể đổi loại thẻ này. Chỉ Task/Story/Bug (cấp STANDARD) được đổi sang loại STANDARD khác.";
    case "TASK_ISSUE_TYPE_INVALID":
      return "Loại thẻ không hợp lệ với nguồn Jira hiện tại.";
    case "TASK_SUBTASK_PARENT_REQUIRED":
      return "Subtask bắt buộc chọn task cha cấp STANDARD.";
    case "TASK_PARENT_TYPE_INVALID":
      return "Task cha không đúng cấp cho loại thẻ đang chọn.";
    case "JIRA_PARENT_SOURCE_MISMATCH":
      return "Task cha thuộc nguồn Jira khác. Hãy chọn lại parent trong đúng nguồn.";
    case "JIRA_PARENT_TASK_NOT_FOUND":
      return "Không tìm thấy task cha. Danh sách parent đã được làm mới.";
    case "TASK_SUBTASK_PERCENT_INVALID":
      return formatSubtaskPercentInvalidMessage(error);
    case "REQUEST_INVALID":
      return apiError.response?.data?.message || apiError.data?.message || "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại form.";
    default:
      return apiError.response?.data?.message || apiError.data?.message || apiError.message || fallback;
  }
}

export function getTaskMutationFieldError(
  error: unknown
): { field: TaskFormField; message: string } | null {
  const code = getTaskApiErrorCode(error);
  if (!code) return null;

  const message = getTaskMutationErrorMessage(error, "");
  switch (code) {
    case "TASK_ISSUE_TYPE_CHANGE_NOT_ALLOWED":
    case "TASK_ISSUE_TYPE_INVALID":
      return { field: "issueTypeId", message };
    case "TASK_SUBTASK_PARENT_REQUIRED":
    case "TASK_PARENT_TYPE_INVALID":
    case "JIRA_PARENT_SOURCE_MISMATCH":
    case "JIRA_PARENT_TASK_NOT_FOUND":
      return { field: "parent", message };
    case "TASK_SUBTASK_PERCENT_INVALID":
      return { field: "storyPoints", message };
    case "REQUEST_INVALID":
      return { field: "summary", message };
    default:
      return null;
  }
}

export function shouldInvalidateParentOptions(error: unknown): boolean {
  const code = getTaskApiErrorCode(error);
  return (
    code === "JIRA_PARENT_SOURCE_MISMATCH" ||
    code === "JIRA_PARENT_TASK_NOT_FOUND" ||
    code === "TASK_PARENT_TYPE_INVALID" ||
    code === "TASK_ISSUE_TYPE_INVALID"
  );
}

export function shouldInvalidateSubtaskShare(error: unknown): boolean {
  return getTaskApiErrorCode(error) === "TASK_SUBTASK_PERCENT_INVALID";
}
