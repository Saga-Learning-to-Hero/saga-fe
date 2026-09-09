export type TeamPreviewRowAction =
  | "READY_CREATE"
  | "READY_ASSIGN"
  | "READY_REASSIGN"
  | "ALREADY_ASSIGNED"
  | "INVALID"
  | "CONFLICT"
  | string;

export type TeamMemberRole = "LEADER" | "MEMBER";
export type ExcelTeamRole = "Leader" | "Member";

export interface LecturerTeamMember {
  teamMemberId: string;
  courseEnrollmentId: string;
  studentProfileId: string;
  studentCode: string;
  fullName: string;
  email: string;
  role: TeamMemberRole | string;
}

export interface ReplaceTeamLeaderRequest {
  teamMemberId: string;
}

export interface MoveTeamMemberRequest {
  targetTeamId: string;
}

export interface LecturerTeamItem {
  teamId: string;
  teamNo: number;
  teamName: string;
  projectId: string | null;
  members: LecturerTeamMember[];
}

export interface LecturerTeamsResponse {
  courseId: string;
  teams: LecturerTeamItem[];
}

export interface TeamPreviewSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  readyCreate: number;
  readyAssign: number;
  readyReassign: number;
  alreadyAssigned: number;
  blockingErrorCount: number;
}

export interface TeamPreviewRow {
  rowNumber: number;
  courseEnrollmentId?: string | null;
  classCode?: string;
  fullName: string;
  studentCode: string;
  email: string;
  teamNo: number | null;
  teamName: string | null;
  teamRole: ExcelTeamRole | string | null;
  action: TeamPreviewRowAction;
  errors: string[];
  warnings: string[];
}

export interface TeamPreviewResponse {
  previewToken: string;
  courseId: string;
  classCode: string;
  hasBlockingErrors: boolean;
  blockingErrors: string[];
  summary: TeamPreviewSummary;
  rows: TeamPreviewRow[];
}

export interface ConfirmTeamImportRequest {
  previewToken: string;
}

export interface ConfirmTeamImportResponse {
  courseId: string;
  createdTeams: number;
  updatedTeams: number;
  assignedMembers: number;
  reassignedMembers: number;
  updatedRoles: number;
  unchanged: number;
  emailsEnqueued: number;
  confirmedAt: string;
}

export const TEAM_TEMPLATE_FILENAME = "Team_Assignment.xlsx";

export function canConfirmTeamImport(preview: TeamPreviewResponse | null | undefined): boolean {
  return Boolean(preview && preview.hasBlockingErrors === false && preview.previewToken);
}

export function sortTeamMembers(members: LecturerTeamMember[]): LecturerTeamMember[] {
  return [...members].sort((a, b) => {
    const roleRank = (role: string) => (role === "LEADER" ? 0 : 1);
    const rankDiff = roleRank(a.role) - roleRank(b.role);
    if (rankDiff !== 0) return rankDiff;
    return a.studentCode.localeCompare(b.studentCode, "vi");
  });
}

export function teamRoleLabel(role: string): string {
  return role === "LEADER" ? "Trưởng nhóm" : "Thành viên";
}

function toOptionalText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function parseLecturerTeamMember(value: unknown): LecturerTeamMember {
  const source = (value ?? {}) as Record<string, unknown>;
  return {
    teamMemberId: toOptionalText(source.teamMemberId).trim(),
    courseEnrollmentId: toOptionalText(source.courseEnrollmentId),
    studentProfileId: toOptionalText(source.studentProfileId),
    studentCode: toOptionalText(source.studentCode),
    fullName: toOptionalText(source.fullName),
    email: toOptionalText(source.email),
    role: toOptionalText(source.role) || "MEMBER",
  };
}

export function parseLecturerTeamsResponse(value: unknown, courseId: string): LecturerTeamsResponse {
  const source = (value ?? {}) as Record<string, unknown>;
  const teams = Array.isArray(source.teams) ? source.teams : [];

  return {
    courseId: toOptionalText(source.courseId).trim() || courseId,
    teams: teams.map((row) => {
      const item = (row ?? {}) as Record<string, unknown>;
      const members = Array.isArray(item.members) ? item.members.map(parseLecturerTeamMember) : [];
      const projectId = typeof item.projectId === "string" && item.projectId.trim() ? item.projectId : null;
      return {
        teamId: toOptionalText(item.teamId),
        teamNo: typeof item.teamNo === "number" ? item.teamNo : 0,
        teamName: toOptionalText(item.teamName),
        projectId,
        members,
      };
    }),
  };
}

export function summarizeLecturerTeams(teams: LecturerTeamItem[]) {
  const withProjectCount = teams.filter((team) => Boolean(team.projectId)).length;
  return {
    teamCount: teams.length,
    withProjectCount,
    waitingProjectCount: teams.length - withProjectCount,
  };
}
