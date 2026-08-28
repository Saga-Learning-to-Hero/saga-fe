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
  // ── Chung ──────────────────────────────────────────────────────────
  {
    label: "",
    roles: ["ADMIN", "LECTURER", "STUDENT"],
    items: [
      { title: "Tổng quan", href: "/dashboard", icon: "LayoutDashboard" },
    ],
  },

  // ── Giảng viên: Giảng dạy ─────────────────────────────────────────
  {
    label: "Giảng dạy",
    roles: ["LECTURER"],
    items: [
      { title: "Khóa học của tôi", href: "/lecturer/courses", icon: "BookOpen" },
      { title: "Danh sách nhóm", href: "/lecturer/groups", icon: "Users" },
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

  // ── Sinh viên: Học tập ────────────────────────────────────────────
  {
    label: "Học tập",
    roles: ["STUDENT"],
    items: [
      { title: "Thông tin dự án", href: "/project-info", icon: "FolderKanban" },
      { title: "Tiến độ công việc", href: "/sprint-progress", icon: "Kanban" },
      { title: "Đồ thị truy xuất", href: "/graph", icon: "GitGraph" },
      { title: "Commit", href: "/commits", icon: "GitCommit" },
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
