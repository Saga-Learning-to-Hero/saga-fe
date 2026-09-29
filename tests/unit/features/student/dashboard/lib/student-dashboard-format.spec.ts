import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { formatStudentNullablePercent } from "@/features/student/dashboard/lib/student-dashboard-format";

describe("formatStudentNullablePercent", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "29/09/2026",
      description: "Phan tram hop le duoc lam tron",
    },
    () => {
      expect(formatStudentNullablePercent(67.4)).toBe("67%");
      expect(formatStudentNullablePercent(0)).toBe("0%");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "29/09/2026",
      description: "Null hoac NaN hien em dash, khong ep 0",
    },
    () => {
      expect(formatStudentNullablePercent(null)).toBe("—");
      expect(formatStudentNullablePercent(undefined)).toBe("—");
      expect(formatStudentNullablePercent(Number.NaN)).toBe("—");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "29/09/2026",
      description: "Gia tri bien 100 va Infinity khong ep sai",
    },
    () => {
      expect(formatStudentNullablePercent(100)).toBe("100%");
      expect(formatStudentNullablePercent(Number.POSITIVE_INFINITY)).toBe("—");
    }
  );
});
