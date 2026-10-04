"use client";

import { CustomSelect } from "@/components/common/custom-select";
import { Badge } from "@/components/ui/badge";
import { resolveDashboardContext } from "../lib/dashboard-context";
import type {
  LecturerDashboardSelection,
  LecturerDashboardTeam,
} from "../types/lecturer-course-dashboard";

interface CourseDashboardContextBarProps {
  teams: LecturerDashboardTeam[];
  selectedTeamId: string | null;
  selection: LecturerDashboardSelection;
  controlsLocked: boolean;
  onTeamChange: (teamId: string | null) => void;
  onSiteChange: (jiraIntegrationId: string) => void;
  onSprintChange: (sprintId: string) => void;
}

export function CourseDashboardContextBar({
  teams,
  selectedTeamId,
  selection,
  controlsLocked,
  onTeamChange,
  onSiteChange,
  onSprintChange,
}: CourseDashboardContextBarProps) {
  const view = resolveDashboardContext({ teams, selectedTeamId, selection, controlsLocked });
  const teamOptions = [
    { value: "all", label: "Tất cả nhóm" },
    ...teams.map((team) => ({
      value: team.teamId,
      label: team.teamName || `Nhóm ${team.teamNo}`,
      subLabel: team.projectId ? team.projectName || "Đã có dự án" : "Chưa có dự án",
    })),
  ];

  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-foreground">Ngữ cảnh Sprint</p>
        {view.selectionLabel ? <Badge variant="outline">{view.selectionLabel}</Badge> : null}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-xs font-semibold text-muted-foreground" htmlFor="dashboard-team">
          Nhóm
          <CustomSelect
            id="dashboard-team"
            value={selectedTeamId ?? "all"}
            options={teamOptions}
            onChange={(value) => onTeamChange(value === "all" ? null : value)}
          />
        </label>
        <label className="space-y-1 text-xs font-semibold text-muted-foreground" htmlFor="dashboard-site">
          Site
          <CustomSelect
            id="dashboard-site"
            value={view.siteValue}
            options={view.siteOptions}
            placeholder="Chọn Site"
            disabled={view.siteDisabled}
            onChange={onSiteChange}
          />
        </label>
        <label className="space-y-1 text-xs font-semibold text-muted-foreground" htmlFor="dashboard-sprint">
          Sprint
          <CustomSelect
            id="dashboard-sprint"
            value={view.sprintValue}
            options={view.sprintOptions}
            placeholder={view.sprintValue ? "Chọn Sprint" : "Chưa có Sprint"}
            disabled={view.sprintDisabled}
            onChange={onSprintChange}
          />
        </label>
      </div>
      {view.hint ? <p className="text-xs text-muted-foreground">{view.hint}</p> : null}
    </div>
  );
}
