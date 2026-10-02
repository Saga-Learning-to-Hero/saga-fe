import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { ASSISTANT_QUESTION_MAX, validateAssistantQuestion } from "@/features/assistant/lib/question-input";

const date = "03/10/2026";

describe("validateAssistantQuestion", () => {
  fptTest({ id: "UTCID01", type: "N", executedDate: date, description: "cau hoi hop le duoc cat khoang trang" }, () => {
    expect(validateAssistantQuestion("  Tien do sprint?  ")).toEqual({ ok: true, question: "Tien do sprint?" });
  });

  fptTest({ id: "UTCID02", type: "A", executedDate: date, description: "chuoi rong bi tu choi" }, () => {
    expect(validateAssistantQuestion("").ok).toBe(false);
  });

  fptTest({ id: "UTCID03", type: "A", executedDate: date, description: "chi co khoang trang bi tu choi" }, () => {
    expect(validateAssistantQuestion("   ").ok).toBe(false);
  });

  fptTest({ id: "UTCID04", type: "A", executedDate: date, description: "vuot 1000 ky tu bi tu choi" }, () => {
    expect(validateAssistantQuestion("a".repeat(1001)).ok).toBe(false);
  });

  fptTest({ id: "UTCID05", type: "B", executedDate: date, description: "dung 1 ky tu van hop le" }, () => {
    expect(validateAssistantQuestion("a")).toEqual({ ok: true, question: "a" });
  });

  fptTest({ id: "UTCID06", type: "B", executedDate: date, description: "dung 1000 ky tu van hop le" }, () => {
    const question = "b".repeat(ASSISTANT_QUESTION_MAX);
    expect(validateAssistantQuestion(question)).toEqual({ ok: true, question });
  });
});
