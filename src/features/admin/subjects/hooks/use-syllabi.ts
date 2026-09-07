import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SyllabusService } from "../api/syllabus-service";
import type {
  SyllabusSummaryResponse,
  SyllabusDetailResponse,
  CreateSyllabusRequest,
  PatchSyllabusRequest,
  ReplaceSyllabusStructureRequest,
} from "../types/syllabus-types";
import { SUBJECT_QUERY_KEYS } from "./use-subjects";

export const SYLLABUS_QUERY_KEYS = {
  all: ["syllabi"] as const,
  bySubject: (subjectId: string) => ["syllabi", "bySubject", subjectId] as const,
  detail: (subjectId: string, versionId: string) =>
    ["syllabi", "detail", subjectId, versionId] as const,
};

export function useSyllabi(subjectId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: SYLLABUS_QUERY_KEYS.bySubject(subjectId),
    queryFn: () => SyllabusService.getSyllabi(subjectId),
    initialData: () => {
      const detail = queryClient.getQueryData<{ syllabi?: Array<{ id: string; versionLabel: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; credits?: number | null; createdAt: string }> }>(
        SUBJECT_QUERY_KEYS.detail(subjectId)
      );
      if (detail?.syllabi && detail.syllabi.length > 0) {
        return detail.syllabi.map((s) => ({
          id: s.id,
          subjectId,
          versionLabel: s.versionLabel,
          status: s.status,
          credits: s.credits,
          createdAt: s.createdAt,
          updatedAt: s.createdAt,
        }));
      }
      return undefined;
    },
    enabled: Boolean(subjectId && subjectId.trim()),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSyllabusDetail(subjectId: string, versionId: string) {
  return useQuery({
    queryKey: SYLLABUS_QUERY_KEYS.detail(subjectId, versionId),
    queryFn: () => SyllabusService.getSyllabusDetail(subjectId, versionId),
    enabled: Boolean(subjectId && versionId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSyllabusDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subjectId,
      data,
    }: {
      subjectId: string;
      data: CreateSyllabusRequest;
    }) => SyllabusService.createDraft(subjectId, data),
    onSuccess: (newDraft, variables) => {
      queryClient.setQueryData<SyllabusSummaryResponse[]>(
        SYLLABUS_QUERY_KEYS.bySubject(variables.subjectId),
        (old) => {
          if (!old) return [newDraft];
          return [newDraft, ...old.filter((s) => s.id !== newDraft.id)];
        }
      );
      queryClient.invalidateQueries({
        queryKey: SYLLABUS_QUERY_KEYS.bySubject(variables.subjectId),
      });
      queryClient.invalidateQueries({
        queryKey: SUBJECT_QUERY_KEYS.detail(variables.subjectId),
      });
      toast.success("Đã tạo phiên bản đề cương DRAFT mới.");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Không thể tạo bản nháp đề cương.");
    },
  });
}

export function useUpdateSyllabusMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subjectId,
      versionId,
      data,
    }: {
      subjectId: string;
      versionId: string;
      data: PatchSyllabusRequest;
    }) => SyllabusService.updateMetadata(subjectId, versionId, data),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData<SyllabusDetailResponse>(
        SYLLABUS_QUERY_KEYS.detail(variables.subjectId, variables.versionId),
        (old) => (old ? { ...old, ...updated } : (updated as SyllabusDetailResponse))
      );
      queryClient.invalidateQueries({
        queryKey: SYLLABUS_QUERY_KEYS.bySubject(variables.subjectId),
      });
      queryClient.invalidateQueries({
        queryKey: SYLLABUS_QUERY_KEYS.detail(variables.subjectId, variables.versionId),
      });
      toast.success("Đã cập nhật thông tin đề cương.");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "SYLLABUS_PUBLISHED_IMMUTABLE") {
        toast.error("Đề cương đã xuất bản không được phép thay đổi thông tin.");
      } else {
        toast.error(err.response?.data?.message || err.message || "Không thể cập nhật đề cương.");
      }
    },
  });
}

export function useReplaceSyllabusStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subjectId,
      versionId,
      data,
    }: {
      subjectId: string;
      versionId: string;
      data: ReplaceSyllabusStructureRequest;
    }) => SyllabusService.replaceStructure(subjectId, versionId, data),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(
        SYLLABUS_QUERY_KEYS.detail(variables.subjectId, variables.versionId),
        updated
      );
      queryClient.invalidateQueries({
        queryKey: SYLLABUS_QUERY_KEYS.detail(variables.subjectId, variables.versionId),
      });
      toast.success("Đã lưu cấu trúc tiêu chí đề cương thành công.");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "SYLLABUS_NOT_DRAFT") {
        toast.error("Chỉ có thể sửa cấu trúc khi đề cương đang ở trạng thái DRAFT.");
      } else if (code === "SYLLABUS_PUBLISHED_IMMUTABLE") {
        toast.error("Đề cương đã xuất bản là bất biến, không thể chỉnh sửa cấu trúc.");
      } else {
        toast.error(err.response?.data?.message || err.message || "Không thể lưu cấu trúc đề cương.");
      }
    },
  });
}

export function usePublishSyllabus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subjectId,
      versionId,
    }: {
      subjectId: string;
      versionId: string;
    }) => SyllabusService.publish(subjectId, versionId),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<SyllabusDetailResponse>(
        SYLLABUS_QUERY_KEYS.detail(variables.subjectId, variables.versionId),
        (old) => (old ? { ...old, status: "PUBLISHED" as const } : old)
      );
      queryClient.invalidateQueries({
        queryKey: SYLLABUS_QUERY_KEYS.bySubject(variables.subjectId),
      });
      queryClient.invalidateQueries({
        queryKey: SYLLABUS_QUERY_KEYS.detail(variables.subjectId, variables.versionId),
      });
      queryClient.invalidateQueries({
        queryKey: SUBJECT_QUERY_KEYS.detail(variables.subjectId),
      });
      toast.success("Đã xuất bản đề cương (PUBLISHED). Đề cương hiện có thể gán vào lớp học phần.");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "SYLLABUS_NOT_DRAFT") {
        toast.error("Đề cương không ở trạng thái DRAFT nên không thể xuất bản.");
      } else {
        toast.error(err.response?.data?.message || err.message || "Không thể xuất bản đề cương.");
      }
    },
  });
}

export function useArchiveSyllabus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subjectId,
      versionId,
    }: {
      subjectId: string;
      versionId: string;
    }) => SyllabusService.archive(subjectId, versionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: SYLLABUS_QUERY_KEYS.bySubject(variables.subjectId),
      });
      queryClient.invalidateQueries({
        queryKey: SYLLABUS_QUERY_KEYS.detail(variables.subjectId, variables.versionId),
      });
      toast.success("Đã chuyển đề cương sang trạng thái lưu trữ (ARCHIVED).");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Không thể lưu trữ đề cương.");
    },
  });
}
