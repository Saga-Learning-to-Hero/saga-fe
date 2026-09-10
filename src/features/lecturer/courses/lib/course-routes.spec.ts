import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  lecturerCourseContributionPath,
  lecturerCourseGradesPath,
  lecturerCourseTeamEvaluationPath,
  lecturerCourseTeamsPath,
  lecturerCourseWeightSettingsPath,
  resolveLecturerWorkspaceView,
} from "./course-routes";

describe("lecturer course-routes", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "10/09/2026",
      description: "Tab teams duoc giu qua query view=teams",
    },
    () => {
      expect(resolveLecturerWorkspaceView("teams")).toBe("teams");
      expect(lecturerCourseTeamsPath("course-1", "teams")).toBe(
        "/lecturer/courses/course-1/teams?view=teams"
      );
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "10/09/2026",
      description: "Query view khong hop le quay ve members",
    },
    () => {
      expect(resolveLecturerWorkspaceView("roster")).toBe("members");
      expect(resolveLecturerWorkspaceView("unknown")).toBe("members");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "10/09/2026",
      description: "Thieu view hoac view rong mac dinh members va khong day history query",
    },
    () => {
      expect(resolveLecturerWorkspaceView(null)).toBe("members");
      expect(resolveLecturerWorkspaceView(undefined)).toBe("members");
      expect(resolveLecturerWorkspaceView("")).toBe("members");
      expect(lecturerCourseTeamsPath("course-1", "members")).toBe(
        "/lecturer/courses/course-1/teams?view=members"
      );
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "10/09/2026",
      description: "Route trong so cu alias sang contribution-configuration",
    },
    () => {
      expect(lecturerCourseWeightSettingsPath("course-1")).toBe(
        lecturerCourseContributionPath("course-1")
      );
      expect(lecturerCourseContributionPath("course-1")).toBe(
        "/lecturer/courses/course-1/contribution-configuration"
      );
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "10/09/2026",
      description: "Route bang diem kem teamId hop le va alias evaluation cu",
    },
    () => {
      expect(lecturerCourseGradesPath("course-1", "team-1")).toBe(
        "/lecturer/courses/course-1/grades?teamId=team-1"
      );
      expect(lecturerCourseTeamEvaluationPath("course-1", "team-1")).toBe(
        lecturerCourseGradesPath("course-1", "team-1")
      );
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: "10/09/2026",
      description: "Thieu teamId thi bang diem khong gan query",
    },
    () => {
      expect(lecturerCourseGradesPath("course-1")).toBe("/lecturer/courses/course-1/grades");
      expect(lecturerCourseGradesPath("course-1", "   ")).toBe("/lecturer/courses/course-1/grades");
      expect(lecturerCourseGradesPath("course-1", null)).toBe("/lecturer/courses/course-1/grades");
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "10/09/2026",
      description: "teamId dac biet duoc ma hoa an toan tren query string",
    },
    () => {
      expect(lecturerCourseGradesPath("course-1", "a b&c")).toBe(
        "/lecturer/courses/course-1/grades?teamId=a+b%26c"
      );
    }
  );
});
