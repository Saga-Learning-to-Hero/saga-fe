import Link from "next/link";
import { ShieldAlertIcon, LogInIcon, MailIcon, AlertCircleIcon } from "lucide-react";
import { SagaLogo } from "@/components/common/saga-logo";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Tài khoản bị vô hiệu hóa - SAGA",
  description: "Thông báo tài khoản người dùng đã bị vô hiệu hóa bởi quản trị viên SAGA.",
};

export default function AccountDisabledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="w-full max-w-md space-y-6">
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <SagaLogo size="md" showText={true} showSubtitle={false} />
          <Badge
            variant="outline"
            className="border-destructive/30 bg-destructive/10 text-destructive text-[11px] font-mono font-bold mt-2"
          >
            Hệ thống Quản trị
          </Badge>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-center animate-in fade-in-0 zoom-in-95 duration-200">
          {/* Icon Badge */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20 shadow-xs">
            <ShieldAlertIcon className="w-8 h-8 animate-pulse" />
          </div>

          {/* Title & Message */}
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Tài khoản đã bị vô hiệu hóa
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tài khoản của bạn đã bị vô hiệu hóa.
              <br />
              Vui lòng liên hệ quản trị viên nếu bạn cần hỗ trợ.
            </p>
          </div>

          {/* Detailed Box */}
          <div className="bg-muted/40 border border-border/70 rounded-2xl p-4 text-left space-y-2.5 text-xs">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <AlertCircleIcon className="w-4 h-4 text-warning shrink-0" />
              <span>Chi tiết trạng thái hệ thống:</span>
            </div>
            <div className="space-y-1.5 text-muted-foreground">
              <div className="flex justify-between">
                <span>Mã bảo mật (Code):</span>
                <span className="font-mono font-bold text-destructive">ACCOUNT_DISABLED</span>
              </div>
              <div className="flex justify-between">
                <span>Phiên làm việc (Session):</span>
                <span className="font-semibold text-foreground">Đã thu hồi (Revoked)</span>
              </div>
              <div className="flex justify-between">
                <span>Quyền truy cập dự án:</span>
                <span className="font-semibold text-foreground">Tạm ngưng</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
              Nếu bạn cho rằng đây là sự nhầm lẫn hoặc cần phục hồi quyền truy cập phục vụ đánh giá dự án, hãy liên hệ với Giảng viên hướng dẫn hoặc Quản trị viên phòng đào tạo (SE).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full h-10 font-semibold rounded-xl gap-2 cursor-pointer shadow-xs"
              )}
            >
              <LogInIcon className="w-4 h-4" />
              <span>Quay về trang đăng nhập</span>
            </Link>

            <a
              href="mailto:support.saga@fpt.edu.vn?subject=[SAGA]%20Yeu%20cau%20ho%20tro%20mo%20tai%20khoan"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full h-10 text-xs font-semibold rounded-xl gap-2 cursor-pointer"
              )}
            >
              <MailIcon className="w-4 h-4" />
              <span>Gửi email hỗ trợ kỹ thuật</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          SAGA &bull; Smart Academic Graph Assessment Platform
        </p>
      </div>
    </div>
  );
}
