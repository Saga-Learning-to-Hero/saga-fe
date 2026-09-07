import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SubjectService } from "../api/subject-service";
import type {
  SubjectResponse,
  CreateSubjectRequest,
  PatchSubjectRequest,
  GetSubjectsParams,
} from "../types/subject-types";

export const SUBJECT_QUERY_KEYS = {
  all: ["subjects"] as const,
  list: (params?: GetSubjectsParams) => ["subjects", "list", params] as const,
  detail: (id: string) => ["subjects", "detail", id] as const,
};

export function useSubjects(params?: GetSubjectsParams) {
  return useQuery({
    queryKey: SUBJECT_QUERY_KEYS.list(params),
    queryFn: () => SubjectService.getSubjects(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSubjectDetail(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: SUBJECT_QUERY_KEYS.detail(id),
    queryFn: () => SubjectService.getSubjectById(id),
    initialData: () => {
      const list = queryClient.getQueryData<SubjectResponse[]>(
        SUBJECT_QUERY_KEYS.list(undefined)
      );
      return list?.find((s) => s.id === id);
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(SUBJECT_QUERY_KEYS.list(undefined))?.dataUpdatedAt,
    enabled: Boolean(id && id.trim()),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubjectRequest) => SubjectService.createSubject(data),
    onSuccess: (newSubject) => {
      queryClient.setQueryData<SubjectResponse[]>(SUBJECT_QUERY_KEYS.list(undefined), (old) => {
        if (!old) return [newSubject];
        return [newSubject, ...old.filter((s) => s.id !== newSubject.id)];
      });
      queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
      toast.success(`Đã thêm môn học ${newSubject.code} thành công.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "SUBJECT_CODE_ALREADY_EXISTS") {
        toast.error("Mã môn học này đã tồn tại trong hệ thống đào tạo.");
      } else {
        toast.error(err.response?.data?.message || err.message || "Không thể tạo môn học.");
      }
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatchSubjectRequest }) =>
      SubjectService.updateSubject(id, data),
    onSuccess: (updatedSubject) => {
      queryClient.setQueryData<SubjectResponse[]>(SUBJECT_QUERY_KEYS.list(undefined), (old) => {
        if (!old) return [updatedSubject];
        return old.map((s) => (s.id === updatedSubject.id ? { ...s, ...updatedSubject } : s));
      });
      queryClient.setQueryData(SUBJECT_QUERY_KEYS.detail(updatedSubject.id), updatedSubject);
      queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
      toast.success(`Đã cập nhật môn học ${updatedSubject.code} thành công.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Không thể cập nhật môn học.");
    },
  });
}
