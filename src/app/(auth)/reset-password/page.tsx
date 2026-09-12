import { Suspense } from "react";
import { AuthSplitLayout } from "@/features/auth/components/auth-split-layout";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <AuthSplitLayout
        bannerTitle="Thiết lập mật khẩu mới"
        bannerHighlight="bảo mật chuẩn Enterprise"
        bannerDescription="Đảm bảo an toàn thông tin đồ án và tài nguyên nhóm với mật khẩu mạnh tối thiểu 10 ký tự."
        bannerStats={[
          { value: "Tối thiểu 10", label: "Độ dài ký tự" },
          { value: "Mã hóa bcrypt", label: "Lưu trữ an toàn" },
          { value: "Hiệu lực ngay", label: "Áp dụng phiên mới" },
        ]}
      >
        <ResetPasswordForm />
      </AuthSplitLayout>
    </Suspense>
  );
}
