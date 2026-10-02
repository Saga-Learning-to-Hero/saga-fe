import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { resolveAssistantRouteContext } from "@/features/assistant/lib/assistant-route-context";

const date = "03/10/2026";

function params(value: string) {
  return new URLSearchParams(value);
}

describe("resolveAssistantRouteContext", () => {
  fptTest({ id: "UTCID01", type: "N", executedDate: date, description: "sinh vien da chon lop thi mo tro ly" }, () => {
    expect(resolveAssistantRouteContext({
      role: "STUDENT",
      pathname: "/student/sprint-progress",
      searchParams: params("courseId=course-1"),
    })).toEqual({ role: "STUDENT", courseId: "course-1", teamId: null });
  });

  fptTest({ id: "UTCID02", type: "N", executedDate: date, description: "giang vien trong lop khong o trang nhom" }, () => {
    expect(resolveAssistantRouteContext({
      role: "LECTURER",
      pathname: "/lecturer/courses/course-1/dashboard",
      searchParams: params(""),
    })).toEqual({ role: "LECTURER", courseId: "course-1", teamId: null });
  });

  fptTest({ id: "UTCID03", type: "N", executedDate: date, description: "giang vien o trang nhom lay teamId" }, () => {
    expect(resolveAssistantRouteContext({
      role: "LECTURER",
      pathname: "/lecturer/courses/course-1/teams/team-9",
      searchParams: params(""),
    })?.teamId).toBe("team-9");
  });

  fptTest({ id: "UTCID04", type: "A", executedDate: date, description: "admin khong co tro ly" }, () => {
    expect(resolveAssistantRouteContext({
      role: "ADMIN",
      pathname: "/admin/dashboard",
      searchParams: params(""),
    })).toBeNull();
  });

  fptTest({ id: "UTCID05", type: "A", executedDate: date, description: "danh sach lop giang vien khong hien tro ly" }, () => {
    expect(resolveAssistantRouteContext({
      role: "LECTURER",
      pathname: "/lecturer/courses",
      searchParams: params(""),
    })).toBeNull();
  });

  fptTest({ id: "UTCID06", type: "A", executedDate: date, description: "trang chon nhom khong gan teamId" }, () => {
    expect(resolveAssistantRouteContext({
      role: "LECTURER",
      pathname: "/lecturer/courses/course-1/teams/select",
      searchParams: params(""),
    })?.teamId).toBeNull();
  });

  fptTest({ id: "UTCID07", type: "A", executedDate: date, description: "sinh vien chua co courseId" }, () => {
    expect(resolveAssistantRouteContext({
      role: "STUDENT",
      pathname: "/student/dashboard",
      searchParams: params(""),
    })).toBeNull();
  });

  fptTest({ id: "UTCID08", type: "A", executedDate: date, description: "trang danh sach lop sinh vien khong hien tro ly" }, () => {
    expect(resolveAssistantRouteContext({
      role: "STUDENT",
      pathname: "/student/courses",
      searchParams: params("courseId=course-1"),
    })).toBeNull();
  });

  fptTest({ id: "UTCID09", type: "B", executedDate: date, description: "trang thanh vien van giu teamId" }, () => {
    expect(resolveAssistantRouteContext({
      role: "LECTURER",
      pathname: "/lecturer/courses/course-1/teams/team-9/members/student-1",
      searchParams: params(""),
    })?.teamId).toBe("team-9");
  });

  fptTest({ id: "UTCID10", type: "B", executedDate: date, description: "courseId tren URL duoc giai ma" }, () => {
    expect(resolveAssistantRouteContext({
      role: "LECTURER",
      pathname: "/lecturer/courses/course%201/ai",
      searchParams: params(""),
    })?.courseId).toBe("course 1");
  });
});
