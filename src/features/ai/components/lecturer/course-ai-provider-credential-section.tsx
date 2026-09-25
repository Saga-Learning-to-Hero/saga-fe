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
  ShieldAlertIcon,
  CheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCourseAiCredential,
  usePutCourseAiCredential,
  useRevokeCourseAiCredential,
} from "../../hooks/use-lecturer-ai";
import { formatVietnamDate, formatVietnamDateTime } from "@/lib/utils";
import type { AiProviderRole } from "../../types";

interface CourseAiProviderCredentialSectionProps {
  courseId: string;
  role: AiProviderRole;
  provider: string;
  providerDisplayName: string;
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
        label: "Đang gặp vấn đề quota/rate/provider",
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

export function CourseAiProviderCredentialSection({
  courseId,
  role,
  provider,
  providerDisplayName,
}: CourseAiProviderCredentialSectionProps) {
  const { data: credential, isLoading } = useCourseAiCredential(
    courseId,
    role,
    provider
  );
  const putMutation = usePutCourseAiCredential(courseId, role, provider);
  const revokeMutation = useRevokeCourseAiCredential(courseId, role, provider);

  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    if (!apiKey.trim()) return;
    putMutation.mutate(
      { provider, apiKey: apiKey.trim() },
      {
        onSuccess: () => {
          setApiKey("");
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
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
      <div className="p-4 rounded-xl border border-border/70 bg-card/40 flex items-center justify-center">
        <Loader2Icon className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isConfigured = Boolean(credential?.configured);
  const statusDisplay = isConfigured
    ? getCredentialStatusDisplay(credential?.status)
    : {
      label: "Chưa cấu hình khóa",
      badgeClass: "bg-muted text-muted-foreground border-border",
      textClass: "text-muted-foreground",
      Icon: AlertCircleIcon,
    };

  return (
    <div className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <KeyRoundIcon className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground">
            Khóa API {providerDisplayName} ({role === "PRIMARY" ? "PRIMARY" : "SECONDARY"})
          </span>
        </div>

        <div>
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
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
              Chưa lưu khóa cho {providerDisplayName}
            </span>
          )}
        </div>
      </div>

      {isConfigured && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-muted/30 border border-border/50 text-[11px]">
          <div>
            <span className="text-muted-foreground block">Nhà cung cấp:</span>
            <span className="font-semibold text-foreground uppercase">
              {credential?.provider || provider}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Trạng thái:</span>
            <span className={`font-semibold flex items-center gap-1 mt-0.5 ${statusDisplay.textClass}`}>
              <statusDisplay.Icon className="w-3 h-3 shrink-0" />
              {statusDisplay.label}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Cập nhật:</span>
            <span className="font-mono text-foreground">
              {credential?.updatedAt
                ? formatVietnamDate(credential.updatedAt)
                : "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Lần dùng gần nhất:</span>
            <span className="font-mono text-foreground">
              {credential?.lastSuccessfulUseAt
                ? formatVietnamDateTime(credential.lastSuccessfulUseAt)
                : "Chưa ghi nhận"}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-[11px] font-medium text-muted-foreground block">
          {isConfigured
            ? `Thay thế khóa API ${providerDisplayName} bằng khóa mới`
            : `Nhập API Key cho ${providerDisplayName}`}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? "text" : "password"}
              placeholder={provider === "OPENROUTER" ? "sk-or-v1-..." : provider === "GEMINI" ? "AIzaSy..." : provider === "COHERE" ? "Vd: xyz..." : "sk-proj-..."}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSave();
                }
              }}
              className="font-mono text-xs pr-10 h-8"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showKey ? <EyeOffIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
            </button>
          </div>

          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSave();
            }}
            disabled={!apiKey.trim() || putMutation.isPending}
            size="sm"
            className="shrink-0 h-8 text-xs gap-1 cursor-pointer"
          >
            {putMutation.isPending ? (
              <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
            ) : null}
            {saveSuccess
              ? "Đã lưu"
              : isConfigured
                ? "Cập nhật khóa"
                : "Lưu khóa"}
          </Button>

          {isConfigured && (
            <div className="shrink-0">
              {confirmRevoke ? (
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={revokeMutation.isPending}
                    onClick={handleRevoke}
                    className="h-8 text-xs cursor-pointer"
                  >
                    {revokeMutation.isPending ? "Đang xóa..." : "Xác nhận xóa"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmRevoke(false)}
                    className="h-8 text-xs cursor-pointer"
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
                  className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                >
                  <Trash2Icon className="w-3.5 h-3.5 mr-1" />
                  Xóa
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {putMutation.isError && (
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <ShieldAlertIcon className="w-4 h-4 shrink-0" />
          <span>Không thể lưu khóa: {(putMutation.error as Error).message}</span>
        </div>
      )}
    </div>
  );
}
