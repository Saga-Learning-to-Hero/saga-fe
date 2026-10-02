import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { ASSISTANT_RELOAD_HISTORY_MESSAGE, mapAssistantAskError } from "@/features/assistant/lib/assistant-errors";

const date = "03/10/2026";

describe("mapAssistantAskError", () => {
  fptTest({ id: "UTCID01", type: "N", executedDate: date, description: "loi chung giu thong bao goc" }, () => {
    expect(mapAssistantAskError(Object.assign(new Error("May chu ban"), { status: 500 }))).toEqual({
      type: "GENERIC",
      message: "May chu ban",
    });
  });

  fptTest({ id: "UTCID02", type: "A", executedDate: date, description: "400 giu cau hoi va bao loi duoi o nhap" }, () => {
    const action = mapAssistantAskError(Object.assign(new Error("Qua ngan"), { status: 400, code: "ASSISTANT_INPUT_INVALID" }));
    expect(action.type).toBe("INLINE");
  });

  fptTest({ id: "UTCID03", type: "A", executedDate: date, description: "404 cuoc tro chuyen quay ve lich su" }, () => {
    expect(mapAssistantAskError(Object.assign(new Error("missing"), { status: 404, code: "ASSISTANT_CONVERSATION_NOT_FOUND" })).type).toBe("BACK_TO_HISTORY");
  });

  fptTest({ id: "UTCID04", type: "A", executedDate: date, description: "429 khoa o nhap" }, () => {
    expect(mapAssistantAskError(Object.assign(new Error("limit"), { status: 429, code: "ASSISTANT_RATE_LIMITED" })).type).toBe("RATE_LIMITED");
  });

  fptTest({ id: "UTCID05", type: "A", executedDate: date, description: "503 tat tro ly" }, () => {
    expect(mapAssistantAskError(Object.assign(new Error("off"), { status: 503, code: "ASSISTANT_DISABLED" })).type).toBe("DISABLED");
  });

  fptTest({ id: "UTCID06", type: "A", executedDate: date, description: "loi mang khong gui lai" }, () => {
    const action = mapAssistantAskError(Object.assign(new Error("Network Error"), { code: "ERR_NETWORK" }));
    expect(action).toEqual({ type: "RELOAD_HISTORY", message: ASSISTANT_RELOAD_HISTORY_MESSAGE });
  });

  fptTest({ id: "UTCID07", type: "B", executedDate: date, description: "timeout cung yeu cau tai lai lich su" }, () => {
    expect(mapAssistantAskError(Object.assign(new Error("timeout of 60000ms exceeded"), { code: "ECONNABORTED" })).type).toBe("RELOAD_HISTORY");
  });
});
