import { describe, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fptTest } from "@/testing/fpt-test-helper";
import { useAuditNameResolver } from "@/features/admin/audit-log/hooks/use-audit-name-resolver";

const mockCourses = [
  {
    id: "course-uuid-01",
    courseCode: "SWP391_FA26_SE1705",
    name: "dự án Phát triển Phần mềm",
  },
];

const mockClasses = [
  {
    id: "class-uuid-01",
    code: "SE1705",
    name: "K17 Software Engineering",
  },
];

const mockUsers = {
  items: [
    {
      id: "user-uuid-01",
      fullName: "Nguyễn Văn Sinh Viên",
      email: "sinhvien@fpt.edu.vn",
      studentCode: "SE170504",
      role: "STUDENT",
    },
    {
      id: "user-uuid-admin",
      fullName: "Trần Quản Trị",
      email: "admin@fpt.edu.vn",
      role: "ADMIN",
    },
  ],
  total: 2,
};

const mockSubjects = [
  {
    id: "subject-uuid-01",
    code: "SWP391",
    nameVietnamese: "dự án Kỹ thuật Phần mềm",
    nameEnglish: "Software Development Project",
  },
];

vi.mock("@/features/admin/academic/hooks/use-academic", () => ({
  useCourses: vi.fn(() => ({ data: mockCourses, isLoading: false })),
  useAdminClasses: vi.fn(() => ({ data: mockClasses, isLoading: false })),
}));

vi.mock("@/features/admin/users/hooks/use-admin-users", () => ({
  useAdminUsers: vi.fn(() => ({ data: mockUsers, isLoading: false })),
}));

vi.mock("@/features/admin/subjects/hooks/use-subjects", () => ({
  useSubjects: vi.fn(() => ({ data: mockSubjects, isLoading: false })),
}));

describe("useAuditNameResolver - Giải mã ID sang Tên đối tượng trên Frontend", () => {
  let wrapper: React.FC<{ children: React.ReactNode }>;
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    wrapper = ({ children }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "16/09/2026",
      description: "Giai ma ten Course tu courseId khop trong danh muc cache FE",
    },
    () => {
      const { result } = renderHook(() => useAuditNameResolver(), { wrapper });
      const courseName = result.current.resolveCourseName("course-uuid-01");
      expect(courseName).toBe("SWP391_FA26_SE1705 - dự án Phát triển Phần mềm");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "16/09/2026",
      description: "Giai ma ten Class tu classId khop trong danh muc cache FE",
    },
    () => {
      const { result } = renderHook(() => useAuditNameResolver(), { wrapper });
      const className = result.current.resolveClassName("class-uuid-01");
      expect(className).toBe("K17 Software Engineering (SE1705)");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "16/09/2026",
      description: "Giai ma day du thong tin User (ho ten, email, MSSV) tu userId",
    },
    () => {
      const { result } = renderHook(() => useAuditNameResolver(), { wrapper });
      const user = result.current.resolveUserInfo("user-uuid-01");
      expect(user).not.toBeNull();
      expect(user?.fullName).toBe("Nguyễn Văn Sinh Viên");
      expect(user?.email).toBe("sinhvien@fpt.edu.vn");
      expect(user?.studentCode).toBe("SE170504");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "16/09/2026",
      description: "Giai ma ten Subject tu subjectId khop trong danh muc cache FE",
    },
    () => {
      const { result } = renderHook(() => useAuditNameResolver(), { wrapper });
      const subjectName = result.current.resolveSubjectName("subject-uuid-01");
      expect(subjectName).toBe("SWP391 - dự án Kỹ thuật Phần mềm");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "16/09/2026",
      description: "resolveTargetName tra ve ten thuc the phu hop cho USER, COURSE, CLASS, SUBJECT",
    },
    () => {
      const { result } = renderHook(() => useAuditNameResolver(), { wrapper });

      expect(result.current.resolveTargetName("USER", "user-uuid-01")).toBe(
        "Nguyễn Văn Sinh Viên"
      );
      expect(result.current.resolveTargetName("COURSE", "course-uuid-01")).toBe(
        "SWP391_FA26_SE1705 - dự án Phát triển Phần mềm"
      );
      expect(result.current.resolveTargetName("CLASS", "class-uuid-01")).toBe(
        "K17 Software Engineering (SE1705)"
      );
      expect(result.current.resolveTargetName("SUBJECT", "subject-uuid-01")).toBe(
        "SWP391 - dự án Kỹ thuật Phần mềm"
      );
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "16/09/2026",
      description: "resolveTargetSubtext tra ve email cho USER va fallback hop ly",
    },
    () => {
      const { result } = renderHook(() => useAuditNameResolver(), { wrapper });

      expect(result.current.resolveTargetSubtext("USER", "user-uuid-01")).toBe(
        "MSSV: SE170504 • sinhvien@fpt.edu.vn"
      );
      expect(
        result.current.resolveTargetSubtext("JIRA", "jira-123", "JIRA • SAGA-15")
      ).toBe("JIRA • SAGA-15");
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "B",
      executedDate: "16/09/2026",
      description: "resolveActorName tra ve ho ten user neu khop hoac fallback khi khong tim thay",
    },
    () => {
      const { result } = renderHook(() => useAuditNameResolver(), { wrapper });

      expect(result.current.resolveActorName("user-uuid-admin")).toBe("Trần Quản Trị");
      expect(
        result.current.resolveActorName("unknown-actor", "Hệ thống SAGA")
      ).toBe("Hệ thống SAGA");
      expect(result.current.resolveActorName(null)).toBe("Hệ thống SAGA");
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "16/09/2026",
      description: "Xu ly bien an toan khi ID truyen vao la null, undefined hoac chuoi rong",
    },
    () => {
      const { result } = renderHook(() => useAuditNameResolver(), { wrapper });

      expect(result.current.resolveCourseName(null)).toBeNull();
      expect(result.current.resolveCourseName("")).toBeNull();
      expect(result.current.resolveClassName(undefined)).toBeNull();
      expect(result.current.resolveUserInfo("")).toBeNull();
      expect(result.current.resolveSubjectName(null)).toBeNull();
      expect(result.current.resolveTargetName("UNKNOWN", "", "Mac dinh")).toBe("Mac dinh");
      expect(result.current.resolveTargetName("CUSTOM", "abc123456789")).toBe("CUSTOM");
      expect(result.current.resolveValueToName("courseId", "course-uuid-01")).toBe(
        "SWP391_FA26_SE1705 - dự án Phát triển Phần mềm"
      );
      expect(result.current.resolveValueToName("unknownField", "123")).toBeNull();
    }
  );
});
