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
  AlertOctagonIcon,
  UsersIcon,
  UserIcon,
  GraduationCapIcon,
  FileTextIcon,
  AlertCircleIcon,
  InfoIcon,
  KeyRoundIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomSelect } from "@/components/common/custom-select";
import { AiStatusBadge } from "../common/ai-status-badge";
import { AiRiskBadge } from "../common/ai-risk-badge";
import {
  useLatestCourseProgress,
  useSubmitCourseProgress,
} from "../../hooks/use-lecturer-ai";
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
import { useLecturerTeams } from "@/features/lecturer/teams/hooks/use-lecturer-teams";
import { CourseAiService } from "../../api/lecturer-ai-api";
import { ProjectAiService } from "../../api/project-ai-api";
import { getAiErrorMessage } from "../../lib/ai-error-map";
import { cn } from "@/lib/utils";
import type {
  AiProgressNarrativeResult,
  AiRiskAnalysisResult,
  AiAnalysisResponse,
} from "../../types";

interface CourseAiProgressTabProps {
  courseId: string;
  onNavigateToCredentials?: () => void;
}

export function CourseAiProgressTab({ courseId, onNavigateToCredentials }: CourseAiProgressTabProps) {
  const [scope, setScope] = useState<"COURSE" | "TEAM" | "STUDENT">("COURSE");
  const [subTab, setSubTab] = useState<"PROGRESS" | "RISK">("PROGRESS");

  const { data: teamsData, isLoading: isTeamsLoading } = useLecturerTeams(courseId);
  const teams = teamsData?.teams || [];

  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const activeTeamId = selectedTeamId || teams[0]?.teamId || "";
  const currentTeam = teams.find((t) => t.teamId === activeTeamId);
  const currentProjectId = currentTeam?.projectId || "";
  const teamMembers = currentTeam?.members || [];
  const activeStudentId = selectedStudentId || teamMembers[0]?.studentProfileId || "";
  const currentStudent = teamMembers.find((m) => m.studentProfileId === activeStudentId);

  const courseProgressQuery = useLatestCourseProgress(courseId);
  const submitCourseProgressMutation = useSubmitCourseProgress(courseId);

  const teamProgressQuery = useLatestTeamProgress(currentProjectId);
  const submitTeamProgressMutation = useSubmitTeamProgress(currentProjectId);
  const teamRiskQuery = useLatestTeamRisk(currentProjectId);
  const submitTeamRiskMutation = useSubmitTeamRisk(currentProjectId);

  const studentProgressQuery = useLatestStudentProgress(currentProjectId, activeStudentId);
  const submitStudentProgressMutation = useSubmitStudentProgress(currentProjectId, activeStudentId);
  const studentRiskQuery = useLatestStudentRisk(currentProjectId, activeStudentId);
  const submitStudentRiskMutation = useSubmitStudentRisk(currentProjectId, activeStudentId);

  const [isExporting, setIsExporting] = useState(false);

  let currentAnalysis: AiAnalysisResponse | null = null;
  let isCurrentLoading = false;
  let isCurrentSubmitting = false;

  if (scope === "COURSE") {
    currentAnalysis = courseProgressQuery.data?.analysis || null;
    isCurrentLoading = courseProgressQuery.isLoading;
    isCurrentSubmitting = submitCourseProgressMutation.isPending;
  } else if (scope === "TEAM") {
    if (subTab === "PROGRESS") {
      currentAnalysis = teamProgressQuery.data?.analysis || null;
      isCurrentLoading = teamProgressQuery.isLoading;
      isCurrentSubmitting = submitTeamProgressMutation.isPending;
    } else {
      currentAnalysis = teamRiskQuery.data?.analysis || null;
      isCurrentLoading = teamRiskQuery.isLoading;
      isCurrentSubmitting = submitTeamRiskMutation.isPending;
    }
  } else {
    if (subTab === "PROGRESS") {
      currentAnalysis = studentProgressQuery.data?.analysis || null;
      isCurrentLoading = studentProgressQuery.isLoading;
      isCurrentSubmitting = submitStudentProgressMutation.isPending;
    } else {
      currentAnalysis = studentRiskQuery.data?.analysis || null;
      isCurrentLoading = studentRiskQuery.isLoading;
      isCurrentSubmitting = submitStudentRiskMutation.isPending;
    }
  }

  const handleExportDocx = async () => {
    if (!currentAnalysis?.id) return;
    try {
      setIsExporting(true);
      let blob: Blob;
      let filename = "";

      if (scope === "COURSE") {
        blob = await CourseAiService.exportCourseProgressDocx(courseId, currentAnalysis.id);
        filename = `SAGA_Bao_Cao_Tien_Do_Khoa_Hoc_${courseId.slice(0, 8)}.docx`;
      } else if (currentProjectId) {
        blob = await ProjectAiService.exportProjectProgressDocx(currentProjectId, currentAnalysis.id);
        filename = `SAGA_Bao_Cao_Tien_Do_Nhom_${currentTeam?.teamName || "Project"}.docx`;
      } else {
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
    } finally {
      setIsExporting(false);
    }
  };

  const handleTriggerAnalysis = () => {
    if (scope === "COURSE") {
      submitCourseProgressMutation.mutate();
    } else if (scope === "TEAM") {
      if (!currentProjectId) return;
      if (subTab === "PROGRESS") {
        submitTeamProgressMutation.mutate();
      } else {
        submitTeamRiskMutation.mutate();
      }
    } else {
      if (!currentProjectId || !activeStudentId) return;
      if (subTab === "PROGRESS") {
        submitStudentProgressMutation.mutate();
      } else {
        submitStudentRiskMutation.mutate();
      }
    }
  };

  let parsedNarrative: AiProgressNarrativeResult | null = null;
  let parsedRisk: AiRiskAnalysisResult | null = null;

  if (currentAnalysis?.providerDecision?.structuredResultJson) {
    try {
      if (subTab === "PROGRESS" || scope === "COURSE") {
        parsedNarrative = JSON.parse(currentAnalysis.providerDecision.structuredResultJson);
      } else {
        parsedRisk = JSON.parse(currentAnalysis.providerDecision.structuredResultJson);
      }
    } catch {
      parsedNarrative = null;
      parsedRisk = null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">
            Báo cáo Tiến độ và Đánh giá Rủi ro AI
          </h3>
          <p className="text-xs text-muted-foreground">
            Phân tích tự động code diff, commit, tiến độ Jira Sprint và phát hiện rủi ro dự án theo từng cấp độ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border shrink-0">
          <button
            type="button"
            onClick={() => setScope("COURSE")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              scope === "COURSE"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <GraduationCapIcon className="w-3.5 h-3.5 text-primary" />
            <span>Toàn khóa học</span>
          </button>
          <button
            type="button"
            onClick={() => setScope("TEAM")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              scope === "TEAM"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <UsersIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>Theo Nhóm dự án</span>
          </button>
          <button
            type="button"
            onClick={() => setScope("STUDENT")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              scope === "STUDENT"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <UserIcon className="w-3.5 h-3.5 text-purple-500" />
            <span>Theo Từng Sinh viên</span>
          </button>
        </div>
      </div>

      {(scope === "TEAM" || scope === "STUDENT") && (
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-64">
              <label htmlFor="select-lecturer-team" className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Nhóm dự án
              </label>
              {isTeamsLoading ? (
                <div className="h-9 rounded-xl border border-border bg-muted/20 animate-pulse flex items-center px-3 text-xs text-muted-foreground">
                  Đang tải danh sách nhóm...
                </div>
              ) : teams.length === 0 ? (
                <div className="text-xs text-muted-foreground italic">Khóa học chưa có nhóm nào</div>
              ) : (
                <CustomSelect
                  id="select-lecturer-team"
                  value={activeTeamId}
                  onChange={(val) => {
                    setSelectedTeamId(val);
                    setSelectedStudentId("");
                  }}
                  options={teams.map((t) => ({
                    value: t.teamId,
                    label: `Nhóm ${t.teamNo}: ${t.teamName}`,
                    subLabel: t.projectId ? "Đã liên kết dự án" : "Chưa liên kết dự án",
                  }))}
                />
              )}
            </div>

            {scope === "STUDENT" && (
              <div className="w-72">
                <label htmlFor="select-lecturer-student" className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Thành viên trong nhóm
                </label>
                {teamMembers.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic">Nhóm chưa có thành viên</div>
                ) : (
                  <CustomSelect
                    id="select-lecturer-student"
                    value={activeStudentId}
                    onChange={(val) => setSelectedStudentId(val)}
                    options={teamMembers.map((m) => ({
                      value: m.studentProfileId,
                      label: `${m.fullName} (${m.studentCode})`,
                      subLabel: m.role === "LEADER" ? "Trưởng nhóm" : "Thành viên",
                    }))}
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setSubTab("PROGRESS")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                subTab === "PROGRESS"
                  ? "bg-card text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileTextIcon className="w-3.5 h-3.5 text-primary" />
              <span>Tiến độ công việc</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab("RISK")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                subTab === "RISK"
                  ? "bg-card text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>Đánh giá rủi ro</span>
            </button>
          </div>
        </div>
      )}

      {(scope === "TEAM" || scope === "STUDENT") && !currentProjectId && (
        <div className="p-8 rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <AlertCircleIcon className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">Nhóm chưa liên kết dự án</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Để AI có dữ liệu phân tích, nhóm cần khởi tạo dự án và kết nối với Jira hoặc GitHub.
          </p>
        </div>
      )}

      {!(scope !== "COURSE" && !currentProjectId) && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                {scope === "COURSE"
                  ? "Báo cáo Tiến độ Toàn Khóa học"
                  : scope === "TEAM"
                    ? `${subTab === "PROGRESS" ? "Tiến độ Nhóm" : "Đánh giá Rủi ro"} — ${currentTeam?.teamName || "Nhóm"}`
                    : `${subTab === "PROGRESS" ? "Đóng góp Cá nhân" : "Đánh giá Rủi ro"} — ${currentStudent?.fullName || "Sinh viên"}`}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {(subTab === "PROGRESS" || scope === "COURSE") && currentAnalysis && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportDocx}
                  disabled={isExporting}
                  className="gap-2 text-xs cursor-pointer"
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
                onClick={handleTriggerAnalysis}
                disabled={isCurrentSubmitting}
                className="gap-2 text-xs cursor-pointer"
              >
                {isCurrentSubmitting ? (
                  <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
                )}
                {isCurrentSubmitting ? "Đang phân tích..." : "Chạy phân tích AI mới"}
              </Button>
            </div>
          </div>

          {isCurrentLoading ? (
            <div className="p-12 rounded-2xl border border-border bg-card flex flex-col items-center justify-center gap-3">
              <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Đang tải dữ liệu phân tích gần nhất từ máy chủ...</span>
            </div>
          ) : !currentAnalysis ? (
            <div className="p-12 rounded-2xl border border-dashed border-border bg-muted/10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <SparklesIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Chưa có dữ liệu phân tích</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                  Nhấn nút &ldquo;Chạy phân tích AI mới&rdquo; ở trên để hệ thống quét dữ liệu và sinh báo cáo tự động.
                </p>
              </div>
              <Button size="sm" onClick={handleTriggerAnalysis} disabled={isCurrentSubmitting} className="cursor-pointer">
                Phân tích ngay
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-muted/30 border border-border text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <AiStatusBadge status={currentAnalysis.status} />
                  {currentAnalysis.completedAt && (
                    <span className="text-muted-foreground font-mono ml-2">
                      Thời điểm: {new Date(currentAnalysis.completedAt).toLocaleString("vi-VN")}
                    </span>
                  )}
                </div>

                {currentAnalysis.providerDecision && (
                  <div className="flex items-center gap-4 text-muted-foreground font-mono">
                    {currentAnalysis.providerDecision.modelId && (
                      <span className="flex items-center gap-1">
                        <CpuIcon className="w-3.5 h-3.5 text-primary" />
                        Mô hình: {currentAnalysis.providerDecision.modelId}
                      </span>
                    )}
                    {currentAnalysis.status !== "FAILED" && currentAnalysis.providerDecision.latencyMs != null && (
                      <span>Độ trễ: {currentAnalysis.providerDecision.latencyMs} ms</span>
                    )}
                    {currentAnalysis.status !== "FAILED" && (currentAnalysis.providerDecision.inputUnits != null || currentAnalysis.providerDecision.outputUnits != null) && (
                      <span>Tokens: {(currentAnalysis.providerDecision.inputUnits ?? 0) + (currentAnalysis.providerDecision.outputUnits ?? 0)}</span>
                    )}
                  </div>
                )}
              </div>

              {currentAnalysis.status === "FAILED" ? (
                <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/10 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400 font-bold text-sm">
                    <AlertOctagonIcon className="w-5 h-5 shrink-0" />
                    <span>Phân tích AI không thành công</span>
                  </div>

                  <p className="text-xs text-foreground/90 leading-relaxed">
                    {getAiErrorMessage(currentAnalysis.failureCode || currentAnalysis.providerDecision?.safeErrorCode)}
                  </p>

                  <div className="p-3.5 rounded-xl bg-card/60 border border-red-500/20 text-xs space-y-1.5 text-muted-foreground">
                    <div className="font-semibold text-foreground">Gợi ý kiểm tra và khắc phục:</div>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Kiểm tra số dư Credit (số tiền khả dụng) hoặc hạn mức sử dụng trên tài khoản API OpenAI/Gemini cá nhân.</li>
                      <li>Kiểm tra cấu hình mô hình LLM trên máy chủ hoặc thiết lập lại API Key riêng.</li>
                      <li>Đảm bảo nhóm đã có commit hoặc task Jira để có dữ liệu đối soát.</li>
                    </ul>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-muted-foreground pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-700 dark:text-red-300 font-bold">
                      Mã lỗi: {currentAnalysis.failureCode || currentAnalysis.providerDecision?.safeErrorCode || "AI_ANALYSIS_FAILED"}
                    </span>
                    {currentAnalysis.providerDecision?.modelId && (
                      <span className="flex items-center gap-1">
                        <CpuIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        Mô hình: {currentAnalysis.providerDecision.modelId}
                      </span>
                    )}
                    {currentAnalysis.completedAt && (
                      <span>Thời điểm: {new Date(currentAnalysis.completedAt).toLocaleString("vi-VN")}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleTriggerAnalysis}
                      disabled={isCurrentSubmitting}
                      className="border-red-500/30 text-red-600 hover:bg-red-500/10 text-xs cursor-pointer"
                    >
                      Thử phân tích lại
                    </Button>
                    {onNavigateToCredentials && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={onNavigateToCredentials}
                        className="text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
                      >
                        <KeyRoundIcon className="size-3.5" />
                        Cấu hình API Key
                      </Button>
                    )}
                  </div>
                </div>
              ) : (subTab === "PROGRESS" || scope === "COURSE") && parsedNarrative ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                      <CardContent className="p-0 space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground">Điểm nổi bật</span>
                        <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          {parsedNarrative.highlights?.length || 0}
                        </div>
                        <span className="text-[10px] text-muted-foreground">mục ghi nhận</span>
                      </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                      <CardContent className="p-0 space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground">Vấn đề cần lưu ý</span>
                        <div className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                          {parsedNarrative.concerns?.length || 0}
                        </div>
                        <span className="text-[10px] text-muted-foreground">cần theo dõi</span>
                      </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                      <CardContent className="p-0 space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground">Điểm nghẽn tiến độ</span>
                        <div className="text-lg font-black text-red-600 dark:text-red-400 font-mono">
                          {parsedNarrative.blockers?.length || 0}
                        </div>
                        <span className="text-[10px] text-muted-foreground">cản trở công việc</span>
                      </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                      <CardContent className="p-0 space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground">Khuyến nghị của AI</span>
                        <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                          {parsedNarrative.recommendations?.length || 0}
                        </div>
                        <span className="text-[10px] text-muted-foreground">hành động gợi ý</span>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-2">
                    <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                      <SparklesIcon className="w-3.5 h-3.5" />
                      Nhận định tổng quan
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {parsedNarrative.overview}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                        <CheckCircle2Icon className="w-4 h-4" />
                        Điểm sáng và thành tựu nổi bật
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
                        Điểm nghẽn cản trở tiến độ
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
                        <span className="text-xs text-muted-foreground">Không ghi nhận điểm nghẽn.</span>
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
              ) : subTab === "RISK" && parsedRisk ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                      <CardContent className="p-0 space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground">Mức độ rủi ro</span>
                        <div className="text-lg font-black font-mono">
                          {parsedRisk.riskLevel}
                        </div>
                        <AiRiskBadge level={parsedRisk.riskLevel} />
                      </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                      <CardContent className="p-0 space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground">Độ tin cậy</span>
                        <div className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                          {(parsedRisk.confidence * 100).toFixed(0)}%
                        </div>
                        <span className="text-[10px] text-muted-foreground">chỉ số xác thực</span>
                      </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                      <CardContent className="p-0 space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground">Yếu tố nguy cơ</span>
                        <div className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                          {parsedRisk.riskReasons?.length || 0}
                        </div>
                        <span className="text-[10px] text-muted-foreground">cảnh báo nhận diện</span>
                      </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                      <CardContent className="p-0 space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground">Biện pháp khắc phục</span>
                        <div className="text-lg font-black text-primary font-mono">
                          {parsedRisk.recommendedActions?.length || 0}
                        </div>
                        <span className="text-[10px] text-muted-foreground">hành động đề xuất</span>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AiRiskBadge level={parsedRisk.riskLevel} />
                      <div>
                        <div className="text-sm font-bold text-foreground">
                          Mức độ rủi ro tổng thể: {parsedRisk.riskLevel}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          Độ tin cậy mô hình: {(parsedRisk.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {parsedRisk.humanReviewRecommended && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        <InfoIcon className="w-3.5 h-3.5" />
                        Khuyến nghị Giảng viên can thiệp trực tiếp
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-3">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-xs uppercase tracking-wider">
                        <AlertTriangleIcon className="w-4 h-4" />
                        Các yếu tố nguy cơ phát hiện
                      </div>
                      {parsedRisk.riskReasons?.length > 0 ? (
                        <div className="space-y-2.5">
                          {parsedRisk.riskReasons.map((reason, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-card border border-border/80 text-xs space-y-1">
                              <div className="font-semibold text-foreground flex items-center justify-between">
                                <span>{reason.code || `Yếu tố ${idx + 1}`}</span>
                                {reason.severity && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                                    {reason.severity}
                                  </span>
                                )}
                              </div>
                              <p className="text-muted-foreground">{reason.description}</p>
                              {reason.impact && (
                                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                  Hệ quả: {reason.impact}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Không phát hiện yếu tố nguy cơ đáng kể.</span>
                      )}
                    </div>

                    <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
                      <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                        <LightbulbIcon className="w-4 h-4" />
                        Hành động giảm thiểu rủi ro đề xuất
                      </div>
                      {parsedRisk.recommendedActions?.length > 0 ? (
                        <ul className="space-y-2">
                          {parsedRisk.recommendedActions.map((action, idx) => (
                            <li key={idx} className="p-3 rounded-xl bg-card border border-border/80 text-xs text-foreground flex items-start gap-2">
                              <span className="text-primary font-bold shrink-0">{idx + 1}.</span>
                              <span className="leading-relaxed">{action}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-muted-foreground">Chưa có đề xuất giảm thiểu rủi ro.</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-border bg-card text-xs text-muted-foreground">
                  Dữ liệu phân tích thô: {currentAnalysis.providerDecision?.structuredResultJson || "Đang xử lý"}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
