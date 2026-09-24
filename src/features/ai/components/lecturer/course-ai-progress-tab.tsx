import { useState } from "react";
import {
  SparklesIcon,
  DownloadIcon,
  Loader2Icon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  ShieldAlertIcon,
  LightbulbIcon,
  BanIcon,
  CpuIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiStatusBadge } from "../common/ai-status-badge";
import {
  useLatestCourseProgress,
  useSubmitCourseProgress,
} from "../../hooks/use-lecturer-ai";
import { CourseAiService } from "../../api/lecturer-ai-api";
import type { AiProgressNarrativeResult } from "../../types";

interface CourseAiProgressTabProps {
  courseId: string;
}

export function CourseAiProgressTab({ courseId }: CourseAiProgressTabProps) {
  const { data: latestData, isLoading } = useLatestCourseProgress(courseId);
  const submitMutation = useSubmitCourseProgress(courseId);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportDocx = async () => {
    if (!latestData?.analysis?.id) return;
    try {
      setIsExporting(true);
      const blob = await CourseAiService.exportCourseProgressDocx(
        courseId,
        latestData.analysis.id
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SAGA_Bao_Cao_Tien_Do_${courseId.slice(0, 8)}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
    } finally {
      setIsExporting(false);
    }
  };

  const analysis = latestData?.analysis;
  let parsedNarrative: AiProgressNarrativeResult | null = null;
  if (analysis?.providerDecision?.structuredResultJson) {
    try {
      parsedNarrative = JSON.parse(analysis.providerDecision.structuredResultJson);
    } catch {
      parsedNarrative = null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Báo cáo tổng hợp tiến độ khóa học bằng Trí tuệ nhân tạo (AI)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Phân tích tự động số liệu commit, task Jira, milestone đề cương và hiệu suất các nhóm trong lớp
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {analysis && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportDocx}
              disabled={isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <Loader2Icon className="w-4 h-4 animate-spin" />
              ) : (
                <DownloadIcon className="w-4 h-4" />
              )}
              Xuất báo cáo Word (.docx)
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
            className="gap-2"
          >
            {submitMutation.isPending ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
              <SparklesIcon className="w-4 h-4 text-amber-300" />
            )}
            {submitMutation.isPending ? "Đang tiến hành phân tích..." : "Yêu cầu AI phân tích mới"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 rounded-2xl border border-border bg-card flex flex-col items-center justify-center gap-3">
          <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Đang tải bản phân tích tiến độ gần nhất...</span>
        </div>
      ) : latestData?.status === "NOT_ANALYZED" || !analysis ? (
        <div className="p-12 rounded-2xl border border-dashed border-border bg-muted/10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Chưa có bản phân tích tiến độ nào</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
              Bấm nút &ldquo;Yêu cầu AI phân tích mới&rdquo; ở trên để hệ thống quét dữ liệu các nhóm và sinh báo cáo tổng hợp.
            </p>
          </div>
          <Button size="sm" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
            Phân tích ngay
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-muted/30 border border-border text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Trạng thái:</span>
              <AiStatusBadge status={analysis.status} />
              {analysis.completedAt && (
                <span className="text-muted-foreground font-mono ml-2">
                  Hoàn thành: {new Date(analysis.completedAt).toLocaleString("vi-VN")}
                </span>
              )}
            </div>

            {analysis.providerDecision && (
              <div className="flex items-center gap-4 text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <CpuIcon className="w-3.5 h-3.5 text-primary" />
                  Mô hình: {analysis.providerDecision.modelId}
                </span>
                <span>Độ trễ: {analysis.providerDecision.latencyMs} ms</span>
                <span>Token: {analysis.providerDecision.inputUnits + analysis.providerDecision.outputUnits}</span>
              </div>
            )}
          </div>

          {parsedNarrative ? (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <SparklesIcon className="w-4 h-4" />
                  Tổng quan nhận định từ AI
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {parsedNarrative.overview}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                    <CheckCircle2Icon className="w-4 h-4" />
                    Điểm sáng & Thành tựu nổi bật
                  </div>
                  {parsedNarrative.highlights?.length > 0 ? (
                    <ul className="space-y-2">
                      {parsedNarrative.highlights.map((h, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-muted-foreground">Chưa có ghi nhận nổi bật.</span>
                  )}
                </div>

                <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider">
                    <AlertTriangleIcon className="w-4 h-4" />
                    Vấn đề đáng quan ngại
                  </div>
                  {parsedNarrative.concerns?.length > 0 ? (
                    <ul className="space-y-2">
                      {parsedNarrative.concerns.map((c, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-2">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-muted-foreground">Không phát hiện quan ngại đáng kể.</span>
                  )}
                </div>

                <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-3">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-xs uppercase tracking-wider">
                    <BanIcon className="w-4 h-4" />
                    Rào cản cản trở tiến độ (Blockers)
                  </div>
                  {parsedNarrative.blockers?.length > 0 ? (
                    <ul className="space-y-2">
                      {parsedNarrative.blockers.map((b, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-2">
                          <span className="text-red-500 font-bold">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-muted-foreground">Không ghi nhận rào cản tắc nghẽn.</span>
                  )}
                </div>

                <div className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                    <LightbulbIcon className="w-4 h-4" />
                    Khuyến nghị can thiệp của Giảng viên
                  </div>
                  {parsedNarrative.recommendations?.length > 0 ? (
                    <ul className="space-y-2">
                      {parsedNarrative.recommendations.map((r, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-2">
                          <span className="text-indigo-500 font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-muted-foreground">Chưa có khuyến nghị mới.</span>
                  )}
                </div>
              </div>

              {parsedNarrative.dueSoonOverdueNote && (
                <div className="p-4 rounded-xl border border-border bg-muted/20 text-xs text-muted-foreground flex items-center gap-2">
                  <ShieldAlertIcon className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{parsedNarrative.dueSoonOverdueNote}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-border bg-card text-xs text-muted-foreground">
              Dữ liệu phân tích thô: {analysis.providerDecision?.structuredResultJson || "Đang xử lý"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
