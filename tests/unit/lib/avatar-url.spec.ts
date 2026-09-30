import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { resolveHttpAvatarUrl, toNullableHttpAvatarUrl } from "@/lib/avatar-url";

describe("resolveHttpAvatarUrl", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "30/09/2026",
      description: "Uu tien candidate http/https hop le dau tien",
    },
    () => {
      expect(
        resolveHttpAvatarUrl(null, "https://cdn.example.com/a.png", "http://other.example/b.png")
      ).toBe("https://cdn.example.com/a.png");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "30/09/2026",
      description: "Loai null, rong, space va URL khong phai http/https",
    },
    () => {
      expect(resolveHttpAvatarUrl(null, undefined, "", "   ", "ftp://x", "data:image/png;base64,xx")).toBeUndefined();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "30/09/2026",
      description: "Trim URL va fallback candidate tiep theo khi candidate dau khong hop le",
    },
    () => {
      expect(resolveHttpAvatarUrl("  https://ok.example/x  ")).toBe("https://ok.example/x");
      expect(resolveHttpAvatarUrl("javascript:alert(1)", "http://safe.example/y")).toBe(
        "http://safe.example/y"
      );
      expect(toNullableHttpAvatarUrl(null, "")).toBeNull();
      expect(toNullableHttpAvatarUrl("https://ok.example/z")).toBe("https://ok.example/z");
    }
  );
});
