"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldAlertIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  AlertCircleIcon,
} from "lucide-react";
import { useReauthPassword } from "../hooks/useAuth";

interface StepUpAuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
  title?: string;
  description?: string;
  notice?: string;
}

interface StepUpAuthFormProps {
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
  title: string;
  description: string;
  notice?: string;
}

function StepUpAuthForm({
  onClose,
  onSuccess,
  title,
  description,
  notice,
}: StepUpAuthFormProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompletingAction, setIsCompletingAction] = useState(false);

  const reauthMutation = useReauthPassword();
  const isLoading = reauthMutation.isPending || isCompletingAction;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }

    setError(null);

    let response;

    try {
      response = await reauthMutation.mutateAsync({ password });
    } catch (err: unknown) {
      const e = err as Error & { code?: string; status?: number };
      if (
        e.code === "INVALID_CREDENTIALS" ||
        e.status === 401 ||
        e.message?.includes("INVALID_CREDENTIALS")
      ) {
        setError("Mật khẩu xác thực không chính xác. Vui lòng thử lại.");
      } else {
        setError(e.message || "Xác thực nâng cao thất bại. Vui lòng thử lại.");
      }
      return;
    }

    if (!response.stepUp) {
      setError("Máy chủ chưa cấp quyền xác thực nâng cao. Vui lòng thử lại.");
      return;
    }

    try {
      setIsCompletingAction(true);
      await onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Đã xác thực mật khẩu nhưng không thể hoàn tất thao tác. Vui lòng thử lại sau.";
      setError(message);
    } finally {
      setIsCompletingAction(false);
    }
  };

  return (
    <DialogContent className="max-w-md p-6 rounded-2xl">
      <DialogHeader className="flex flex-row items-start gap-3 space-y-0 text-left">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
          <ShieldAlertIcon className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <DialogTitle className="text-base font-bold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </DialogDescription>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {notice && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
            <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
            <span className="leading-relaxed">{notice}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20 animate-in fade-in-50">
            <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="step-up-password" className="text-xs font-semibold text-foreground">
            Mật khẩu hiện tại <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="step-up-password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu tài khoản..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLoading}
              autoFocus
              required
              className="h-9 text-xs rounded-lg pr-9 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              disabled={isLoading}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50"
            >
              {showPassword ? (
                <EyeOffIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <DialogFooter className="pt-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs rounded-lg"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !password.trim()}
            className="text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                Đang xác thực...
              </>
            ) : (
              "Xác nhận"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function StepUpAuthDialog({
  isOpen,
  onClose,
  onSuccess,
  title = "Xác thực bảo mật nâng cao",
  description = "Thao tác xác nhận đóng góp yêu cầu bạn nhập lại mật khẩu hiện tại để xác minh danh tính và bảo vệ dữ liệu dự án.",
  notice,
}: StepUpAuthDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {isOpen && (
        <StepUpAuthForm
          onClose={onClose}
          onSuccess={onSuccess}
          title={title}
          description={description}
          notice={notice}
        />
      )}
    </Dialog>
  );
}
