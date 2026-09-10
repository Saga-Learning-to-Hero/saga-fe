import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LecturerTeamService } from "../api/lecturer-team-service";
import { LECTURER_COURSE_QUERY_KEYS } from "@/features/lecturer/courses/hooks/use-lecturer-courses";
import { CONTRIBUTION_QUERY_KEYS } from "@/features/lecturer/contribution/hooks/use-lecturer-contribution";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/api-error";
import { TEAM_TEMPLATE_FILENAME, type ConfirmTeamImportRequest } from "../types/lecturer-team";

export const LECTURER_TEAM_QUERY_KEYS = {
  lecturerTeams: (courseId: string) => ["lecturerTeams", courseId] as const,
};

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export function useLecturerTeams(courseId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: LECTURER_TEAM_QUERY_KEYS.lecturerTeams(courseId),
    queryFn: () => LecturerTeamService.getTeams(courseId),
    enabled: (options?.enabled ?? true) && Boolean(courseId && courseId.trim()),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
}

export function useDownloadTeamTemplate() {
  return useMutation({
    mutationFn: async (courseId: string) => {
      const blob = await LecturerTeamService.getTemplate(courseId);
      downloadBlob(blob, TEAM_TEMPLATE_FILENAME);
      return blob;
    },
    onSuccess: () => {
      toast.success("Đã tải file mẫu Team_Assignment.xlsx.");
    },
  });
}

export function usePreviewTeamImport() {
  return useMutation({
    mutationFn: ({ courseId, file }: { courseId: string; file: File }) =>
      LecturerTeamService.previewImport(courseId, file),
  });
}

function invalidateTeamCoordination(queryClient: QueryClient, courseId: string) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: LECTURER_TEAM_QUERY_KEYS.lecturerTeams(courseId),
    }),
    queryClient.invalidateQueries({
      queryKey: LECTURER_COURSE_QUERY_KEYS.lecturerRoster(courseId),
    }),
    queryClient.invalidateQueries({
      queryKey: CONTRIBUTION_QUERY_KEYS.teamWeights(courseId),
    }),
    queryClient.invalidateQueries({
      queryKey: CONTRIBUTION_QUERY_KEYS.evaluations,
    }),
  ]);
}

export function useReplaceTeamLeader(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, teamMemberId }: { teamId: string; teamMemberId: string }) =>
      LecturerTeamService.replaceLeader(courseId, teamId, teamMemberId),
    onSuccess: async () => {
      await invalidateTeamCoordination(queryClient, courseId);
      toast.success("Đã đổi trưởng nhóm. Danh sách nhóm được tải lại từ máy chủ.");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Không thể đổi trưởng nhóm."));
    },
  });
}

export function useMoveTeamMember(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamMemberId,
      targetTeamId,
    }: {
      teamMemberId: string;
      targetTeamId: string;
    }) => LecturerTeamService.moveMember(courseId, teamMemberId, targetTeamId),
    onSuccess: async () => {
      await invalidateTeamCoordination(queryClient, courseId);
      toast.success("Đã chuyển thành viên sang nhóm khác. Dữ liệu nhóm được tải lại từ máy chủ.");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Không thể chuyển thành viên sang nhóm khác."));
    },
  });
}

export function useConfirmTeamImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: string;
      data: ConfirmTeamImportRequest;
    }) => LecturerTeamService.confirmImport(courseId, data),
    onSuccess: async (result, variables) => {
      await Promise.all([
        invalidateTeamCoordination(queryClient, variables.courseId),
        queryClient.invalidateQueries({
          queryKey: CONTRIBUTION_QUERY_KEYS.sliceWeights(variables.courseId),
        }),
      ]);
      toast.success(
        `Đã xác nhận phân nhóm: tạo ${result.createdTeams}, cập nhật ${result.updatedTeams}, gán ${result.assignedMembers}, chuyển ${result.reassignedMembers}, đổi vai trò ${result.updatedRoles}, không đổi ${result.unchanged}, email ${result.emailsEnqueued}.`
      );
    },
  });
}

export function getTeamImportErrorMessage(error: unknown): string {
  const code = getApiErrorCode(error);
  switch (code) {
    case "TEAM_PREVIEW_INVALID":
      return "Token xem trước không hợp lệ. Vui lòng tải file lên lại.";
    case "TEAM_PREVIEW_EXPIRED":
      return "Token xem trước đã hết hạn (TTL 15 phút) hoặc đã dùng. Vui lòng preview lại.";
    case "TEAM_PREVIEW_MISMATCH":
      return "Token xem trước không khớp lớp hoặc tài khoản hiện tại. Hãy preview lại đúng lớp đang mở.";
    case "TEAM_CONFIRM_BLOCKED":
      return "Xác nhận bị chặn vì file còn lỗi. Hãy sửa Excel rồi preview lại.";
    case "TEAM_LEADER_INVALID":
      return "Mỗi TeamNo phải có đúng một Leader. Không dùng MENTOR.";
    case "TEAM_FILE_INVALID":
      return "File Excel không đúng mẫu. Hãy tải lại mẫu chính thức Team_Assignment.xlsx.";
    case "TEAM_FILE_TOO_LARGE":
      return "File vượt giới hạn máy chủ hiện tại (2 MB). Hãy giảm dung lượng rồi thử lại.";
    case "LECTURER_COURSE_FORBIDDEN":
      return "Bạn không có quyền thao tác trên lớp học phần này.";
    default:
      return getApiErrorMessage(error, "Không thể hoàn tất phân nhóm từ file Excel.");
  }
}

export function shouldClearTeamPreview(error: unknown): boolean {
  const code = getApiErrorCode(error);
  return (
    code === "TEAM_PREVIEW_INVALID" ||
    code === "TEAM_PREVIEW_EXPIRED" ||
    code === "TEAM_PREVIEW_MISMATCH"
  );
}
