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

export function lecturerCourseGraphPath(courseId: string) {
  return `/lecturer/courses/${courseId}/graph`;
}

export function lecturerCourseGroupsPath(courseId: string) {
  return `/lecturer/courses/${courseId}/groups`;
}

export function lecturerCourseGroupPath(courseId: string, groupId: string) {
  return `/lecturer/courses/${courseId}/groups/${groupId}`;
}

export function lecturerCourseStudentPath(courseId: string, studentId: string) {
  return `/lecturer/courses/${courseId}/students/${studentId}`;
}
