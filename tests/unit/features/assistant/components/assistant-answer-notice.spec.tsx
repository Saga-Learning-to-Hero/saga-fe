import { describe, expect, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { fptTest } from "@/testing/fpt-test-helper";

const toastSuccess = vi.hoisted(() => vi.fn());
vi.mock("sonner", () => ({ toast: { success: toastSuccess } }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/student/dashboard",
  useSearchParams: () => new URLSearchParams("courseId=course-1"),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/features/auth/store/useAuthStore", () => ({
  useAuthStore: (selector?: (state: { user: { role: string } }) => unknown) => {
    const state = { user: { role: "STUDENT" } };
    return selector ? selector(state) : state;
  },
}));

// The real panel renders markdown; this test is about the launcher's unread dot and the toast.
vi.mock("@/features/assistant/components/assistant-panel", () => ({
  AssistantPanel: () => <div>panel</div>,
}));

import { ProjectAssistantLauncher } from "@/features/assistant/components/project-assistant-launcher";
import {
  ASSISTANT_ANSWERED_EVENT,
  ASSISTANT_OPEN_EVENT,
  announceAssistantAnswer,
  isAwayFromAssistant,
} from "@/features/assistant/lib/assistant-events";

const date = "05/10/2026";

describe("Assistant answer notice", () => {
  beforeEach(() => {
    toastSuccess.mockClear();
  });

  fptTest(
    { id: "UTCID10", type: "N", executedDate: date, description: "Tra loi ve khi khung chat thu nho, tab an hoac da chuyen trang thi coi la vang mat" },
    () => {
      expect(isAwayFromAssistant(true, true)).toBe(document.visibilityState === "hidden");
      expect(isAwayFromAssistant(false, true)).toBe(true);
      expect(isAwayFromAssistant(true, false)).toBe(true);
    }
  );

  fptTest(
    { id: "UTCID11", type: "N", executedDate: date, description: "Thong bao co nut Xem mo lai tro ly" },
    () => {
      const opened = vi.fn();
      window.addEventListener(ASSISTANT_OPEN_EVENT, opened);

      announceAssistantAnswer();

      expect(toastSuccess).toHaveBeenCalledWith("Trợ lý AI đã trả lời", expect.objectContaining({ action: expect.objectContaining({ label: "Xem" }) }));
      const options = toastSuccess.mock.calls[0][1] as { action: { onClick: () => void } };
      options.action.onClick();
      expect(opened).toHaveBeenCalledTimes(1);
      window.removeEventListener(ASSISTANT_OPEN_EVENT, opened);
    }
  );

  fptTest(
    { id: "UTCID12", type: "N", executedDate: date, description: "Nut tro ly hien cham do khi co cau tra loi chua xem, mo ra thi het" },
    () => {
      render(<ProjectAssistantLauncher />);
      expect(screen.queryByLabelText("Trợ lý có câu trả lời mới")).not.toBeInTheDocument();

      act(() => {
        window.dispatchEvent(new Event(ASSISTANT_ANSWERED_EVENT));
      });
      expect(screen.getByLabelText("Trợ lý có câu trả lời mới")).toBeInTheDocument();

      act(() => {
        window.dispatchEvent(new Event(ASSISTANT_OPEN_EVENT));
      });
      expect(screen.queryByLabelText("Trợ lý có câu trả lời mới")).not.toBeInTheDocument();
      expect(screen.getByText("panel")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Thu gọn trợ lý AI dự án" }));
      expect(screen.queryByLabelText("Trợ lý có câu trả lời mới")).not.toBeInTheDocument();
    }
  );
});
