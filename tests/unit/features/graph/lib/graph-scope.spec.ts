import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  buildGraphScopeParams,
  filterGraphEvidenceByScope,
} from "@/features/graph/lib/graph-scope";

describe("buildGraphScopeParams", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "04/10/2026",
      description: "Che do gon Overview va Activity khong gui param evidence hay nodeTypes",
    },
    () => {
      expect(
        buildGraphScopeParams({ graphType: "OVERVIEW", scopeMode: "COMPACT" })
      ).toBeNull();
      expect(
        buildGraphScopeParams({ graphType: "ACTIVITY", scopeMode: "COMPACT" })
      ).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "04/10/2026",
      description: "Che do Commit gui includeEvidence va evidenceTypes=COMMIT, roi an file va web link",
    },
    () => {
      const params = buildGraphScopeParams({ graphType: "OVERVIEW", scopeMode: "COMMIT" });
      expect(params).toEqual({ includeEvidence: true, evidenceTypes: ["COMMIT"] });
      expect(
        buildGraphScopeParams({ graphType: "ACTIVITY", scopeMode: "COMMIT" })
      ).toEqual({ includeEvidence: true, evidenceTypes: ["COMMIT"] });

      const visible = filterGraphEvidenceByScope(
        {
          nodes: [
            { data: { id: "task:1", type: "TASK" } },
            { data: { id: "file:1", type: "FILE" } },
            { data: { id: "commit:1", type: "COMMIT" } },
            { data: { id: "link:1", type: "WEB_LINK" } },
          ],
          edges: [
            { data: { source: "task:1", target: "file:1" } },
            { data: { source: "task:1", target: "commit:1" } },
            { data: { source: "task:1", target: "link:1" } },
          ],
        },
        "COMMIT"
      );
      expect(visible.nodes.map((node) => node.data.id)).toEqual(["task:1", "commit:1"]);
      expect(visible.edges).toEqual([{ data: { source: "task:1", target: "commit:1" } }]);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "04/10/2026",
      description: "Che do tep va lien ket gui includeEvidence va evidenceTypes FILE,WEB_LINK, roi an commit",
    },
    () => {
      const params = buildGraphScopeParams({ graphType: "OVERVIEW", scopeMode: "FILE_LINK" });
      expect(params).toEqual({ includeEvidence: true, evidenceTypes: ["FILE", "WEB_LINK"] });
      expect(
        buildGraphScopeParams({ graphType: "ACTIVITY", scopeMode: "FILE_LINK" })
      ).toEqual({ includeEvidence: true, evidenceTypes: ["FILE", "WEB_LINK"] });
      expect(JSON.stringify(params)).not.toContain("includeCommits");

      const visible = filterGraphEvidenceByScope(
        {
          nodes: [
            { data: { id: "task:1", type: "TASK" } },
            { data: { id: "file:1", type: "FILE" } },
            { data: { id: "commit:1", type: "COMMIT" } },
            { data: { id: "link:1", type: "WEB_LINK" } },
          ],
          edges: [
            { data: { source: "task:1", target: "file:1" } },
            { data: { source: "task:1", target: "commit:1" } },
            { data: { source: "task:1", target: "link:1" } },
          ],
        },
        "FILE_LINK"
      );
      expect(visible.nodes.map((node) => node.data.id)).toEqual(["task:1", "file:1", "link:1"]);
      expect(visible.edges).toEqual([
        { data: { source: "task:1", target: "file:1" } },
        { data: { source: "task:1", target: "link:1" } },
      ]);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "04/10/2026",
      description: "Attribution khong cat COMMIT va khong gui includeCommits=false",
    },
    () => {
      expect(
        buildGraphScopeParams({ graphType: "ATTRIBUTION", scopeMode: "COMPACT" })
      ).toBeNull();
      const detailed = buildGraphScopeParams({ graphType: "ATTRIBUTION", scopeMode: "COMMIT" });
      expect(detailed).toBeNull();
      expect(JSON.stringify(detailed ?? {})).not.toContain("includeCommits");
      expect(JSON.stringify(detailed ?? {})).not.toContain("COMMIT");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "04/10/2026",
      description: "Focus drill-down co FILE, WEB_LINK va maxNodes=200",
    },
    () => {
      expect(
        buildGraphScopeParams({
          graphType: "OVERVIEW",
          scopeMode: "COMPACT",
          focusNodeId: "task:abc",
        })
      ).toEqual({
        focusNodeId: "task:abc",
        depth: 1,
        includeEvidence: true,
        maxNodes: 200,
        nodeTypes: ["TASK", "COMMIT", "FILE", "WEB_LINK", "STUDENT"],
        edgeTypes: ["ASSIGNED_TO", "EVIDENCED_BY", "PARENT_OF", "HAS_WORK_ITEM"],
      });
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "04/10/2026",
      description: "Contribution khong an evidence; usedCriteriaOnly chi khi duoc bat",
    },
    () => {
      expect(
        buildGraphScopeParams({ graphType: "CONTRIBUTION", scopeMode: "COMPACT" })
      ).toBeNull();
      expect(
        buildGraphScopeParams({
          graphType: "CONTRIBUTION",
          scopeMode: "COMPACT",
          usedCriteriaOnly: true,
        })
      ).toEqual({ usedCriteriaOnly: true });
    }
  );
});
