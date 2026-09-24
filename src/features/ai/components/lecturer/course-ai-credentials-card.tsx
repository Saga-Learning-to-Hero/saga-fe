import { useState } from "react";
import {
  KeyRoundIcon,
  EyeIcon,
  EyeOffIcon,
  Trash2Icon,
  CheckCircle2Icon,
  AlertCircleIcon,
  AlertTriangleIcon,
  XCircleIcon,
  Loader2Icon,
  InfoIcon,
  ShieldAlertIcon,
} from "lucide-react";
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

function getCredentialStatusDisplay(status?: string | null) {
  switch (status) {
    case "ACTIVE":
      return {
        label: "Đang hoạt động",
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        textClass: "text-emerald-600 dark:text-emerald-400",
        Icon: CheckCircle2Icon,
      };
    case "UNVERIFIED":
      return {
        label: "Đã cấu hình · Chưa xác minh",
        badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        textClass: "text-sky-600 dark:text-sky-400",
        Icon: AlertCircleIcon,
      };
    case "DEGRADED":
      return {
        label: "Có vấn đề quota/rate/provider",
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        textClass: "text-amber-600 dark:text-amber-400",
        Icon: AlertTriangleIcon,
      };
    case "INVALID":
      return {
        label: "Khóa không hợp lệ",
        badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        textClass: "text-red-600 dark:text-red-400",
        Icon: XCircleIcon,
      };
    case "REVOKED":
      return {
        label: "Đã thu hồi",
        badgeClass: "bg-muted text-muted-foreground border-border",
        textClass: "text-muted-foreground",
        Icon: Trash2Icon,
      };
    default:
      return {
        label: "Đã cấu hình · Chưa xác minh",
        badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        textClass: "text-sky-600 dark:text-sky-400",
        Icon: AlertCircleIcon,
      };
  }
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

  const isConfigured = Boolean(credential?.configured);
  const statusDisplay = isConfigured
    ? getCredentialStatusDisplay(credential?.status)
    : {
        label: "Chưa cấu hình khóa riêng",
        badgeClass: "bg-muted text-muted-foreground border-border",
        textClass: "text-muted-foreground",
        Icon: AlertCircleIcon,
      };

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              role === "PRIMARY"
                ? "bg-primary/10 text-primary"
                : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
            }`}
          >
            <KeyRoundIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              {isConfigured ? (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusDisplay.badgeClass}`}
                >
                  <statusDisplay.Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{statusDisplay.label}</span>
                  {credential?.lastFour && (
                    <span className="font-mono text-[11px]">
                      (•••• {credential.lastFour})
                    </span>
                  )}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                  <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                  Chưa cấu hình khóa riêng
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      {role === "PRIMARY" ? (
        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground space-y-1">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <InfoIcon className="w-4 h-4 text-primary shrink-0" />
            <span>Khóa API chính của khóa học (PRIMARY)</span>
          </div>
          <p className="leading-relaxed">
            Giảng viên thông thường chỉ cần cấu hình khóa PRIMARY là đủ. Phân tích tự động Commit, Task và Rủi ro bắt buộc sử dụng khóa này. Nếu khóa không tồn tại, hết hạn mức hoặc không hợp lệ, hệ thống sẽ dừng phân tích tự động và không tự động chuyển sang khóa nền tảng.
          </p>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/15 text-xs text-muted-foreground space-y-1">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <InfoIcon className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>Khóa API đối chứng phụ (SECONDARY - Tùy chọn)</span>
          </div>
          <p className="leading-relaxed">
            Khóa tùy chọn, chỉ dùng cho mô hình đối chứng (Secondary Brain) và không bắt buộc để AI chính hoạt động. Khóa này độc lập, không tái sử dụng hay dự phòng từ khóa PRIMARY hoặc khóa nền tảng. <strong>Nếu bạn chỉ có 1 API Key, vui lòng chỉ cấu hình khóa PRIMARY ở trên.</strong>
          </p>
        </div>
      )}

      {isConfigured && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs">
          <div>
            <span className="text-muted-foreground block">Nhà cung cấp:</span>
            <span className="font-semibold text-foreground uppercase">
              {credential?.provider || "OpenAI"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Trạng thái khóa:</span>
            <span className={`font-semibold flex items-center gap-1 mt-0.5 ${statusDisplay.textClass}`}>
              <statusDisplay.Icon className="w-3.5 h-3.5 shrink-0" />
              {statusDisplay.label}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Cập nhật lần cuối:</span>
            <span className="font-mono text-foreground">
              {credential?.updatedAt
                ? new Date(credential.updatedAt).toLocaleDateString("vi-VN")
                : "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Lần dùng gần nhất:</span>
            <span className="font-mono text-foreground">
              {credential?.lastSuccessfulUseAt
                ? new Date(credential.lastSuccessfulUseAt).toLocaleDateString("vi-VN")
                : "Chưa ghi nhận"}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-3">
        <label className="text-xs font-medium text-foreground block">
          {isConfigured
            ? role === "PRIMARY"
              ? "Thay thế khóa API chính bằng khóa mới"
              : "Thay thế khóa API đối chứng bằng khóa mới"
            : role === "PRIMARY"
            ? "Nhập OpenAI API Key chính của khóa học (PRIMARY)"
            : "Nhập OpenAI API Key đối chứng (SECONDARY - Tùy chọn)"}
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

      {putMutation.isError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <ShieldAlertIcon className="w-4 h-4 shrink-0" />
          <span>Không thể lưu khóa API: {(putMutation.error as Error).message}</span>
        </div>
      )}
    </div>
  );
}
