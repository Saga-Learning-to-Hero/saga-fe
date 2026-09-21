import { describe, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { fptTest } from "@/testing/fpt-test-helper";
import { DashboardKPIsSection } from "@/features/admin/dashboard/components/dashboard-kpis";
import { WebhookIntegrationSection } from "@/features/admin/dashboard/components/webhook-integration-card";

describe("Admin dashboard sections", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "20/09/2026",
      description: "KPI hiển thị dữ liệu canonical và không dùng chỉ số webhook mock",
    },
    () => {
      render(
        <DashboardKPIsSection
          kpis={{
            totalStudents: 120,
            studentsGrowthPercentage: 12.5,
            comparedSemesterCode: "SU26",
            totalCourses: 8,
            totalTeams: 24,
            connectedTeamsCount: 20,
            connectedTeamsRate: 83.33,
            totalCommitsSynced: 900,
            totalJiraTasksSynced: 400,
            traceabilityRate: 62.5,
          }}
        />
      );

      expect(screen.getByText("Sinh viên đang học")).toBeInTheDocument();
      expect(screen.getByText(/12,5% so với SU26/)).toBeInTheDocument();
      expect(screen.getByText("20/24")).toBeInTheDocument();
      expect(screen.getByText("62,5%")).toBeInTheDocument();
      expect(screen.queryByText(/Độ trễ/)).not.toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "B",
      executedDate: "20/09/2026",
      description: "KPI nullable hiển thị Chưa có dữ liệu thay vì giả định 0 phần trăm",
    },
    () => {
      render(
        <DashboardKPIsSection
          kpis={{
            totalStudents: 0,
            studentsGrowthPercentage: null,
            comparedSemesterCode: null,
            totalCourses: 0,
            totalTeams: 0,
            connectedTeamsCount: 0,
            connectedTeamsRate: null,
            totalCommitsSynced: 0,
            totalJiraTasksSynced: 0,
            traceabilityRate: null,
          }}
        />
      );

      expect(
        screen.getByText("Chưa có học kỳ trước để đối chiếu")
      ).toBeInTheDocument();
      expect(screen.getByText("Chưa có dữ liệu")).toBeInTheDocument();
      expect(
        screen.getByText(/có đủ Jira và GitHub/)
      ).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "20/09/2026",
      description: "Pulse và cảnh báo nhóm dùng đúng field response của Backend",
    },
    () => {
      render(
        <WebhookIntegrationSection
          integrationPulse={[
            {
              service: "GITHUB",
              uniqueEventsReceived24h: 12,
              uniqueEventsReceived7d: 45,
              lastUniqueEventAt: "2026-09-20T10:00:00",
            },
            {
              service: "JIRA",
              uniqueEventsReceived24h: 8,
              uniqueEventsReceived7d: 30,
              lastUniqueEventAt: null,
            },
          ]}
          unconnectedTeams={[
            {
              teamId: "team-12345678",
              teamNo: 7,
              teamName: "SAGA Team",
              courseCode: "SWP391_FA26",
              lecturerName: "Nguyen Van A",
              lecturerEmail: "a@fpt.edu.vn",
              missingService: "PROJECT",
              createdAt: "2026-09-01T00:00:00",
              daysSinceCreated: 19,
            },
          ]}
        />
      );

      expect(screen.getByText("Webhook activity")).toBeInTheDocument();
      expect(screen.getByText("Chưa tạo dự án")).toBeInTheDocument();
      expect(screen.getByText("19 ngày")).toHaveClass("text-danger");
      expect(screen.getByText(/Gần nhất: Chưa ghi nhận/)).toBeInTheDocument();
      expect(screen.getByText(/không phải health check/i)).toBeInTheDocument();
    }
  );
});
