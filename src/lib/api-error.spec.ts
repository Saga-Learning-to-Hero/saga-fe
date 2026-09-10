import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { getApiErrorStatus, isUnauthorizedError } from "./api-error";

function errorWithStatus(status?: number) {
  const error = new Error("session") as Error & { status?: number };
  error.status = status;
  return error;
}

describe("api-error session handling", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "10/09/2026",
      description: "401 duoc nhan la het phien de chuyen login kem next",
    },
    () => {
      expect(isUnauthorizedError(errorWithStatus(401))).toBe(true);
      expect(getApiErrorStatus(errorWithStatus(401))).toBe(401);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "10/09/2026",
      description: "Loi mang khong status khong xoa danh tinh",
    },
    () => {
      expect(isUnauthorizedError(new Error("Network Error"))).toBe(false);
      expect(isUnauthorizedError("offline")).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "10/09/2026",
      description: "5xx khong duoc coi la 401, UI phai hien Retry",
    },
    () => {
      expect(isUnauthorizedError(errorWithStatus(500))).toBe(false);
      expect(isUnauthorizedError(errorWithStatus(503))).toBe(false);
      expect(getApiErrorStatus(errorWithStatus(500))).toBe(500);
    }
  );
});
