import { describe, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { fptTest } from "@/testing/fpt-test-helper";
import { AssistantMessageThread } from "@/features/assistant/components/assistant-message-thread";
import type { AssistantMessage } from "@/features/assistant/types/project-assistant";

// The real bubble renders markdown; this test is about the thread's order and pending state only.
vi.mock("@/features/assistant/components/assistant-message-bubble", () => ({
  AssistantMessageBubble: ({ message }: { message: AssistantMessage }) => (
    <article data-message-id={message.id}>{message.content}</article>
  ),
}));

const date = "05/10/2026";

const baseProps = {
  isLoading: false,
  isError: false,
  error: null,
  onRetry: vi.fn(),
  role: "LECTURER" as const,
  courseId: "course-1",
  teamId: "team-1",
  feedbackPendingId: null,
  followUpDisabled: true,
  reloadBanner: null,
  onReloadHistory: vi.fn(),
  onFeedback: vi.fn(),
  onFollowUp: vi.fn(),
};

const earlier = [
  { id: "m1", role: "USER", content: "Tiến độ sprint?" },
  { id: "m2", role: "ASSISTANT", content: "Sprint 5: 23/27 task đã hoàn thành." },
] as unknown as AssistantMessage[];

describe("AssistantMessageThread", () => {
  fptTest(
    { id: "UTCID07", type: "N", executedDate: date, description: "cau hoi vua gui hien ngay, ben duoi la bong bong tro ly dang tra loi" },
    () => {
      render(<AssistantMessageThread {...baseProps} messages={earlier} pendingQuestion="tôi là ai" />);

      const question = screen.getByText("tôi là ai");
      const typing = screen.getByRole("status", { name: "Trợ lý đang trả lời" });
      const lastAnswer = screen.getByText("Sprint 5: 23/27 task đã hoàn thành.");
      expect(typing).toHaveTextContent("Trợ lý đang trả lời…");
      // order: earlier messages, then the new question, then the typing bubble
      expect(lastAnswer.compareDocumentPosition(question) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(question.compareDocumentPosition(typing) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  );

  fptTest(
    { id: "UTCID08", type: "N", executedDate: date, description: "khong co cau hoi dang gui thi khong hien bong bong dang tra loi" },
    () => {
      render(<AssistantMessageThread {...baseProps} messages={earlier} pendingQuestion={null} />);

      expect(screen.queryByRole("status", { name: "Trợ lý đang trả lời" })).not.toBeInTheDocument();
    }
  );

  fptTest(
    { id: "UTCID09", type: "B", executedDate: date, description: "cuoc tro chuyen moi: cau hoi dau tien thay the man hinh trong" },
    () => {
      render(<AssistantMessageThread {...baseProps} messages={[]} pendingQuestion="Task nào trễ hạn?" />);

      expect(screen.queryByText("Bạn muốn kiểm tra thông tin gì?")).not.toBeInTheDocument();
      expect(screen.getByText("Task nào trễ hạn?")).toBeInTheDocument();
    }
  );
});
