import type { Sprint } from "../types/sprint-progress";

export type TaskFormField =
  | "summary"
  | "description"
  | "storyPoints"
  | "sprintId"
  | "startDate"
  | "dueDate"
  | "jiraIntegrationId"
  | "assigneeAccountId";

export type TaskFormErrors = Partial<Record<TaskFormField, string>>;

export interface TaskFormValidationInput {
  summary: string;
  description: string;
  storyPoints: string;
  sprintId: string;
  startDate: string;
  dueDate: string;
  jiraIntegrationId?: string;
  activeJiraSourceCount: number;
  selectedSprint?: Sprint;
  isSprintAssignmentChanged: boolean;
  requireOwnJiraAccount: boolean;
  ownJiraAccountId?: string;
  missingPersonalIntegrations?: Array<"JIRA" | "GITHUB">;
}

export interface TaskFormValidationResult {
  errors: TaskFormErrors;
  dateWarning?: string;
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateOnly(value: string): boolean {
  if (!DATE_ONLY_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validateTaskForm(input: TaskFormValidationInput): TaskFormValidationResult {
  const errors: TaskFormErrors = {};
  const summary = input.summary.trim();
  const description = input.description.trim();
  const storyPoints = input.storyPoints.trim();
  const startDate = input.startDate.trim();
  const dueDate = input.dueDate.trim();

  if (!summary) {
    errors.summary = "Vui lòng nhập tên Task.";
  } else if (summary.length > 255) {
    errors.summary = "Tên Task không được vượt quá 255 ký tự.";
  }

  if (description.length > 10_000) {
    errors.description = "Mô tả Task không được vượt quá 10.000 ký tự.";
  }

  if (storyPoints) {
    const parsed = Number(storyPoints);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
      errors.storyPoints = "Story Point phải là số nguyên từ 0 đến 100.";
    }
  }

  if (startDate && !isValidDateOnly(startDate)) {
    errors.startDate = "Ngày bắt đầu không hợp lệ.";
  }
  if (dueDate && !isValidDateOnly(dueDate)) {
    errors.dueDate = "Hạn hoàn thành không hợp lệ.";
  }
  if (!errors.startDate && !errors.dueDate && startDate && dueDate && startDate > dueDate) {
    errors.dueDate = "Hạn hoàn thành phải bằng hoặc sau ngày bắt đầu.";
  }

  if (input.activeJiraSourceCount > 1 && !input.jiraIntegrationId?.trim()) {
    errors.jiraIntegrationId = "Vui lòng chọn nguồn Jira để tạo Task.";
  }

  if (input.requireOwnJiraAccount && !input.ownJiraAccountId) {
    errors.assigneeAccountId =
      "Tài khoản Jira cá nhân chưa được liên kết hoặc không thể được giao Task trong nguồn Jira này.";
  }

  if (input.missingPersonalIntegrations?.length) {
    const providerNames = input.missingPersonalIntegrations.map((provider) =>
      provider === "JIRA" ? "Jira" : "GitHub"
    );
    errors.assigneeAccountId = `Vui lòng liên kết ${providerNames.join(" và ")} trước khi tạo Task.`;
  }

  if (input.sprintId !== "backlog") {
    if (!input.selectedSprint) {
      errors.sprintId = "Sprint đã chọn không còn khả dụng trong nguồn Jira hiện tại.";
    } else if (input.selectedSprint.status === "COMPLETED" && input.isSprintAssignmentChanged) {
      errors.sprintId = "Không thể đưa Task mới hoặc chuyển Task vào Sprint đã hoàn thành.";
    } else if (
      input.isSprintAssignmentChanged &&
      (input.selectedSprint.externalSprintId === null ||
        input.selectedSprint.externalSprintId === undefined ||
        Number.isNaN(Number(input.selectedSprint.externalSprintId)))
    ) {
      errors.sprintId = "Sprint chưa có mã đồng bộ hợp lệ trên Jira.";
    }
  }

  let dateWarning: string | undefined;
  const sprint = input.sprintId === "backlog" ? undefined : input.selectedSprint;
  if (
    !errors.startDate &&
    !errors.dueDate &&
    sprint?.startDate &&
    sprint.endDate &&
    ((startDate && startDate < sprint.startDate) || (dueDate && dueDate > sprint.endDate))
  ) {
    dateWarning = `Lịch Task nằm ngoài ${sprint.name} (${sprint.startDate} – ${sprint.endDate}). Bạn vẫn có thể lưu nếu đây là kế hoạch có chủ đích.`;
  }

  return { errors, dateWarning };
}
