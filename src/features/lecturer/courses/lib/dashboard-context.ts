import type {
  LecturerDashboardSelection,
  LecturerDashboardTeam,
} from "../types/lecturer-course-dashboard";

export interface DashboardSelectOption {
  value: string;
  label: string;
  subLabel?: string;
}

export interface DashboardContextView {
  siteValue: string;
  sprintValue: string;
  siteDisabled: boolean;
  sprintDisabled: boolean;
  hint: string | null;
  selectionLabel: "Đã chọn" | "Mặc định" | null;
  siteOptions: DashboardSelectOption[];
  sprintOptions: DashboardSelectOption[];
}

export function resolveDashboardContext({
  teams,
  selectedTeamId,
  selection,
  controlsLocked,
}: {
  teams: LecturerDashboardTeam[];
  selectedTeamId: string | null;
  selection: LecturerDashboardSelection;
  controlsLocked: boolean;
}): DashboardContextView {
  const team = selectedTeamId ? teams.find((item) => item.teamId === selectedTeamId) ?? null : null;
  const siteOptions = (team?.jiraSources ?? []).map((source) => ({
    value: source.jiraIntegrationId,
    label: source.siteName || source.projectKey || "Site Jira",
    subLabel: source.siteName && source.projectKey ? source.projectKey : undefined,
  }));
  const sprintOptions = (team?.sprintOptions ?? []).map((option) => ({
    value: option.id,
    label: option.name || "Sprint",
    subLabel: option.state || undefined,
  }));

  if (!team) {
    return {
      siteValue: "",
      sprintValue: "",
      siteDisabled: true,
      sprintDisabled: true,
      hint: null,
      selectionLabel: null,
      siteOptions: [],
      sprintOptions: [],
    };
  }

  const selectionMatches = selection.mode !== "default" && selection.teamId === team.teamId;
  const siteValue =
    selection.mode === "site" && selectionMatches
      ? selection.jiraIntegrationId
      : team.currentSprint?.source?.jiraIntegrationId ?? "";
  const sprintValue =
    controlsLocked && selection.mode === "site"
      ? ""
      : selection.mode === "sprint" && selectionMatches
        ? selection.sprintId
        : team.currentSprint?.sprintId ?? "";

  let hint: string | null = null;
  let siteDisabled = controlsLocked;
  let sprintDisabled = controlsLocked;

  if (!team.projectId) {
    hint = "Nhóm này chưa có dự án.";
    siteDisabled = true;
    sprintDisabled = true;
  } else if (siteOptions.length === 0) {
    hint = "Nhóm này chưa có Site Jira.";
    siteDisabled = true;
  } else if (sprintOptions.length === 0) {
    hint = "Chưa có Sprint để chọn.";
    sprintDisabled = true;
  } else if (!team.currentSprint && selection.mode !== "sprint") {
    hint = "Chưa có Sprint đang chạy.";
  }

  if (controlsLocked && team.projectId) {
    siteDisabled = true;
    sprintDisabled = true;
  }

  const selectionLabel =
    team.sprintSelection === "SELECTED"
      ? "Đã chọn"
      : team.sprintSelection === "DEFAULT"
        ? "Mặc định"
        : null;

  return {
    siteValue: siteDisabled && !siteOptions.some((option) => option.value === siteValue) ? "" : siteValue,
    sprintValue,
    siteDisabled,
    sprintDisabled,
    hint,
    selectionLabel,
    siteOptions,
    sprintOptions,
  };
}
