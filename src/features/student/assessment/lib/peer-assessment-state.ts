export type PeerAssessmentState =
  | "LOADING_COURSE"
  | "NO_COURSE"
  | "INVALID_COURSE"
  | "LOADING_TEAM"
  | "WAITING_FOR_TEAM"
  | "FORBIDDEN"
  | "TEAM_ERROR"
  | "NO_PROJECT"
  | "READY";

export function getPeerAssessmentState(input: {
  courseId: string;
  isCoursesLoading: boolean;
  isInvalidCourse: boolean;
  isTeamLoading: boolean;
  isWaitingForTeam: boolean;
  forbidden: boolean;
  isTeamError: boolean;
  hasTeam?: boolean;
  projectId?: string | null;
}): PeerAssessmentState {
  if (!input.courseId && input.isCoursesLoading) return "LOADING_COURSE";
  if (!input.courseId) return "NO_COURSE";
  if (input.isInvalidCourse) return "INVALID_COURSE";
  if (input.isTeamLoading) return "LOADING_TEAM";
  if (input.isWaitingForTeam) return "WAITING_FOR_TEAM";
  if (input.forbidden) return "FORBIDDEN";
  if (input.isTeamError) return "TEAM_ERROR";
  if (input.hasTeam && !input.projectId) return "NO_PROJECT";
  return "READY";
}
