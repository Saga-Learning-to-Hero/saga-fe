import {
  XIcon,
  SparklesIcon,
  Loader2Icon,
  CheckCircle2Icon,
  GitCommitIcon,
  FileCheck2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useCommitAnalysesHistory,
  useSubmitCommitAnalysis,
  useCommitAcademicClassifications,
  useSubmitCommitAcademic,
} from "../../hooks/use-project-ai";
import type { AiStructuredResult } from "../../types";

interface CommitAiIntelligenceModalProps {
  projectId: string;
  gitCommitId: string;
  commitHash: string;
  commitMessage: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CommitAiIntelligenceModal({
  projectId,
  gitCommitId,
  commitHash,
  commitMessage,
  isOpen,
  onClose,
}: CommitAiIntelligenceModalProps) {
  const historyQuery = useCommitAnalysesHistory(projectId, gitCommitId);
  const submitCommitMutation = useSubmitCommitAnalysis(projectId, gitCommitId);

  const academicQuery = useCommitAcademicClassifications(projectId, gitCommitId);
  const submitAcademicMutation = useSubmitCommitAcademic(projectId, gitCommitId);

  if (!isOpen) return null;

  const latestRun = historyQuery.data?.content?.[0];
  let parsedResult: AiStructuredResult | null = null;
  if (latestRun?.providerDecision?.structuredResultJson) {
    try {
      parsedResult = JSON.parse(latestRun.providerDecision.structuredResultJson);
    } catch {
      parsedResult = null;
    }
  }

  const classifications = academicQuery.data || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <SparklesIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Đánh giá Thông minh Commit (Commit Intelligence)
              </h3>
              <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <GitCommitIcon className="w-3 h-3" />
                <span>{commitHash.slice(0, 8)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 hover:bg-muted cursor-pointer">
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs font-mono space-y-1">
            <span className="text-muted-foreground block text-[11px]">Tin nhắn Commit gốc:</span>
            <span className="text-foreground block">{commitMessage}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Kết quả đánh giá AI:</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={submitCommitMutation.isPending}
                onClick={() => submitCommitMutation.mutate()}
                className="h-7 text-xs gap-1"
              >
                {submitCommitMutation.isPending ? (
                  <Loader2Icon className="w-3 h-3 animate-spin" />
                ) : (
                  <SparklesIcon className="w-3 h-3 text-primary" />
                )}
                Chấm điểm Commit
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={submitAcademicMutation.isPending}
                onClick={() => submitAcademicMutation.mutate()}
                className="h-7 text-xs gap-1"
              >
                {submitAcademicMutation.isPending ? (
                  <Loader2Icon className="w-3 h-3 animate-spin" />
                ) : (
                  <FileCheck2Icon className="w-3 h-3 text-indigo-500" />
                )}
                Phân loại đề cương
              </Button>
            </div>
          </div>

          {historyQuery.isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2Icon className="w-4 h-4 animate-spin text-primary" />
              Đang tải kết quả phân tích...
            </div>
          ) : !latestRun || !parsedResult ? (
            <div className="p-8 text-center text-xs text-muted-foreground space-y-2 rounded-2xl border border-dashed border-border bg-muted/10">
              <p>Chưa có kết quả đánh giá thông minh cho commit này.</p>
              <Button size="sm" onClick={() => submitCommitMutation.mutate()}>
                Phân tích ngay
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs space-y-1">
                  <span className="text-[11px] text-muted-foreground block">Điểm tin nhắn:</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-foreground font-mono">
                      {parsedResult.commitMessageAssessment?.score ?? 0}
                    </span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                  <span className="text-[11px] font-semibold text-primary block">
                    {parsedResult.commitMessageAssessment?.verdict}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs space-y-1">
                  <span className="text-[11px] text-muted-foreground block">Chất lượng Code:</span>
                  <div className="text-base font-bold text-foreground">
                    {parsedResult.codeAssessment?.verdict || "CHƯA RÕ"}
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground block">
                    Độ tin cậy: {((parsedResult.codeAssessment?.confidence ?? 0) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs space-y-1">
                  <span className="text-[11px] text-muted-foreground block">Khớp với Task Jira:</span>
                  <div className="text-base font-bold text-foreground">
                    {parsedResult.taskAlignmentSummary || "CHƯA LIÊN KẾT"}
                  </div>
                  <span className="text-[11px] text-muted-foreground block">
                    {parsedResult.taskAlignments?.length ?? 0} task liên kết
                  </span>
                </div>
              </div>

              {parsedResult.commitMessageAssessment?.suggestedMessage && (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2Icon className="w-3.5 h-3.5" />
                    Gợi ý cải thiện tin nhắn commit chuẩn Conventional Commits:
                  </div>
                  <div className="p-2.5 rounded-lg bg-card font-mono text-[11px] border border-border/60">
                    {parsedResult.commitMessageAssessment.suggestedMessage}
                  </div>
                </div>
              )}

              {parsedResult.commitMessageAssessment?.summary && (
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border text-xs text-muted-foreground leading-relaxed">
                  {parsedResult.commitMessageAssessment.summary}
                </div>
              )}

              {classifications.length > 0 && (
                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2 text-xs">
                  <div className="font-semibold text-indigo-600 dark:text-indigo-400">
                    Phân loại mục tiêu đề cương:
                  </div>
                  <div className="space-y-1">
                    {classifications.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-card border border-border text-xs"
                      >
                        <span className="font-medium text-foreground">{c.targetName}</span>
                        <span className="font-mono text-primary font-semibold text-[11px]">
                          {(c.confidence * 100).toFixed(0)}% tin cậy
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/60 flex items-center justify-end shrink-0 bg-muted/20">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
