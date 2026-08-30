export function lecturerCourseTeamsPath(courseId: string) {
  return `/lecturer/courses/${courseId}/teams`;
}

export function lecturerCourseTeamPath(courseId: string, teamId: string) {
  return `/lecturer/courses/${courseId}/teams/${teamId}`;
}
