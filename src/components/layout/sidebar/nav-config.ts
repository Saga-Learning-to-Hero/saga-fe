import type { Role } from "@/types/auth";
import type { StudentCourse } from "@/features/student/courses/types/student-course";
import {
  lecturerCourseDashboardPath,
  lecturerCourseGradesPath,
  lecturerCourseGraphPath,
  lecturerCourseWeightSettingsPath,
  lecturerCourseTeamsPath,
} from "@/features/lecturer/courses/lib/course-routes";

// ── Types ──────────────────────────────────────────────────────────────

export type NavMatchMode = "exact" | "prefix";

export interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: string;
  match: NavMatchMode;
  badge?: string | number;
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

export const ADMIN_NAV: NavGroup[] = [
  {
    id: "admin-overview",
    label: "",
    roles: ["ADMIN"],
    items: [
      { id: "admin-dashboard", title: "Tổng quan hệ thống", href: "/admin/dashboard", icon: "LayoutDashboard", match: "exact" },
    ],
  },
  {
    id: "admin-management",
    label: "Quản trị học thuật",
    roles: ["ADMIN"],
    items: [
      { id: "admin-users", title: "Quản lý Người dùng (GV & SV)", href: "/admin/users", icon: "Users", match: "exact" },
      { id: "admin-academic", title: "Cấu trúc học thuật & Lớp", href: "/admin/academic", icon: "Database", match: "prefix" },
      { id: "admin-subjects", title: "Chương trình đào tạo (FLM)", href: "/admin/subjects", icon: "BookOpen", match: "prefix" },
    ],
  },
  {
    id: "admin-system",
    label: "Hạ tầng & An ninh",
    roles: ["ADMIN"],
    items: [
      { id: "admin-audit", title: "Nhật ký kiểm toán (Audit Log)", href: "/admin/audit-log", icon: "ScrollText", match: "exact" },
    ],
  },
];

// ── Lecturer Nav Items (Dành cho Top Header Navigation) ────────────────

export function getLecturerNavItems(courseId: string): NavItem[] {
  return [
    {
      id: "course-dashboard",
      title: "Tổng quan",
      href: lecturerCourseDashboardPath(courseId),
      icon: "LayoutDashboard",
      match: "exact",
    },
    {
      id: "course-teams",
      title: "Hoạt động nhóm",
      href: lecturerCourseTeamsPath(courseId),
      icon: "Users",
      match: "prefix",
    },
    {
      id: "course-grades",
      title: "Bảng điểm",
      href: lecturerCourseGradesPath(courseId),
      icon: "ScrollText",
      match: "exact",
    },
    {
      id: "course-graph",
      title: "Đồ thị truy xuất",
      href: lecturerCourseGraphPath(courseId),
      icon: "GitGraph",
      match: "exact",
    },
    {
      id: "course-weights",
      title: "Cấu hình trọng số",
      href: lecturerCourseWeightSettingsPath(courseId),
      icon: "SlidersHorizontal",
      match: "prefix",
    },
  ];
}

// ── Student Nav Items (Dành cho Top Header Navigation) ─────────────────

export function getStudentNavItems(): NavItem[] {
  return [
    {
      id: "student-dashboard",
      title: "Tổng quan",
      href: "/student/dashboard",
      icon: "LayoutDashboard",
      match: "exact",
    },
    {
      id: "student-integrations",
      title: "Tích hợp",
      href: "/student/integrations",
      icon: "Link2",
      match: "exact",
    },
    {
      id: "student-project",
      title: "Dự án",
      href: "/student/project-info",
      icon: "FolderKanban",
      match: "exact",
    },
    {
      id: "student-graph",
      title: "Đồ thị",
      href: "/student/graph",
      icon: "GitGraph",
      match: "exact",
    },
    {
      id: "student-sprint",
      title: "Công việc",
      href: "/student/sprint-progress",
      icon: "Kanban",
      match: "exact",
    },
    {
      id: "student-commits",
      title: "Commit",
      href: "/student/commits",
      icon: "GitCommit",
      match: "exact",
    },
    {
      id: "student-peer",
      title: "Đánh giá",
      href: "/student/peer-assessment",
      icon: "UserCheck",
      match: "exact",
    },
    {
      id: "student-contribution",
      title: "Đóng góp",
      href: "/student/contribution",
      icon: "PieChart",
      match: "exact",
    },
  ];
}

// ── Legacy / Generic getNavGroups (Tương thích Sidebar) ────────────────

export function getNavGroups(
  role: Role,
  courseId: string | null,
  courseCode?: string,
  pathname?: string,
  selectedStudentCourse?: StudentCourse | null,
): NavGroup[] {
  if (role === "ADMIN") {
    return ADMIN_NAV;
  }
  if (role === "LECTURER") {
    if (!courseId) {
      return [
        {
          id: "lecturer-root",
          label: "Giảng dạy",
          roles: ["LECTURER"],
          items: [
            { id: "lecturer-courses", title: "Khóa học của tôi", href: "/lecturer/courses", icon: "BookOpen", match: "exact" },
          ],
        },
      ];
    }
    const courseLabel = courseCode ? `Lớp học · ${courseCode.toUpperCase()}` : "Lớp học";
    return [
      {
        id: "lecturer-back",
        label: "",
        roles: ["LECTURER"],
        items: [
          { id: "lecturer-back-courses", title: "Đổi khóa học", href: "/lecturer/courses", icon: "ArrowLeft", match: "exact" },
        ],
      },
      {
        id: "course-context",
        label: courseLabel,
        roles: ["LECTURER"],
        items: getLecturerNavItems(courseId),
      },
    ];
  }

  // Student
  if (pathname === "/student/courses") {
    return [
      {
        id: "student-root",
        label: "Học tập",
        roles: ["STUDENT"],
        items: [
          { id: "student-courses", title: "Khóa học của tôi", href: "/student/courses", icon: "BookOpen", match: "exact" },
        ],
      },
    ];
  }

  const courseLabel = selectedStudentCourse?.subjectCode
    ? `Môn học · ${selectedStudentCourse.subjectCode.toUpperCase()}`
    : "Học tập";

  return [
    {
      id: "student-back",
      label: "",
      roles: ["STUDENT"],
      items: [
        { id: "student-back-courses", title: "Đổi khóa học", href: "/student/courses", icon: "ArrowLeft", match: "exact" },
      ],
    },
    {
      id: "student-study",
      label: courseLabel,
      roles: ["STUDENT"],
      items: getStudentNavItems(),
    },
  ];
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


