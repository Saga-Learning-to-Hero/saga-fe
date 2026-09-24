import {
  SparklesIcon,
  ShieldAlertIcon,
  Loader2Icon,
  GraduationCapIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiEvidenceStrengthBadge } from "../common/ai-evidence-strength-badge";
import { AiRiskBadge } from "../common/ai-risk-badge";
import {
  useLatestTaskIntelligence,
  useSubmitTaskIntelligence,
  useLatestTaskRisk,
  useSubmitTaskRisk,
  useTaskAcademicClassifications,
  useSubmitTaskAcademic,
} from "../../hooks/use-project-ai";
import type {
  AiTaskIntelligenceResult,
  AiRiskAnalysisResult,
} from "../../types";

interface TaskAiIntelligenceSectionProps {
  projectId?: string | null;
  taskId: string;
}

export function TaskAiIntelligenceSection({
  projectId,
  taskId,
}: TaskAiIntelligenceSectionProps) {
  const resolvedProjectId = projectId || "";
  const intelligenceQuery = useLatestTaskIntelligence(resolvedProjectId, taskId);
  const submitIntelligenceMutation = useSubmitTaskIntelligence(resolvedProjectId, taskId);

  const riskQuery = useLatestTaskRisk(resolvedProjectId, taskId);
  const submitRiskMutation = useSubmitTaskRisk(resolvedProjectId, taskId);

  const academicQuery = useTaskAcademicClassifications(resolvedProjectId, taskId);
  const submitAcademicMutation = useSubmitTaskAcademic(resolvedProjectId, taskId);

  let parsedIntelligence: AiTaskIntelligenceResult | null = null;
  if (intelligenceQuery.data?.analysis?.providerDecision?.structuredResultJson) {
    try {
      parsedIntelligence = JSON.parse(
        intelligenceQuery.data.analysis.providerDecision.structuredResultJson
      );
    } catch {
      parsedIntelligence = null;
    }
  }

  let parsedRisk: AiRiskAnalysisResult | null = null;
  if (riskQuery.data?.analysis?.providerDecision?.structuredResultJson) {
    try {
      parsedRisk = JSON.parse(riskQuery.data.analysis.providerDecision.structuredResultJson);
    } catch {
      parsedRisk = null;
    }
  }

  const classifications = academicQuery.data || [];

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-primary/10 pb-3">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          <SparklesIcon className="w-4 h-4" />
          <span>Đánh giá Trí tuệ Nhân tạo (SAGA AI Intelligence)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            disabled={submitIntelligenceMutation.isPending}
            onClick={() => submitIntelligenceMutation.mutate()}
            className="h-7 px-2 text-xs gap-1 bg-card hover:bg-muted"
          >
            {submitIntelligenceMutation.isPending ? (
              <Loader2Icon className="w-3 h-3 animate-spin" />
            ) : (
              <SparklesIcon className="w-3 h-3 text-primary" />
            )}
            Đánh giá Task
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={submitRiskMutation.isPending}
            onClick={() => submitRiskMutation.mutate()}
            className="h-7 px-2 text-xs gap-1 bg-card hover:bg-muted"
          >
            {submitRiskMutation.isPending ? (
              <Loader2Icon className="w-3 h-3 animate-spin" />
            ) : (
              <ShieldAlertIcon className="w-3 h-3 text-red-500" />
            )}
            Quét rủi ro
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={submitAcademicMutation.isPending}
            onClick={() => submitAcademicMutation.mutate()}
            className="h-7 px-2 text-xs gap-1 bg-card hover:bg-muted"
          >
            {submitAcademicMutation.isPending ? (
              <Loader2Icon className="w-3 h-3 animate-spin" />
            ) : (
              <GraduationCapIcon className="w-3 h-3 text-indigo-500" />
            )}
            Phân loại đề cương
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {intelligenceQuery.isLoading ? (
          <div className="p-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
            Đang tải dữ liệu đánh giá Task...
          </div>
        ) : parsedIntelligence ? (
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Độ mạnh minh chứng:</span>
              <AiEvidenceStrengthBadge strength={parsedIntelligence.evidenceStrength} />
            </div>

            {parsedIntelligence.deviationDetected && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangleIcon className="w-4 h-4 shrink-0" />
                  Phát hiện làm lệch mô tả Task (Deviation Alert)
                </div>
                <div className="text-[11px] leading-relaxed">
                  {parsedIntelligence.deviationSummary}
                </div>
              </div>
            )}

            <div className="text-xs text-foreground bg-card/70 p-3 rounded-xl border border-border/60 leading-relaxed">
              {parsedIntelligence.summary}
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic">
            Chưa có đánh giá thông minh cho task này. Bấm &ldquo;Đánh giá Task&rdquo; để AI phân tích minh chứng và code liên kết.
          </div>
        )}

        {parsedRisk && (
          <div className="pt-2 border-t border-primary/10 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Mức độ rủi ro chậm tiến độ:</span>
            <AiRiskBadge level={parsedRisk.riskLevel} />
          </div>
        )}

        {classifications.length > 0 && (
          <div className="pt-2 border-t border-primary/10 space-y-1.5">
            <span className="text-xs font-semibold text-foreground block">
              Mục tiêu đề cương (AI đề xuất):
            </span>
            <div className="space-y-1">
              {classifications.slice(0, 2).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-card/80 border border-border/60 text-xs"
                >
                  <div>
                    <span className="font-medium text-foreground">{c.targetName}</span>
                    <span className="text-muted-foreground ml-1.5 font-mono text-[11px]">
                      ({c.targetType})
                    </span>
                  </div>
                  <span className="font-mono text-primary font-semibold text-[11px]">
                    {(c.confidence * 100).toFixed(0)}% tin cậy
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
