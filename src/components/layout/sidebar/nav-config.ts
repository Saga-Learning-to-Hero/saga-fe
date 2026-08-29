import type { Role } from "@/types/auth";
import {
  lecturerCourseDashboardPath,
  lecturerCourseGradesPath,
  lecturerCourseGraphPath,
  lecturerCourseWeightSettingsPath,
} from "@/features/lecturer/courses/lib/course-routes";

// ── Types ──────────────────────────────────────────────────────────────

export type NavMatchMode = "exact" | "prefix";

export interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: string;
  match: NavMatchMode;
}

export interface NavGroup {
  id: string;
  label: string;
  roles: Role[];
  items: NavItem[];
}

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Kiểm tra NavItem có đang active không dựa trên pathname.
 * - "exact": chỉ active khi pathname === href
 * - "prefix": active khi pathname bắt đầu bằng href (có `/` phân cách)
 */
export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.match === "prefix") {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }
  return pathname === item.href;
}

// ── Admin nav ──────────────────────────────────────────────────────────

const ADMIN_NAV: NavGroup[] = [
  {
    id: "admin-overview",
    label: "",
    roles: ["ADMIN"],
    items: [
      { id: "admin-dashboard", title: "Tổng quan", href: "/admin/dashboard", icon: "LayoutDashboard", match: "exact" },
    ],
  },
  {
    id: "admin-management",
    label: "Quản lý",
    roles: ["ADMIN"],
    items: [
      { id: "admin-users", title: "Người dùng", href: "/admin/users", icon: "UserCog", match: "exact" },
      { id: "admin-projects", title: "Dự án & Nhóm", href: "/admin/projects", icon: "FolderKanban", match: "prefix" },
      { id: "admin-academic", title: "Dữ liệu học thuật", href: "/admin/academic", icon: "Database", match: "prefix" },
    ],
  },
  {
    id: "admin-system",
    label: "Hệ thống",
    roles: ["ADMIN"],
    items: [
      { id: "admin-audit", title: "Nhật ký hoạt động", href: "/admin/audit-log", icon: "ScrollText", match: "exact" },
    ],
  },
];

// ── Lecturer global nav (khi chưa chọn lớp) ───────────────────────────

const LECTURER_GLOBAL_NAV: NavGroup[] = [
  {
    id: "lecturer-root",
    label: "Giảng dạy",
    roles: ["LECTURER"],
    items: [
      { id: "lecturer-courses", title: "Khóa học của tôi", href: "/lecturer/courses", icon: "BookOpen", match: "exact" },
    ],
  },
];

// ── Lecturer course context nav (khi đã vào lớp) ──────────────────────

function buildLecturerCourseNav(courseId: string, courseCode?: string): NavGroup[] {
  const courseLabel = courseCode ? `Lớp học · ${courseCode.toUpperCase()}` : "Lớp học";

  return [
    {
      id: "lecturer-root",
      label: "Giảng dạy",
      roles: ["LECTURER"],
      items: [
        { id: "lecturer-courses", title: "Tất cả khóa học", href: "/lecturer/courses", icon: "BookOpen", match: "exact" },
      ],
    },
    {
      id: "course-context",
      label: courseLabel,
      roles: ["LECTURER"],
      items: [
        { id: "course-dashboard", title: "Dashboard", href: lecturerCourseDashboardPath(courseId), icon: "LayoutDashboard", match: "exact" },
        { id: "course-grades", title: "Bảng điểm", href: lecturerCourseGradesPath(courseId), icon: "ScrollText", match: "exact" },
        { id: "course-graph", title: "Đồ thị truy xuất", href: lecturerCourseGraphPath(courseId), icon: "GitGraph", match: "exact" },
        { id: "course-weights", title: "Cấu hình trọng số", href: lecturerCourseWeightSettingsPath(courseId), icon: "SlidersHorizontal", match: "prefix" },
      ],
    },
  ];
}

// ── Student nav ────────────────────────────────────────────────────────

const STUDENT_NAV: NavGroup[] = [
  {
    id: "student-root",
    label: "",
    roles: ["STUDENT"],
    items: [
      { id: "student-courses", title: "Khóa học của tôi", href: "/student/courses", icon: "BookOpen", match: "exact" },
      { id: "student-dashboard", title: "Tổng quan", href: "/student/dashboard", icon: "LayoutDashboard", match: "exact" },
    ],
  },
  {
    id: "student-study",
    label: "Học tập",
    roles: ["STUDENT"],
    items: [
      { id: "student-project", title: "Thông tin dự án", href: "/student/project-info", icon: "FolderKanban", match: "exact" },
      { id: "student-graph", title: "Đồ thị truy xuất", href: "/student/graph", icon: "GitGraph", match: "exact" },
      { id: "student-sprint", title: "Tiến độ công việc", href: "/student/sprint-progress", icon: "Kanban", match: "exact" },
      { id: "student-commits", title: "Commit", href: "/student/commits", icon: "GitCommit", match: "exact" },
    ],
  },
  {
    id: "student-results",
    label: "Kết quả",
    roles: ["STUDENT"],
    items: [
      { id: "student-peer", title: "Đánh giá chéo", href: "/student/peer-assessment", icon: "UserCheck", match: "exact" },
      { id: "student-contribution", title: "Mức đóng góp", href: "/student/contribution", icon: "PieChart", match: "exact" },
    ],
  },
];

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Trả về navigation groups dựa trên role và course context.
 * Không trộn menu global với course-context — loại bỏ triệt để item trùng.
 */
export function getNavGroups(
  role: Role,
  courseId: string | null,
  courseCode?: string,
): NavGroup[] {
  switch (role) {
    case "ADMIN":
      return ADMIN_NAV;
    case "LECTURER":
      return courseId
        ? buildLecturerCourseNav(courseId, courseCode)
        : LECTURER_GLOBAL_NAV;
    case "STUDENT":
      return STUDENT_NAV;
  }
}

// ── Shared utilities ───────────────────────────────────────────────────

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
