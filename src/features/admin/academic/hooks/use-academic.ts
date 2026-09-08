import { useQuery, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
} from "../types/academic-types";
import type {
  CourseResponse,
  CreateCourseRequest,
  PatchCourseRequest,
  GetCoursesParams,
  ConfirmRosterImportRequest,
  GetAdminLecturersParams,
} from "../types/course-roster-types";

export const ACADEMIC_QUERY_KEYS = {
  semesters: ["academic", "semesters"] as const,
  activeSemester: ["academic", "semesters", "active"] as const,
  semesterDetail: (id: string) => ["academic", "semesters", id] as const,
  classes: ["academic", "classes"] as const,
  courses: (params?: GetCoursesParams) => ["academic", "courses", params] as const,
  courseDetail: (id: string) => ["academic", "courseDetail", id] as const,
  roster: (courseId: string) => ["academic", "roster", courseId] as const,
  lecturers: (params?: GetAdminLecturersParams) => ["academic", "lecturers", params] as const,
};

export function prefetchSemestersQuery(queryClient: QueryClient) {
  return queryClient.query({
    queryKey: ACADEMIC_QUERY_KEYS.semesters,
    queryFn: () => AcademicService.getSemesters(),
    staleTime: 1000 * 60 * 5,
  }).catch(() => { });
}

export function prefetchClassesQuery(queryClient: QueryClient) {
  return queryClient.query({
    queryKey: ACADEMIC_QUERY_KEYS.classes,
    queryFn: () => AcademicService.getClasses(),
    staleTime: 1000 * 60 * 5,
  }).catch(() => { });
}

export function prefetchCoursesQuery(queryClient: QueryClient, params?: GetCoursesParams) {
  return queryClient.query({
    queryKey: ACADEMIC_QUERY_KEYS.courses(params),
    queryFn: () => CourseService.getCourses(params),
    staleTime: 1000 * 60 * 5,
  }).catch(() => { });
}

export function prefetchCourseDetailQuery(queryClient: QueryClient, courseId: string) {
  return queryClient.query({
    queryKey: ACADEMIC_QUERY_KEYS.courseDetail(courseId),
    queryFn: () => CourseService.getCourseById(courseId),
    staleTime: 1000 * 60 * 5,
  }).catch(() => { });
}

export function prefetchRosterQuery(queryClient: QueryClient, courseId: string) {
  return queryClient.query({
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
      toast.success(`Đã thêm học kỳ ${newSem.code} thành công.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "SEMESTER_CODE_ALREADY_EXISTS" || code === "SEMESTER_CODE_DUPLICATE") {
        toast.error("Mã học kỳ này đã tồn tại trong hệ thống.");
      } else {
        toast.error(err.response?.data?.message || err.message || "Không thể tạo học kỳ.");
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
      toast.success(`Đã cập nhật học kỳ ${updated.code} thành công.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "SEMESTER_CODE_DUPLICATE" || code === "SEMESTER_CODE_ALREADY_EXISTS") {
        toast.error("Mã học kỳ này đã tồn tại trong hệ thống.");
      } else if (code === "SEMESTER_DATE_RANGE_INVALID") {
        toast.error("Ngày bắt đầu phải trước ngày kết thúc học kỳ.");
      } else {
        toast.error(err.response?.data?.message || err.message || "Không thể cập nhật học kỳ.");
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
      toast.success(`Đã kích hoạt học kỳ ${activeSem.code} làm học kỳ hiện tại.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Không thể kích hoạt học kỳ.");
    },
  });
}

export function useAdminClasses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ACADEMIC_QUERY_KEYS.classes,
    queryFn: () => AcademicService.getClasses(),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
  });
}

export function useCreateAdminClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAcademicClassRequest) => AcademicService.createClass(data),
    onSuccess: (newClass) => {
      queryClient.setQueryData<AcademicClassResponse[]>(ACADEMIC_QUERY_KEYS.classes, (old) => {
        if (!old) return [newClass];
        return [newClass, ...old.filter((c) => c.id !== newClass.id)];
      });
      queryClient.invalidateQueries({ queryKey: ACADEMIC_QUERY_KEYS.classes });
      const displayCode = newClass.classCode || newClass.code || newClass.name || "";
      toast.success(`Đã tạo lớp hành chính ${displayCode} thành công.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "ACADEMIC_CLASS_CODE_DUPLICATE") {
        toast.error("Mã lớp hành chính đã tồn tại trong học kỳ này.");
      } else {
        toast.error(err.response?.data?.message || err.message || "Không thể tạo lớp hành chính.");
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
      queryClient.setQueryData<AcademicClassResponse[]>(ACADEMIC_QUERY_KEYS.classes, (old) => {
        if (!old) return [updatedClass];
        return old.map((c) => (c.id === updatedClass.id ? { ...c, ...updatedClass } : c));
      });
      queryClient.invalidateQueries({ queryKey: ACADEMIC_QUERY_KEYS.classes });
      const displayCode = updatedClass.classCode || updatedClass.code || updatedClass.name || "";
      toast.success(`Đã cập nhật thông tin lớp hành chính ${displayCode}.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "ACADEMIC_CLASS_CODE_DUPLICATE") {
        toast.error("Mã lớp hành chính đã tồn tại trong học kỳ này.");
      } else {
        toast.error(err.response?.data?.message || err.message || "Không thể cập nhật lớp hành chính.");
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
      const cachedCourses = queryClient.getQueryData<CourseResponse[]>(
        ACADEMIC_QUERY_KEYS.courses(undefined)
      );
      return cachedCourses?.find((c) => c.id === courseId);
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourseRequest) => CourseService.createCourse(data),
    onSuccess: (newCourse) => {
      queryClient.setQueryData<CourseResponse[]>(ACADEMIC_QUERY_KEYS.courses(undefined), (old) => {
        if (!old) return [newCourse];
        return [newCourse, ...old.filter((c) => c.id !== newCourse.id)];
      });
      queryClient.invalidateQueries({ queryKey: ["academic", "courses"] });
      const displayCode = newCourse.courseCode || newCourse.classCode || newCourse.name || "";
      toast.success(`Đã tạo lớp học phần ${displayCode} thành công.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Không thể tạo lớp học phần.");
    },
  });
}

export function usePatchCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatchCourseRequest }) =>
      CourseService.patchCourse(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<CourseResponse[]>(ACADEMIC_QUERY_KEYS.courses(undefined), (old) => {
        if (!old) return [];
        return old.map((c) => (c.id === updated.id ? { ...c, ...updated } : c));
      });
      queryClient.invalidateQueries({ queryKey: ["academic", "courses"] });
      toast.success("Đã cập nhật thông tin lớp học phần.");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "COURSE_SYLLABUS_IMMUTABLE") {
        toast.error("Không thể thay đổi đề cương của lớp học phần đã có sinh viên đăng ký hoặc có dự án.");
      } else {
        toast.error(err.response?.data?.message || err.message || "Không thể cập nhật lớp học phần.");
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
      toast.error(err.response?.data?.message || err.message || "Không thể đọc file Excel danh sách sinh viên.");
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
      toast.success(
        `Đã ghi danh ${res.enrolled} sinh viên và gửi thư mời tới ${res.invited} tài khoản mới.`
      );
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Không thể xác nhận import danh sách sinh viên.");
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
      toast.success("Đã tải xuống file Excel mẫu.");
    },
    onError: () => {
      toast.error("Không thể tải file mẫu Excel.");
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

