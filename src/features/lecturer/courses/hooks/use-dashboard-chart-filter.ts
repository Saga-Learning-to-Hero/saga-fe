"use client";

import { useMemo, useState } from "react";
import { filterDashboardTeamsByScope } from "../lib/lecturer-dashboard-format";
import type { LecturerDashboardTeam } from "../types/lecturer-course-dashboard";

export function useDashboardChartFilter(teams: LecturerDashboardTeam[]) {
  const [selectedTeamId, setSelectedTeamId] = useState("all");

  const teamOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả nhóm" },
      ...teams.map((team) => ({
        value: team.teamId,
        label: team.teamName || `Nhóm ${team.teamNo}`,
        subLabel: team.projectName || "Chưa có tên dự án",
      })),
    ],
    [teams]
  );

  const effectiveTeamId = teamOptions.some((item) => item.value === selectedTeamId)
    ? selectedTeamId
    : "all";
  const filteredTeams = useMemo(
    () => filterDashboardTeamsByScope(teams, effectiveTeamId, "all"),
    [effectiveTeamId, teams]
  );

  return {
    teamOptions,
    selectedTeamId: effectiveTeamId,
    filteredTeams,
    isDefault: effectiveTeamId === "all",
    setSelectedTeamId,
  };
}
