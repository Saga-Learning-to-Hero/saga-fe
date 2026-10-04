import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { buildGraphScopeParams } from "@/features/graph/lib/graph-scope";

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
      description: "Che do chi tiet chi gui includeEvidence=true",
    },
    () => {
      expect(
        buildGraphScopeParams({ graphType: "OVERVIEW", scopeMode: "FULL" })
      ).toEqual({ includeEvidence: true });
      expect(
        buildGraphScopeParams({ graphType: "ACTIVITY", scopeMode: "FULL" })
      ).toEqual({ includeEvidence: true });
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
      const detailed = buildGraphScopeParams({ graphType: "ATTRIBUTION", scopeMode: "FULL" });
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
