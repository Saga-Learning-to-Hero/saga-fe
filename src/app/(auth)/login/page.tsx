import { Suspense } from "react";
import { AuthSplitLayout } from "@/features/auth/components/auth-split-layout";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <Suspense>
      <AuthSplitLayout
        bannerTitle="Theo dõi dự án nhóm"
        bannerHighlight="minh bạch & rõ ràng"
        bannerDescription="Đồng bộ task Jira, commit GitHub và thống kê đóng góp của từng thành viên trong nhóm."
        bannerStats={[
          { value: "Jira & Git", label: "Đồng bộ tự động" },
          { value: "Traceability", label: "Minh chứng rõ ràng" },
          { value: "Slicing Pie", label: "Đo lường đóng góp" },
        ]}
      >
        <LoginForm />
      </AuthSplitLayout>
    </Suspense>
  );
}
