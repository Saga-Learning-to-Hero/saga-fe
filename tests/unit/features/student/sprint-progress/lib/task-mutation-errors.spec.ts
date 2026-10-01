import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  getTaskMutationErrorMessage,
  getTaskMutationFieldError,
} from "@/features/student/sprint-progress/lib/task-mutation-errors";

function apiError(code: string, message = "x") {
  return { response: { data: { code, message } } };
}

describe("task-mutation-errors", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "02/10/2026",
      description: "Map ma loi loai the va parent vao dung o form",
    },
    () => {
      expect(getTaskMutationFieldError(apiError("TASK_ISSUE_TYPE_INVALID"))?.field).toBe("issueTypeId");
      expect(getTaskMutationFieldError(apiError("TASK_ISSUE_TYPE_CHANGE_NOT_ALLOWED"))?.field).toBe(
        "issueTypeId"
      );
      expect(getTaskMutationFieldError(apiError("TASK_SUBTASK_PARENT_REQUIRED"))?.field).toBe("parent");
      expect(getTaskMutationFieldError(apiError("TASK_PARENT_TYPE_INVALID"))?.field).toBe("parent");
      expect(getTaskMutationFieldError(apiError("JIRA_PARENT_SOURCE_MISMATCH"))?.field).toBe("parent");
      expect(getTaskMutationFieldError(apiError("JIRA_PARENT_TASK_NOT_FOUND"))?.field).toBe("parent");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "02/10/2026",
      description: "Xoa con Subtask tra thong bao 409, khong map o form",
    },
    () => {
      expect(getTaskMutationErrorMessage(apiError("TASK_DELETE_BLOCKED_BY_SUBTASKS"), "fallback")).toContain(
        "Task con"
      );
      expect(getTaskMutationFieldError(apiError("TASK_DELETE_BLOCKED_BY_SUBTASKS"))).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "02/10/2026",
      description: "REQUEST_INVALID map o summary de giu form da nhap",
    },
    () => {
      expect(getTaskMutationFieldError(apiError("REQUEST_INVALID", "Sai request"))?.field).toBe("summary");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "02/10/2026",
      description: "TASK_SUBTASK_PERCENT_INVALID map o storyPoints va dung usedPercent",
    },
    () => {
      const error = {
        data: {
          code: "TASK_SUBTASK_PERCENT_INVALID",
          usedPercent: 60,
          requestedPercent: 50,
          maxPercent: 100,
        },
        code: "TASK_SUBTASK_PERCENT_INVALID",
      };
      const field = getTaskMutationFieldError(error);
      expect(field?.field).toBe("storyPoints");
      expect(field?.message).toContain("60%");
      expect(field?.message).toContain("50%");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "02/10/2026",
      description: "Thong bao minPoints maxPoints khi BE tra gioi han diem",
    },
    () => {
      const error = {
        response: {
          data: {
            code: "TASK_SUBTASK_PERCENT_INVALID",
            minPoints: 1,
            maxPoints: 4,
          },
        },
      };
      expect(getTaskMutationErrorMessage(error, "fallback")).toContain("1–4");
    }
  );
});
