import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LecturerWeightsService } from "../api/lecturer-weights-service";
import { ProjectWeightsService } from "../api/project-weights-service";
import { TeamContributionService } from "../api/team-contribution-service";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/api-error";
import type {
  ContributionConfigModeRequest,
  ContributionOverrideRequest,
  ContributionSliceWeightsRequest,
  ProjectGroupWeightsRequest,
} from "../types/contribution";

function getContributionErrorMessage(error: unknown, fallback: string): string {
  if (getApiErrorCode(error) === "TEAM_MODE_CONFIGURATION_INCOMPLETE") {
    return "Chưa thể chuyển sang cấu hình riêng: mỗi nhóm đã có dự án cần lưu trọng số riêng trước.";
  }
  return getApiErrorMessage(error, fallback);
}

export const CONTRIBUTION_QUERY_KEYS = {
  sliceWeights: (courseId: string) => ["contributionSliceWeights", courseId] as const,
  teamWeights: (courseId: string) => ["contributionTeamWeights", courseId] as const,
  groupWeights: (projectId: string) => ["projectGroupWeights", projectId] as const,
  evaluation: (teamId: string) => ["contributionEvaluation", teamId] as const,
  evaluations: ["contributionEvaluation"] as const,
};

export function useContributionSliceWeights(courseId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: CONTRIBUTION_QUERY_KEYS.sliceWeights(courseId),
    queryFn: () => LecturerWeightsService.getSliceWeights(courseId),
    enabled: (options?.enabled ?? true) && Boolean(courseId && courseId.trim()),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
}

export function useContributionTeamWeights(courseId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: CONTRIBUTION_QUERY_KEYS.teamWeights(courseId),
    queryFn: () => LecturerWeightsService.getTeamWeights(courseId),
    enabled: (options?.enabled ?? true) && Boolean(courseId && courseId.trim()),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
}

export function useProjectGroupWeights(projectId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: CONTRIBUTION_QUERY_KEYS.groupWeights(projectId),
    queryFn: () => ProjectWeightsService.getGroupWeights(projectId),
    enabled: (options?.enabled ?? true) && Boolean(projectId && projectId.trim()),
    staleTime: 1000 * 30,
  });
}

export function useContributionEvaluation(teamId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: CONTRIBUTION_QUERY_KEYS.evaluation(teamId),
    queryFn: () => TeamContributionService.getEvaluation(teamId),
    enabled: (options?.enabled ?? true) && Boolean(teamId && teamId.trim()),
    staleTime: 1000 * 15,
  });
}

export function useUpdateContributionSliceWeights(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ContributionSliceWeightsRequest) =>
      LecturerWeightsService.updateSliceWeights(courseId, payload),
    onSuccess: async (data) => {
      queryClient.setQueryData(CONTRIBUTION_QUERY_KEYS.sliceWeights(courseId), data);
      await queryClient.invalidateQueries({ queryKey: CONTRIBUTION_QUERY_KEYS.evaluations });
      toast.success("Đã lưu trọng số dùng chung cho lớp học phần.");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Không thể lưu trọng số lớp học phần."));
    },
  });
}

export function useUpdateContributionConfigMode(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ContributionConfigModeRequest) =>
      LecturerWeightsService.updateConfigMode(courseId, payload),
    onSuccess: async (data) => {
      queryClient.setQueryData(CONTRIBUTION_QUERY_KEYS.sliceWeights(courseId), data);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CONTRIBUTION_QUERY_KEYS.sliceWeights(courseId) }),
        queryClient.invalidateQueries({ queryKey: CONTRIBUTION_QUERY_KEYS.teamWeights(courseId) }),
        queryClient.invalidateQueries({ queryKey: CONTRIBUTION_QUERY_KEYS.evaluations }),
      ]);
      toast.success(
        data.mode === "PROJECT_GROUP"
          ? "Lớp đang dùng trọng số riêng theo từng dự án nhóm."
          : "Lớp đang dùng một bộ trọng số chung."
      );
    },
    onError: (error: unknown) => {
      toast.error(getContributionErrorMessage(error, "Không thể đổi kiểu cấu hình trọng số."));
    },
  });
}

export function useUpdateProjectGroupWeights(context: {
  courseId: string;
  projectId: string;
  teamId: string;
}) {
  const queryClient = useQueryClient();
  const { courseId, projectId, teamId } = context;

  return useMutation({
    mutationFn: (payload: ProjectGroupWeightsRequest) =>
      ProjectWeightsService.updateGroupWeights(projectId, {
        ...payload,
        teamId: payload.teamId || teamId,
      }),
    onSuccess: async (data) => {
      queryClient.setQueryData(CONTRIBUTION_QUERY_KEYS.groupWeights(projectId), data);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CONTRIBUTION_QUERY_KEYS.groupWeights(projectId) }),
        queryClient.invalidateQueries({ queryKey: CONTRIBUTION_QUERY_KEYS.teamWeights(courseId) }),
        queryClient.invalidateQueries({ queryKey: CONTRIBUTION_QUERY_KEYS.evaluation(teamId) }),
      ]);
      toast.success("Đã lưu trọng số của dự án nhóm.");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Không thể lưu trọng số dự án nhóm."));
    },
  });
}

export function useOverrideContribution(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ContributionOverrideRequest) =>
      TeamContributionService.overrideContribution(teamId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CONTRIBUTION_QUERY_KEYS.evaluation(teamId) });
      toast.success("Đã điều chỉnh tỷ lệ đóng góp. Số liệu được lấy lại từ máy chủ.");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Không thể điều chỉnh tỷ lệ đóng góp."));
    },
  });
}
