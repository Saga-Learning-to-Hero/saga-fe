export interface AssistantTeamOption {
  teamId: string;
  teamNo: number;
  teamName: string;
  projectId: string | null;
}

export interface ResolvedAssistantProject {
  projectId: string | null;
  teamId: string | null;
  teamLabel: string | null;
  guidance: string | null;
  needsTeamPicker: boolean;
}

function teamLabel(team: AssistantTeamOption): string {
  const name = team.teamName?.trim();
  return name ? `Nhóm ${team.teamNo} - ${name}` : `Nhóm ${team.teamNo}`;
}

export function resolveStudentAssistantProject(input: {
  teamId?: string | null;
  projectId?: string | null;
  teamName?: string | null;
  teamNo?: number | null;
  isWaitingForTeam: boolean;
}): ResolvedAssistantProject {
  const teamId = input.teamId?.trim() || null;
  if (input.isWaitingForTeam || !teamId) {
    return {
      projectId: null,
      teamId: null,
      teamLabel: null,
      guidance: "Bạn chưa được phân vào nhóm trong lớp này.",
      needsTeamPicker: false,
    };
  }
  const projectId = input.projectId?.trim() || null;
  const label = input.teamName?.trim()
    ? `Nhóm ${input.teamNo ?? ""} - ${input.teamName.trim()}`.replace("Nhóm  -", "Nhóm")
    : input.teamNo
      ? `Nhóm ${input.teamNo}`
      : "Nhóm của bạn";
  if (!projectId) {
    return {
      projectId: null,
      teamId,
      teamLabel: label,
      guidance: "Nhóm của bạn chưa có dự án, nên trợ lý chưa dùng được.",
      needsTeamPicker: false,
    };
  }
  return {
    projectId,
    teamId,
    teamLabel: label,
    guidance: null,
    needsTeamPicker: false,
  };
}

export function resolveLecturerAssistantProject(input: {
  teams: AssistantTeamOption[];
  routeTeamId: string | null;
  pickedTeamId: string | null;
}): ResolvedAssistantProject {
  if (input.teams.length === 0) {
    return {
      projectId: null,
      teamId: null,
      teamLabel: null,
      guidance: "Lớp này chưa có nhóm.",
      needsTeamPicker: false,
    };
  }

  if (input.routeTeamId) {
    const routeTeam = input.teams.find((team) => team.teamId === input.routeTeamId) ?? null;
    if (!routeTeam) {
      return {
        projectId: null,
        teamId: input.routeTeamId,
        teamLabel: null,
        guidance: "Không tìm thấy nhóm này trong lớp.",
        needsTeamPicker: false,
      };
    }
    if (!routeTeam.projectId) {
      return {
        projectId: null,
        teamId: routeTeam.teamId,
        teamLabel: teamLabel(routeTeam),
        guidance: "Nhóm này chưa có dự án, nên trợ lý chưa dùng được.",
        needsTeamPicker: false,
      };
    }
    return {
      projectId: routeTeam.projectId,
      teamId: routeTeam.teamId,
      teamLabel: teamLabel(routeTeam),
      guidance: null,
      needsTeamPicker: false,
    };
  }

  const withProject = input.teams.filter((team) => Boolean(team.projectId));
  if (withProject.length === 0) {
    return {
      projectId: null,
      teamId: null,
      teamLabel: null,
      guidance: "Lớp này chưa có nhóm đã khởi tạo dự án.",
      needsTeamPicker: false,
    };
  }

  const picked = input.pickedTeamId
    ? withProject.find((team) => team.teamId === input.pickedTeamId) ?? null
    : null;
  if (!picked?.projectId) {
    return {
      projectId: null,
      teamId: null,
      teamLabel: null,
      guidance: "Hãy chọn một nhóm đã có dự án để hỏi trợ lý.",
      needsTeamPicker: true,
    };
  }

  return {
    projectId: picked.projectId,
    teamId: picked.teamId,
    teamLabel: teamLabel(picked),
    guidance: null,
    needsTeamPicker: true,
  };
}
