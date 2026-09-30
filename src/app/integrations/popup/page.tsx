"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckSquareIcon, GitBranchIcon, Loader2Icon } from "lucide-react";

function PopupWaitingContent() {
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") === "github" ? "GitHub" : "Atlassian Jira";
  const ProviderIcon = provider === "GitHub" ? GitBranchIcon : CheckSquareIcon;

  return (
    <main className="min-h-screen bg-background p-6 flex items-center justify-center">
      <section className="w-full max-w-sm rounded-2xl border border-border/80 bg-card p-6 text-center shadow-lg">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <ProviderIcon className="size-7" />
        </div>
        <h1 className="mt-4 text-lg font-bold text-foreground">Đang chuẩn bị xác thực {provider}</h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          SAGA đang tạo phiên xác thực an toàn. Cửa sổ sẽ tự chuyển sang {provider} trong giây lát.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-primary">
          <Loader2Icon className="size-4 animate-spin" />
          Vui lòng chờ...
        </div>
      </section>
    </main>
  );
}

export default function IntegrationPopupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">
          Đang chuẩn bị cửa sổ xác thực...
        </main>
      }
    >
      <PopupWaitingContent />
    </Suspense>
  );
}
