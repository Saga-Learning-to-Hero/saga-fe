export function lecturerCoursesPath() {
  return "/lecturer/courses";
}

export function lecturerCoursePath(courseId: string) {
  return `/lecturer/courses/${courseId}`;
}

export function lecturerCourseDashboardPath(courseId: string) {
  return `/lecturer/courses/${courseId}/dashboard`;
}

export function lecturerCourseGradesPath(courseId: string, teamId?: string | null) {
  const base = `/lecturer/courses/${courseId}/grades`;
  const trimmed = typeof teamId === "string" ? teamId.trim() : "";
  if (!trimmed) return base;
  const params = new URLSearchParams({ teamId: trimmed });
  return `${base}?${params.toString()}`;
}

export function lecturerCourseContributionPath(courseId: string) {
  return `/lecturer/courses/${courseId}/contribution-configuration`;
}

export function lecturerCourseWeightSettingsPath(courseId: string) {
  return lecturerCourseContributionPath(courseId);
}

export function lecturerCourseGraphPath(courseId: string) {
  return `/lecturer/courses/${courseId}/graph`;
}

export function lecturerCourseTeamsPath(
  courseId: string,
  view?: "members" | "teams"
) {
  const base = `/lecturer/courses/${courseId}/teams`;
  return view ? `${base}?view=${view}` : base;
}

export type LecturerWorkspaceView = "members" | "teams";

export function resolveLecturerWorkspaceView(raw: string | null | undefined): LecturerWorkspaceView {
  return raw === "teams" ? "teams" : "members";
}

export function lecturerCourseTeamPath(courseId: string, teamId: string) {
  return `/lecturer/courses/${courseId}/teams/${teamId}`;
}

export function lecturerCourseTeamEvaluationPath(courseId: string, teamId: string) {
  return lecturerCourseGradesPath(courseId, teamId);
}

export function lecturerCourseStudentPath(courseId: string, studentId: string) {
  return `/lecturer/courses/${courseId}/students/${studentId}`;
}
