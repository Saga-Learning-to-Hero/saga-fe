export function lecturerCoursesPath() {
  return "/lecturer/courses";
}

export function lecturerCoursePath(courseId: string) {
  return `/lecturer/courses/${courseId}`;
}

export function lecturerCourseDashboardPath(courseId: string) {
  return `/lecturer/courses/${courseId}/dashboard`;
}

export function lecturerCourseGradesPath(courseId: string) {
  return `/lecturer/courses/${courseId}/grades`;
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

export function lecturerCourseTeamsPath(courseId: string) {
  return `/lecturer/courses/${courseId}/teams`;
}

export function lecturerCourseTeamPath(courseId: string, teamId: string) {
  return `/lecturer/courses/${courseId}/teams/${teamId}`;
}

export function lecturerCourseTeamEvaluationPath(courseId: string, teamId: string) {
  return `/lecturer/courses/${courseId}/teams/${teamId}/contribution-evaluation`;
}

export function lecturerCourseStudentPath(courseId: string, studentId: string) {
  return `/lecturer/courses/${courseId}/students/${studentId}`;
}
