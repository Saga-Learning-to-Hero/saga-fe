export type ManagedRole = "LECTURER" | "STUDENT";
export type UserAccountStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BANNED";

export interface ManagedUser {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  studentCode?: string;
  lecturerCode?: string;
  adminClass?: string;
  role: ManagedRole;
  status: UserAccountStatus;
  avatar?: string;
  department?: string;
  phone?: string;
  bio?: string;
  createdAt: string;
  lastActiveAt?: string;
  banReason?: string;
}
