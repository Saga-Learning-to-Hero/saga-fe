import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { normalizeApiBaseUrl, getApiBaseUrl, buildApiUrl } from "@/lib/api-config";

describe("api-config", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "24/09/2026",
      description: "Tra ve URL chuan hoa khi truyen URL hop le khong co dau gach cheo cuoi",
    },
    () => {
      expect(normalizeApiBaseUrl("https://api.saga.autos")).toBe("https://api.saga.autos");
      expect(normalizeApiBaseUrl("http://localhost:8080")).toBe("http://localhost:8080");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "24/09/2026",
      description: "buildApiUrl ghep duong dan chuan xac khong bi duplicate slash",
    },
    () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_URL;
      process.env.NEXT_PUBLIC_API_URL = "https://api.saga.autos/";

      expect(buildApiUrl("/api/auth/csrf")).toBe("https://api.saga.autos/api/auth/csrf");
      expect(buildApiUrl("api/auth/csrf")).toBe("https://api.saga.autos/api/auth/csrf");

      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "24/09/2026",
      description: "getApiBaseUrl lay dung gia tri tu process.env.NEXT_PUBLIC_API_URL",
    },
    () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_URL;
      process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080";

      expect(getApiBaseUrl()).toBe("http://localhost:8080");

      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "24/09/2026",
      description: "Tra ve fallback canonical khi truyen chuoi rong",
    },
    () => {
      expect(normalizeApiBaseUrl("")).toBe("https://api.saga.autos");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "24/09/2026",
      description: "Tra ve fallback canonical khi truyen undefined hoac null",
    },
    () => {
      expect(normalizeApiBaseUrl(undefined)).toBe("https://api.saga.autos");
      expect(normalizeApiBaseUrl(null)).toBe("https://api.saga.autos");
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: "24/09/2026",
      description: "Loai bo nhieu dau gach cheo o cuoi URL",
    },
    () => {
      expect(normalizeApiBaseUrl("https://api.saga.autos///")).toBe("https://api.saga.autos");
      expect(normalizeApiBaseUrl("http://localhost:8080//")).toBe("http://localhost:8080");
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "B",
      executedDate: "24/09/2026",
      description: "Tra ve fallback canonical khi URL chi toan khoang trang",
    },
    () => {
      expect(normalizeApiBaseUrl("   ")).toBe("https://api.saga.autos");
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "24/09/2026",
      description: "buildApiUrl xu ly dung khi path chi co dau slash hoac rong",
    },
    () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_URL;
      process.env.NEXT_PUBLIC_API_URL = "https://api.saga.autos";

      expect(buildApiUrl("/")).toBe("https://api.saga.autos/");
      expect(buildApiUrl("")).toBe("https://api.saga.autos/");

      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    }
  );
});
