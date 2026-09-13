import { describe, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fptTest } from "@/testing/fpt-test-helper";

describe("TraceabilityGraphView defaults", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "14/09/2026",
      description: "Neo4j Graph van la tab mac dinh va co nhan du lieu minh hoa",
    },
    () => {
      const source = readFileSync(resolve(__dirname, "traceability-graph-view.tsx"), "utf8");
      expect(source).toContain('useState<"FLOW" | "GRAPH">("GRAPH")');
      expect(source).toContain("Dữ liệu minh họa — chưa kết nối API Neo4j");
    }
  );
});
