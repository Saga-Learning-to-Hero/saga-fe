import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { getPeerAssessmentState } from "./peer-assessment-state";

const base = {
  courseId: "course-1",
  isCoursesLoading: false,
  isInvalidCourse: false,
  isTeamLoading: false,
  isWaitingForTeam: false,
  forbidden: false,
  isTeamError: false,
};

describe("peer-assessment-state", () => {
  fptTest(
    { id: "UTCID01", type: "N", executedDate: "13/09/2026", description: "hien thi trang thai san sang khi da co course va team" },
    () => expect(getPeerAssessmentState(base)).toBe("READY")
  );

  fptTest(
    { id: "UTCID02", type: "A", executedDate: "13/09/2026", description: "phan biet course khong hop le va khong duoc phep truy cap" },
    () => {
      expect(getPeerAssessmentState({ ...base, isInvalidCourse: true })).toBe("INVALID_COURSE");
      expect(getPeerAssessmentState({ ...base, forbidden: true, isTeamError: true })).toBe("FORBIDDEN");
    }
  );

  fptTest(
    { id: "UTCID03", type: "B", executedDate: "13/09/2026", description: "phan biet chua chon lop, dang tai va dang cho phan nhom" },
    () => {
      expect(getPeerAssessmentState({ ...base, courseId: "", isCoursesLoading: true })).toBe("LOADING_COURSE");
      expect(getPeerAssessmentState({ ...base, courseId: "" })).toBe("NO_COURSE");
      expect(getPeerAssessmentState({ ...base, isTeamLoading: true })).toBe("LOADING_TEAM");
      expect(getPeerAssessmentState({ ...base, isWaitingForTeam: true })).toBe("WAITING_FOR_TEAM");
      expect(getPeerAssessmentState({ ...base, isTeamError: true })).toBe("TEAM_ERROR");
    }
  );
});
