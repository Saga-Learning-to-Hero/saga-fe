import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  getIntegrationPopupSnapshot,
  markIntegrationPopupWindow,
  parseIntegrationPopupSnapshot,
} from "@/features/integrations/lib/integration-popup-context";

function createPopupWindow(name = ""): Window {
  const values = new Map<string, string>();

  return {
    name,
    opener: null,
    sessionStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  } as unknown as Window;
}

describe("integration-popup-context", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "30/09/2026",
      description: "Nhan dien dung popup Jira du window.opener bi mat sau OAuth",
    },
    () => {
      const popup = createPopupWindow();
      markIntegrationPopupWindow(popup, {
        provider: "jira",
        scope: "personal",
      });

      const snapshot = getIntegrationPopupSnapshot(popup);

      expect(parseIntegrationPopupSnapshot(snapshot)).toEqual({
        provider: "jira",
        scope: "personal",
      });
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "30/09/2026",
      description: "Dung ten cua so lam fallback khi sessionStorage khong con du lieu",
    },
    () => {
      const popup = createPopupWindow("saga_personal_github_oauth");

      expect(parseIntegrationPopupSnapshot(getIntegrationPopupSnapshot(popup))).toEqual({
        provider: "github",
        scope: "personal",
      });
    }
  );
});
