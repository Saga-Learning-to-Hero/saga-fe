export type ApiErrorLike = Error & {
  code?: string;
  status?: number;
  data?: unknown;
};

export function getApiError(error: unknown): ApiErrorLike {
  if (error instanceof Error) {
    return error as ApiErrorLike;
  }
  return new Error("Đã có lỗi xảy ra trong quá trình kết nối đến máy chủ SAGA.") as ApiErrorLike;
}

export function getApiErrorCode(error: unknown): string | undefined {
  return getApiError(error).code;
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return getApiError(error).status;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const message = getApiError(error).message;
  return message?.trim() ? message : fallback;
}

export function requireCourseId(courseId: string): string {
  if (!courseId || !courseId.trim()) {
    throw new Error("Throw ValidationException: Course ID is required");
  }
  return courseId.trim();
}
