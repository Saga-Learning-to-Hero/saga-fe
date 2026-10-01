import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { isTaskOwnedByCurrentStudent } from "@/features/student/sprint-progress/lib/task-permissions";
import type { SprintIssue } from "@/features/student/sprint-progress/types/sprint-progress";

function issueWithAssignee(studentId: string | null, studentCode: string): SprintIssue {
  return {
    id: "task-1",
    key: "SAGA-1",
    summary: "Task",
    type: "TASK",
    issueTypeLevel: "STANDARD",
    priority: "MEDIUM",
    status: "TODO",
    storyPoints: 0,
    assignee: { id: studentId || studentCode, studentId, studentCode, name: "Sinh viên", avatar: "" },
    sprintId: "backlog",
    createdAt: "2026-09-30T00:00:00Z",
  };
}

describe("isTaskOwnedByCurrentStudent", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "30/09/2026",
      description: "Xac dinh Task cua minh bang assigneeStudentId canonical",
    },
    () => {
      expect(isTaskOwnedByCurrentStudent(issueWithAssignee("student-1", "SE001"), "student-1", "SE001")).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "30/09/2026",
      description: "Khong fallback sang ma sinh vien khi canonical studentId khong khop",
    },
    () => {
      expect(isTaskOwnedByCurrentStudent(issueWithAssignee("student-2", "SE001"), "student-1", "SE001")).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "30/09/2026",
      description: "Fallback ma sinh vien cho du lieu cu chua co assigneeStudentId",
    },
    () => {
      expect(isTaskOwnedByCurrentStudent(issueWithAssignee(null, "SE001"), "student-1", "SE001")).toBe(true);
    }
  );
});
