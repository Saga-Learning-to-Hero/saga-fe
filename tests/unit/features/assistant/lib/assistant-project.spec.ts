import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { resolveLecturerAssistantProject, resolveStudentAssistantProject } from "@/features/assistant/lib/assistant-project";

const date = "03/10/2026";
const teams = [
  { teamId: "t1", teamNo: 1, teamName: "Alpha", projectId: "p1" },
  { teamId: "t2", teamNo: 2, teamName: "Beta", projectId: null },
];

describe("assistant project resolver", () => {
  fptTest({ id: "UTCID01", type: "N", executedDate: date, description: "sinh vien co du an dung projectId cua nhom" }, () => {
    expect(resolveStudentAssistantProject({
      teamId: "t1",
      projectId: "p1",
      teamName: "Alpha",
      teamNo: 1,
      isWaitingForTeam: false,
    }).projectId).toBe("p1");
  });

  fptTest({ id: "UTCID02", type: "N", executedDate: date, description: "giang vien o trang nhom chon dung nhom do" }, () => {
    const result = resolveLecturerAssistantProject({ teams, routeTeamId: "t1", pickedTeamId: null });
    expect(result.projectId).toBe("p1");
    expect(result.needsTeamPicker).toBe(false);
  });

  fptTest({ id: "UTCID03", type: "A", executedDate: date, description: "sinh vien chua co nhom thi khong goi tro ly" }, () => {
    const result = resolveStudentAssistantProject({ teamId: null, projectId: null, isWaitingForTeam: true });
    expect(result.projectId).toBeNull();
    expect(result.guidance).toMatch(/chưa được phân vào nhóm/);
  });

  fptTest({ id: "UTCID04", type: "A", executedDate: date, description: "nhom chua co du an" }, () => {
    const result = resolveStudentAssistantProject({ teamId: "t1", projectId: null, isWaitingForTeam: false });
    expect(result.guidance).toMatch(/chưa có dự án/);
  });

  fptTest({ id: "UTCID05", type: "A", executedDate: date, description: "giang vien ngoai trang nhom phai tu chon" }, () => {
    const result = resolveLecturerAssistantProject({ teams, routeTeamId: null, pickedTeamId: null });
    expect(result.needsTeamPicker).toBe(true);
    expect(result.projectId).toBeNull();
  });

  fptTest({ id: "UTCID06", type: "B", executedDate: date, description: "doi nhom da chon sang du an khac" }, () => {
    const first = resolveLecturerAssistantProject({ teams, routeTeamId: null, pickedTeamId: "t1" });
    const second = resolveLecturerAssistantProject({
      teams: [{ teamId: "t9", teamNo: 9, teamName: "Gamma", projectId: "p9" }],
      routeTeamId: null,
      pickedTeamId: "t1",
    });
    expect(first.projectId).toBe("p1");
    expect(second.projectId).toBeNull();
  });

  fptTest({ id: "UTCID07", type: "B", executedDate: date, description: "lop khong co nhom nao co du an" }, () => {
    const result = resolveLecturerAssistantProject({
      teams: [{ teamId: "t2", teamNo: 2, teamName: "Beta", projectId: null }],
      routeTeamId: null,
      pickedTeamId: null,
    });
    expect(result.guidance).toMatch(/chưa có nhóm đã khởi tạo dự án/);
  });
});
