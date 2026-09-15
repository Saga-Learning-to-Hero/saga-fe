import { describe, expect, it } from "vitest";
import { getTaskDueDateInfo } from "./task-due-date";

const NOW = new Date("2026-09-15T03:00:00.000Z");

describe("getTaskDueDateInfo", () => {
  it("phan loai task qua han theo ngay tai Viet Nam", () => {
    expect(getTaskDueDateInfo("2026-09-14", "IN_PROGRESS", NOW)).toMatchObject({
      formattedDate: "14/09/2026",
      state: "OVERDUE",
    });
  });

  it("phan loai task den han hom nay", () => {
    expect(getTaskDueDateInfo("2026-09-15", "IN_PROGRESS", NOW)).toMatchObject({
      formattedDate: "15/09/2026",
      state: "TODAY",
    });
  });

  it("phan loai task sap toi han", () => {
    expect(getTaskDueDateInfo("2026-09-22", "TODO", NOW)).toMatchObject({
      formattedDate: "22/09/2026",
      state: "UPCOMING",
    });
  });

  it("khong canh bao qua han cho task da hoan thanh", () => {
    expect(getTaskDueDateInfo("2026-09-14", "DONE", NOW)).toMatchObject({
      state: "COMPLETED",
    });
  });

  it("bo qua gia tri rong hoac ngay khong hop le", () => {
    expect(getTaskDueDateInfo(null, "TODO", NOW)).toBeNull();
    expect(getTaskDueDateInfo("2026-02-30", "TODO", NOW)).toBeNull();
    expect(getTaskDueDateInfo("not-a-date", "TODO", NOW)).toBeNull();
  });
});
