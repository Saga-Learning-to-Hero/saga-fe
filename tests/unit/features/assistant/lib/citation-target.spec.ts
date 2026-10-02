import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { CITATION_DISABLED_REASON, resolveCitationHref } from "@/features/assistant/lib/citation-target";

const date = "03/10/2026";
const student = { role: "STUDENT" as const, courseId: "course-1", teamId: null };
const lecturer = { role: "LECTURER" as const, courseId: "course-1", teamId: "team-1" };

describe("resolveCitationHref", () => {
  fptTest({ id: "UTCID01", type: "N", executedDate: date, description: "task sinh vien mo trang Tasks" }, () => {
    const target = resolveCitationHref({ kind: "TASK", id: "task-1", taskId: null, sha: null }, student);
    expect(target).toEqual({ href: "/student/sprint-progress?courseId=course-1&taskId=task-1" });
  });

  fptTest({ id: "UTCID02", type: "N", executedDate: date, description: "commit sinh vien kem hash va id" }, () => {
    const target = resolveCitationHref({ kind: "COMMIT", id: "commit-1", taskId: null, sha: "abc123" }, student);
    expect("href" in target && target.href).toContain("commitHash=abc123");
    expect("href" in target && target.href).toContain("commitId=commit-1");
  });

  fptTest({ id: "UTCID03", type: "N", executedDate: date, description: "thanh vien sinh vien mo tong quan" }, () => {
    const target = resolveCitationHref({ kind: "MEMBER", id: "student-1", taskId: null, sha: null }, student);
    expect(target).toEqual({ href: "/student/dashboard?courseId=course-1&memberId=student-1" });
  });

  fptTest({ id: "UTCID04", type: "N", executedDate: date, description: "task giang vien mo do thi kem team" }, () => {
    const target = resolveCitationHref({ kind: "TASK", id: "task-1", taskId: null, sha: null }, lecturer);
    expect("href" in target && target.href).toContain("/lecturer/courses/course-1/graph?");
    expect("href" in target && target.href).toContain("teamId=team-1");
    expect("href" in target && target.href).toContain("taskId=task-1");
  });

  fptTest({ id: "UTCID05", type: "N", executedDate: date, description: "thanh vien giang vien mo trang tien do" }, () => {
    const target = resolveCitationHref({ kind: "MEMBER", id: "student-1", taskId: null, sha: null }, lecturer);
    expect(target).toEqual({ href: "/lecturer/courses/course-1/teams/team-1/members/student-1" });
  });

  fptTest({ id: "UTCID06", type: "B", executedDate: date, description: "ho so tre han dieu huong dung vai tro" }, () => {
    const studentTarget = resolveCitationHref({ kind: "DELAY_CASE", id: "case-1", taskId: "task-1", sha: null }, student);
    const lecturerTarget = resolveCitationHref({ kind: "DELAY_CASE", id: "case-1", taskId: "task-1", sha: null }, lecturer);
    expect("href" in studentTarget && studentTarget.href).toContain("delayCaseId=case-1");
    expect(lecturerTarget).toEqual({ href: "/lecturer/courses/course-1/teams/team-1?delayCaseId=case-1" });
  });

  fptTest({ id: "UTCID07", type: "A", executedDate: date, description: "thieu id task thi vo hieu" }, () => {
    expect(resolveCitationHref({ kind: "TASK", id: null, taskId: null, sha: null }, student)).toEqual({
      disabledReason: CITATION_DISABLED_REASON,
    });
  });

  fptTest({ id: "UTCID08", type: "A", executedDate: date, description: "commit thieu sha thi vo hieu" }, () => {
    expect(resolveCitationHref({ kind: "COMMIT", id: "commit-1", taskId: null, sha: " " }, lecturer)).toEqual({
      disabledReason: CITATION_DISABLED_REASON,
    });
  });

  fptTest({ id: "UTCID09", type: "A", executedDate: date, description: "giang vien thieu teamId thi vo hieu" }, () => {
    expect(resolveCitationHref(
      { kind: "TASK", id: "task-1", taskId: null, sha: null },
      { role: "LECTURER", courseId: "course-1", teamId: null }
    )).toEqual({ disabledReason: CITATION_DISABLED_REASON });
  });

  fptTest({ id: "UTCID10", type: "A", executedDate: date, description: "kind la khong thi vo hieu" }, () => {
    expect(resolveCitationHref({ kind: "UNKNOWN", id: "x", taskId: null, sha: null }, student)).toEqual({
      disabledReason: CITATION_DISABLED_REASON,
    });
  });

  fptTest({ id: "UTCID11", type: "B", executedDate: date, description: "commit chi co sha van mo duoc" }, () => {
    const target = resolveCitationHref({ kind: "COMMIT", id: null, taskId: null, sha: "abc" }, student);
    expect("href" in target && target.href).toContain("commitHash=abc");
    expect("href" in target && target.href.includes("commitId")).toBe(false);
  });

  fptTest({ id: "UTCID12", type: "B", executedDate: date, description: "ho so tre han khong co taskId van mo duoc" }, () => {
    const target = resolveCitationHref({ kind: "DELAY_CASE", id: "case-1", taskId: null, sha: null }, student);
    expect("href" in target && target.href).toContain("delayCaseId=case-1");
    expect("href" in target && target.href.includes("taskId")).toBe(false);
  });
});
