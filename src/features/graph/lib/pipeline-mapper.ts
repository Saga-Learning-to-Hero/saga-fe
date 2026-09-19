import type { ProjectProgressMemberSummary } from "@/features/student/project/types/student-project";
import type { TaskLinkedCommitItem } from "@/features/student/project/types/student-project";
import type { StudentTeamMember } from "@/features/student/courses/types/student-course";
import type { ProjectTaskResponse } from "@/features/student/sprint-progress/types/jira-task-types";
import {
  BACKLOG_SPRINT_ID,
  UNASSIGNED_LANE_ID,
  type PipelineCommit,
  type PipelineFilterState,
  type PipelineLane,
  type PipelineMember,
  type PipelineSprintOption,
  type PipelineStats,
  type PipelineTask,
} from "../types/pipeline";

const DONE_STATUSES = ["DONE", "COMPLETED", "RESOLVED", "CLOSED"];

export function isCompletedStatus(status?: string | null): boolean {
  const value = (status || "").toUpperCase();
  return DONE_STATUSES.some((token) => value.includes(token));
}

export function isDocumentOrResearchTask(task: {
  title?: string | null;
  issueTypeName?: string | null;
  labels?: string[] | null;
}): boolean {
  const title = (task.title || "").toLowerCase();
  const issueType = (task.issueTypeName || "").toLowerCase();
  const labels = (task.labels || []).map((l) => l.toLowerCase());

  const docKeywords = [
    "tài liệu",
    "báo cáo",
    "report",
    "srs",
    "document",
    "documentation",
    "research",
    "khảo sát",
    "nghiên cứu",
    "slide",
    "thuyết trình",
    "biên bản",
    "meeting note",
  ];

  const isDocByTitle = docKeywords.some((kw) => title.includes(kw));
  const isDocByIssueType = ["documentation", "document", "research", "report"].some((t) =>
    issueType.includes(t)
  );
  const isDocByLabel = labels.some(
    (l) => l.includes("document") || l.includes("research") || l.includes("doc")
  );

  return isDocByTitle || isDocByIssueType || isDocByLabel;
}

export function isDoneWithoutLinkedCommit(
  task: Pick<PipelineTask, "status" | "linkedCommitCount"> & {
    title?: string | null;
    issueTypeName?: string | null;
    labels?: string[] | null;
    hasEvidence?: boolean;
    evidenceCount?: number;
  }
): boolean {
  if (!isCompletedStatus(task.status)) return false;
  if ((task.linkedCommitCount ?? 0) > 0) return false;
  if (task.hasEvidence === true || (task.evidenceCount ?? 0) > 0) return false;
  return true;
}

export function mapMembersFromProgress(members: ProjectProgressMemberSummary[]): PipelineMember[] {
  return [...members]
    .map((member) => ({
      studentId: member.studentId,
      fullName: member.fullName,
      studentCode: member.studentCode,
      teamRole: member.teamRole,
    }))
    .sort((a, b) => {
      const roleRank = (role: string) => (role.toUpperCase() === "LEADER" ? 0 : 1);
      const rank = roleRank(a.teamRole) - roleRank(b.teamRole);
      if (rank !== 0) return rank;
      return a.studentCode.localeCompare(b.studentCode, "vi");
    });
}

export function mapMembersFromTeam(members: StudentTeamMember[]): PipelineMember[] {
  return [...members]
    .map((member) => ({
      studentId: member.studentCode,
      fullName: member.fullName,
      studentCode: member.studentCode,
      teamRole: member.role,
    }))
    .sort((a, b) => {
      const roleRank = (role: string) => (role.toUpperCase() === "LEADER" ? 0 : 1);
      const rank = roleRank(a.teamRole) - roleRank(b.teamRole);
      if (rank !== 0) return rank;
      return a.studentCode.localeCompare(b.studentCode, "vi");
    });
}

export function mapPipelineTasks(tasks: ProjectTaskResponse[]): PipelineTask[] {
  return tasks.map((task) => {
    const sprintId = task.sprint?.id || task.sprint?.externalSprintId || BACKLOG_SPRINT_ID;
    return {
      id: task.id,
      key: task.externalKey || task.id,
      title: task.title,
      status: task.status,
      issueTypeName: task.issueTypeName,
      parent: task.parent || null,
      assigneeStudentId: task.assigneeStudentId || task.assignee?.studentId || null,
      assigneeDisplayName: task.assigneeDisplayName || task.assignee?.displayName || null,
      assigneeExternalId: task.assigneeExternalId || task.assignee?.accountId || null,
      sprintId: String(sprintId),
      sprintName: task.sprint?.name || "Backlog",
      storyPoint: typeof task.storyPoint === "number" ? task.storyPoint : null,
      priority: task.priority || task.priorityDetail?.name || null,
      linkedCommitCount: task.linkedCommitCount || 0,
      labels: task.labels || [],
    };
  });
}

export function resolveCommitAuthorLabel(
  commit: Pick<TaskLinkedCommitItem, "authorStudentId" | "authorExternalId">,
  members: PipelineMember[]
): string {
  const member = members.find((item) => item.studentId && item.studentId === commit.authorStudentId);
  if (member) return member.fullName;
  if (commit.authorExternalId) return `${commit.authorExternalId} · Chưa liên kết sinh viên`;
  return "Chưa liên kết sinh viên";
}

export function mapPipelineCommits(
  commits: TaskLinkedCommitItem[],
  members: PipelineMember[]
): PipelineCommit[] {
  return commits.map((commit) => ({
    id: commit.id,
    sha: commit.sha,
    shortHash: commit.sha.slice(0, 7),
    message: commit.message,
    authorStudentId: commit.authorStudentId || null,
    authorExternalId: commit.authorExternalId || null,
    authorLabel: resolveCommitAuthorLabel(commit, members),
    committedAt: commit.committedAt,
    repositoryFullName: commit.repositoryFullName,
    headRef: commit.headRef || null,
  }));
}

export function findTaskLaneMember(task: PipelineTask, members: PipelineMember[]): PipelineMember | null {
  if (task.assigneeStudentId) {
    const byId = members.find((member) => member.studentId === task.assigneeStudentId);
    if (byId) return byId;
  }
  if (task.assigneeDisplayName) {
    const byName = members.find(
      (member) => member.fullName.toLowerCase() === task.assigneeDisplayName!.toLowerCase()
    );
    if (byName) return byName;
  }
  return null;
}

export function groupTasksIntoLanes(tasks: PipelineTask[], members: PipelineMember[]): PipelineLane[] {
  const lanes: PipelineLane[] = members.map((member) => ({
    id: member.studentId,
    member,
    tasks: [],
  }));
  const unassigned: PipelineLane = { id: UNASSIGNED_LANE_ID, member: null, tasks: [] };

  for (const task of tasks) {
    const owner = findTaskLaneMember(task, members);
    if (owner) {
      lanes.find((lane) => lane.id === owner.studentId)?.tasks.push(task);
    } else {
      unassigned.tasks.push(task);
    }
  }

  return unassigned.tasks.length > 0 ? [...lanes, unassigned] : lanes;
}

export function collectPipelineSprints(tasks: PipelineTask[]): PipelineSprintOption[] {
  const map = new Map<string, PipelineSprintOption>();
  for (const task of tasks) {
    if (!map.has(task.sprintId)) {
      map.set(task.sprintId, {
        id: task.sprintId,
        name: task.sprintName,
        state: task.sprintId === BACKLOG_SPRINT_ID ? "backlog" : undefined,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.id === BACKLOG_SPRINT_ID) return 1;
    if (b.id === BACKLOG_SPRINT_ID) return -1;
    return a.name.localeCompare(b.name, "vi");
  });
}

export function computePipelineStats(
  members: PipelineMember[],
  tasks: PipelineTask[],
  totalCommits: number | null
): PipelineStats {
  return {
    totalMembers: members.length,
    totalTasks: tasks.length,
    totalCommits,
    tasksWithLinkedCommits: tasks.filter((task) => task.linkedCommitCount > 0).length,
    doneWithoutLinkedCommits: tasks.filter(isDoneWithoutLinkedCommit).length,
  };
}

export function filterPipelineTasks(
  tasks: PipelineTask[],
  filter: PipelineFilterState,
  members: PipelineMember[] = [],
  scopedTaskIds?: Set<string>
): PipelineTask[] {
  return tasks.filter((task) => {
    if (filter.studentId !== "ALL") {
      const owner = findTaskLaneMember(task, members);
      if (filter.studentId === UNASSIGNED_LANE_ID) {
        if (owner) return false;
      } else if (owner?.studentId !== filter.studentId) {
        return false;
      }
    }
    if (filter.sprintId !== "ALL" && task.sprintId !== filter.sprintId) return false;

    if (filter.anomalyType && filter.anomalyType !== "ALL") {
      if (filter.anomalyType === "DONE_NO_COMMIT" && !isDoneWithoutLinkedCommit(task)) return false;
      if (filter.anomalyType === "UNASSIGNED" && (task.assigneeStudentId || task.assigneeDisplayName)) return false;
      if (filter.anomalyType === "MISSING_COMMITS" && task.linkedCommitCount > 0) return false;
    } else if (filter.anomaliesOnly && !isDoneWithoutLinkedCommit(task)) {
      return false;
    }

    if (filter.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.trim().toLowerCase();
      const matchKey = task.key.toLowerCase().includes(q);
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchAssignee = (task.assigneeDisplayName || "").toLowerCase().includes(q);
      if (!matchKey && !matchTitle && !matchAssignee) return false;
    }

    const hasRepositoryScope = Boolean(filter.repoId && filter.repoId !== "ALL");
    const hasBranchScope = Boolean(filter.branchName && filter.branchName !== "ALL");
    if ((hasRepositoryScope || hasBranchScope) && scopedTaskIds && !scopedTaskIds.has(task.id)) {
      return false;
    }

    return true;
  });
}

export function resolvePipelineQueryPlan(input: {
  pipelineOpen: boolean;
  projectId: string | null | undefined;
  selectedTaskId: string | null | undefined;
  tasksReady: boolean;
  progressLoading: boolean;
}) {
  const projectId = input.projectId?.trim() || null;
  const selectedTaskId = input.selectedTaskId?.trim() || null;
  const pipelineReady = input.pipelineOpen && Boolean(projectId);
  return {
    projectId,
    selectedTaskId,
    pipelineReady,
    progressEnabled: pipelineReady,
    tasksProjectId: pipelineReady ? projectId : null,
    commitsEnabled: pipelineReady && input.tasksReady && !input.progressLoading,
    taskCommitsEnabled: pipelineReady && Boolean(selectedTaskId),
    taskCommitsProjectId: pipelineReady && selectedTaskId ? projectId : null,
    taskCommitsTaskId: pipelineReady ? selectedTaskId : null,
    realtimeEnabled: pipelineReady,
  };
}

export function sanitizePipelineFilter(
  filter: PipelineFilterState,
  members: PipelineMember[],
  sprints: PipelineSprintOption[]
): PipelineFilterState {
  const studentExists =
    filter.studentId === "ALL" ||
    filter.studentId === UNASSIGNED_LANE_ID ||
    members.some((member) => member.studentId === filter.studentId);
  const sprintExists = filter.sprintId === "ALL" || sprints.some((sprint) => sprint.id === filter.sprintId);
  return {
    ...filter,
    studentId: studentExists ? filter.studentId : "ALL",
    sprintId: sprintExists ? filter.sprintId : "ALL",
    searchQuery: filter.searchQuery || "",
    anomalyType: filter.anomalyType || "ALL",
    repoId: filter.repoId || "ALL",
    branchName: filter.branchName || "ALL",
  };
}

export function buildPipelineTasksCsv(tasks: PipelineTask[]): string {
  const header = ["Mã Task", "Tiêu đề", "Trạng thái", "Sprint", "Người làm", "Commit liên kết"];
  const rows = tasks.map((task) => [
    task.key,
    task.title.replaceAll('"', '""'),
    task.status,
    task.sprintName,
    task.assigneeDisplayName || "Chưa phân công",
    String(task.linkedCommitCount),
  ]);
  return [header, ...rows]
    .map((cols) => cols.map((col) => `"${col}"`).join(","))
    .join("\n");
}

export function downloadTextFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
