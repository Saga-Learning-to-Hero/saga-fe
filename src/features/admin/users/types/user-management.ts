export type ManagedRole = "LECTURER" | "STUDENT";
export type UserAccountStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BANNED";

export interface ManagedUser {
  id: string;
  email: string;
  fullName: string;
  studentCode?: string; // Mã số sinh viên (MSSV) - Chỉ có ở Sinh viên (STUDENT)
  role: ManagedRole;
  status: UserAccountStatus;
  avatar?: string;
  department?: string;
  createdAt: string;
  lastActiveAt?: string;
  banReason?: string;
}
