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

export function lecturerCourseGraphPath(courseId: string, teamId?: string | null) {
  const base = `/lecturer/courses/${courseId}/graph`;
  const trimmed = typeof teamId === "string" ? teamId.trim() : "";
  if (!trimmed) return base;
  const params = new URLSearchParams({ teamId: trimmed });
  return `${base}?${params.toString()}`;
}

export function lecturerCoursePeerReviewsPath(
  courseId: string,
  filters?: { teamId?: string | null; sprintId?: string | null; revieweeId?: string | null }
) {
  const base = `/lecturer/courses/${courseId}/peer-reviews`;
  const params = new URLSearchParams();
  const teamId = typeof filters?.teamId === "string" ? filters.teamId.trim() : "";
  const sprintId = typeof filters?.sprintId === "string" ? filters.sprintId.trim() : "";
  const revieweeId = typeof filters?.revieweeId === "string" ? filters.revieweeId.trim() : "";
  if (teamId) params.set("teamId", teamId);
  if (sprintId) params.set("sprintId", sprintId);
  if (revieweeId) params.set("revieweeId", revieweeId);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
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

export function lecturerCourseTeamMemberPath(
  courseId: string,
  teamId: string,
  studentId: string
) {
  return `/lecturer/courses/${courseId}/teams/${teamId}/members/${studentId}`;
}
