import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, vi } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import IntegrationSuccessPage from "@/app/integrations/success/page";
import { markIntegrationPopupWindow } from "@/features/integrations/lib/integration-popup-context";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refreshIntegrations: vi.fn(),
  sendIntegrationResult: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/features/auth/store/useAuthStore", () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    user: { role: "STUDENT" },
  }),
}));

vi.mock("@/features/integrations/hooks/useUserIntegrations", () => ({
  useRefreshUserIntegrations: () => mocks.refreshIntegrations,
}));

vi.mock("@/features/integrations/lib/integration-broadcast", () => ({
  sendIntegrationResult: mocks.sendIntegrationResult,
}));

describe("IntegrationSuccessPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "30/09/2026",
      description: "Popup callback tu dong dong va khong dieu huong trang khi window.opener bi mat",
    },
    async () => {
      vi.useFakeTimers();
      const closeSpy = vi.spyOn(window, "close").mockImplementation(() => {});
      markIntegrationPopupWindow(window, {
        provider: "jira",
        scope: "personal",
      });

      render(<IntegrationSuccessPage />);
      await act(async () => {});

      expect(screen.getByText(/Cửa sổ sẽ tự đóng/i)).toBeInTheDocument();
      expect(mocks.sendIntegrationResult).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          provider: "jira",
          scope: "personal",
        })
      );
      expect(mocks.refreshIntegrations).not.toHaveBeenCalled();
      expect(mocks.replace).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(closeSpy).toHaveBeenCalled();

      vi.useRealTimers();
    }
  );
});
