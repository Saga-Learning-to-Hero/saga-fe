import { render, screen } from "@testing-library/react";
import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { HeatmapCellTooltip } from "./activity-heatmap-grid";

describe("HeatmapCellTooltip", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "18/09/2026",
      description: "Tooltip heatmap hien thi ngay, diem va tung loai hoat dong ro rang",
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
            comments: 0,
            documents: 2,
            totalActivities: 27,
            totalScore: 63,
          }}
        />
      );

      expect(screen.getByText("Thứ Năm, 17/09")).toBeTruthy();
      expect(screen.getByText("+63 điểm")).toBeTruthy();
      expect(screen.getByText("Commit Git").parentElement?.textContent).toContain("11");
      expect(screen.getByText("Task Jira").parentElement?.textContent).toContain("5");
      expect(screen.getByText("Đánh giá chéo").parentElement?.textContent).toContain("9");
      expect(screen.getByText("Bình luận").parentElement?.textContent).toContain("0");
      expect(screen.getByText("Tài liệu").parentElement?.textContent).toContain("2");
      expect(screen.getByText("Tổng hoạt động").parentElement?.textContent).toContain("27");
    }
  );
});
