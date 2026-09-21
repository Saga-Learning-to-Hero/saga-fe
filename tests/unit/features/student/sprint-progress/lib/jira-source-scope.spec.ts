import { describe, expect, it } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  scopeIssuesToJiraSource,
  scopeSprintsToJiraSource,
} from "@/features/student/sprint-progress/lib/jira-source-scope";

describe("scopeSprintsToJiraSource", () => {
  const sprints = [
    { id: "local-a", externalSprintId: "101", name: "Site A Sprint", state: "active" },
    { id: "local-b", externalSprintId: "202", name: "Site B Sprint", state: "active" },
    { id: "local-b-empty", externalSprintId: "203", name: "Site B Future", state: "future" },
  ];

  it("keeps only sprints advertised by the selected Jira source", () => {
    expect(
      scopeSprintsToJiraSource(sprints, [
        { id: "202", name: "Site B Sprint", state: "active" },
        { id: "203", name: "Site B Future", state: "future" },
      ])
    ).toEqual([sprints[1], sprints[2]]);
  });

  it("uses projected task sprint ids as a safe fallback", () => {
    expect(
      scopeSprintsToJiraSource(sprints, undefined, [{ sprintId: "local-b" }])
    ).toEqual([sprints[1]]);
  });

  it("does not leak another Jira site's sprints when source metadata is unavailable", () => {
    expect(scopeSprintsToJiraSource(sprints, undefined)).toEqual([]);
  });
});

describe("scopeIssuesToJiraSource", () => {
  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "21/09/2026",
      description: "Backlog khong hien task cua Jira Site khac khi project co nhieu source",
    },
    () => {
      const issues = [
        { id: "task-sg", jiraIntegrationId: "source-sg" },
        { id: "task-saga", jiraIntegrationId: "source-saga" },
        { id: "legacy-task", jiraIntegrationId: null },
      ];

      expect(scopeIssuesToJiraSource(issues, "source-sg", 2)).toEqual([
        { id: "task-sg", jiraIntegrationId: "source-sg" },
      ]);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "21/09/2026",
      description: "Project mot Jira source van hien task legacy chua co provenance",
    },
    () => {
      const issues = [
        { id: "current", jiraIntegrationId: "source-a" },
        { id: "legacy", jiraIntegrationId: null },
      ];

      expect(scopeIssuesToJiraSource(issues, "source-a", 1)).toHaveLength(2);
    }
  );
});
