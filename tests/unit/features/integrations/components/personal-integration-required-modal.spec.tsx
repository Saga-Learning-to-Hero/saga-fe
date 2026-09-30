import { describe, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { fptTest } from "@/testing/fpt-test-helper";
import { PersonalIntegrationRequiredModal } from "@/features/integrations/components/personal-integration-required-modal";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockStartJiraMutateAsync = vi.fn();
const mockStartGitHubMutateAsync = vi.fn();

vi.mock("@/features/integrations/hooks/useJiraIntegrations", () => ({
  useStartJiraLink: () => ({
    mutateAsync: mockStartJiraMutateAsync,
    isPending: false,
  }),
}));

vi.mock("@/features/integrations/hooks/useGithubIntegrations", () => ({
  useStartGitHubLink: () => ({
    mutateAsync: mockStartGitHubMutateAsync,
    isPending: false,
  }),
}));

vi.mock("@/features/integrations/hooks/useUserIntegrations", () => ({
  useUserIdentities: () => ({
    isJiraConnected: false,
    isGitHubConnected: false,
    jiraIdentity: null,
    githubIdentity: null,
    isLoading: false,
  }),
}));

vi.mock("@/lib/api-error", () => ({
  showInfoToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

describe("PersonalIntegrationRequiredModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "30/09/2026",
      description: "Khong render gi khi isOpen = false",
    },
    () => {
      const { container } = render(
        <PersonalIntegrationRequiredModal
          isOpen={false}
          isJiraConnected={false}
          isGitHubConnected={false}
          courseId="course-1"
          moduleName="task"
        />
      );

      expect(container.firstChild).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "30/09/2026",
      description: "Render modal chan hoan toan khi isOpen = true va ca 2 deu chua lien ket",
    },
    () => {
      render(
        <PersonalIntegrationRequiredModal
          isOpen={true}
          isJiraConnected={false}
          isGitHubConnected={false}
          courseId="course-1"
          moduleName="task"
        />
      );

      expect(screen.getByText("Yêu cầu liên kết tài khoản cá nhân")).toBeInTheDocument();
      expect(screen.getByText(/Quản lý Tiến độ Sprint & Bảng Kanban Task/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Liên kết tài khoản Jira ngay/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Liên kết tài khoản GitHub ngay/i })).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "30/09/2026",
      description: "Hien thi thong tin Da ket noi khi chi moi lien ket Jira",
    },
    () => {
      render(
        <PersonalIntegrationRequiredModal
          isOpen={true}
          isJiraConnected={true}
          isGitHubConnected={false}
          jiraDisplayName="Nguyen Van A"
          courseId="course-1"
          moduleName="commit"
        />
      );

      expect(screen.getByText(/Nhật ký Commit mã nguồn GitHub/i)).toBeInTheDocument();
      expect(screen.getByText("Đã kết nối")).toBeInTheDocument();
      expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
      expect(screen.getByText("Chưa kết nối")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Liên kết tài khoản Jira ngay/i })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Liên kết tài khoản GitHub ngay/i })).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "30/09/2026",
      description: "Click nut Lien ket Jira goi startJiraLink mutation",
    },
    async () => {
      mockStartJiraMutateAsync.mockResolvedValueOnce({ authorizationUrl: "https://jira.atlassian.com/auth" });
      const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);

      render(
        <PersonalIntegrationRequiredModal
          isOpen={true}
          isJiraConnected={false}
          isGitHubConnected={false}
          courseId="course-1"
          moduleName="task"
        />
      );

      const btn = screen.getByRole("button", { name: /Liên kết tài khoản Jira ngay/i });
      fireEvent.click(btn);

      await waitFor(() => {
        expect(mockStartJiraMutateAsync).toHaveBeenCalled();
      });

      windowOpenSpy.mockRestore();
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "30/09/2026",
      description: "Click nut Lien ket GitHub goi startGitHubLink mutation",
    },
    async () => {
      mockStartGitHubMutateAsync.mockResolvedValueOnce({ authorizationUrl: "https://github.com/login/oauth" });
      const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);

      render(
        <PersonalIntegrationRequiredModal
          isOpen={true}
          isJiraConnected={true}
          isGitHubConnected={false}
          courseId="course-1"
          moduleName="commit"
        />
      );

      const btn = screen.getByRole("button", { name: /Liên kết tài khoản GitHub ngay/i });
      fireEvent.click(btn);

      await waitFor(() => {
        expect(mockStartGitHubMutateAsync).toHaveBeenCalled();
      });

      windowOpenSpy.mockRestore();
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: "30/09/2026",
      description: "Click nut Ve Dashboard goi router.push ve /student/dashboard voi courseId",
    },
    () => {
      render(
        <PersonalIntegrationRequiredModal
          isOpen={true}
          isJiraConnected={false}
          isGitHubConnected={false}
          courseId="course-xyz"
          moduleName="task"
        />
      );

      const backBtn = screen.getByRole("button", { name: /Về Dashboard/i });
      fireEvent.click(backBtn);

      expect(mockPush).toHaveBeenCalledWith("/student/dashboard?courseId=course-xyz");
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "B",
      executedDate: "30/09/2026",
      description: "Click nut Ve Dashboard khi khong co courseId thi dieu huong ve /student/courses",
    },
    () => {
      render(
        <PersonalIntegrationRequiredModal
          isOpen={true}
          isJiraConnected={false}
          isGitHubConnected={false}
          moduleName="task"
        />
      );

      const backBtn = screen.getByRole("button", { name: /Về Dashboard/i });
      fireEvent.click(backBtn);

      expect(mockPush).toHaveBeenCalledWith("/student/courses");
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "N",
      executedDate: "30/09/2026",
      description: "Khoa cuon document.body khi modal dang mo va hoan tra khi unmount",
    },
    () => {
      const { unmount } = render(
        <PersonalIntegrationRequiredModal
          isOpen={true}
          isJiraConnected={false}
          isGitHubConnected={false}
          moduleName="task"
        />
      );

      expect(document.body.style.overflow).toBe("hidden");

      unmount();

      expect(document.body.style.overflow).toBe("");
    }
  );
});
