"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  LayoutDashboardIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
  CheckSquareIcon,
  GitBranchIcon,
  HelpCircleIcon,
  UserIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getRoleHomePath } from "@/features/auth/lib/role-routes";

interface ErrorInfo {
  title: string;
  description: string;
  suggestion: string;
}

const ERROR_DETAILS_MAP: Record<string, ErrorInfo> = {
  OAUTH_STATE_EXPIRED: {
    title: "Phiên xác thực đã hết hạn",
    description:
      "Yêu cầu liên kết tài khoản đã quá thời gian chờ bảo mật. Điều này xảy ra khi trang xác thực mở quá lâu mà chưa được hoàn tất.",
    suggestion:
      "Vui lòng quay lại giao diện Cài đặt Tích hợp và bấm kết nối lại để tạo phiên làm việc mới.",
  },
  OAUTH_STATE_INVALID: {
    title: "Mã bảo mật phiên không hợp lệ",
    description:
      "Tham số kiểm tra tính toàn vẹn (state) không khớp với phiên làm việc hiện tại của bạn.",
    suggestion:
      "Đóng các tab xác thực cũ và thực hiện kết nối trực tiếp từ hệ thống SAGA.",
  },
  JIRA_ACCOUNT_NOT_LINKED_TO_CURRENT_USER: {
    title: "Không thể liên kết tài khoản Jira",
    description:
      "Tài khoản Atlassian Jira bạn vừa đăng nhập không thể xác thực danh tính với người dùng hiện tại hoặc đã được gán cho một tài khoản khác.",
    suggestion:
      "Kiểm tra lại tài khoản Jira/Atlassian đang đăng nhập trên trình duyệt để đảm bảo đúng danh tính học tập.",
  },
  GITHUB_INSTALLATION_INVALID: {
    title: "Cài đặt ứng dụng GitHub không hợp lệ",
    description:
      "Ứng dụng SAGA chưa được cài đặt vào tài khoản cá nhân hoặc tổ chức được chỉ định trên GitHub.",
    suggestion:
      "Truy cập GitHub Settings > Applications để kiểm tra và cấp quyền truy cập cho ứng dụng SAGA.",
  },
  GITHUB_INSTALLATION_NOT_AUTHORIZED: {
    title: "Chưa được phân quyền trên GitHub",
    description:
      "Bạn không có quyền quản trị viên đối với tổ chức GitHub hoặc kho lưu trữ cần đồng bộ.",
    suggestion:
      "Liên hệ Nhóm trưởng hoặc Chủ sở hữu (Owner) của tổ chức GitHub để được cấp quyền ủy quyền ứng dụng.",
  },
  INVALID_CREDENTIALS: {
    title: "Thông tin xác thực không hợp lệ",
    description:
      "Khóa bảo mật hoặc mã ủy quyền từ nhà cung cấp dịch vụ bị từ chối hoặc đã bị thu hồi.",
    suggestion:
      "Thử đăng xuất khỏi dịch vụ bên thứ ba và thực hiện liên kết lại từ đầu.",
  },
  INTEGRATION_UNAVAILABLE: {
    title: "Dịch vụ tích hợp tạm thời gián đoạn",
    description:
      "Máy chủ SAGA hoặc API từ phía nhà cung cấp bên thứ ba hiện không phản hồi.",
    suggestion:
      "Vui lòng chờ trong giây lát và thử lại, hoặc liên hệ Quản trị viên hệ thống để được hỗ trợ.",
  },
  access_denied: {
    title: "Yêu cầu cấp quyền bị từ chối",
    description:
      "Bạn đã hủy hoặc từ chối cấp quyền truy cập tài khoản tại màn hình xác thực của nhà cung cấp.",
    suggestion:
      "Để kích hoạt tính năng đối soát công sức và bài nộp, bạn cần chấp nhận cấp quyền khi được hỏi.",
  },
  JIRA_OAUTH_CANCELLED: {
    title: "Đã hủy liên kết tài khoản Jira",
    description:
      "Bạn đã chủ động hủy quá trình xác thực và cấp quyền trên Atlassian Jira.",
    suggestion:
      "Trạng thái liên kết tài khoản trước đó của bạn được giữ nguyên. Bạn có thể kết nối lại bất kỳ lúc nào từ trang Tích hợp.",
  },
};

function FailureContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();

  const errorCode = searchParams.get("error") || searchParams.get("code") || "INTEGRATION_FAILED";
  const errorMessage = searchParams.get("message") || searchParams.get("error_description");
  const rawProvider = (searchParams.get("provider") || "").toLowerCase();

  const isJira = rawProvider.includes("jira") || rawProvider.includes("atlassian");
  const isGithub = rawProvider.includes("github");

  const errorInfo: ErrorInfo = ERROR_DETAILS_MAP[errorCode] || {
    title: "Liên kết tài khoản thất bại",
    description:
      "Đã xảy ra sự cố trong quá trình xác thực và đồng bộ dữ liệu tài khoản với máy chủ SAGA.",
    suggestion:
      "Vui lòng kiểm tra lại kết nối mạng, quyền truy cập của tài khoản và thực hiện lại thao tác.",
  };

  const homeHref = isAuthenticated && user ? getRoleHomePath(user.role) : "/dashboard";

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-40 h-40 bg-destructive/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-destructive/10 border border-destructive/25 flex items-center justify-center text-destructive shadow-lg shadow-destructive/10 animate-pulse">
              <ShieldAlertIcon className="w-10 h-10" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center text-destructive shadow-md">
              <AlertTriangleIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            {isJira ? (
              <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 gap-1.5 px-3 py-1 font-semibold text-xs">
                <CheckSquareIcon className="w-3.5 h-3.5" />
                Jira Software
              </Badge>
            ) : isGithub ? (
              <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 gap-1.5 px-3 py-1 font-semibold text-xs">
                <GitBranchIcon className="w-3.5 h-3.5" />
                GitHub Platform
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs font-semibold gap-1 px-3 py-1">
                Tích hợp bên thứ ba
              </Badge>
            )}

            <Badge variant="destructive" className="text-xs font-semibold px-2.5 py-1">
              Thất bại
            </Badge>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {errorInfo.title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              {errorInfo.description}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3.5">
          <div className="bg-muted/40 border border-border/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-muted-foreground">Mã định danh lỗi:</span>
              <span className="font-mono text-destructive font-bold bg-destructive/10 px-2.5 py-0.5 rounded-lg border border-destructive/20 text-[11px]">
                {errorCode}
              </span>
            </div>

            {errorMessage && (
              <div className="text-xs text-muted-foreground pt-1 border-t border-border/60">
                <span className="font-semibold text-foreground">Phản hồi từ dịch vụ: </span>
                <span className="font-mono text-[11px] break-all">{errorMessage}</span>
              </div>
            )}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-foreground">
            <HelpCircleIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-primary">Gợi ý khắc phục</p>
              <p className="text-muted-foreground leading-relaxed">{errorInfo.suggestion}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/profile/integrations"
            className="w-full sm:w-auto h-10 px-5 inline-flex items-center justify-center gap-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25 transition-all cursor-pointer"
          >
            <RefreshCwIcon className="w-3.5 h-3.5" />
            Thử kết nối lại
          </Link>

          <Link
            href={homeHref}
            className="w-full sm:w-auto h-10 px-5 inline-flex items-center justify-center gap-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            <LayoutDashboardIcon className="w-3.5 h-3.5 text-muted-foreground" />
            Về trang tổng quan
          </Link>
        </div>

        <div className="mt-6 pt-5 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <UserIcon className="w-3.5 h-3.5" />
            Hồ sơ tài khoản
          </Link>

          <Link
            href="/profile/integrations"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Quay lại Cài đặt Tích hợp
          </Link>
        </div>
      </div>

      <p className="text-center text-[11px] text-muted-foreground/60 font-mono">
        Mã kiểm toán: ERR_OAUTH_INTEGRATION_FAILED · SAGA Integration Engine
      </p>
    </div>
  );
}

export default function IntegrationFailurePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-xl mx-auto p-12 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
          <RefreshCwIcon className="w-4 h-4 animate-spin text-primary" />
          Đang tải thông tin kết quả tích hợp...
        </div>
      }
    >
      <FailureContent />
    </Suspense>
  );
}
