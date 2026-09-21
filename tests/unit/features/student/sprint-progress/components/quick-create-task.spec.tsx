import { describe, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fptTest } from "@/testing/fpt-test-helper";
import { QuickCreateTask } from "@/features/student/sprint-progress/components/quick-create-task";

const mockMutateAsync = vi.fn();
let mockIsPending = false;

vi.mock("@/features/student/sprint-progress/hooks/use-project-tasks", () => ({
  useCreateProjectTask: () => ({
    mutateAsync: mockMutateAsync,
    isPending: mockIsPending,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("QuickCreateTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
  });

  fptTest(
    {
      id: "UTCID01",
      type: "A",
      executedDate: "14/09/2026",
      description: "An hoan toan component khi canCreate = false",
    },
    () => {
      const { container } = render(
        <QuickCreateTask
          projectId="proj-123"
          canCreate={false}
          sprintId="sprint-1"
          sprintExternalId="239"
        />
      );

      expect(container.firstChild).toBeNull();
      expect(screen.queryByText("Tạo task nhanh")).not.toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "14/09/2026",
      description: "Hien thi nut Tao task nhanh khi canCreate = true va mo inline form khi click",
    },
    async () => {
      const user = userEvent.setup();
      render(
        <QuickCreateTask
          projectId="proj-123"
          canCreate={true}
          sprintId="sprint-1"
          sprintExternalId="239"
        />
      );

      const triggerBtn = screen.getByRole("button", { name: /Tạo task nhanh/i });
      expect(triggerBtn).toBeInTheDocument();

      await user.click(triggerBtn);

      const input = screen.getByPlaceholderText("Cần làm gì? Nhập tên task...");
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
      expect(screen.getByRole("button", { name: "Tạo" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Hủy" })).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "14/09/2026",
      description: "Khong cho phep submit khi summary chi chua khoang trang hoac rong",
    },
    async () => {
      const user = userEvent.setup();
      render(
        <QuickCreateTask
          projectId="proj-123"
          canCreate={true}
          sprintId="sprint-1"
          sprintExternalId="239"
        />
      );

      await user.click(screen.getByRole("button", { name: /Tạo task nhanh/i }));
      const submitBtn = screen.getByRole("button", { name: "Tạo" });
      expect(submitBtn).toBeDisabled();

      const input = screen.getByPlaceholderText("Cần làm gì? Nhập tên task...");
      await user.type(input, "     ");
      expect(submitBtn).toBeDisabled();

      await user.keyboard("{Enter}");
      expect(mockMutateAsync).not.toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "14/09/2026",
      description: "Tao task trong sprint: trim summary va gui kem sprintExternalId",
    },
    async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ id: "task-1", title: "New Task" });

      render(
        <QuickCreateTask
          projectId="proj-123"
          jiraIntegrationId="jira-source-2"
          canCreate={true}
          sprintId="sprint-uuid-1"
          sprintExternalId="239"
          sprintName="Sprint 4"
        />
      );

      await user.click(screen.getByRole("button", { name: /Tạo task nhanh/i }));
      const input = screen.getByPlaceholderText("Cần làm gì? Nhập tên task...");
      await user.type(input, "   Thiet ke giao dien moi   ");

      const submitBtn = screen.getByRole("button", { name: "Tạo" });
      expect(submitBtn).not.toBeDisabled();
      await user.click(submitBtn);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          projectId: "proj-123",
          data: {
            summary: "Thiet ke giao dien moi",
            jiraIntegrationId: "jira-source-2",
            sprintExternalId: "239",
          },
        });
        expect(screen.queryByPlaceholderText("Cần làm gì? Nhập tên task...")).not.toBeInTheDocument();
      });
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "14/09/2026",
      description: "Tao task trong backlog: khong gui kem sprintExternalId",
    },
    async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ id: "task-2", title: "Backlog Item" });

      render(
        <QuickCreateTask
          projectId="proj-123"
          canCreate={true}
          sprintId="backlog"
        />
      );

      await user.click(screen.getByRole("button", { name: /Tạo task nhanh/i }));
      const input = screen.getByPlaceholderText("Cần làm gì? Nhập tên task...");
      await user.type(input, "Nghiem thu backlog task");

      await user.click(screen.getByRole("button", { name: "Tạo" }));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          projectId: "proj-123",
          data: {
            summary: "Nghiem thu backlog task",
            jiraIntegrationId: undefined,
            sprintExternalId: undefined,
          },
        });
      });
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "14/09/2026",
      description: "Gui request khi nhan phim Enter trong input",
    },
    async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ id: "task-3" });

      render(
        <QuickCreateTask
          projectId="proj-123"
          canCreate={true}
          sprintId="sprint-1"
          sprintExternalId="239"
        />
      );

      await user.click(screen.getByRole("button", { name: /Tạo task nhanh/i }));
      const input = screen.getByPlaceholderText("Cần làm gì? Nhập tên task...");
      await user.type(input, "Task submit bang Enter{enter}");

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          projectId: "proj-123",
          data: {
            summary: "Task submit bang Enter",
            jiraIntegrationId: undefined,
            sprintExternalId: "239",
          },
        });
      });
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "14/09/2026",
      description: "Huy inline quick create khi nhan phim Escape hoac bam nut Huy",
    },
    async () => {
      const user = userEvent.setup();
      render(
        <QuickCreateTask
          projectId="proj-123"
          canCreate={true}
          sprintId="sprint-1"
          sprintExternalId="239"
        />
      );

      await user.click(screen.getByRole("button", { name: /Tạo task nhanh/i }));
      expect(screen.getByPlaceholderText("Cần làm gì? Nhập tên task...")).toBeInTheDocument();

      await user.keyboard("{Escape}");
      expect(screen.queryByPlaceholderText("Cần làm gì? Nhập tên task...")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Tạo task nhanh/i })).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /Tạo task nhanh/i }));
      await user.click(screen.getByRole("button", { name: "Hủy" }));
      expect(screen.queryByPlaceholderText("Cần làm gì? Nhập tên task...")).not.toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "14/09/2026",
      description: "Chan double submit va hien thi dang tao khi mutation dang pending",
    },
    async () => {
      const user = userEvent.setup();
      mockIsPending = true;

      render(
        <QuickCreateTask
          projectId="proj-123"
          canCreate={true}
          sprintId="sprint-1"
          sprintExternalId="239"
        />
      );

      await user.click(screen.getByRole("button", { name: /Tạo task nhanh/i }));
      const input = screen.getByPlaceholderText("Cần làm gì? Nhập tên task...");
      expect(input).toBeDisabled();

      const submitBtn = screen.getByRole("button", { name: /Đang tạo.../i });
      expect(submitBtn).toBeDisabled();

      await user.click(submitBtn);
      expect(mockMutateAsync).not.toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "A",
      executedDate: "14/09/2026",
      description: "Giu nguyen noi dung input va hien thi loi khi API tra ve that bai",
    },
    async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockRejectedValueOnce({
        response: {
          data: {
            code: "JIRA_API_ERROR",
            message: "Lỗi kết nối tới Jira workspace",
          },
        },
      });

      render(
        <QuickCreateTask
          projectId="proj-123"
          canCreate={true}
          sprintId="sprint-1"
          sprintExternalId="239"
        />
      );

      await user.click(screen.getByRole("button", { name: /Tạo task nhanh/i }));
      const input = screen.getByPlaceholderText("Cần làm gì? Nhập tên task...");
      await user.type(input, "Task bi loi");

      await user.click(screen.getByRole("button", { name: "Tạo" }));

      await waitFor(() => {
        expect(screen.getByText("Lỗi kết nối tới Jira workspace")).toBeInTheDocument();
        expect(input).toHaveValue("Task bi loi");
        expect(input).toBeInTheDocument();
      });
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "A",
      executedDate: "14/09/2026",
      description: "Bao loi va chan goi API neu sprint khong co externalSprintId hop le",
    },
    async () => {
      const user = userEvent.setup();
      render(
        <QuickCreateTask
          projectId="proj-123"
          canCreate={true}
          sprintId="sprint-without-ext"
          sprintExternalId={undefined}
          sprintName="Sprint Chờ Đồng Bộ"
        />
      );

      await user.click(screen.getByRole("button", { name: /Tạo task nhanh/i }));
      const input = screen.getByPlaceholderText("Cần làm gì? Nhập tên task...");
      await user.type(input, "Task vao sprint chua dong bo");

      await user.click(screen.getByRole("button", { name: "Tạo" }));

      await waitFor(() => {
        expect(
          screen.getByText(/chưa có ID đồng bộ hợp lệ trên Jira/i)
        ).toBeInTheDocument();
        expect(mockMutateAsync).not.toHaveBeenCalled();
      });
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "N",
      executedDate: "14/09/2026",
      description: "Xu ly loi JIRA_WRITE_INCOMPLETE: dong input va reset trang thai",
    },
    async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockRejectedValueOnce({
        response: {
          data: {
            code: "JIRA_WRITE_INCOMPLETE",
            message: "Task đã được tạo trên Jira nhưng thuộc tính phụ chưa đồng bộ.",
          },
        },
      });

      render(
        <QuickCreateTask
          projectId="proj-123"
          canCreate={true}
          sprintId="sprint-1"
          sprintExternalId="239"
        />
      );

      await user.click(screen.getByRole("button", { name: /Tạo task nhanh/i }));
      const input = screen.getByPlaceholderText("Cần làm gì? Nhập tên task...");
      await user.type(input, "Task incomplete");

      await user.click(screen.getByRole("button", { name: "Tạo" }));

      await waitFor(() => {
        expect(screen.queryByPlaceholderText("Cần làm gì? Nhập tên task...")).not.toBeInTheDocument();
      });
    }
  );
});
