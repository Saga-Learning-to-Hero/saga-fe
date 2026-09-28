import { showSuccessToast, showErrorToast } from "@/lib/api-error";
import { useQuery, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { AcademicService } from "../api/academic-service";
import { CourseService } from "../api/course-service";
import { RosterService } from "../api/roster-service";
import { AdminLecturerService } from "../api/admin-lecturer-service";
import type {
  SemesterResponse,
  AcademicClassResponse,
  CreateSemesterRequest,
  PatchSemesterRequest,
  CreateAcademicClassRequest,
  PatchAcademicClassRequest,
  GetClassesParams,
  AcademicClassPageResponse,
} from "../types/academic-types";
import type {
  CourseResponse,
  CreateCourseRequest,
  PatchCourseRequest,
  GetCoursesParams,
  ConfirmRosterImportRequest,
  GetAdminLecturersParams,
  AddStudentToCourseRequest,
  CoursePageResponse,
} from "../types/course-roster-types";

export const ACADEMIC_QUERY_KEYS = {
  semesters: ["academic", "semesters"] as const,
  activeSemester: ["academic", "semesters", "active"] as const,
  semesterDetail: (id: string) => ["academic", "semesters", id] as const,
  classes: (params?: GetClassesParams) => ["academic", "classes", params] as const,
  courses: (params?: GetCoursesParams) => ["academic", "courses", params] as const,
  courseDetail: (id: string) => ["academic", "courseDetail", id] as const,
  roster: (courseId: string) => ["academic", "roster", courseId] as const,
  lecturers: (params?: GetAdminLecturersParams) => ["academic", "lecturers", params] as const,
  pagedLecturers: (params?: GetAdminLecturersParams) => ["academic", "pagedLecturers", params] as const,
};

export function prefetchSemestersQuery(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: ACADEMIC_QUERY_KEYS.semesters,
    queryFn: () => AcademicService.getSemesters(),
    staleTime: 1000 * 60 * 5,
  }).catch(() => { });
}

export function prefetchClassesQuery(queryClient: QueryClient, params?: GetClassesParams) {
  return queryClient.prefetchQuery({
    queryKey: ACADEMIC_QUERY_KEYS.classes(params),
    queryFn: () => AcademicService.getClasses(params),
    staleTime: 1000 * 60 * 5,
  }).catch(() => { });
}

export function prefetchCoursesQuery(queryClient: QueryClient, params?: GetCoursesParams) {
  return queryClient.prefetchQuery({
    queryKey: ACADEMIC_QUERY_KEYS.courses(params),
    queryFn: () => CourseService.getCourses(params),
    staleTime: 1000 * 60 * 5,
  }).catch(() => { });
}

export function prefetchCourseDetailQuery(queryClient: QueryClient, courseId: string) {
  return queryClient.prefetchQuery({
    queryKey: ACADEMIC_QUERY_KEYS.courseDetail(courseId),
    queryFn: () => CourseService.getCourseById(courseId),
    staleTime: 1000 * 60 * 5,
  }).catch(() => { });
}

export function prefetchRosterQuery(queryClient: QueryClient, courseId: string) {
  return queryClient.prefetchQuery({
    queryKey: ACADEMIC_QUERY_KEYS.roster(courseId),
    queryFn: () => RosterService.getRoster(courseId),
    staleTime: 1000 * 60 * 2,
  }).catch(() => { });
}

export function useSemesters(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ACADEMIC_QUERY_KEYS.semesters,
    queryFn: () => AcademicService.getSemesters(),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
  });
}

export function useActiveSemester() {
  return useQuery({
    queryKey: ACADEMIC_QUERY_KEYS.activeSemester,
    queryFn: () => AcademicService.getActiveSemester(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSemesterDetail(semesterId: string) {
  return useQuery({
    queryKey: ACADEMIC_QUERY_KEYS.semesterDetail(semesterId),
    queryFn: () => AcademicService.getSemesterById(semesterId),
    enabled: Boolean(semesterId && semesterId.trim()),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSemester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSemesterRequest) => AcademicService.createSemester(data),
    onSuccess: (newSem) => {
      queryClient.setQueryData<SemesterResponse[]>(ACADEMIC_QUERY_KEYS.semesters, (old) => {
        if (!old) return [newSem];
        return [newSem, ...old.filter((s) => s.id !== newSem.id)];
      });
      queryClient.invalidateQueries({ queryKey: ACADEMIC_QUERY_KEYS.semesters });
      queryClient.invalidateQueries({ queryKey: ACADEMIC_QUERY_KEYS.activeSemester });
      showSuccessToast(`Đã thêm học kỳ ${newSem.code} thành công.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "SEMESTER_CODE_ALREADY_EXISTS" || code === "SEMESTER_CODE_DUPLICATE") {
        showErrorToast("Mã học kỳ này đã tồn tại trong hệ thống.");
      } else {
        showErrorToast(err.response?.data?.message || err.message || "Không thể tạo học kỳ.");
      }
    },
  });
}

export function usePatchSemester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatchSemesterRequest }) =>
      AcademicService.patchSemester(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<SemesterResponse[]>(ACADEMIC_QUERY_KEYS.semesters, (old) => {
        if (!old) return [updated];
        return old.map((s) => (s.id === updated.id ? { ...s, ...updated } : s));
      });
      queryClient.setQueryData(ACADEMIC_QUERY_KEYS.semesterDetail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: ACADEMIC_QUERY_KEYS.semesters });
      queryClient.invalidateQueries({ queryKey: ACADEMIC_QUERY_KEYS.activeSemester });
      showSuccessToast(`Đã cập nhật học kỳ ${updated.code} thành công.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "SEMESTER_CODE_DUPLICATE" || code === "SEMESTER_CODE_ALREADY_EXISTS") {
        showErrorToast("Mã học kỳ này đã tồn tại trong hệ thống.");
      } else if (code === "SEMESTER_DATE_RANGE_INVALID") {
        showErrorToast("Ngày bắt đầu phải trước ngày kết thúc học kỳ.");
      } else {
        showErrorToast(err.response?.data?.message || err.message || "Không thể cập nhật học kỳ.");
      }
    },
  });
}

export function useSetActiveSemester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (semesterId: string) => AcademicService.setActiveSemester(semesterId),
    onSuccess: (activeSem) => {
      queryClient.setQueryData<SemesterResponse[]>(ACADEMIC_QUERY_KEYS.semesters, (old) => {
        if (!old) return [];
        return old.map((s) => ({ ...s, active: s.id === activeSem.id }));
      });
      queryClient.setQueryData(ACADEMIC_QUERY_KEYS.activeSemester, activeSem);
      queryClient.invalidateQueries({ queryKey: ACADEMIC_QUERY_KEYS.semesters });
      queryClient.invalidateQueries({ queryKey: ACADEMIC_QUERY_KEYS.activeSemester });
      showSuccessToast(`Đã kích hoạt học kỳ ${activeSem.code} làm học kỳ hiện tại.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      showErrorToast(err.response?.data?.message || err.message || "Không thể kích hoạt học kỳ.");
    },
  });
}

export function useAdminClasses(params?: GetClassesParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ACADEMIC_QUERY_KEYS.classes(params),
    queryFn: () => AcademicService.getClasses(params),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
  });
}

export function useCreateAdminClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAcademicClassRequest) => AcademicService.createClass(data),
    onSuccess: (newClass) => {
      queryClient.setQueryData<AcademicClassPageResponse | AcademicClassResponse[]>(
        ACADEMIC_QUERY_KEYS.classes(undefined),
        (old) => {
          if (!old) return { items: [newClass], page: 0, size: 50, total: 1 };
          if (Array.isArray(old)) return [newClass, ...old.filter((c) => c.id !== newClass.id)];
          return {
            ...old,
            total: old.total + 1,
            items: [newClass, ...old.items.filter((c) => c.id !== newClass.id)],
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["academic", "classes"] });
      const displayCode = newClass.classCode || newClass.code || newClass.name || "";
      showSuccessToast(`Đã tạo lớp hành chính ${displayCode} thành công.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "ACADEMIC_CLASS_CODE_DUPLICATE") {
        showErrorToast("Mã lớp hành chính đã tồn tại trong học kỳ này.");
      } else {
        showErrorToast(err.response?.data?.message || err.message || "Không thể tạo lớp hành chính.");
      }
    },
  });
}

export function usePatchAdminClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatchAcademicClassRequest }) =>
      AcademicService.patchClass(id, data),
    onSuccess: (updatedClass) => {
      queryClient.setQueryData<AcademicClassPageResponse | AcademicClassResponse[]>(
        ACADEMIC_QUERY_KEYS.classes(undefined),
        (old) => {
          if (!old) return { items: [updatedClass], page: 0, size: 50, total: 1 };
          if (Array.isArray(old)) return old.map((c) => (c.id === updatedClass.id ? { ...c, ...updatedClass } : c));
          return {
            ...old,
            items: old.items.map((c) => (c.id === updatedClass.id ? { ...c, ...updatedClass } : c)),
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["academic", "classes"] });
      const displayCode = updatedClass.classCode || updatedClass.code || updatedClass.name || "";
      showSuccessToast(`Đã cập nhật thông tin lớp hành chính ${displayCode}.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "ACADEMIC_CLASS_CODE_DUPLICATE") {
        showErrorToast("Mã lớp hành chính đã tồn tại trong học kỳ này.");
      } else {
        showErrorToast(err.response?.data?.message || err.message || "Không thể cập nhật lớp hành chính.");
      }
    },
  });
}

export function useCourses(params?: GetCoursesParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ACADEMIC_QUERY_KEYS.courses(params),
    queryFn: () => CourseService.getCourses(params),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
  });
}

export function useCourseDetail(courseId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ACADEMIC_QUERY_KEYS.courseDetail(courseId),
    queryFn: () => CourseService.getCourseById(courseId),
    enabled: Boolean(courseId && courseId.trim()),
    staleTime: 1000 * 60 * 5,
    initialData: () => {
      const cached = queryClient.getQueryData<CoursePageResponse | CourseResponse[]>(
        ACADEMIC_QUERY_KEYS.courses(undefined)
      );
      if (Array.isArray(cached)) {
        return cached.find((c) => c.id === courseId);
      }
      return cached?.items?.find((c) => c.id === courseId);
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourseRequest) => CourseService.createCourse(data),
    onSuccess: (newCourse) => {
      queryClient.setQueryData<CoursePageResponse | CourseResponse[]>(
        ACADEMIC_QUERY_KEYS.courses(undefined),
        (old) => {
          if (!old) return { items: [newCourse], page: 0, size: 50, total: 1 };
          if (Array.isArray(old)) return [newCourse, ...old.filter((c) => c.id !== newCourse.id)];
          return {
            ...old,
            total: old.total + 1,
            items: [newCourse, ...old.items.filter((c) => c.id !== newCourse.id)],
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["academic", "courses"] });
      const displayCode = newCourse.courseCode || newCourse.classCode || newCourse.name || "";
      showSuccessToast(`Đã tạo lớp học phần ${displayCode} thành công.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      showErrorToast(err.response?.data?.message || err.message || "Không thể tạo lớp học phần.");
    },
  });
}

export function usePatchCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatchCourseRequest }) =>
      CourseService.patchCourse(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<CoursePageResponse | CourseResponse[]>(
        ACADEMIC_QUERY_KEYS.courses(undefined),
        (old) => {
          if (!old) return { items: [updated], page: 0, size: 50, total: 1 };
          if (Array.isArray(old)) return old.map((c) => (c.id === updated.id ? { ...c, ...updated } : c));
          return {
            ...old,
            items: old.items.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["academic", "courses"] });
      showSuccessToast("Đã cập nhật thông tin lớp học phần.");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "COURSE_SYLLABUS_IMMUTABLE") {
        showErrorToast("Không thể thay đổi đề cương của lớp học phần đã có sinh viên đăng ký hoặc có dự án.");
      } else {
        showErrorToast(err.response?.data?.message || err.message || "Không thể cập nhật lớp học phần.");
      }
    },
  });
}

export function useRoster(courseId: string) {
  return useQuery({
    queryKey: ACADEMIC_QUERY_KEYS.roster(courseId),
    queryFn: () => RosterService.getRoster(courseId),
    enabled: Boolean(courseId && courseId.trim()),
    staleTime: 1000 * 60 * 2,
  });
}

export function usePreviewRosterImport() {
  return useMutation({
    mutationFn: ({ courseId, file }: { courseId: string; file: File }) =>
      RosterService.previewImport(courseId, file),
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      showErrorToast(err.response?.data?.message || err.message || "Không thể đọc file Excel danh sách sinh viên.");
    },
  });
}

export function useConfirmRosterImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: string;
      data: ConfirmRosterImportRequest;
    }) => RosterService.confirmImport(courseId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({
        queryKey: ACADEMIC_QUERY_KEYS.roster(variables.courseId),
      });
      queryClient.invalidateQueries({ queryKey: ["academic", "courses"] });
      showSuccessToast(
        `Đã ghi danh ${res.enrolled} sinh viên và gửi thư mời tới ${res.invited} tài khoản mới.`
      );
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      showErrorToast(err.response?.data?.message || err.message || "Không thể xác nhận import danh sách sinh viên.");
    },
  });
}

export function useAddStudentToRoster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: string;
      data: AddStudentToCourseRequest;
    }) => RosterService.addStudent(courseId, data),
    onSuccess: (newStudent, variables) => {
      queryClient.invalidateQueries({
        queryKey: ACADEMIC_QUERY_KEYS.roster(variables.courseId),
      });
      queryClient.invalidateQueries({ queryKey: ["academic", "courses"] });
      showSuccessToast(
        `Đã thêm sinh viên ${newStudent.fullName || variables.data.fullName} (${variables.data.studentCode}) vào lớp học phần.`
      );
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "STUDENT_ALREADY_ENROLLED") {
        showErrorToast("Sinh viên này đã được ghi danh trong lớp học phần.");
      } else if (code === "STUDENT_ALREADY_INVITED") {
        showErrorToast("Sinh viên này đã có thư mời đang chờ kích hoạt.");
      } else {
        showErrorToast(err.response?.data?.message || err.message || "Không thể thêm sinh viên vào lớp học phần.");
      }
    },
  });
}

export function useDownloadRosterTemplate() {
  return useMutation({
    mutationFn: async ({ courseId, courseCode }: { courseId: string; courseCode?: string }) => {
      const blob = await RosterService.getRosterTemplate(courseId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `roster-template-${courseCode || courseId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      return blob;
    },
    onSuccess: () => {
      showSuccessToast("Đã tải xuống file Excel mẫu.");
    },
    onError: () => {
      showErrorToast("Không thể tải file mẫu Excel.");
    },
  });
}

export function useAdminLecturers(
  params?: GetAdminLecturersParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ACADEMIC_QUERY_KEYS.lecturers(params),
    queryFn: () => AdminLecturerService.getLecturers(params),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
  });
}

export function usePagedAdminLecturers(
  params?: GetAdminLecturersParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ACADEMIC_QUERY_KEYS.pagedLecturers(params),
    queryFn: () => AdminLecturerService.getPagedLecturers(params),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
  });
}

export function useRemoveEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      enrollmentId,
    }: {
      courseId: string;
      enrollmentId: string;
    }) => RosterService.removeEnrollment(courseId, enrollmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ACADEMIC_QUERY_KEYS.roster(variables.courseId),
      });
      queryClient.invalidateQueries({ queryKey: ["academic", "courses"] });
      showSuccessToast("Đã rút tên sinh viên khỏi lớp học phần (bảo lưu lịch sử đóng góp).");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "TEAM_LEADER_REMOVAL_REQUIRES_REASSIGNMENT") {
        showErrorToast("Sinh viên đang là Trưởng nhóm. Vui lòng chuyển quyền Trưởng nhóm cho thành viên khác trước khi xóa.");
      } else if (code === "ROSTER_STUDENT_ALREADY_REMOVED") {
        showErrorToast("Sinh viên này đã được rút tên trước đó.");
      } else if (code === "ROSTER_STUDENT_NOT_FOUND") {
        showErrorToast("Không tìm thấy thông tin sinh viên trong lớp học phần này.");
      } else {
        showErrorToast(err.response?.data?.message || err.message || "Không thể rút tên sinh viên khỏi lớp học phần.");
      }
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      invitationId,
    }: {
      courseId: string;
      invitationId: string;
    }) => RosterService.cancelInvitation(courseId, invitationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ACADEMIC_QUERY_KEYS.roster(variables.courseId),
      });
      queryClient.invalidateQueries({ queryKey: ["academic", "courses"] });
      showSuccessToast("Đã hủy thư mời tham gia lớp học phần.");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "ROSTER_STUDENT_ALREADY_REMOVED") {
        showErrorToast("Thư mời này đã được xử lý hoặc hủy trước đó.");
      } else if (code === "ROSTER_STUDENT_NOT_FOUND") {
        showErrorToast("Không tìm thấy thông tin thư mời trong lớp học phần này.");
      } else {
        showErrorToast(err.response?.data?.message || err.message || "Không thể hủy thư mời tham gia lớp học phần.");
      }
    },
  });
}


