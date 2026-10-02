import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { mapMessage, normalizeAnswerSource, normalizeCitationKind, normalizeKeySource, normalizeMessageRole } from "@/features/assistant/types/project-assistant";

const date = "03/10/2026";

describe("project assistant normalizers", () => {
  fptTest({ id: "UTCID01", type: "N", executedDate: date, description: "nhan dien enum da biet" }, () => {
    expect(normalizeKeySource("PLATFORM")).toBe("PLATFORM");
    expect(normalizeAnswerSource("FALLBACK")).toBe("FALLBACK");
    expect(normalizeMessageRole("ASSISTANT")).toBe("ASSISTANT");
    expect(normalizeCitationKind("DELAY_CASE")).toBe("DELAY_CASE");
  });

  fptTest({ id: "UTCID02", type: "A", executedDate: date, description: "gia tri la khong thanh UNKNOWN" }, () => {
    expect(normalizeKeySource("SOMETHING")).toBe("UNKNOWN");
    expect(normalizeAnswerSource(12)).toBeNull();
    expect(normalizeMessageRole(null)).toBe("UNKNOWN");
    expect(normalizeCitationKind("")).toBe("UNKNOWN");
  });

  fptTest({ id: "UTCID03", type: "B", executedDate: date, description: "enum viet thuong van duoc chuan hoa" }, () => {
    expect(normalizeKeySource(" unavailable ")).toBe("UNAVAILABLE");
    expect(normalizeCitationKind("commit")).toBe("COMMIT");
  });

  fptTest({ id: "UTCID04", type: "A", executedDate: date, description: "message thieu mang va boolean duoc mac dinh an toan" }, () => {
    const message = mapMessage({ id: "m1", role: "ASSISTANT", content: null });
    expect(message.citations).toEqual([]);
    expect(message.followUpQuestions).toEqual([]);
    expect(message.verified).toBe(false);
    expect(message.insufficientData).toBe(false);
    expect(message.removedCitationCount).toBe(0);
    expect(message.content).toBe("");
  });

  fptTest({ id: "UTCID05", type: "B", executedDate: date, description: "removedCitationCount am thanh 0" }, () => {
    expect(mapMessage({ id: "m1", removedCitationCount: -2 }).removedCitationCount).toBe(0);
  });
});
