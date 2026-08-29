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
  {
    label: "",
    roles: ["ADMIN"],
    items: [{ title: "Tổng quan", href: "/admin/dashboard", icon: "LayoutDashboard" }],
  },
  {
    label: "Quản lý",
    roles: ["ADMIN"],
    items: [
      { title: "Người dùng", href: "/admin/users", icon: "UserCog" },
      { title: "Dự án & Nhóm", href: "/admin/projects", icon: "FolderKanban" },
      { title: "Dữ liệu học thuật", href: "/admin/academic", icon: "Database" },
    ],
  },
  {
    label: "Hệ thống",
    roles: ["ADMIN"],
    items: [{ title: "Nhật ký hoạt động", href: "/admin/audit-log", icon: "ScrollText" }],
  },
  {
    label: "Giảng dạy",
    roles: ["LECTURER"],
    items: [
      { title: "Khóa học của tôi", href: "/lecturer/courses", icon: "BookOpen" },
      { title: "Danh sách nhóm", href: "/lecturer/groups", icon: "Users" },
    ],
  },
  {
    label: "Phân tích",
    roles: ["LECTURER"],
    items: [
      { title: "Đồ thị truy xuất", href: "/graph", icon: "GitGraph" },
      { title: "Đánh giá nhóm", href: "/lecturer/assessment", icon: "ClipboardCheck" },
      { title: "Bảng đóng góp", href: "/lecturer/contribution", icon: "PieChart" },
    ],
  },
  {
    label: "",
    roles: ["STUDENT"],
    items: [
      { title: "Khóa học của tôi", href: "/student/courses", icon: "BookOpen" },
      { title: "Tổng quan", href: "/student/dashboard", icon: "LayoutDashboard" },
    ],
  },
  {
    label: "Học tập",
    roles: ["STUDENT"],
    items: [
      { title: "Thông tin dự án", href: "/student/project-info", icon: "FolderKanban" },
      { title: "Tiến độ công việc", href: "/student/sprint-progress", icon: "Kanban" },
      { title: "Đồ thị truy xuất", href: "/student/graph", icon: "GitGraph" },
      { title: "Commit", href: "/student/commits", icon: "GitCommit" },
    ],
  },
  {
    label: "Kết quả",
    roles: ["STUDENT"],
    items: [
      { title: "Đánh giá của tôi", href: "/student/assessment", icon: "GraduationCap" },
      { title: "Mức đóng góp", href: "/student/contribution", icon: "PieChart" },
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
  return name.split(" ").slice(-2).map((part) => part[0]).join("").toUpperCase();
}
