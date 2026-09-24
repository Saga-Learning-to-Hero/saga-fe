import { useState } from "react";
import { KeyRoundIcon, EyeIcon, EyeOffIcon, Trash2Icon, CheckCircle2Icon, AlertCircleIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCourseAiCredential,
  usePutCourseAiCredential,
  useRevokeCourseAiCredential,
} from "../../hooks/use-lecturer-ai";
import type { AiProviderRole } from "../../types";

interface CourseAiCredentialsCardProps {
  courseId: string;
  role: AiProviderRole;
  title: string;
  description: string;
}

export function CourseAiCredentialsCard({
  courseId,
  role,
  title,
  description,
}: CourseAiCredentialsCardProps) {
  const { data: credential, isLoading } = useCourseAiCredential(courseId, role);
  const putMutation = usePutCourseAiCredential(courseId, role);
  const revokeMutation = useRevokeCourseAiCredential(courseId, role);

  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    putMutation.mutate(
      { provider: "openai", apiKey: apiKey.trim() },
      {
        onSuccess: () => {
          setApiKey("");
        },
      }
    );
  };

  const handleRevoke = () => {
    revokeMutation.mutate(undefined, {
      onSuccess: () => {
        setConfirmRevoke(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-border bg-card/60 flex items-center justify-center">
        <Loader2Icon className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isConfigured = credential?.configured;

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <KeyRoundIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              {isConfigured ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2Icon className="w-3 h-3" />
                  Đang hoạt động (•••• {credential.lastFour})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                  <AlertCircleIcon className="w-3 h-3" />
                  Chưa cấu hình khóa riêng
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      {isConfigured && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs">
          <div>
            <span className="text-muted-foreground block">Nhà cung cấp:</span>
            <span className="font-semibold text-foreground uppercase">
              {credential.provider || "OpenAI"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Trạng thái khóa:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {credential.status || "ACTIVE"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Cập nhật lần cuối:</span>
            <span className="font-mono text-foreground">
              {credential.updatedAt
                ? new Date(credential.updatedAt).toLocaleDateString("vi-VN")
                : "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Lần dùng gần nhất:</span>
            <span className="font-mono text-foreground">
              {credential.lastSuccessfulUseAt
                ? new Date(credential.lastSuccessfulUseAt).toLocaleDateString("vi-VN")
                : "Chưa ghi nhận"}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-3">
        <label className="text-xs font-medium text-foreground block">
          {isConfigured ? "Thay thế bằng API Key mới" : "Nhập OpenAI API Key cá nhân"}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? "text" : "password"}
              placeholder="sk-proj-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-xs pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
          <Button
            type="submit"
            disabled={!apiKey.trim() || putMutation.isPending}
            size="sm"
            className="shrink-0"
          >
            {putMutation.isPending ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : isConfigured ? (
              "Cập nhật khóa"
            ) : (
              "Lưu khóa API"
            )}
          </Button>

          {isConfigured && (
            <div className="shrink-0">
              {confirmRevoke ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={revokeMutation.isPending}
                    onClick={handleRevoke}
                  >
                    {revokeMutation.isPending ? "Đang thu hồi..." : "Xác nhận xóa"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmRevoke(false)}
                  >
                    Hủy
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmRevoke(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2Icon className="w-4 h-4 mr-1" />
                  Thu hồi
                </Button>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
