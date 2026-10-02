"use client";

import { useMemo, useState } from "react";
import { getApiErrorCode } from "@/lib/api-error";
import { useLecturerTeams } from "@/features/lecturer/teams/hooks/use-lecturer-teams";
import { useStudentMyTeam } from "@/features/student/courses/hooks/use-student-courses";
import {
  resolveLecturerAssistantProject,
  resolveStudentAssistantProject,
  type AssistantTeamOption,
  type ResolvedAssistantProject,
} from "../lib/assistant-project";
import type { AssistantRouteContext } from "../lib/assistant-route-context";

export interface AssistantProjectState extends ResolvedAssistantProject {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  teams: AssistantTeamOption[];
  selectedTeamId: string;
  setSelectedTeamId: (teamId: string) => void;
}

const EMPTY_PROJECT: ResolvedAssistantProject = {
  projectId: null,
  teamId: null,
  teamLabel: null,
  guidance: null,
  needsTeamPicker: false,
};

export function useAssistantProject(context: AssistantRouteContext | null): AssistantProjectState {
  const [pickedTeamId, setPickedTeamId] = useState("");
  const isStudent = context?.role === "STUDENT";
  const isLecturer = context?.role === "LECTURER";

  const studentTeam = useStudentMyTeam(context?.courseId || "", {
    enabled: Boolean(isStudent && context?.courseId),
  });
  const lecturerTeams = useLecturerTeams(context?.courseId || "", {
    enabled: Boolean(isLecturer && context?.courseId),
  });

  const teams = useMemo<AssistantTeamOption[]>(
    () =>
      (lecturerTeams.data?.teams ?? []).map((team) => ({
        teamId: team.teamId,
        teamNo: team.teamNo,
        teamName: team.teamName,
        projectId: team.projectId,
      })),
    [lecturerTeams.data?.teams]
  );

  const resolved = useMemo(() => {
    if (!context) return EMPTY_PROJECT;
    if (context.role === "STUDENT") {
      if (studentTeam.isLoading) return EMPTY_PROJECT;
      if (studentTeam.isError && !studentTeam.isWaitingForTeam) return EMPTY_PROJECT;
      return resolveStudentAssistantProject({
        teamId: studentTeam.data?.teamId,
        projectId: studentTeam.data?.projectId,
        teamName: studentTeam.data?.teamName,
        teamNo: studentTeam.data?.teamNo,
        isWaitingForTeam: studentTeam.isWaitingForTeam || !studentTeam.data,
      });
    }
    if (lecturerTeams.isLoading || lecturerTeams.isError) return EMPTY_PROJECT;
    return resolveLecturerAssistantProject({
      teams,
      routeTeamId: context.teamId,
      pickedTeamId: pickedTeamId || null,
    });
  }, [context, lecturerTeams.isError, lecturerTeams.isLoading, pickedTeamId, studentTeam.data, studentTeam.isError, studentTeam.isLoading, studentTeam.isWaitingForTeam, teams]);

  const isLoading = Boolean(
    context && ((isStudent && studentTeam.isLoading) || (isLecturer && lecturerTeams.isLoading))
  );
  const isError = Boolean(
    (isStudent && studentTeam.isError && !studentTeam.isWaitingForTeam) ||
      (isLecturer && lecturerTeams.isError)
  );
  const error = isStudent ? studentTeam.error : lecturerTeams.error;

  return {
    ...resolved,
    isLoading,
    isError,
    error,
    refetch: () => {
      if (isStudent) void studentTeam.refetch();
      if (isLecturer) void lecturerTeams.refetch();
    },
    teams,
    selectedTeamId: resolved.teamId ?? "",
    setSelectedTeamId: setPickedTeamId,
  };
}

export function isStudentCourseForbidden(error: unknown): boolean {
  return getApiErrorCode(error) === "STUDENT_COURSE_FORBIDDEN";
}
