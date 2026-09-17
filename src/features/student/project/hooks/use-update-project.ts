"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectProjectionService } from "../api/project-projection-service";
import type { UpdateStudentProjectRequest } from "../types/student-project";

export function useUpdateProject(projectId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStudentProjectRequest) => {
      if (!projectId || !projectId.trim()) {
        throw new Error("Mã dự án không hợp lệ.");
      }
      return ProjectProjectionService.patchProject(projectId, payload);
    },
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ["student", "courses"] });
      void queryClient.invalidateQueries({ queryKey: ["student"] });
      void queryClient.invalidateQueries({ queryKey: ["project-progress"] });
      queryClient.setQueriesData(
        { queryKey: ["student", "courses"] },
        (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          const typed = old as Record<string, unknown>;
          if (typed.projectId === updated.projectId || typed.id === updated.projectId) {
            return {
              ...typed,
              name: updated.name,
              description: updated.description,
            };
          }
          return old;
        }
      );
    },
  });
}
