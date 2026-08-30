export type ManagedRole = "ADMIN" | "LECTURER" | "STUDENT";
export type UserAccountStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BANNED";

export interface ManagedUser {
  id: string;
  email: string;
  fullName: string;
  name?: string; // Tương thích với User
  studentCode?: string; // Mã số sinh viên (MSSV)
  lecturerCode?: string; // Mã cán bộ/giảng viên
  adminClass?: string; // Lớp hành chính
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
