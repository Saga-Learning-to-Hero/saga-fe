"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon, CheckCircle2Icon, AlertCircleIcon } from "lucide-react";
import { useGitHubOAuthCallback } from "@/features/integrations/hooks/useGithubIntegrations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function GitHubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const hasParams = Boolean(code && state);
  const [status, setStatus] = useState<"processing" | "success" | "error">(() =>
    hasParams ? "processing" : "error"
  );
  const [errorMessage, setErrorMessage] = useState(() =>
    hasParams ? "" : "Thiếu mã xác thực (code) hoặc state từ GitHub OAuth."
  );

  const callbackMutation = useGitHubOAuthCallback();

  useEffect(() => {
    if (!code || !state) return;

    let isMounted = true;

    callbackMutation
      .mutateAsync({ code, state })
      .then(() => {
        if (!isMounted) return;
        setStatus("success");
        setTimeout(() => {
          router.replace("/student/integrations");
        }, 1500);
      })
      .catch((err: Error) => {
        if (!isMounted) return;
        setStatus("error");
        setErrorMessage(err.message || "Xác thực OAuth GitHub thất bại từ máy chủ.");
      });

    return () => {
      isMounted = false;
    };
  }, [code, state, callbackMutation, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full rounded-3xl border border-border/80 shadow-lg text-center p-6 sm:p-8 space-y-4 bg-card">
        <CardContent className="p-0 space-y-4">
          {status === "processing" && (
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto">
                <Loader2Icon className="w-7 h-7 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-foreground">Đang xác thực GitHub OAuth...</h3>
              <p className="text-xs text-muted-foreground">
                Hệ thống đang trao đổi mã ủy quyền với máy chủ để hoàn tất liên kết tài khoản cá nhân.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2Icon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-foreground">Liên kết GitHub thành công!</h3>
              <p className="text-xs text-muted-foreground">
                Đang chuyển hướng bạn trở về menu Tích hợp...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircleIcon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-foreground">Liên kết thất bại</h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-3 rounded-xl">
                {errorMessage}
              </p>
              <Button
                type="button"
                onClick={() => router.replace("/student/integrations")}
                className="text-xs font-bold rounded-xl"
              >
                Quay lại Menu Tích hợp
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function GitHubCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <GitHubCallbackContent />
    </Suspense>
  );
}
