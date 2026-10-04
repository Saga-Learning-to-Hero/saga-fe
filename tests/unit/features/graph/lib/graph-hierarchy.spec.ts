import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  findParentOfEdge,
  graphNodeSizeFor,
  isHasWorkItemEdge,
  isParentOfEdge,
  taskColumnForIssueTypeLevel,
} from "@/features/graph/lib/graph-hierarchy";

describe("graph-hierarchy", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "02/10/2026",
      description: "Tim cha chi qua PARENT_OF target = child.id, khong doc field node",
    },
    () => {
      const edges = [
        { id: "e1", source: "project-1", target: "epic-1", type: "HAS_WORK_ITEM" as const },
        { id: "e2", source: "epic-1", target: "task-1", type: "PARENT_OF" as const },
      ];
      expect(findParentOfEdge(edges, "task-1")?.source).toBe("epic-1");
      expect(findParentOfEdge(edges, "epic-1")).toBeUndefined();
      expect(isParentOfEdge(edges[1])).toBe(true);
      expect(isHasWorkItemEdge(edges[0])).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "02/10/2026",
      description: "Size tuong doi Project 1.5, Epic 1.3, Standard 1.0, Subtask 0.78, Commit 0.72",
    },
    () => {
      expect(graphNodeSizeFor("PROJECT")).toEqual({ width: 120, height: 60 });
      expect(graphNodeSizeFor("TASK", "EPIC")).toEqual({ width: 104, height: 52 });
      expect(graphNodeSizeFor("TASK", "STANDARD")).toEqual({ width: 80, height: 40 });
      expect(graphNodeSizeFor("TASK", "SUBTASK")).toEqual({ width: 62, height: 31 });
      expect(graphNodeSizeFor("COMMIT")).toEqual({ width: 58, height: 29 });
      expect(graphNodeSizeFor("FILE")).toEqual({ width: 54, height: 27 });
      expect(graphNodeSizeFor("WEB_LINK")).toEqual({ width: 54, height: 27 });
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "02/10/2026",
      description: "UNRESOLVED van hien: khong bia PARENT_OF khi parent chua sync",
    },
    () => {
      const edges = [{ id: "e1", source: "project-1", target: "orphan", label: "HAS_SPRINT" as const }];
      expect(findParentOfEdge(edges, "orphan")).toBeUndefined();
      expect(taskColumnForIssueTypeLevel("ABOVE_EPIC")).toBe(0);
      expect(taskColumnForIssueTypeLevel("SUBTASK")).toBe(3);
    }
  );
});
