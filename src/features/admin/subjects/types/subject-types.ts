export type SubjectStatus = "ACTIVE" | "INACTIVE";

export interface CreateSubjectRequest {
  code: string;
  nameEnglish: string;
  nameVietnamese?: string | null;
}

export interface PatchSubjectRequest {
  nameEnglish?: string;
  nameVietnamese?: string | null;
  status?: SubjectStatus;
}

export interface SubjectSyllabusSummary {
  id: string;
  versionLabel: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  credits?: number | null;
  createdAt: string;
}

export interface SubjectResponse {
  id: string;
  code: string;
  nameEnglish: string;
  nameVietnamese?: string | null;
  status: SubjectStatus;
  createdAt: string;
  updatedAt: string;
  syllabi?: SubjectSyllabusSummary[];
}

export interface GetSubjectsParams {
  code?: string;
  status?: SubjectStatus;
  q?: string;
}
