import { Suspense } from "react";
import { KeyRoundIcon } from "lucide-react";
import { AuthSplitLayout } from "@/features/auth/components/auth-split-layout";
import { SetupPasswordForm } from "@/features/auth/components/setup-password-form";

export default function SetupPasswordPage() {
  return (
    <Suspense>
      <AuthSplitLayout
        bannerBadge={
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold">
            <KeyRoundIcon className="size-4 text-emerald-300" />
            <span>Tài khoản Google FPT/FE</span>
          </div>
        }
        bannerTitle="Tạo mật khẩu"
        bannerHighlight="cho lần đầu đăng nhập"
        bannerDescription="Tạo một mật khẩu riêng để bạn có thể đăng nhập trực tiếp bằng email trường mà không cần dùng Google."
      >
        <SetupPasswordForm />
      </AuthSplitLayout>
    </Suspense>
  );
}
