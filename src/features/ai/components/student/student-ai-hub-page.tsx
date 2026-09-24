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
  AlertOctagonIcon,
  RefreshCwIcon,
  KanbanIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeaderBadge } from "@/components/common/leader-badge";
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
import { getAiErrorMessage } from "../../lib/ai-error-map";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useStudentCourseContext } from "@/features/student/courses/hooks/use-student-course-context";
import { useStudentMyTeam } from "@/features/student/courses/hooks/use-student-courses";
import { cn } from "@/lib/utils";
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

  const { course, courseId } = useStudentCourseContext();
  const myTeamQuery = useStudentMyTeam(courseId, { enabled: Boolean(courseId) });
  const myTeam = myTeamQuery.data;

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

  const progressAnalysis = currentProgress?.analysis;
  const riskAnalysis = currentRisk?.analysis;

  const isLeader = Boolean(myTeam?.myRole === "LEADER");

  const handleRefresh = () => {
    if (scope === "team") {
      void teamProgressQuery.refetch();
      void teamRiskQuery.refetch();
    } else {
      void studentProgressQuery.refetch();
      void studentRiskQuery.refetch();
    }
  };

  const isAnyLoading = isProgressLoading || isRiskLoading;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-border/80 bg-card/90 p-5 shadow-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <Avatar className="size-11 rounded-2xl border border-primary/25 shadow-xs" size="lg">
            <AvatarImage
              src={user?.avatar || undefined}
              alt={user?.name || "Sinh viên"}
              referrerPolicy="no-referrer"
              className="object-cover rounded-2xl"
            />
            <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold text-sm font-mono">
              {user?.name?.slice(0, 2)?.toUpperCase() || "SV"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-foreground">
                {user?.name || "Sinh viên"}
              </h2>
              {isLeader ? (
                <LeaderBadge size="sm" />
              ) : (
                <Badge variant="secondary" className="text-[10px] font-bold">
                  Thành viên
                </Badge>
              )}
              {myTeam ? (
                <Badge variant="outline" className="font-mono text-[10px]">
                  Nhóm {myTeam.teamNo} · {myTeam.teamName}
                </Badge>
              ) : null}
              {course ? (
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {course.code}
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Theo dõi tiến độ Sprint, cảnh báo rủi ro trễ hạn và nhận đề xuất tối ưu hóa năng suất từ AI.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 cursor-pointer text-xs gap-1.5"
            disabled={isAnyLoading}
            onClick={handleRefresh}
          >
            <RefreshCwIcon className={cn("size-3.5", isAnyLoading && "animate-spin")} />
            Làm mới
          </Button>

          <div className="flex items-center gap-1 p-1 rounded-2xl bg-muted/60 border border-border shrink-0">
            <button
              type="button"
              onClick={() => setScope("team")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                scope === "team"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <UsersIcon className="w-3.5 h-3.5 text-primary" />
              <span>Toàn nhóm dự án</span>
            </button>
            <button
              type="button"
              onClick={() => setScope("student")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                scope === "student"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <UserIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>Cá nhân tôi</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <CardContent className="p-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Tiến độ dự án</span>
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <SparklesIcon className="size-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-foreground font-mono">
                {progressAnalysis?.status === "COMPLETED"
                  ? "Đã phân tích"
                  : progressAnalysis?.status === "RUNNING"
                    ? "Đang xử lý"
                    : progressAnalysis?.status === "FAILED"
                      ? "Chưa hoàn tất"
                      : "Chờ kích hoạt"}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {scope === "team" ? "Phạm vi: Nhóm dự án" : "Phạm vi: Cá nhân"}
              </p>
            </div>
            <div className="pt-1">
              <AiStatusBadge status={progressAnalysis?.status || "PENDING"} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <CardContent className="p-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Mức độ rủi ro</span>
              <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                <ShieldAlertIcon className="size-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-foreground font-mono">
                {parsedRisk?.riskLevel || "CHƯA QUÉT"}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {parsedRisk ? `Độ tin cậy ${(parsedRisk.confidence * 100).toFixed(0)}%` : "Chờ thuật toán AI quét"}
              </p>
            </div>
            <div className="pt-1">
              {parsedRisk ? (
                <AiRiskBadge level={parsedRisk.riskLevel} />
              ) : (
                <Badge variant="outline" className="text-[11px] text-muted-foreground">
                  Chưa có dữ liệu rủi ro
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <CardContent className="p-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Dữ liệu đối soát</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <KanbanIcon className="size-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-foreground font-mono">
                Jira & GitHub
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Commits, Tasks & Milestones
              </p>
            </div>
            <div className="pt-1">
              <Badge variant="outline" className="text-[11px] text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10">
                Tiến độ và Rủi ro
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <CardContent className="p-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Đề xuất hành động</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <LightbulbIcon className="size-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-foreground font-mono">
                {(parsedNarrative?.recommendations?.length || 0) + (parsedRisk?.recommendedActions?.length || 0)}{" "}
                <span className="text-xs font-normal text-muted-foreground">đề xuất</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Gợi ý cải thiện năng suất Sprint
              </p>
            </div>
            <div className="pt-1">
              <Badge variant="outline" className="text-[11px] text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/10">
                Tối ưu hóa quy trình làm việc
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  {scope === "team" ? "Báo cáo Tiến độ Nhóm" : "Báo cáo Tiến độ Cá nhân"}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {progressAnalysis && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportDocx}
                    disabled={isExporting}
                    className="gap-1.5 text-xs cursor-pointer"
                  >
                    {isExporting ? (
                      <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <DownloadIcon className="w-3.5 h-3.5" />
                    )}
                    Xuất file Word (.docx)
                  </Button>
                )}

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
                  className="gap-1.5 text-xs cursor-pointer"
                >
                  {(scope === "team"
                    ? submitTeamProgressMutation.isPending
                    : submitStudentProgressMutation.isPending) ? (
                    <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <SparklesIcon className="w-3.5 h-3.5 text-primary" />
                  )}
                  Chạy lại phân tích
                </Button>
              </div>
            </div>

            {isProgressLoading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3 text-xs text-muted-foreground">
                <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
                <span>Đang nạp phân tích tiến độ từ máy chủ...</span>
              </div>
            ) : !progressAnalysis ? (
              <div className="p-12 text-center text-xs text-muted-foreground space-y-3 rounded-2xl border border-dashed border-border bg-muted/10">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Chưa có dữ liệu phân tích gần nhất</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    Nhấn nút bên dưới để yêu cầu mô hình AI tổng hợp số liệu commit và task Jira của bạn.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (scope === "team") submitTeamProgressMutation.mutate();
                    else submitStudentProgressMutation.mutate();
                  }}
                  className="cursor-pointer"
                >
                  Phân tích ngay
                </Button>
              </div>
            ) : progressAnalysis.status === "FAILED" ? (
              <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/10 space-y-3.5 shadow-xs">
                <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400 font-bold text-sm">
                  <AlertOctagonIcon className="w-5 h-5 shrink-0" />
                  <span>Phân tích tiến độ thất bại</span>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed">
                  {getAiErrorMessage(progressAnalysis.failureCode || progressAnalysis.providerDecision?.safeErrorCode)}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-muted-foreground pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-700 dark:text-red-300 font-bold">
                    Mã lỗi: {progressAnalysis.failureCode || progressAnalysis.providerDecision?.safeErrorCode || "AI_ANALYSIS_FAILED"}
                  </span>
                  {progressAnalysis.completedAt && (
                    <span>Thời điểm: {new Date(progressAnalysis.completedAt).toLocaleString("vi-VN")}</span>
                  )}
                </div>
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (scope === "team") submitTeamProgressMutation.mutate();
                      else submitStudentProgressMutation.mutate();
                    }}
                    className="border-red-500/30 text-red-600 hover:bg-red-500/10 text-xs cursor-pointer"
                  >
                    Thử phân tích lại
                  </Button>
                </div>
              </div>
            ) : parsedNarrative ? (
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <AiStatusBadge status={progressAnalysis.status} />
                  {progressAnalysis.completedAt && (
                    <span className="text-xs text-muted-foreground font-mono">
                      Thời điểm: {new Date(progressAnalysis.completedAt).toLocaleString("vi-VN")}
                    </span>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Nhận định tổng quan
                  </div>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                    {parsedNarrative.overview}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      <CheckCircle2Icon className="w-4 h-4" />
                      Điểm nổi bật
                    </div>
                    {parsedNarrative.highlights?.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-foreground">
                        {parsedNarrative.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-muted-foreground">Đang cập nhật...</span>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      <AlertTriangleIcon className="w-4 h-4" />
                      Vấn đề cần lưu ý
                    </div>
                    {parsedNarrative.concerns?.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-foreground">
                        {parsedNarrative.concerns.map((c, i) => (
                          <li key={i} className="flex items-start gap-2">
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
                  <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      <LightbulbIcon className="w-4 h-4" />
                      Khuyến nghị của AI
                    </div>
                    <ul className="space-y-2 text-xs text-foreground">
                      {parsedNarrative.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-indigo-500 font-bold">→</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-border bg-card text-xs text-muted-foreground">
                Dữ liệu phân tích thô: {progressAnalysis.providerDecision?.structuredResultJson || "Đang xử lý"}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlertIcon className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-foreground">Đánh giá rủi ro</h3>
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
                className="h-7 px-2.5 text-xs cursor-pointer"
              >
                {(scope === "team"
                  ? submitTeamRiskMutation.isPending
                  : submitStudentRiskMutation.isPending) ? (
                  <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Quét rủi ro"
                )}
              </Button>
            </div>

            {isRiskLoading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2Icon className="w-5 h-5 animate-spin text-primary" />
                <span>Đang quét các yếu tố rủi ro...</span>
              </div>
            ) : !riskAnalysis ? (
              <div className="p-8 text-center text-xs text-muted-foreground space-y-3 rounded-2xl border border-dashed border-border bg-muted/10">
                <p>Chưa có dữ liệu đánh giá rủi ro.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (scope === "team") submitTeamRiskMutation.mutate();
                    else submitStudentRiskMutation.mutate();
                  }}
                  className="cursor-pointer"
                >
                  Quét ngay
                </Button>
              </div>
            ) : riskAnalysis.status === "FAILED" ? (
              <div className="p-5 rounded-2xl border border-red-500/30 bg-red-500/10 space-y-2.5">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
                  <AlertOctagonIcon className="w-4 h-4 shrink-0" />
                  <span>Quét rủi ro thất bại</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {getAiErrorMessage(riskAnalysis.failureCode || riskAnalysis.providerDecision?.safeErrorCode)}
                </p>
                <div className="text-[11px] font-mono text-muted-foreground">
                  Mã lỗi: {riskAnalysis.failureCode || riskAnalysis.providerDecision?.safeErrorCode || "AI_RISK_FAILED"}
                </div>
              </div>
            ) : parsedRisk ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border">
                  <span className="text-xs text-muted-foreground">Cấp độ rủi ro:</span>
                  <AiRiskBadge level={parsedRisk.riskLevel} />
                </div>

                {parsedRisk.riskReasons?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-foreground block">
                      Các yếu tố nguy cơ nhận diện:
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
                              Hệ quả: {r.impact}
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
                      Biện pháp khắc phục đề xuất:
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
            ) : (
              <div className="p-4 rounded-xl border border-border bg-card text-xs text-muted-foreground">
                Dữ liệu rủi ro thô: {riskAnalysis.providerDecision?.structuredResultJson || "Đang xử lý"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
