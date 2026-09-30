import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, vi } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { useIntegrationPopupFlow } from "@/features/integrations/hooks/useIntegrationPopupFlow";
import { sendIntegrationResult } from "@/features/integrations/lib/integration-broadcast";

vi.mock("@/lib/api-error", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

class BroadcastChannelMock {
  static instances: BroadcastChannelMock[] = [];

  readonly name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(name: string) {
    this.name = name;
    BroadcastChannelMock.instances.push(this);
  }

  postMessage(data: unknown) {
    for (const instance of BroadcastChannelMock.instances) {
      if (instance !== this && instance.name === this.name) {
        instance.onmessage?.({ data } as MessageEvent);
      }
    }
  }

  close() {}
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useIntegrationPopupFlow", () => {
  beforeEach(() => {
    BroadcastChannelMock.instances = [];
    vi.stubGlobal("BroadcastChannel", BroadcastChannelMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "30/09/2026",
      description: "Mo popup truoc va dieu huong cung popup sang URL OAuth sau khi API tra ve",
    },
    () => {
      const popup = {
        closed: false,
        close: vi.fn(),
        focus: vi.fn(),
        location: { replace: vi.fn() },
      } as unknown as Window;
      const openSpy = vi.spyOn(window, "open").mockReturnValue(popup);
      const queryClient = new QueryClient();
      const { result, unmount } = renderHook(() => useIntegrationPopupFlow(), {
        wrapper: createWrapper(queryClient),
      });

      act(() => {
        expect(result.current.preparePopup("jira")).toBe(true);
        result.current.startFlow({
          provider: "jira",
          scope: "personal",
          authorizationUrl: "https://auth.atlassian.test/oauth",
        });
      });

      expect(openSpy).toHaveBeenCalledTimes(1);
      expect(openSpy).toHaveBeenCalledWith(
        "/integrations/popup?provider=jira",
        "saga_personal_jira_oauth",
        expect.stringContaining("popup=yes")
      );
      expect(popup.location.replace).toHaveBeenCalledWith("https://auth.atlassian.test/oauth");
      expect(result.current.isWaiting).toBe(true);

      unmount();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "30/09/2026",
      description: "Nhan broadcast thanh cong thi dong popup, refetch danh tinh va ket thuc trang thai cho",
    },
    async () => {
      const popup = {
        closed: false,
        close: vi.fn(),
        focus: vi.fn(),
        location: { replace: vi.fn() },
      } as unknown as Window;
      vi.spyOn(window, "open").mockReturnValue(popup);
      const onSuccess = vi.fn();
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const { result } = renderHook(() => useIntegrationPopupFlow({ onSuccess }), {
        wrapper: createWrapper(queryClient),
      });

      act(() => {
        result.current.preparePopup("github");
        result.current.startFlow({
          provider: "github",
          scope: "personal",
          authorizationUrl: "https://github.test/login/oauth",
        });
      });
      await waitFor(() => expect(result.current.isWaiting).toBe(true));

      act(() => {
        sendIntegrationResult({
          status: "success",
          provider: "github",
          scope: "personal",
        });
      });

      await waitFor(() => {
        expect(result.current.isWaiting).toBe(false);
        expect(popup.close).toHaveBeenCalledTimes(1);
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user-integrations-me"] });
    }
  );
});
