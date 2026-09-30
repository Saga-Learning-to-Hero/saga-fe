"use client";

import {
  Loader2Icon,
  ExternalLinkIcon,
  XIcon,
  CheckSquareIcon,
  GitBranchIcon,
  RefreshCwIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IntegrationProvider, IntegrationScope } from "../lib/integration-broadcast";

interface IntegrationWaitingModalProps {
  isOpen: boolean;
  provider: IntegrationProvider;
  scope?: IntegrationScope;
  onClose: () => void;
  onRetryOpen?: () => void;
  onCheckNow?: () => void;
}

export function IntegrationWaitingModal({
  isOpen,
  provider,
  scope = "personal",
  onClose,
  onRetryOpen,
  onCheckNow,
}: IntegrationWaitingModalProps) {
  if (!isOpen) return null;

  const isJira = provider === "jira";
  const providerLabel = isJira ? "Atlassian Jira" : "GitHub";
  const scopeLabel = scope === "project" ? "Dự án nhóm" : "Tài khoản cá nhân";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isJira
                ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
                : "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400"
            }`}>
              {isJira ? <CheckSquareIcon className="w-4 h-4" /> : <GitBranchIcon className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Đang kết nối {providerLabel}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Phạm vi: {scopeLabel}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            title="Hủy kết nối"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-center">
          {/* Animated Connecting Visual */}
          <div className="py-2 flex items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-black text-sm shadow-inner">
              SAGA
            </div>

            <div className="flex flex-col items-center gap-1">
              <Loader2Icon className="w-5 h-5 text-primary animate-spin" />
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-accent animate-pulse rounded-full" />
            </div>

            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-inner ${
              isJira
                ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
                : "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400"
            }`}>
              {isJira ? <CheckSquareIcon className="w-7 h-7" /> : <GitBranchIcon className="w-7 h-7" />}
            </div>
          </div>

          <div className="space-y-2">
            <Badge variant="outline" className="text-[11px] font-semibold px-2.5 py-0.5">
              Đang chờ thao tác trong cửa sổ xác thực...
            </Badge>
            <h4 className="text-base font-bold text-foreground">
              Vui lòng cấp quyền trên {providerLabel}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Trình duyệt đã mở một cửa sổ riêng để bạn đăng nhập và bấm <strong className="text-foreground">Cấp quyền (Authorize)</strong>.
            </p>
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed bg-muted/40 p-2.5 rounded-xl border border-border/60">
              Sau khi xác thực thành công, cửa sổ này sẽ <strong className="text-foreground">tự động đóng</strong> và màn hình SAGA hiện tại sẽ cập nhật mà không tải lại trang.
            </p>
          </div>

          {/* Fallback actions if tab was blocked or lost */}
          {onRetryOpen && (
            <div className="pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetryOpen}
                className="text-xs text-muted-foreground hover:text-primary gap-1.5 cursor-pointer h-8"
              >
                <ExternalLinkIcon className="w-3.5 h-3.5" />
                <span>Không thấy cửa sổ xác thực? Mở lại</span>
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/60 flex items-center justify-between gap-2.5 shrink-0 bg-muted/20">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold cursor-pointer"
          >
            Hủy kết nối
          </Button>

          {onCheckNow && (
            <Button
              size="sm"
              onClick={onCheckNow}
              className="text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <RefreshCwIcon className="w-3.5 h-3.5" />
              <span>Tôi đã liên kết xong</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
