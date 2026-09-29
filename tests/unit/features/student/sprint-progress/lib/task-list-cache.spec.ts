import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  dropMatchedStatusOverrides,
  shouldDropStatusOverride,
  upsertProjectTaskInList,
} from "@/features/student/sprint-progress/lib/task-list-cache";
import type { ProjectTaskResponse } from "@/features/student/sprint-progress/types/jira-task-types";

function task(overrides: Partial<ProjectTaskResponse> & Pick<ProjectTaskResponse, "id" | "status">): ProjectTaskResponse {
  return {
    externalId: overrides.id,
    externalKey: `SAGA-${overrides.id}`,
    title: "Task",
    issueTypeName: "Task",
    linkedCommitCount: 0,
    createdAt: "2026-09-29T00:00:00.000Z",
    updatedAt: "2026-09-29T00:00:00.000Z",
    ...overrides,
  };
}

describe("task-list-cache", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "29/09/2026",
      description: "upsert thay task cung id va giu thu tu cac task con lai",
    },
    () => {
      const first = task({ id: "t1", status: "TODO" });
      const second = task({ id: "t2", status: "TODO" });
      const updated = task({ id: "t1", status: "IN_PROGRESS", title: "Dang lam" });

      const result = upsertProjectTaskInList([first, second], updated);

      expect(result.map((item) => item.id)).toEqual(["t1", "t2"]);
      expect(result[0].status).toBe("IN_PROGRESS");
      expect(result[0].title).toBe("Dang lam");
      expect(result[1]).toEqual(second);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "29/09/2026",
      description: "Drop overlay khi GET /tasks da khop status keo tha",
    },
    () => {
      expect(
        shouldDropStatusOverride(task({ id: "t1", status: "IN_PROGRESS" }), { status: "IN_PROGRESS" })
      ).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "29/09/2026",
      description: "Giu overlay khi GET van TODO sau khi keo sang IN_PROGRESS",
    },
    () => {
      expect(
        shouldDropStatusOverride(task({ id: "t1", status: "TODO" }), { status: "IN_PROGRESS" })
      ).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "29/09/2026",
      description: "Status la khong drop overlay IN_PROGRESS",
    },
    () => {
      expect(
        shouldDropStatusOverride(task({ id: "t1", status: "WEIRD_WORKFLOW" }), { status: "IN_PROGRESS" })
      ).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "29/09/2026",
      description: "List rong hoac thieu id thi upsert them task, khong drop overlay",
    },
    () => {
      const created = task({ id: "t9", status: "DONE" });
      expect(upsertProjectTaskInList(undefined, created)).toEqual([created]);
      expect(upsertProjectTaskInList([], created)).toEqual([created]);
      expect(shouldDropStatusOverride(undefined, { status: "DONE" })).toBe(false);
      expect(shouldDropStatusOverride(created, {})).toBe(false);

      const overrides = { t1: { status: "IN_PROGRESS" as const } };
      expect(dropMatchedStatusOverrides(overrides, [task({ id: "t1", status: "TODO" })])).toBe(overrides);
      expect(dropMatchedStatusOverrides(overrides, [task({ id: "t1", status: "IN_PROGRESS" })])).toEqual({});
    }
  );
});
