import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import type { ProjectTaskResponse } from "@/features/student/sprint-progress/types/jira-task-types";
import type { TaskLinkedCommitItem } from "@/features/student/project/types/student-project";
import {
  buildPipelineTasksCsv,
  collectPipelineSprints,
  computePipelineStats,
  filterPipelineTasks,
  findTaskLaneMember,
  groupTasksIntoLanes,
  isDocumentOrResearchTask,
  isDoneWithoutLinkedCommit,
  mapMembersFromProgress,
  mapMembersFromTeam,
  mapPipelineCommits,
  mapPipelineTasks,
  resolveCommitAuthorLabel,
  resolvePipelineQueryPlan,
  sanitizePipelineFilter,
} from "./pipeline-mapper";
import { BACKLOG_SPRINT_ID, UNASSIGNED_LANE_ID, type PipelineMember } from "../types/pipeline";

const members: PipelineMember[] = [
  { studentId: "stu-1", fullName: "Le Hoang Hai", studentCode: "HE170504", teamRole: "LEADER" },
  { studentId: "stu-2", fullName: "Nguyen Minh Tuan", studentCode: "SE171234", teamRole: "MEMBER" },
];

function task(partial: Partial<ProjectTaskResponse> & Pick<ProjectTaskResponse, "id" | "title" | "status">): ProjectTaskResponse {
  return {
    externalId: partial.id,
    externalKey: partial.externalKey || partial.id,
    issueTypeName: "Task",
    linkedCommitCount: 0,
    createdAt: "2026-09-14T00:00:00Z",
    updatedAt: "2026-09-14T00:00:00Z",
    ...partial,
  };
}

describe("pipeline-mapper", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "14/09/2026",
      description: "Gan Task vao thanh vien khi assigneeStudentId khop studentId",
    },
    () => {
      const mapped = mapPipelineTasks([
        task({
          id: "t1",
          title: "Auth",
          status: "IN_PROGRESS",
          assigneeStudentId: "stu-1",
          assigneeDisplayName: "Le Hoang Hai",
          linkedCommitCount: 2,
        }),
      ]);
      expect(findTaskLaneMember(mapped[0], members)?.studentId).toBe("stu-1");
      const lanes = groupTasksIntoLanes(mapped, members);
      expect(lanes.find((lane) => lane.id === "stu-1")?.tasks).toHaveLength(1);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "14/09/2026",
      description: "Task chua phan cong vao lane Chua phan cong",
    },
    () => {
      const mapped = mapPipelineTasks([
        task({ id: "t2", title: "Backlog item", status: "TODO", assigneeStudentId: null }),
      ]);
      const lanes = groupTasksIntoLanes(mapped, members);
      expect(lanes.some((lane) => lane.id === UNASSIGNED_LANE_ID)).toBe(true);
      expect(lanes.find((lane) => lane.id === UNASSIGNED_LANE_ID)?.tasks[0].id).toBe("t2");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "14/09/2026",
      description: "Tac gia commit chua lien ket hien authorExternalId va nhan chua lien ket",
    },
    () => {
      const commit: TaskLinkedCommitItem = {
        id: "c1",
        repoId: "r1",
        repositoryFullName: "org/repo",
        sha: "abcdef123456",
        message: "fix login",
        authorExternalId: "octocat",
        authorStudentId: null,
        committedAt: "2026-09-14T01:00:00Z",
        createdAt: "2026-09-14T01:00:00Z",
      };
      expect(resolveCommitAuthorLabel(commit, members)).toContain("octocat");
      expect(resolveCommitAuthorLabel(commit, members)).toContain("Chưa liên kết sinh viên");
      expect(mapPipelineCommits([commit], members)[0].authorStudentId).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "14/09/2026",
      description: "Thanh vien map commit khi authorStudentId khop",
    },
    () => {
      const commit: TaskLinkedCommitItem = {
        id: "c2",
        repoId: "r1",
        repositoryFullName: "org/repo",
        sha: "111222333",
        message: "feat graph",
        authorStudentId: "stu-2",
        committedAt: "2026-09-14T01:00:00Z",
        createdAt: "2026-09-14T01:00:00Z",
      };
      expect(resolveCommitAuthorLabel(commit, members)).toBe("Nguyen Minh Tuan");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "14/09/2026",
      description: "Task DONE linkedCommitCount 0 la canh bao thieu commit",
    },
    () => {
      expect(isDoneWithoutLinkedCommit({ status: "DONE", linkedCommitCount: 0 })).toBe(true);
      expect(isDoneWithoutLinkedCommit({ status: "DONE", linkedCommitCount: 1 })).toBe(false);
      expect(isDoneWithoutLinkedCommit({ status: "IN_PROGRESS", linkedCommitCount: 0 })).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "14/09/2026",
      description: "Sprint null thanh Backlog va thong ke khong suy dien commit chua lien ket",
    },
    () => {
      const mapped = mapPipelineTasks([
        task({
          id: "t3",
          title: "Docs",
          status: "DONE",
          linkedCommitCount: 0,
          sprint: null,
        }),
        task({
          id: "t4",
          title: "API",
          status: "IN_PROGRESS",
          linkedCommitCount: 3,
          sprint: { id: "sp-1", name: "Sprint 3", state: "active" },
        }),
      ]);
      expect(mapped[0].sprintId).toBe(BACKLOG_SPRINT_ID);
      expect(mapped[0].sprintName).toBe("Backlog");
      const stats = computePipelineStats(members, mapped, 10);
      expect(stats.totalMembers).toBe(2);
      expect(stats.totalTasks).toBe(2);
      expect(stats.totalCommits).toBe(10);
      expect(stats.tasksWithLinkedCommits).toBe(1);
      expect(stats.doneWithoutLinkedCommits).toBe(1);
      expect(collectPipelineSprints(mapped).some((item) => item.id === BACKLOG_SPRINT_ID)).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "14/09/2026",
      description: "Mo Pipeline khong bat query task commits khi chua chon Task",
    },
    () => {
      const plan = resolvePipelineQueryPlan({
        pipelineOpen: true,
        projectId: "proj-1",
        selectedTaskId: null,
        tasksReady: true,
        progressLoading: false,
      });
      expect(plan.commitsEnabled).toBe(true);
      expect(plan.taskCommitsEnabled).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "N",
      executedDate: "14/09/2026",
      description: "Chi bat mot query task commits khi da chon Task",
    },
    () => {
      const first = resolvePipelineQueryPlan({
        pipelineOpen: true,
        projectId: "proj-1",
        selectedTaskId: "task-a",
        tasksReady: true,
        progressLoading: false,
      });
      const next = resolvePipelineQueryPlan({
        pipelineOpen: true,
        projectId: "proj-1",
        selectedTaskId: "task-b",
        tasksReady: true,
        progressLoading: false,
      });
      expect(first.taskCommitsEnabled).toBe(true);
      expect(first.selectedTaskId).toBe("task-a");
      expect(next.selectedTaskId).toBe("task-b");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "14/09/2026",
      description: "Tab Neo4j dong Pipeline thi khong goi task commits hay commits tong",
    },
    () => {
      const plan = resolvePipelineQueryPlan({
        pipelineOpen: false,
        projectId: "proj-1",
        selectedTaskId: "task-a",
        tasksReady: true,
        progressLoading: false,
      });
      expect(plan.progressEnabled).toBe(false);
      expect(plan.commitsEnabled).toBe(false);
      expect(plan.taskCommitsEnabled).toBe(false);
      expect(plan.tasksProjectId).toBeNull();
      expect(plan.taskCommitsProjectId).toBeNull();
      expect(plan.taskCommitsTaskId).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "A",
      executedDate: "14/09/2026",
      description: "Reset filter khi student hoac sprint khong con sau refresh",
    },
    () => {
      const sanitized = sanitizePipelineFilter(
        { studentId: "gone", sprintId: "old-sprint", anomaliesOnly: true },
        members,
        [{ id: "sp-1", name: "Sprint 3" }]
      );
      expect(sanitized.studentId).toBe("ALL");
      expect(sanitized.sprintId).toBe("ALL");
      expect(sanitized.anomaliesOnly).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "N",
      executedDate: "14/09/2026",
      description: "Filter thanh vien va sprint dung du lieu API da map",
    },
    () => {
      const mapped = mapPipelineTasks([
        task({
          id: "t5",
          title: "UI",
          status: "DONE",
          assigneeStudentId: "stu-1",
          linkedCommitCount: 0,
          sprint: { id: "sp-1", name: "Sprint 3", state: "active" },
        }),
        task({
          id: "t6",
          title: "API",
          status: "TODO",
          assigneeStudentId: "stu-2",
          linkedCommitCount: 1,
          sprint: { id: "sp-1", name: "Sprint 3", state: "active" },
        }),
      ]);
      const filtered = filterPipelineTasks(
        mapped,
        { studentId: "stu-1", sprintId: "sp-1", anomaliesOnly: true },
        members
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("t5");
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "B",
      executedDate: "14/09/2026",
      description: "CSV Task gom dung cot hop dong, khong them additions hay score",
    },
    () => {
      const csv = buildPipelineTasksCsv([
        {
          id: "t7",
          key: "SAGA-7",
          title: "Export",
          status: "DONE",
          issueTypeName: "Task",
          assigneeStudentId: "stu-1",
          assigneeDisplayName: "Le Hoang Hai",
          assigneeExternalId: null,
          sprintId: "sp-1",
          sprintName: "Sprint 3",
          storyPoint: 3,
          priority: "High",
          linkedCommitCount: 2,
        },
      ]);
      expect(csv).toContain("Mã Task");
      expect(csv).toContain("SAGA-7");
      expect(csv).toContain("Commit liên kết");
      expect(csv).toContain("2");
      expect(csv).not.toContain("linkedCommitCount");
      expect(csv).not.toContain("traceabilityScore");
      expect(csv).not.toContain("additions");
    }
  );

  fptTest(
    {
      id: "UTCID13",
      type: "A",
      executedDate: "14/09/2026",
      description: "Fallback team members dung studentCode khi khong co progress",
    },
    () => {
      const fromTeam = mapMembersFromTeam([
        { studentCode: "HE170504", fullName: "Le Hoang Hai", role: "LEADER" },
      ]);
      expect(fromTeam[0].studentId).toBe("HE170504");
      const fromProgress = mapMembersFromProgress([
        {
          studentId: "uuid-1",
          userId: "u1",
          fullName: "Le Hoang Hai",
          studentCode: "HE170504",
          teamRole: "LEADER",
          tasks: {
            assigned: 1,
            assignedTotal: 1,
            completed: 0,
            incomplete: 1,
            inProgress: 1,
            blocked: 0,
          },
          commits: {
            total: 0,
            linkedToTasks: 0,
            tasksWithLinkedCommits: 0,
            lastCommitAt: null,
            lastCommittedAt: null,
          },
          evidenceConfirmations: 0,
        },
      ]);
      expect(fromProgress[0].studentId).toBe("uuid-1");
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "N",
      executedDate: "15/09/2026",
      description: "Repository Branch filter dung taskId canonical thay vi parse Jira key",
    },
    () => {
      const mapped = mapPipelineTasks([
        task({
          id: "task-manual",
          externalKey: "SAGA-66",
          title: "Manual link",
          status: "DONE",
          linkedCommitCount: 1,
        }),
        task({
          id: "task-other",
          externalKey: "SAGA-67",
          title: "Other task",
          status: "DONE",
          linkedCommitCount: 1,
        }),
      ]);

      const filtered = filterPipelineTasks(
        mapped,
        {
          studentId: "ALL",
          sprintId: "ALL",
          repoId: "repo-uuid",
          branchName: "develop",
        },
        members,
        new Set(["task-manual"])
      );

      expect(filtered.map((item) => item.id)).toEqual(["task-manual"]);
    }
  );

  fptTest(
    {
      id: "UTCID15",
      type: "N",
      executedDate: "19/09/2026",
      description: "isDoneWithoutLinkedCommit tra ve false khi task da co tep hoac link minh chung",
    },
    () => {
      const taskWithEvidence = {
        status: "DONE",
        linkedCommitCount: 0,
        hasEvidence: true,
        evidenceCount: 2,
      };
      expect(isDoneWithoutLinkedCommit(taskWithEvidence)).toBe(false);

      const taskWithEvidenceCountOnly = {
        status: "DONE",
        linkedCommitCount: 0,
        evidenceCount: 1,
      };
      expect(isDoneWithoutLinkedCommit(taskWithEvidenceCountOnly)).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID16",
      type: "N",
      executedDate: "19/09/2026",
      description: "isDocumentOrResearchTask nhan dien dung task bao cao tai lieu nghien cuu",
    },
    () => {
      expect(isDocumentOrResearchTask({ title: "Làm và chỉnh sửa tài liệu Report 1" })).toBe(true);
      expect(isDocumentOrResearchTask({ title: "Viết báo cáo SRS" })).toBe(true);
      expect(isDocumentOrResearchTask({ title: "Khảo sát công nghệ", issueTypeName: "Research" })).toBe(true);
      expect(isDocumentOrResearchTask({ title: "Coding UI", labels: ["saga:document"] })).toBe(true);
      expect(isDocumentOrResearchTask({ title: "Fix bug auth API", issueTypeName: "Task" })).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID17",
      type: "B",
      executedDate: "19/09/2026",
      description: "isDoneWithoutLinkedCommit tra ve true cho task Done 0 commit khi chua co minh chung",
    },
    () => {
      expect(isDoneWithoutLinkedCommit({ status: "DONE", linkedCommitCount: 0 })).toBe(true);
      expect(isDoneWithoutLinkedCommit({ status: "TODO", linkedCommitCount: 0 })).toBe(false);
      expect(isDoneWithoutLinkedCommit({ status: "DONE", linkedCommitCount: 1 })).toBe(false);
    }
  );
});
