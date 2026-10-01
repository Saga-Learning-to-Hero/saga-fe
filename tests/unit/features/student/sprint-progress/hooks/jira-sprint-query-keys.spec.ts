import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { JIRA_SPRINT_QUERY_KEYS } from "@/features/student/sprint-progress/hooks/use-sprint-data";

describe("jira sprint query keys", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "02/10/2026",
      description: "Query key parent-options gom du childIssueTypeId va jiraIntegrationId",
    },
    () => {
      const key = JIRA_SPRINT_QUERY_KEYS.parentTaskOptions("proj-1", {
        childIssueTypeId: "10004",
        jiraIntegrationId: "jira-1",
        excludeTaskId: "task-9",
        q: "saga",
        page: 1,
        size: 20,
      });
      expect(key).toEqual([
        "jira-sprint",
        "parent-task-options",
        "proj-1",
        "10004",
        "jira-1",
        "task-9",
        "saga",
        1,
        20,
      ]);
    }
  );
});
