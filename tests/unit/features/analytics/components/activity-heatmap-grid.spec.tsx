import { render, screen } from "@testing-library/react";
import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { HeatmapCellTooltip } from "@/features/analytics/components/activity-heatmap-grid";

describe("HeatmapCellTooltip", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "18/09/2026",
      description: "Tooltip heatmap hien thi ngay va tung loai hoat dong ro rang",
    },
    () => {
      render(
        <HeatmapCellTooltip
          formattedDate="Thứ Năm, 17/09"
          cell={{
            date: "2026-09-17",
            commits: 11,
            tasks: 5,
            peerReviews: 9,
            documents: 2,
            totalActivities: 27,
            actors: [
              {
                studentId: "sv-01",
                studentCode: "SE170001",
                fullName: "Nguyen Van A",
                avatar: null,
              },
            ],
          }}
        />
      );

      expect(screen.getByText("Thứ Năm, 17/09")).toBeTruthy();
      expect(screen.getByText("Commit Git").parentElement?.textContent).toContain("11");
      expect(screen.getByText("Task Jira").parentElement?.textContent).toContain("5");
      expect(screen.getByText("Đánh giá chéo").parentElement?.textContent).toContain("9");
      expect(screen.getByText("Tài liệu").parentElement?.textContent).toContain("2");
      expect(screen.getByText("Tổng hoạt động").parentElement?.textContent).toContain("27");
      expect(screen.getByText("Nguyen Van A")).toBeTruthy();
    }
  );
});
