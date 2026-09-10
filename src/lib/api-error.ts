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

export function isUnauthorizedError(error: unknown): boolean {
  return getApiErrorStatus(error) === 401;
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

export function requireTeamMemberId(teamMemberId: string): string {
  if (!teamMemberId || !teamMemberId.trim()) {
    throw new Error("Throw ValidationException: Team member ID is required");
  }
  return teamMemberId.trim();
}
