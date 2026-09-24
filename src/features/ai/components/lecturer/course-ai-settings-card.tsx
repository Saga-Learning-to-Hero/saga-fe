import { useState } from "react";
import { BotIcon, CheckIcon, Loader2Icon, ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useCourseAiSettings,
  useUpdateCourseAiSettings,
} from "../../hooks/use-lecturer-ai";
import type { CourseAiSettingsResponse } from "../../types";

interface CourseAiSettingsCardProps {
  courseId: string;
}

function CourseAiSettingsForm({
  courseId,
  initialSettings,
}: {
  courseId: string;
  initialSettings: CourseAiSettingsResponse;
}) {
  const updateMutation = useUpdateCourseAiSettings(courseId);
  const [automationEnabled, setAutomationEnabled] = useState(initialSettings.automationEnabled);
  const [allowPlatformFallback, setAllowPlatformFallback] = useState(
    initialSettings.allowPlatformFallback
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      { automationEnabled, allowPlatformFallback },
      {
        onSuccess: () => {
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6"
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BotIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Cấu hình tự động hóa AI của lớp học
            </h3>
            <p className="text-xs text-muted-foreground">
              Thiết lập chính sách kích hoạt AI và cơ chế dự phòng tài khoản
            </p>
          </div>
        </div>
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          size="sm"
          className="gap-2"
        >
          {updateMutation.isPending ? (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          ) : savedSuccess ? (
            <CheckIcon className="w-4 h-4 text-emerald-400" />
          ) : null}
          {savedSuccess ? "Đã lưu thành công" : "Lưu thiết lập"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex items-start gap-3 p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={automationEnabled}
            onChange={(e) => setAutomationEnabled(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary"
          />
          <div className="space-y-1">
            <span className="text-sm font-medium text-foreground block">
              Tự động phân tích khi có dữ liệu mới
            </span>
            <span className="text-xs text-muted-foreground block leading-relaxed">
              Tự động kích hoạt đánh giá thông minh khi sinh viên đẩy commit hoặc cập nhật task Jira.
            </span>
          </div>
        </label>

        <label className="flex items-start gap-3 p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={allowPlatformFallback}
            onChange={(e) => setAllowPlatformFallback(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary"
          />
          <div className="space-y-1">
            <span className="text-sm font-medium text-foreground block">
              Cho phép dùng khóa dự phòng của trường
            </span>
            <span className="text-xs text-muted-foreground block leading-relaxed">
              Nếu chưa cấu hình API Key riêng hoặc hết hạn mức, hệ thống sẽ tự động dùng khóa mặc định của trường.
            </span>
          </div>
        </label>
      </div>

      {updateMutation.isError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <ShieldAlertIcon className="w-4 h-4 shrink-0" />
          <span>Không thể cập nhật cấu hình: {(updateMutation.error as Error).message}</span>
        </div>
      )}
    </form>
  );
}

export function CourseAiSettingsCard({ courseId }: CourseAiSettingsCardProps) {
  const { data: settings, isLoading } = useCourseAiSettings(courseId);

  if (isLoading || !settings) {
    return (
      <div className="p-6 rounded-2xl border border-border bg-card/60 flex items-center justify-center">
        <Loader2Icon className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <CourseAiSettingsForm
      key={`${settings.automationEnabled}-${settings.allowPlatformFallback}`}
      courseId={courseId}
      initialSettings={settings}
    />
  );
}
