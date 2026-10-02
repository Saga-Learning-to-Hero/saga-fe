import { describe, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { fptTest } from "@/testing/fpt-test-helper";
import { AssistantComposer } from "@/features/assistant/components/assistant-composer";
import { AssistantMarkdown } from "@/features/assistant/components/assistant-markdown";
import { AssistantCitationChip } from "@/features/assistant/components/assistant-citation-chip";
import { AssistantPanel } from "@/features/assistant/components/assistant-panel";
import { ProjectAssistantLauncher } from "@/features/assistant/components/project-assistant-launcher";
import type { AssistantCitation } from "@/features/assistant/types/project-assistant";

const date = "03/10/2026";
const navigation = vi.hoisted(() => ({
  role: "STUDENT",
  pathname: "/student/dashboard",
  search: "courseId=course-1",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(navigation.search),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/features/auth/store/useAuthStore", () => ({
  useAuthStore: (selector?: (state: { user: { role: string } }) => unknown) => {
    const state = { user: { role: navigation.role } };
    return selector ? selector(state) : state;
  },
}));

vi.mock("@/features/assistant/hooks/use-assistant-project", () => ({
  useAssistantProject: () => ({
    isLoading: false,
    isError: false,
    error: null,
    guidance: null,
    projectId: "p1",
    teamId: "t1",
    teamLabel: "Nhóm 1",
    needsTeamPicker: false,
    teams: [],
    selectedTeamId: "t1",
    setSelectedTeamId: vi.fn(),
    refetch: vi.fn(),
  }),
}));

vi.mock("@/features/assistant/hooks/use-project-assistant", () => ({
  useAssistantStatus: () => ({
    data: { enabled: true, aiConfigured: true, keySource: "COURSE", dailyLimit: 10, usedToday: 1, remainingToday: 9 },
    isLoading: false,
    isSuccess: true,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useAssistantConversations: () => ({
    data: [{ id: "c1", projectId: "p1", title: "Tiến độ sprint", createdAt: "2026-10-03T01:00:00Z", lastMessageAt: "2026-10-03T01:00:00Z" }],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useAssistantMessages: () => ({ data: [], isLoading: false, isError: false, error: null, refetch: vi.fn() }),
  useStartAssistantConversation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useAskAssistant: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useAssistantFeedback: () => ({ mutate: vi.fn(), isPending: false, variables: null }),
}));

vi.mock("@/features/student/courses/hooks/use-student-courses", () => ({
  useStudentMyTeam: () => ({ data: null, isLoading: false, isError: false, isWaitingForTeam: false, refetch: vi.fn() }),
}));

vi.mock("@/features/lecturer/teams/hooks/use-lecturer-teams", () => ({
  useLecturerTeams: () => ({ data: { teams: [] }, isLoading: false, isError: false, refetch: vi.fn() }),
}));

describe("assistant chat UI", () => {
  beforeEach(() => {
    navigation.role = "STUDENT";
    navigation.pathname = "/student/dashboard";
    navigation.search = "courseId=course-1";
  });

  fptTest({ id: "UTCID01", type: "N", executedDate: date, description: "mo panel thi thay lich su truoc" }, () => {
    render(<AssistantPanel context={{ role: "STUDENT", courseId: "course-1", teamId: null }} active />);
    expect(screen.getByRole("button", { name: "Cuộc trò chuyện mới" })).toBeInTheDocument();
    expect(screen.getByText("Tiến độ sprint")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Hỏi về tiến độ/)).not.toBeInTheDocument();
  });

  fptTest({ id: "UTCID02", type: "N", executedDate: date, description: "bang markdown duoc render va html tho bi loai" }, () => {
    const { container } = render(
      <AssistantMarkdown content={"| A | B |\n| --- | --- |\n| 1 | 2 |\n\n<script>alert(1)</script>\n\n[an](javascript:alert(1))"} />
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("a")).toBeNull();
    expect(container.innerHTML).not.toContain("<script");
  });

  fptTest({ id: "UTCID03", type: "N", executedDate: date, description: "nguon hop le la lien ket" }, () => {
    const citation: AssistantCitation = { kind: "TASK", id: "task-1", label: "SAGA-1", taskId: null, sha: null };
    render(<AssistantCitationChip citation={citation} role="STUDENT" courseId="course-1" teamId={null} />);
    expect(screen.getByRole("link", { name: "SAGA-1" })).toHaveAttribute(
      "href",
      "/student/sprint-progress?courseId=course-1&taskId=task-1"
    );
  });

  fptTest({ id: "UTCID04", type: "A", executedDate: date, description: "nguon thieu id bi vo hieu" }, () => {
    const citation: AssistantCitation = { kind: "TASK", id: null, label: "Task mo", taskId: null, sha: null };
    render(<AssistantCitationChip citation={citation} role="STUDENT" courseId="course-1" teamId={null} />);
    expect(screen.getByTitle("Không đủ thông tin để mở nguồn")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  fptTest({ id: "UTCID05", type: "A", executedDate: date, description: "dang gui thi khoa o nhap va khong gui trung" }, () => {
    const onSend = vi.fn(() => true);
    const { rerender } = render(
      <AssistantComposer value="Tien do?" onChange={vi.fn()} onSend={onSend} pending={false} disabled={false} error={null} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Gửi câu hỏi" }));
    fireEvent.click(screen.getByRole("button", { name: "Gửi câu hỏi" }));
    expect(onSend).toHaveBeenCalledTimes(1);
    rerender(<AssistantComposer value="Tien do?" onChange={vi.fn()} onSend={onSend} pending disabled={false} error={null} />);
    expect(screen.getByText("Trợ lý đang trả lời…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gửi câu hỏi" })).toBeDisabled();
  });

  fptTest({ id: "UTCID06", type: "B", executedDate: date, description: "sinh vien da chon lop thi thay nut tro ly" }, () => {
    render(<ProjectAssistantLauncher />);
    const launcher = screen.getByRole("button", { name: "Mở trợ lý AI dự án" });
    expect(launcher).toBeInTheDocument();
    expect(launcher).toHaveClass("right-5", "bottom-5", "rounded-full");
    expect(launcher).toHaveAttribute("aria-expanded", "false");
    expect(launcher.querySelector(".lucide-bot")).toBeInTheDocument();
  });

  fptTest({ id: "UTCID07", type: "A", executedDate: date, description: "admin va danh sach lop khong thay nut" }, () => {
    navigation.role = "ADMIN";
    navigation.pathname = "/admin/dashboard";
    const admin = render(<ProjectAssistantLauncher />);
    expect(admin.queryByRole("button", { name: "Mở trợ lý AI dự án" })).not.toBeInTheDocument();
    admin.unmount();

    navigation.role = "STUDENT";
    navigation.pathname = "/student/courses";
    navigation.search = "";
    render(<ProjectAssistantLauncher />);
    expect(screen.queryByRole("button", { name: "Mở trợ lý AI dự án" })).not.toBeInTheDocument();
  });

  fptTest({ id: "UTCID08", type: "B", executedDate: date, description: "giang vien chi thay nut khi da vao mot lop" }, () => {
    navigation.role = "LECTURER";
    navigation.pathname = "/lecturer/courses";
    const list = render(<ProjectAssistantLauncher />);
    expect(list.queryByRole("button", { name: "Mở trợ lý AI dự án" })).not.toBeInTheDocument();
    list.unmount();

    navigation.pathname = "/lecturer/courses/course-1/dashboard";
    render(<ProjectAssistantLauncher />);
    expect(screen.getByRole("button", { name: "Mở trợ lý AI dự án" })).toBeInTheDocument();
  });

  fptTest({ id: "UTCID09", type: "N", executedDate: date, description: "thu gon va mo lai giu nguyen hoi thoai va ban nhap" }, () => {
    render(<ProjectAssistantLauncher />);

    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý AI dự án" }));
    const dialog = screen.getByRole("dialog", { name: "Trợ lý dự án" });
    fireEvent.click(within(dialog).getByRole("button", { name: /Tiến độ sprint/ }));

    const composer = within(dialog).getByPlaceholderText(/Hỏi về tiến độ/);
    fireEvent.change(composer, { target: { value: "Kiểm tra Sprint hiện tại" } });
    expect(composer).toHaveValue("Kiểm tra Sprint hiện tại");

    fireEvent.click(within(dialog).getByRole("button", { name: "Thu gọn trợ lý AI dự án" }));
    expect(dialog).toHaveAttribute("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý AI dự án" }));
    const reopenedDialog = screen.getByRole("dialog", { name: "Trợ lý dự án" });
    expect(within(reopenedDialog).getByPlaceholderText(/Hỏi về tiến độ/)).toHaveValue(
      "Kiểm tra Sprint hiện tại"
    );
    expect(within(reopenedDialog).getByRole("button", { name: "Quay lại danh sách" })).toBeInTheDocument();
  });

  fptTest({ id: "UTCID10", type: "N", executedDate: date, description: "chuyen trang thi dat lai phien giao dien chat" }, () => {
    const view = render(<ProjectAssistantLauncher />);
    fireEvent.click(screen.getByRole("button", { name: "Mở trợ lý AI dự án" }));
    fireEvent.click(screen.getByRole("button", { name: /Tiến độ sprint/ }));
    expect(screen.getByPlaceholderText(/Hỏi về tiến độ/)).toBeInTheDocument();

    navigation.pathname = "/student/graph";
    view.rerender(<ProjectAssistantLauncher />);

    expect(screen.queryByRole("dialog", { name: "Trợ lý dự án" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mở trợ lý AI dự án" })).toHaveAttribute("aria-expanded", "false");
  });
});
