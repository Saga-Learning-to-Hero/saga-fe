import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { getApiErrorStatus, isUnauthorizedError, isStepUpRequiredError } from "@/lib/api-error";

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

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "14/09/2026",
      description: "isStepUpRequiredError tra ve true khi status 403 va code STEP_UP_REQUIRED",
    },
    () => {
      const err = new Error("Step-up required") as Error & { status?: number; code?: string };
      err.status = 403;
      err.code = "STEP_UP_REQUIRED";
      expect(isStepUpRequiredError(err)).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "14/09/2026",
      description: "isStepUpRequiredError tra ve false khi loi 403 ACCESS_DENIED hoac 500",
    },
    () => {
      const accessDeniedErr = new Error("Access Denied") as Error & { status?: number; code?: string };
      accessDeniedErr.status = 403;
      accessDeniedErr.code = "ACCESS_DENIED";
      expect(isStepUpRequiredError(accessDeniedErr)).toBe(false);
      expect(isStepUpRequiredError(new Error("Server error"))).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: "14/09/2026",
      description: "isStepUpRequiredError tra ve true khi code nam trong response.data",
    },
    () => {
      const customResponseErr = {
        response: {
          status: 403,
          data: { code: "STEP_UP_REQUIRED" },
        },
      };
      expect(isStepUpRequiredError(customResponseErr)).toBe(true);
    }
  );
});
