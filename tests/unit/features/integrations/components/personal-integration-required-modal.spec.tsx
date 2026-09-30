import { describe, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

function createPopupWindowMock(): Window {
  return {
    closed: false,
    close: vi.fn(),
    focus: vi.fn(),
    location: { replace: vi.fn() },
  } as unknown as Window;
}

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

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

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
      const { container } = renderWithClient(
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
      renderWithClient(
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
      renderWithClient(
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
      const popup = createPopupWindowMock();
      const windowOpenSpy = vi.spyOn(window, "open").mockReturnValue(popup);

      renderWithClient(
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
        expect(popup.location.replace).toHaveBeenCalledWith("https://jira.atlassian.com/auth");
      });
      expect(windowOpenSpy).toHaveBeenCalledWith(
        "/integrations/popup?provider=jira",
        "saga_personal_jira_oauth",
        expect.stringContaining("popup=yes")
      );

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
      const popup = createPopupWindowMock();
      const windowOpenSpy = vi.spyOn(window, "open").mockReturnValue(popup);

      renderWithClient(
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
        expect(popup.location.replace).toHaveBeenCalledWith("https://github.com/login/oauth");
      });
      expect(windowOpenSpy).toHaveBeenCalledWith(
        "/integrations/popup?provider=github",
        "saga_personal_github_oauth",
        expect.stringContaining("popup=yes")
      );

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
      renderWithClient(
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
      renderWithClient(
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
      const { unmount } = renderWithClient(
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

  fptTest(
    {
      id: "UTCID09",
      type: "A",
      executedDate: "30/09/2026",
      description: "Khong goi API OAuth khi trinh duyet chan popup",
    },
    async () => {
      const windowOpenSpy = vi.spyOn(window, "open").mockReturnValue(null);

      renderWithClient(
        <PersonalIntegrationRequiredModal
          isOpen={true}
          isJiraConnected={false}
          isGitHubConnected={true}
          moduleName="task"
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /Liên kết tài khoản Jira ngay/i }));

      await waitFor(() => {
        expect(windowOpenSpy).toHaveBeenCalled();
      });
      expect(mockStartJiraMutateAsync).not.toHaveBeenCalled();

      windowOpenSpy.mockRestore();
    }
  );
});
