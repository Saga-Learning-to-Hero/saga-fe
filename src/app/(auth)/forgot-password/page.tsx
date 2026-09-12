import { Suspense } from "react";
import { AuthSplitLayout } from "@/features/auth/components/auth-split-layout";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <AuthSplitLayout
        bannerTitle="Khôi phục tài khoản"
        bannerHighlight="an toàn & bảo mật"
        bannerDescription="Hệ thống xác thực một chạm hỗ trợ khôi phục quyền truy cập nhanh chóng vào dự án và dữ liệu học thuật của bạn."
        bannerStats={[
          { value: "30 phút", label: "Thời hạn liên kết" },
          { value: "Mã hóa một chiều", label: "Bảo mật mật khẩu" },
          { value: "Xác thực tức thì", label: "Khôi phục nhanh" },
        ]}
      >
        <ForgotPasswordForm />
      </AuthSplitLayout>
    </Suspense>
  );
}
