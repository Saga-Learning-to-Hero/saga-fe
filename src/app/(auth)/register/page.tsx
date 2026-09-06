import { Suspense } from "react";
import { GraduationCapIcon } from "lucide-react";
import { AuthSplitLayout } from "@/features/auth/components/auth-split-layout";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthSplitLayout
        bannerBadge={
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold">
            <GraduationCapIcon className="size-4 text-amber-300" />
            <span>Dành cho sinh viên</span>
          </div>
        }
        bannerTitle="Tạo tài khoản"
        bannerHighlight="tham gia nhóm đồ án"
        bannerDescription="Dành cho sinh viên dùng email cá nhân để tham gia làm việc cùng nhóm trên hệ thống SAGA."
      >
        <RegisterForm />
      </AuthSplitLayout>
    </Suspense>
  );
}
