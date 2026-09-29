import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  areJiraSourceQueriesSettled,
  getSprintSourceUserMessage,
  resolveSprintQuerySource,
  shouldRetrySprintQuery,
} from "@/features/student/sprint-progress/lib/sprint-query-source";

describe("resolveSprintQuerySource", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "29/09/2026",
      description: "Truyen explicit integrationId thi enable ngay, khong cho source settle",
    },
    () => {
      const result = resolveSprintQuerySource({
        explicitIntegrationId: "jira-a",
        sourcesSettled: false,
        activeSourceIds: ["jira-b", "jira-c"],
      });
      expect(result).toEqual({
        status: "ready",
        enabled: true,
        integrationId: "jira-a",
        activeCount: 2,
      });
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "29/09/2026",
      description: "Dung mot source ACTIVE sau khi settle thi goi /sprints voi id do",
    },
    () => {
      const result = resolveSprintQuerySource({
        sourcesSettled: true,
        activeSourceIds: ["only-source"],
      });
      expect(result.enabled).toBe(true);
      expect(result.integrationId).toBe("only-source");
      expect(result.status).toBe("ready");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "29/09/2026",
      description: "Sources chua settle thi khong enable query /sprints",
    },
    () => {
      const result = resolveSprintQuerySource({
        sourcesSettled: false,
        activeSourceIds: [],
      });
      expect(result.enabled).toBe(false);
      expect(result.status).toBe("pending");
      expect(result.integrationId).toBeUndefined();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "29/09/2026",
      description: "Khong co source ACTIVE thi khong goi API, tra no_source",
    },
    () => {
      const result = resolveSprintQuerySource({
        sourcesSettled: true,
        activeSourceIds: [],
      });
      expect(result.enabled).toBe(false);
      expect(result.status).toBe("no_source");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "29/09/2026",
      description: "Nhieu source chua chon thi khong auto lay source dau",
    },
    () => {
      const result = resolveSprintQuerySource({
        sourcesSettled: true,
        activeSourceIds: ["first", "second"],
      });
      expect(result.enabled).toBe(false);
      expect(result.status).toBe("needs_selection");
      expect(result.integrationId).toBeUndefined();
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: "29/09/2026",
      description: "Explicit id chi co khoang trang duoc coi la chua chon",
    },
    () => {
      const result = resolveSprintQuerySource({
        explicitIntegrationId: "   ",
        sourcesSettled: true,
        activeSourceIds: ["first", "second"],
      });
      expect(result.enabled).toBe(false);
      expect(result.status).toBe("needs_selection");
    }
  );
});

describe("areJiraSourceQueriesSettled", () => {
  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "29/09/2026",
      description: "Canonical da fetched va co item thi settled",
    },
    () => {
      expect(
        areJiraSourceQueriesSettled({
          hasExplicitId: false,
          canonicalFetched: true,
          canonicalCount: 2,
          integrationsEnabled: false,
          integrationsFetched: false,
        })
      ).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "29/09/2026",
      description: "Canonical rong phai cho integrations fetched",
    },
    () => {
      expect(
        areJiraSourceQueriesSettled({
          hasExplicitId: false,
          canonicalFetched: true,
          canonicalCount: 0,
          integrationsEnabled: true,
          integrationsFetched: false,
        })
      ).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "29/09/2026",
      description: "Co explicit id thi coi nhu settled ngay",
    },
    () => {
      expect(
        areJiraSourceQueriesSettled({
          hasExplicitId: true,
          canonicalFetched: false,
          canonicalCount: 0,
          integrationsEnabled: false,
          integrationsFetched: false,
        })
      ).toBe(true);
    }
  );
});

describe("shouldRetrySprintQuery", () => {
  fptTest(
    {
      id: "UTCID10",
      type: "A",
      executedDate: "29/09/2026",
      description: "409 Conflict khong retry",
    },
    () => {
      expect(shouldRetrySprintQuery(0, { status: 409, code: "CONFLICT" })).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "A",
      executedDate: "29/09/2026",
      description: "403 ACCESS_DENIED khong retry",
    },
    () => {
      expect(shouldRetrySprintQuery(0, { status: 403, code: "ACCESS_DENIED" })).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "N",
      executedDate: "29/09/2026",
      description: "500 duoc retry mot lan",
    },
    () => {
      expect(shouldRetrySprintQuery(0, { status: 500 })).toBe(true);
      expect(shouldRetrySprintQuery(1, { status: 500 })).toBe(false);
    }
  );
});

describe("getSprintSourceUserMessage", () => {
  fptTest(
    {
      id: "UTCID13",
      type: "N",
      executedDate: "29/09/2026",
      description: "409 hien thong bao chon nguon Jira bang tieng Viet",
    },
    () => {
      const message = getSprintSourceUserMessage({ error: { status: 409 } });
      expect(message.title).toBe("Chưa chọn nguồn Jira");
      expect(message.description).toContain("nhiều kết nối Jira");
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "B",
      executedDate: "29/09/2026",
      description: "0 source hien empty ket noi Jira, khong phai error page",
    },
    () => {
      const message = getSprintSourceUserMessage({ status: "no_source" });
      expect(message.title).toBe("Chưa kết nối Jira");
    }
  );
});
