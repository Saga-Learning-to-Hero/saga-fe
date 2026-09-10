import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { getRoleHomePath, getSafeRedirectUrl, isPathAllowedForRole } from "./role-routes";

describe("role-routes", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "10/09/2026",
      description: "Reload URL team hop le giu trong namespace lecturer",
    },
    () => {
      expect(
        isPathAllowedForRole(
          "/lecturer/courses/course-1/teams/team-1/contribution-evaluation",
          "LECTURER"
        )
      ).toBe(true);
      expect(getSafeRedirectUrl("/lecturer/courses/course-1/teams/team-1", "LECTURER")).toBe(
        "/lecturer/courses/course-1/teams/team-1"
      );
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "10/09/2026",
      description: "Sai role chuyen ve trang chu dung role",
    },
    () => {
      expect(isPathAllowedForRole("/lecturer/courses", "STUDENT")).toBe(false);
      expect(getSafeRedirectUrl("/lecturer/courses", "STUDENT")).toBe("/student/courses");
      expect(getRoleHomePath("ADMIN")).toBe("/admin/dashboard");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "10/09/2026",
      description: "next rong hoac ngoai origin quay ve role home",
    },
    () => {
      expect(getSafeRedirectUrl(null, "LECTURER")).toBe("/lecturer/courses");
      expect(getSafeRedirectUrl("https://evil.example/login", "LECTURER")).toBe("/lecturer/courses");
    }
  );
});
