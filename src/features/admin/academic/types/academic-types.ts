export interface CreateSemesterRequest {
  code: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface PatchSemesterRequest {
  code?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
}

export interface SetActiveSemesterRequest {
  semesterId: string;
}

export interface SemesterResponse {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
  status?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAcademicClassRequest {
  classCode?: string;
  code?: string;
  name: string;
  semesterId: string;
}

export interface PatchAcademicClassRequest {
  classCode?: string;
  name?: string;
}

export interface AcademicClassResponse {
  id: string;
  classCode: string;
  code?: string;
  name: string;
  semesterId: string;
  semesterCode?: string | null;
  createdAt: string;
  updatedAt?: string;
}
