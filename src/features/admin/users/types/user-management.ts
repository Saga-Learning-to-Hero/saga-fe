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

export interface AdminUserItemResponse {
  id: string;
  email: string;
  username?: string | null;
  fullName: string;
  avatarUrl?: string | null;
  role: string;
  accountStatus: string;
  studentCode?: string | null;
  lecturerProfileId?: string | null;
  createdAt: string;
}

export interface AdminUsersListResponse {
  items: AdminUserItemResponse[];
  page: number;
  size: number;
  total: number;
}

export interface GetAdminUsersParams {
  q?: string;
  role?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface UpdateUserStatusRequest {
  status: "ACTIVE" | "INACTIVE";
}

export function mapAdminUserResponseToManagedUser(
  item: AdminUserItemResponse
): ManagedUser {
  const normalizedRole: ManagedRole =
    item.role?.toUpperCase() === "LECTURER" ? "LECTURER" : "STUDENT";

  let normalizedStatus: UserAccountStatus = "ACTIVE";
  const rawStatus = item.accountStatus?.toUpperCase();
  if (rawStatus === "INACTIVE") {
    normalizedStatus = "INACTIVE";
  } else if (rawStatus === "BANNED") {
    normalizedStatus = "BANNED";
  } else if (rawStatus === "PENDING") {
    normalizedStatus = "PENDING";
  } else {
    normalizedStatus = "ACTIVE";
  }

  return {
    id: item.id,
    email: item.email,
    fullName: item.fullName || item.username || "Chưa cập nhật tên",
    name: item.fullName || item.username || "Chưa cập nhật",
    studentCode: item.studentCode || undefined,
    role: normalizedRole,
    status: normalizedStatus,
    avatar: item.avatarUrl || undefined,
    createdAt: item.createdAt,
  };
}
