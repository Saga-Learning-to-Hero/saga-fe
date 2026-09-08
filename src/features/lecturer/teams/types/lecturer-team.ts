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
  courseEnrollmentId: string;
  studentProfileId: string;
  studentCode: string;
  fullName: string;
  email: string;
  role: TeamMemberRole | string;
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
