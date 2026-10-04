import type { LecturerDashboardSelection } from "../types/lecturer-course-dashboard";

export const DASHBOARD_SELECTION_INVALID =
  "Throw ValidationException: Dashboard selection is invalid";

export type DashboardSelectionQuery =
  | { teamId: string; jiraIntegrationId: string }
  | { teamId: string; sprintId: string };

type DashboardSelectionDraft = {
  mode?: string;
  teamId?: string;
  jiraIntegrationId?: string;
  sprintId?: string;
};

export function dashboardSelectionKey(
  selection: LecturerDashboardSelection = { mode: "default" },
): readonly ["default"] | readonly ["site", string, string] | readonly ["sprint", string, string] {
  if (selection.mode === "site") {
    return ["site", selection.teamId, selection.jiraIntegrationId] as const;
  }
  if (selection.mode === "sprint") {
    return ["sprint", selection.teamId, selection.sprintId] as const;
  }
  return ["default"] as const;
}

export function resolveDashboardSelection(
  selection?: DashboardSelectionDraft | null,
): DashboardSelectionQuery | undefined {
  if (!selection || !selection.mode || selection.mode === "default") return undefined;

  const draft = selection;
  const teamId = draft.teamId?.trim() ?? "";
  const jiraIntegrationId = draft.jiraIntegrationId?.trim() ?? "";
  const sprintId = draft.sprintId?.trim() ?? "";
  const hasSite = jiraIntegrationId.length > 0;
  const hasSprint = sprintId.length > 0;

  if (!teamId || (hasSite && hasSprint)) {
    throw new Error(DASHBOARD_SELECTION_INVALID);
  }

  if (selection.mode === "site") {
    if (!hasSite || hasSprint) throw new Error(DASHBOARD_SELECTION_INVALID);
    return { teamId, jiraIntegrationId };
  }

  if (selection.mode === "sprint") {
    if (!hasSprint || hasSite) throw new Error(DASHBOARD_SELECTION_INVALID);
    return { teamId, sprintId };
  }

  throw new Error(DASHBOARD_SELECTION_INVALID);
}

export function selectionForTeamChange(
  current: LecturerDashboardSelection,
  teamId: string | null,
): LecturerDashboardSelection {
  if (!teamId) return { mode: "default" };
  if (current.mode !== "default" && current.teamId !== teamId) return { mode: "default" };
  return current;
}
