import { describe, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fptTest } from "@/testing/fpt-test-helper";
import { StepUpAuthDialog } from "./step-up-auth-dialog";

const mockMutateAsync = vi.fn();
let mockIsPending = false;

vi.mock("../hooks/useAuth", () => ({
  useReauthPassword: () => ({
    mutateAsync: mockMutateAsync,
    isPending: mockIsPending,
  }),
}));

describe("StepUpAuthDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "14/09/2026",
      description: "Render hop thoai khi isOpen=true va goi onSuccess khi nhap mat khau dung",
    },
    async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSuccess = vi.fn();
      mockMutateAsync.mockResolvedValueOnce({
        stepUp: true,
        expiresAt: "2026-09-14T14:30:00Z",
      });

      render(
        <StepUpAuthDialog
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      );

      expect(screen.getByText("Xác thực bảo mật nâng cao")).toBeInTheDocument();

      const input = screen.getByPlaceholderText("Nhập mật khẩu tài khoản...");
      await user.type(input, "MySecretPass123");

      const submitBtn = screen.getByRole("button", { name: "Xác nhận" });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({ password: "MySecretPass123" });
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "14/09/2026",
      description: "Hien thi thong bao loi khi backend tra ve mat khau sai",
    },
    async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSuccess = vi.fn();
      const err = new Error("INVALID_CREDENTIALS") as Error & { code?: string; status?: number };
      err.code = "INVALID_CREDENTIALS";
      err.status = 401;
      mockMutateAsync.mockRejectedValueOnce(err);

      render(
        <StepUpAuthDialog
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      );

      const input = screen.getByPlaceholderText("Nhập mật khẩu tài khoản...");
      await user.type(input, "WrongPassword");

      const submitBtn = screen.getByRole("button", { name: "Xác nhận" });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText("Mật khẩu xác thực không chính xác. Vui lòng thử lại.")).toBeInTheDocument();
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
      });
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "14/09/2026",
      description: "Nut Xac nhan bi vo hieu hoa khi o mat khau rong",
    },
    () => {
      render(
        <StepUpAuthDialog
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      const submitBtn = screen.getByRole("button", { name: "Xác nhận" });
      expect(submitBtn).toBeDisabled();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "14/09/2026",
      description: "Bam nut Huy bo se goi onClose",
    },
    async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <StepUpAuthDialog
          isOpen={true}
          onClose={onClose}
          onSuccess={vi.fn()}
        />
      );

      const cancelBtn = screen.getByRole("button", { name: "Hủy bỏ" });
      await user.click(cancelBtn);

      expect(onClose).toHaveBeenCalledTimes(1);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "14/09/2026",
      description: "Khong retry thao tac khi backend chua cap step-up sau khi xac thuc",
    },
    async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSuccess = vi.fn();
      mockMutateAsync.mockResolvedValueOnce({
        stepUp: false,
        expiresAt: "2026-09-14T14:30:00Z",
      });

      render(
        <StepUpAuthDialog
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      );

      await user.type(
        screen.getByPlaceholderText("Nhập mật khẩu tài khoản..."),
        "MySecretPass123"
      );
      await user.click(screen.getByRole("button", { name: "Xác nhận" }));

      await waitFor(() => {
        expect(
          screen.getByText("Máy chủ chưa cấp quyền xác thực nâng cao. Vui lòng thử lại.")
        ).toBeInTheDocument();
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
      });
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "14/09/2026",
      description: "Giu modal mo va bao loi khi retry thao tac sau step-up that bai",
    },
    async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSuccess = vi.fn().mockRejectedValueOnce(
        new Error("Yêu cầu đã được dừng để tránh gửi lặp.")
      );
      mockMutateAsync.mockResolvedValueOnce({
        stepUp: true,
        expiresAt: "2026-09-14T14:30:00Z",
      });

      render(
        <StepUpAuthDialog
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
          notice="Yêu cầu trước đó trả về 403 STEP_UP_REQUIRED."
        />
      );

      expect(
        screen.getByText("Yêu cầu trước đó trả về 403 STEP_UP_REQUIRED.")
      ).toBeInTheDocument();

      await user.type(
        screen.getByPlaceholderText("Nhập mật khẩu tài khoản..."),
        "MySecretPass123"
      );
      await user.click(screen.getByRole("button", { name: "Xác nhận" }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(
          screen.getByText("Yêu cầu đã được dừng để tránh gửi lặp.")
        ).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
      });
    }
  );
});
