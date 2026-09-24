"use client";

import { useState } from "react";
import {
  SparklesIcon,
  ShieldAlertIcon,
  DownloadIcon,
  Loader2Icon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  LightbulbIcon,
  UsersIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiRiskBadge } from "../common/ai-risk-badge";
import { AiStatusBadge } from "../common/ai-status-badge";
import {
  useLatestTeamProgress,
  useSubmitTeamProgress,
  useLatestTeamRisk,
  useSubmitTeamRisk,
  useLatestStudentProgress,
  useSubmitStudentProgress,
  useLatestStudentRisk,
  useSubmitStudentRisk,
} from "../../hooks/use-project-ai";
import { ProjectAiService } from "../../api/project-ai-api";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type {
  AiProgressNarrativeResult,
  AiRiskAnalysisResult,
} from "../../types";

interface StudentAiHubPageProps {
  projectId: string;
}

export function StudentAiHubPage({ projectId }: StudentAiHubPageProps) {
  const user = useAuthStore((s) => s.user);
  const studentId = user?.id || "";

  const [scope, setScope] = useState<"team" | "student">("team");
  const [isExporting, setIsExporting] = useState(false);

  const teamProgressQuery = useLatestTeamProgress(projectId);
  const submitTeamProgressMutation = useSubmitTeamProgress(projectId);

  const teamRiskQuery = useLatestTeamRisk(projectId);
  const submitTeamRiskMutation = useSubmitTeamRisk(projectId);

  const studentProgressQuery = useLatestStudentProgress(projectId, studentId);
  const submitStudentProgressMutation = useSubmitStudentProgress(projectId, studentId);

  const studentRiskQuery = useLatestStudentRisk(projectId, studentId);
  const submitStudentRiskMutation = useSubmitStudentRisk(projectId, studentId);

  const currentProgress = scope === "team" ? teamProgressQuery.data : studentProgressQuery.data;
  const currentRisk = scope === "team" ? teamRiskQuery.data : studentRiskQuery.data;

  const isProgressLoading =
    scope === "team" ? teamProgressQuery.isLoading : studentProgressQuery.isLoading;
  const isRiskLoading = scope === "team" ? teamRiskQuery.isLoading : studentRiskQuery.isLoading;

  const handleExportDocx = async () => {
    const analysisId = currentProgress?.analysis?.id;
    if (!analysisId) return;
    try {
      setIsExporting(true);
      const blob = await ProjectAiService.exportProjectProgressDocx(projectId, analysisId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SAGA_Bao_Cao_${scope === "team" ? "Nhom" : "Ca_Nhan"}_${projectId.slice(0, 8)}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
    } finally {
      setIsExporting(false);
    }
  };

  let parsedNarrative: AiProgressNarrativeResult | null = null;
  if (currentProgress?.analysis?.providerDecision?.structuredResultJson) {
    try {
      parsedNarrative = JSON.parse(
        currentProgress.analysis.providerDecision.structuredResultJson
      );
    } catch {
      parsedNarrative = null;
    }
  }

  let parsedRisk: AiRiskAnalysisResult | null = null;
  if (currentRisk?.analysis?.providerDecision?.structuredResultJson) {
    try {
      parsedRisk = JSON.parse(currentRisk.analysis.providerDecision.structuredResultJson);
    } catch {
      parsedRisk = null;
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-linear-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
            <SparklesIcon className="w-3.5 h-3.5" />
            Trợ lý Trí tuệ Nhân tạo Sinh viên (SAGA Student AI)
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Nhận định Tiến độ & Dự báo Rủi ro Dự án
          </h1>
          <p className="text-xs text-muted-foreground">
            Theo dõi phân tích khách quan của AI về tiến độ triển khai Sprint, phát hiện nguy cơ trễ hạn và đề xuất hành động cải thiện.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-card border border-border">
            <button
              onClick={() => setScope("team")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${scope === "team"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              <UsersIcon className="w-3.5 h-3.5" />
              Toàn nhóm
            </button>
            <button
              onClick={() => setScope("student")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${scope === "student"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              Cá nhân tôi
            </button>
          </div>

          {currentProgress?.analysis?.id && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportDocx}
              disabled={isExporting}
              className="gap-2 shrink-0"
            >
              {isExporting ? (
                <Loader2Icon className="w-4 h-4 animate-spin" />
              ) : (
                <DownloadIcon className="w-4 h-4" />
              )}
              Xuất Word (.docx)
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2.5">
                <SparklesIcon className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  {scope === "team" ? "Tiến độ Nhóm Dự án" : "Tiến độ Đóng góp Cá nhân"}
                </h3>
              </div>

              <Button
                size="sm"
                variant="outline"
                disabled={
                  scope === "team"
                    ? submitTeamProgressMutation.isPending
                    : submitStudentProgressMutation.isPending
                }
                onClick={() => {
                  if (scope === "team") {
                    submitTeamProgressMutation.mutate();
                  } else {
                    submitStudentProgressMutation.mutate();
                  }
                }}
                className="gap-1.5 text-xs"
              >
                {(scope === "team"
                  ? submitTeamProgressMutation.isPending
                  : submitStudentProgressMutation.isPending) ? (
                  <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <SparklesIcon className="w-3.5 h-3.5 text-primary" />
                )}
                Phân tích lại tiến độ
              </Button>
            </div>

            {isProgressLoading ? (
              <div className="p-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2Icon className="w-4 h-4 animate-spin text-primary" />
                Đang nạp phân tích tiến độ...
              </div>
            ) : !currentProgress?.analysis || !parsedNarrative ? (
              <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                <p>Chưa có dữ liệu phân tích tiến độ gần nhất.</p>
                <Button
                  size="sm"
                  onClick={() => {
                    if (scope === "team") submitTeamProgressMutation.mutate();
                    else submitStudentProgressMutation.mutate();
                  }}
                >
                  Yêu cầu AI phân tích ngay
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AiStatusBadge status={currentProgress.analysis.status} />
                  {currentProgress.analysis.completedAt && (
                    <span className="text-xs text-muted-foreground font-mono">
                      Cập nhật: {new Date(currentProgress.analysis.completedAt).toLocaleString("vi-VN")}
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground leading-relaxed whitespace-pre-line">
                  {parsedNarrative.overview}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2Icon className="w-4 h-4" />
                      Điểm sáng đã đạt được
                    </div>
                    {parsedNarrative.highlights?.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-foreground">
                        {parsedNarrative.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-muted-foreground">Đang cập nhật...</span>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <AlertTriangleIcon className="w-4 h-4" />
                      Vấn đề cần lưu tâm
                    </div>
                    {parsedNarrative.concerns?.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-foreground">
                        {parsedNarrative.concerns.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-muted-foreground">Không có vấn đề cấp bách.</span>
                    )}
                  </div>
                </div>

                {parsedNarrative.recommendations?.length > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      <LightbulbIcon className="w-4 h-4" />
                      Hành động AI khuyến nghị
                    </div>
                    <ul className="space-y-1 text-xs text-foreground">
                      {parsedNarrative.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-indigo-500 font-bold">→</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlertIcon className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-foreground">Đánh giá Mức độ Rủi ro</h3>
              </div>
              <Button
                size="sm"
                variant="ghost"
                disabled={
                  scope === "team"
                    ? submitTeamRiskMutation.isPending
                    : submitStudentRiskMutation.isPending
                }
                onClick={() => {
                  if (scope === "team") submitTeamRiskMutation.mutate();
                  else submitStudentRiskMutation.mutate();
                }}
                className="h-7 px-2 text-xs"
              >
                {(scope === "team"
                  ? submitTeamRiskMutation.isPending
                  : submitStudentRiskMutation.isPending) ? (
                  <Loader2Icon className="w-3 h-3 animate-spin" />
                ) : (
                  "Quét rủi ro"
                )}
              </Button>
            </div>

            {isRiskLoading ? (
              <div className="p-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2Icon className="w-4 h-4 animate-spin text-primary" />
                Đang quét rủi ro...
              </div>
            ) : !currentRisk?.analysis || !parsedRisk ? (
              <div className="p-6 text-center text-xs text-muted-foreground space-y-2">
                <p>Chưa có dữ liệu rủi ro.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (scope === "team") submitTeamRiskMutation.mutate();
                    else submitStudentRiskMutation.mutate();
                  }}
                >
                  Quét ngay
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border">
                  <span className="text-xs text-muted-foreground">Cấp độ rủi ro:</span>
                  <AiRiskBadge level={parsedRisk.riskLevel} />
                </div>

                {parsedRisk.riskReasons?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-foreground block">
                      Nguyên nhân rủi ro nhận diện:
                    </span>
                    <ul className="space-y-2">
                      {parsedRisk.riskReasons.map((r, i) => (
                        <li
                          key={i}
                          className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-xs text-foreground space-y-1"
                        >
                          <div className="font-medium text-red-600 dark:text-red-400">
                            {r.description}
                          </div>
                          {r.impact && (
                            <div className="text-[11px] text-muted-foreground">
                              Tác động: {r.impact}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {parsedRisk.recommendedActions?.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold text-foreground block">
                      Khuyến nghị khắc phục ngay:
                    </span>
                    <ul className="space-y-1.5">
                      {parsedRisk.recommendedActions.map((action, i) => (
                        <li
                          key={i}
                          className="p-2.5 rounded-lg bg-muted/40 border border-border text-xs text-foreground flex items-start gap-2"
                        >
                          <span className="text-primary font-bold">{i + 1}.</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
