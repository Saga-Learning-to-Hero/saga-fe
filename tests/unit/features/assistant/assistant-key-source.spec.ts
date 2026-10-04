import { describe, expect } from "vitest";
import { normalizeKeySource } from "@/features/assistant/types/project-assistant";
import { assistantKeySourceLabel } from "@/features/assistant/lib/assistant-labels";
import { fptTest } from "@/testing/fpt-test-helper";

describe("Assistant key source", () => {
  fptTest(
    { id: "UTCID01", type: "N", executedDate: "04/10/2026", description: "Nhan nguon key TEAM va hien nhan key cua nhom" },
    () => {
      expect(normalizeKeySource("team")).toBe("TEAM");
      expect(assistantKeySourceLabel("TEAM")).toBe("Dùng key AI của nhóm");
      expect(assistantKeySourceLabel("PLATFORM")).toBe("Dùng AI của hệ thống");
      expect(normalizeKeySource("something-else")).toBe("UNKNOWN");
    }
  );
});
