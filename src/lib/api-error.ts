import { toast } from "sonner";

export const SAGA_TOAST_IDS = {
  SAVE_SETTINGS: "save_settings_toast",
  SYNC: "sync_toast",
  ACTION: "action_toast",
} as const;

export type ApiErrorLike = Error & {
  code?: string;
  status?: number;
  data?: unknown;
};

export function getApiError(error: unknown): ApiErrorLike {
  if (error instanceof Error) {
    const err = error as ApiErrorLike;
    const anyErr = error as { response?: { status?: number; data?: { code?: string } } };
    if (err.status === undefined && typeof anyErr.response?.status === "number") {
      err.status = anyErr.response.status;
    }
    if (err.code === undefined && typeof anyErr.response?.data?.code === "string") {
      err.code = anyErr.response.data.code;
    }
    return err;
  }
  if (error && typeof error === "object") {
    const errObj = error as Record<string, unknown>;
    const response = errObj.response as Record<string, unknown> | undefined;
    const responseData = response?.data as Record<string, unknown> | undefined;
    const msg =
      (typeof errObj.message === "string" && errObj.message) ||
      (typeof responseData?.message === "string" && responseData.message) ||
      "Đã có lỗi xảy ra trong quá trình kết nối đến máy chủ SAGA.";
    const err = new Error(msg) as ApiErrorLike;
    err.status =
      typeof errObj.status === "number"
        ? errObj.status
        : typeof response?.status === "number"
          ? response.status
          : undefined;
    err.code =
      typeof errObj.code === "string"
        ? errObj.code
        : typeof responseData?.code === "string"
          ? responseData.code
          : undefined;
    return err;
  }
  return new Error("Đã có lỗi xảy ra trong quá trình kết nối đến máy chủ SAGA.") as ApiErrorLike;
}

export function getApiErrorCode(error: unknown): string | undefined {
  const err = getApiError(error);
  if (typeof err.code === "string") return err.code;
  const anyErr = error as { response?: { data?: { code?: string } }; code?: string } | undefined;
  return anyErr?.response?.data?.code ?? anyErr?.code;
}

export function getApiErrorStatus(error: unknown): number | undefined {
  const err = getApiError(error);
  if (typeof err.status === "number") return err.status;
  const anyErr = error as { response?: { status?: number }; status?: number } | undefined;
  return anyErr?.response?.status ?? anyErr?.status;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const message = getApiError(error).message;
  return message?.trim() ? message : fallback;
}

interface ToastOptions {
  id?: string;
  description?: string;
}

export function showErrorToast(fallbackMessage: string, error?: unknown, options?: ToastOptions | string): void {
  const message = error ? getApiErrorMessage(error, fallbackMessage) : fallbackMessage;
  const opts = typeof options === 'string' ? { id: options } : (options || {});

  if (message.includes("Network Error") || message.includes("timeout")) {
    toast.error("Không thể kết nối đến máy chủ", {
      id: opts.id,
      description: "Vui lòng kiểm tra lại kết nối mạng của bạn.",
    });
    return;
  }

  toast.error(fallbackMessage, {
    id: opts.id,
    description: opts.description || (message !== fallbackMessage ? message : undefined),
  });
}

export function showSuccessToast(message: string, options?: ToastOptions | string): void {
  const opts = typeof options === 'string' ? { id: options } : (options || {});
  toast.success(message, { id: opts.id, description: opts.description });
}

export function showInfoToast(message: string, options?: ToastOptions | string): void {
  const opts = typeof options === 'string' ? { id: options } : (options || {});
  toast.info(message, { id: opts.id, description: opts.description });
}

export function showWarningToast(message: string, options?: ToastOptions | string): void {
  const opts = typeof options === 'string' ? { id: options } : (options || {});
  toast.warning(message, { id: opts.id, description: opts.description });
}

export function isUnauthorizedError(error: unknown): boolean {
  return getApiErrorStatus(error) === 401;
}

export function isStepUpRequiredError(error: unknown): boolean {
  const code = getApiErrorCode(error);
  if (code === "STEP_UP_REQUIRED") {
    return true;
  }
  const status = getApiErrorStatus(error);
  if (status === 403 && code === "STEP_UP_REQUIRED") {
    return true;
  }
  if (error && typeof error === "object") {
    const anyErr = error as { code?: string; status?: number; data?: { code?: string } };
    if (anyErr.code === "STEP_UP_REQUIRED" || anyErr.data?.code === "STEP_UP_REQUIRED") {
      return true;
    }
  }
  return false;
}

export function requireCourseId(courseId: string): string {
  if (!courseId || !courseId.trim()) {
    throw new Error("Throw ValidationException: Course ID is required");
  }
  return courseId.trim();
}

export function requireTeamId(teamId: string): string {
  if (!teamId || !teamId.trim()) {
    throw new Error("Throw ValidationException: Team ID is required");
  }
  return teamId.trim();
}

export function requireProjectId(projectId: string): string {
  if (!projectId || !projectId.trim()) {
    throw new Error("Throw ValidationException: Project ID is required");
  }
  return projectId.trim();
}

export function requireStudentProfileId(studentProfileId: string): string {
  if (!studentProfileId || !studentProfileId.trim()) {
    throw new Error("Throw ValidationException: Student profile ID is required");
  }
  return studentProfileId.trim();
}

export function requireSprintId(sprintId: string): string {
  if (!sprintId || !sprintId.trim()) {
    throw new Error("Throw ValidationException: Sprint ID is required");
  }
  return sprintId.trim();
}

export function requireTeamMemberId(teamMemberId: string): string {
  if (!teamMemberId || !teamMemberId.trim()) {
    throw new Error("Throw ValidationException: Team member ID is required");
  }
  return teamMemberId.trim();
}
