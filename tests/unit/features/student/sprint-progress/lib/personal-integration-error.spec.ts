import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  getPersonalIntegrationErrorMessage,
  getTaskLabelErrorMessage,
} from "@/features/student/sprint-progress/lib/personal-integration-error";

describe("personal-integration-error helper", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "30/09/2026",
      description: "Tra ve thong bao ro rang khi co details.missingProviders chua JIRA va GITHUB",
    },
    () => {
      const error = {
        response: {
          data: {
            code: "PERSONAL_INTEGRATION_REQUIRED",
            details: {
              missingProviders: ["JIRA", "GITHUB"],
            },
          },
        },
      };

      const result = getPersonalIntegrationErrorMessage(error);
      expect(result).toBe(
        "Bạn chưa liên kết tài khoản cá nhân với Jira và GitHub. Vui lòng liên kết để thực hiện tạo hoặc cập nhật task."
      );
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "30/09/2026",
      description: "Tra ve thong bao chi tiet khi chi thieu JIRA",
    },
    () => {
      const error = {
        response: {
          data: {
            code: "PERSONAL_INTEGRATION_REQUIRED",
            details: {
              missingProviders: ["JIRA"],
            },
          },
        },
      };

      const result = getPersonalIntegrationErrorMessage(error);
      expect(result).toBe(
        "Bạn chưa liên kết tài khoản cá nhân với Jira. Vui lòng liên kết để thực hiện tạo hoặc cập nhật task."
      );
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "30/09/2026",
      description: "Tra ve thong bao chi tiet khi chi thieu GITHUB",
    },
    () => {
      const error = {
        response: {
          data: {
            code: "PERSONAL_INTEGRATION_REQUIRED",
            details: {
              missingProviders: ["GITHUB"],
            },
          },
        },
      };

      const result = getPersonalIntegrationErrorMessage(error);
      expect(result).toBe(
        "Bạn chưa liên kết tài khoản cá nhân với GitHub. Vui lòng liên kết để thực hiện tạo hoặc cập nhật task."
      );
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "B",
      executedDate: "30/09/2026",
      description: "Tra ve fallback message khi missingProviders rong hoac khong hop le",
    },
    () => {
      const error = {
        response: {
          data: {
            code: "PERSONAL_INTEGRATION_REQUIRED",
            message: "Custom backend error message",
            details: {
              missingProviders: [],
            },
          },
        },
      };

      const result = getPersonalIntegrationErrorMessage(error);
      expect(result).toBe("Custom backend error message");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "30/09/2026",
      description: "Tra ve null khi error la null hoac undefined",
    },
    () => {
      expect(getPersonalIntegrationErrorMessage(null)).toBeNull();
      expect(getPersonalIntegrationErrorMessage(undefined)).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "30/09/2026",
      description: "Tra ve null khi error co code khac PERSONAL_INTEGRATION_REQUIRED",
    },
    () => {
      const error = {
        response: {
          data: {
            code: "SOMETHING_ELSE",
            message: "Other error",
          },
        },
      };

      expect(getPersonalIntegrationErrorMessage(error)).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "30/09/2026",
      description: "getTaskLabelErrorMessage tra ve thong bao chuan khi ma loi la TASK_LABEL_NOT_ALLOWED",
    },
    () => {
      const error = {
        response: {
          data: {
            code: "TASK_LABEL_NOT_ALLOWED",
            message: "Label không hợp lệ",
          },
        },
      };

      expect(getTaskLabelErrorMessage(error)).toBe("Label không hợp lệ");
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "30/09/2026",
      description: "getTaskLabelErrorMessage tra ve null khi error la null hoac khong phai TASK_LABEL_NOT_ALLOWED",
    },
    () => {
      expect(getTaskLabelErrorMessage(null)).toBeNull();
      expect(getTaskLabelErrorMessage({ code: "OTHER" })).toBeNull();
    }
  );
});
