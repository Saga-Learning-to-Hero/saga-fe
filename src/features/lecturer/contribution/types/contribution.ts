export type ContributionConfigMode = "COURSE" | "PROJECT_GROUP";

export type ContributionSliceWeights = {
  mode: ContributionConfigMode;
  codeWeight: number;
  testWeight: number;
  documentWeight: number;
  researchWeight: number;
};

export type ContributionSliceWeightsRequest = {
  codeWeight: number;
  testWeight: number;
  documentWeight: number;
  researchWeight: number;
};

export type ContributionConfigModeRequest = {
  mode: ContributionConfigMode;
};

export type ContributionTeamSummary = {
  teamId: string;
  projectId: string | null;
  teamName: string;
  teamNo: number;
  configured: boolean;
};

export type ContributionTeamWeightsResponse = {
  courseId: string;
  mode: ContributionConfigMode;
  teams: ContributionTeamSummary[];
};

export type ProjectGroupWeights = {
  projectId: string;
  teamId: string;
  codeWeight: number;
  testWeight: number;
  documentWeight: number;
  researchWeight: number;
  note: string;
};

export type ProjectGroupWeightsRequest = {
  teamId?: string;
  codeWeight: number;
  testWeight: number;
  documentWeight: number;
  researchWeight: number;
  note?: string;
};

export type ContributionSliceWeightValues = {
  codeWeight: number;
  testWeight: number;
  documentWeight: number;
  researchWeight: number;
};

export type ContributionRoleInTeam = "LEADER" | "MEMBER" | "MENTOR" | string;

export type ContributionSprintBreakdown = {
  sprintId: string;
  sprintName: string;
  sliceScore: number | null;
  sliceContributionPercentage: number | null;
  contributionPercentage: number | null;
};

export type ContributionMember = {
  studentProfileId: string;
  fullName: string;
  studentCode: string;
  roleInTeam: ContributionRoleInTeam;
  sliceScore: number | null;
  sliceContributionPercentage: number | null;
  finalContributionPercentage: number | null;
  peerReviewScore: number | null;
  codeContributionPercentage: number | null;
  testContributionPercentage: number | null;
  documentContributionPercentage: number | null;
  researchContributionPercentage: number | null;
  taskContributionPercentage: number | null;
  sprintBreakdowns: ContributionSprintBreakdown[];
  warnings: string[];
};

export type ContributionEvaluation = {
  teamId: string;
  projectId: string | null;
  courseId: string | null;
  configMode: ContributionConfigMode;
  sliceWeights: ContributionSliceWeightValues;
  members: ContributionMember[];
};

export type ContributionOverrideRequest = {
  studentProfileId: string;
  percentage: number;
  reason: string;
};

export type ContributionOverrideResponse = {
  id: string;
  studentProfileId: string;
  oldValue: number | null;
  newValue: number | null;
  reason: string;
};

export const EMPTY_SLICE_WEIGHTS: ContributionSliceWeightValues = {
  codeWeight: 0,
  testWeight: 0,
  documentWeight: 0,
  researchWeight: 0,
};

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toOptionalId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function parseContributionConfigMode(value: unknown): ContributionConfigMode {
  return value === "PROJECT_GROUP" ? "PROJECT_GROUP" : "COURSE";
}

export function parseSliceWeightValues(value: unknown): ContributionSliceWeightValues {
  const source = (value ?? {}) as Record<string, unknown>;
  return {
    codeWeight: toNumber(source.codeWeight),
    testWeight: toNumber(source.testWeight),
    documentWeight: toNumber(source.documentWeight),
    researchWeight: toNumber(source.researchWeight),
  };
}

export function parseCourseContributionWeights(value: unknown): ContributionSliceWeights {
  const source = (value ?? {}) as Record<string, unknown>;
  return {
    mode: parseContributionConfigMode(source.mode),
    ...parseSliceWeightValues(source),
  };
}

export function parseContributionTeamWeights(
  value: unknown,
  courseId: string
): ContributionTeamWeightsResponse {
  const source = (value ?? {}) as Record<string, unknown>;
  const teams = Array.isArray(source.teams) ? source.teams : [];

  return {
    courseId: toOptionalId(source.courseId) || courseId,
    mode: parseContributionConfigMode(source.mode),
    teams: teams.map((row) => {
      const item = (row ?? {}) as Record<string, unknown>;
      return {
        teamId: typeof item.teamId === "string" ? item.teamId : "",
        projectId: toOptionalId(item.projectId),
        teamName: typeof item.teamName === "string" ? item.teamName : "",
        teamNo: typeof item.teamNo === "number" ? item.teamNo : 0,
        configured: Boolean(item.configured),
      };
    }),
  };
}

export function parseProjectGroupWeights(value: unknown, projectId: string): ProjectGroupWeights {
  const source = (value ?? {}) as Record<string, unknown>;
  return {
    projectId: toOptionalId(source.projectId) || projectId,
    teamId: toOptionalId(source.teamId) || "",
    note: typeof source.note === "string" ? source.note : "",
    ...parseSliceWeightValues(source),
  };
}

function parseSprintBreakdown(value: unknown): ContributionSprintBreakdown {
  const source = (value ?? {}) as Record<string, unknown>;
  return {
    sprintId: typeof source.sprintId === "string" ? source.sprintId : "",
    sprintName: typeof source.sprintName === "string" ? source.sprintName : "",
    sliceScore: toNullableNumber(source.sliceScore),
    sliceContributionPercentage: toNullableNumber(source.sliceContributionPercentage),
    contributionPercentage: toNullableNumber(source.contributionPercentage),
  };
}

function parseContributionMember(value: unknown): ContributionMember {
  const source = (value ?? {}) as Record<string, unknown>;
  const warnings = Array.isArray(source.warnings)
    ? source.warnings.filter((item): item is string => typeof item === "string")
    : [];
  const sprintBreakdowns = Array.isArray(source.sprintBreakdowns)
    ? source.sprintBreakdowns.map(parseSprintBreakdown)
    : [];

  return {
    studentProfileId: typeof source.studentProfileId === "string" ? source.studentProfileId : "",
    fullName: typeof source.fullName === "string" ? source.fullName : "",
    studentCode: typeof source.studentCode === "string" ? source.studentCode : "",
    roleInTeam: typeof source.roleInTeam === "string" ? source.roleInTeam : "MEMBER",
    sliceScore: toNullableNumber(source.sliceScore),
    sliceContributionPercentage: toNullableNumber(source.sliceContributionPercentage),
    finalContributionPercentage: toNullableNumber(source.finalContributionPercentage),
    peerReviewScore: toNullableNumber(source.peerReviewScore),
    codeContributionPercentage: toNullableNumber(source.codeContributionPercentage),
    testContributionPercentage: toNullableNumber(source.testContributionPercentage),
    documentContributionPercentage: toNullableNumber(source.documentContributionPercentage),
    researchContributionPercentage: toNullableNumber(source.researchContributionPercentage),
    taskContributionPercentage: toNullableNumber(source.taskContributionPercentage),
    sprintBreakdowns,
    warnings,
  };
}

export function parseContributionEvaluation(value: unknown, teamId: string): ContributionEvaluation {
  const source = (value ?? {}) as Record<string, unknown>;
  const members = Array.isArray(source.members) ? source.members.map(parseContributionMember) : [];

  return {
    teamId: toOptionalId(source.teamId) || teamId,
    projectId: toOptionalId(source.projectId),
    courseId: toOptionalId(source.courseId),
    configMode: parseContributionConfigMode(source.configMode ?? source.mode),
    sliceWeights: parseSliceWeightValues(source.sliceWeights),
    members,
  };
}

export function parseContributionOverride(value: unknown): ContributionOverrideResponse {
  const source = (value ?? {}) as Record<string, unknown>;
  return {
    id: typeof source.id === "string" ? source.id : "",
    studentProfileId: typeof source.studentProfileId === "string" ? source.studentProfileId : "",
    oldValue: toNullableNumber(source.oldValue),
    newValue: toNullableNumber(source.newValue),
    reason: typeof source.reason === "string" ? source.reason : "",
  };
}
