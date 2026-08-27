import type { Role } from "@/types/auth";

export interface NavItem {
  title: string;
  href: string;
  icon: string;
}

export interface NavGroup {
  label: string;
  roles: Role[];
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  // ── Admin ──────────────────────────────────────────────────────────
  {
    label: "",
    roles: ["ADMIN"],
    items: [
      { title: "Tổng quan", href: "/admin/dashboard", icon: "LayoutDashboard" },
    ],
  },

  // ── Admin: Quản lý ────────────────────────────────────────────────
  {
    label: "Quản lý",
    roles: ["ADMIN"],
    items: [
      { title: "Người dùng", href: "/admin/users", icon: "UserCog" },
      { title: "Dự án & Nhóm", href: "/admin/projects", icon: "FolderKanban" },
      { title: "Dữ liệu học thuật", href: "/admin/academic", icon: "Database" },
    ],
  },

  // ── Admin: Hệ thống ───────────────────────────────────────────────
  {
    label: "Hệ thống",
    roles: ["ADMIN"],
    items: [
      { title: "Nhật ký hoạt động", href: "/admin/audit-log", icon: "ScrollText" },
    ],
  },

  // ── Giảng viên: Giảng dạy ─────────────────────────────────────────
  {
    label: "Lớp học",
    roles: ["LECTURER"],
    items: [
      { title: "Lớp học của tôi", href: "/lecturer/courses", icon: "BookOpen" },
    ],
  },

  // ── Giảng viên: Phân tích ─────────────────────────────────────────
  {
    label: "Phân tích",
    roles: ["LECTURER"],
    items: [
      { title: "Đồ thị truy xuất", href: "/graph", icon: "GitGraph" },
      { title: "Đánh giá nhóm", href: "/lecturer/assessment", icon: "ClipboardCheck" },
      { title: "Bảng đóng góp", href: "/lecturer/contribution", icon: "PieChart" },
    ],
  },

  // ── Sinh viên ─────────────────────────────────────────────────────
  {
    label: "",
    roles: ["STUDENT"],
    items: [
      { title: "Tổng quan", href: "/student/dashboard", icon: "LayoutDashboard" },
    ],
  },

  // ── Sinh viên: Học tập ────────────────────────────────────────────
  {
    label: "Học tập",
    roles: ["STUDENT"],
    items: [
      { title: "Đồ thị truy xuất", href: "/graph", icon: "GitGraph" },
      { title: "Nhiệm vụ của tôi", href: "/tasks", icon: "ClipboardList" },
    ],
  },

  // ── Sinh viên: Kết quả ────────────────────────────────────────────
  {
    label: "Kết quả",
    roles: ["STUDENT"],
    items: [
      { title: "Đánh giá của tôi", href: "/assessment", icon: "GraduationCap" },
      { title: "Mức đóng góp", href: "/contribution", icon: "PieChart" },
    ],
  },
];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Quản trị viên",
  LECTURER: "Giảng viên",
  STUDENT: "Sinh viên",
};

export const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "bg-danger-muted text-danger",
  LECTURER: "bg-warning-muted text-warning",
  STUDENT: "bg-info-muted text-info",
};

export function getInitials(name: string) {
  return name.split(" ").slice(-2).map((n) => n[0]).join("").toUpperCase();
}
