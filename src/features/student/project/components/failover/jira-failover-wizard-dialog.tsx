"use client";

import { useMemo, useState } from "react";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  InfoIcon,
  Loader2Icon,
  RefreshCwIcon,
  ShieldAlertIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/common/custom-select";
import {
  useFailoverExecute,
  useFailoverPreview,
  useFailoverRetry,
  useFailoverRun,
  useJiraSourceDisconnect,
} from "../../hooks/use-jira-sources";
import { JiraReconcileItemDialog } from "./jira-reconcile-item-dialog";
import type {
  FailoverRunItem,
  JiraSourceSummary,
} from "../../types/jira-sources";

interface JiraFailoverWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  source: JiraSourceSummary;
  availableSources: JiraSourceSummary[];
}

export function JiraFailoverWizardDialog({
  open,
  onOpenChange,
  projectId,
  source,
  availableSources,
}: JiraFailoverWizardDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [targetIntegrationId, setTargetIntegrationId] = useState<string>("");
  const [targetSprintId, setTargetSprintId] = useState<string>("");
  const [defaultIssueTypeId, setDefaultIssueTypeId] = useState<string>("");
  const [revokeSource, setRevokeSource] = useState(true);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [runId, setRunId] = useState<string>("");
  const [reconcileItem, setReconcileItem] = useState<FailoverRunItem | null>(null);

  const activeTargetSources = useMemo(() => {
    return availableSources.filter(
      (s) => s.integrationId !== source.integrationId && s.connectionStatus === "ACTIVE"
    );
  }, [availableSources, source.integrationId]);

  const targetSource = useMemo(() => {
    return availableSources.find((s) => s.integrationId === targetIntegrationId);
  }, [availableSources, targetIntegrationId]);

  const previewQuery = useFailoverPreview(
    projectId,
    source.integrationId,
    {
      targetIntegrationId,
      targetSprintId: targetSprintId && targetSprintId !== "backlog" ? targetSprintId : null,
      defaultIssueTypeId: defaultIssueTypeId || null,
      page: 0,
      size: 100,
    },
    open && step >= 2 && Boolean(targetIntegrationId)
  );

  const executeMutation = useFailoverExecute(projectId, source.integrationId);
  const retryMutation = useFailoverRetry(projectId, source.integrationId);
  const disconnectMutation = useJiraSourceDisconnect(projectId);
  const runQuery = useFailoverRun(projectId, source.integrationId, runId || undefined);

  if (!open) return null;

  const handleSelectAllEligible = () => {
    if (!previewQuery.data) return;
    const eligibleIds = previewQuery.data.items
      .filter((item) => item.readiness === "READY" || item.readiness === "WARNING")
      .map((item) => item.sourceTaskId);
    setSelectedTaskIds(eligibleIds);
  };

  const handleToggleTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleExecute = async () => {
    if (!targetIntegrationId || selectedTaskIds.length === 0) return;

    try {
      const response = await executeMutation.mutateAsync({
        targetIntegrationId,
        targetSprintId: targetSprintId && targetSprintId !== "backlog" ? targetSprintId : null,
        defaultIssueTypeId: defaultIssueTypeId || null,
        revokeSource,
        sourceTaskIds: selectedTaskIds,
      });
      setRunId(response.runId);
      setStep(4);
    } catch {
      // Error handled by mutation toast
    }
  };

  const handleSoftRevokeSource = async () => {
    try {
      await disconnectMutation.mutateAsync(source.integrationId);
    } catch {
      // Error handled by mutation toast
    }
  };

  const handleRetry = async () => {
    if (!runId) return;
    try {
      await retryMutation.mutateAsync(runId);
    } catch {
      // Error handled by mutation toast
    }
  };

  const handleClose = () => {
    setStep(1);
    setTargetIntegrationId("");
    setTargetSprintId("");
    setDefaultIssueTypeId("");
    setSelectedTaskIds([]);
    setRunId("");
    setReconcileItem(null);
    onOpenChange(false);
  };

  const targetSourceOptions = activeTargetSources.map((s) => ({
    value: s.integrationId,
    label: `${s.projectKey} · ${s.siteName}`,
    subLabel: `Board: ${s.boardId ?? "Mặc định"}`,
  }));

  const targetSprintOptions = [
    { value: "backlog", label: "Đưa vào Backlog dự án đích", subLabel: "Không thuộc Sprint" },
    ...(previewQuery.data?.targetOptions.sprints ?? []).map((sp) => ({
      value: sp.id,
      label: sp.name,
      subLabel: `Trạng thái: ${sp.state}`,
    })),
  ];

  const defaultIssueTypeOptions = [
    { value: "", label: "Tự động map theo tên issue type" },
    ...(previewQuery.data?.targetOptions.issueTypes ?? [])
      .filter((it) => !it.subtask)
      .map((it) => ({
        value: it.id,
        label: it.name,
        subLabel: `Mã: ${it.id}`,
      })),
  ];

  const previewCounts = previewQuery.data?.counts;
  const runData = runQuery.data;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <RefreshCwIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Chuyển giao công việc Jira dở dang (Failover Wizard)
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Di chuyển an toàn các task dở dang từ nguồn sự cố sang nguồn Jira mới
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-2.5 bg-muted/30 border-b border-border/50 flex items-center gap-2 text-xs overflow-x-auto">
          <div className={`flex items-center gap-1.5 font-semibold ${step === 1 ? "text-primary" : "text-muted-foreground"}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">1</span>
            <span>Chọn nguồn đích</span>
          </div>
          <ChevronRightIcon className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
          <div className={`flex items-center gap-1.5 font-semibold ${step === 2 ? "text-primary" : "text-muted-foreground"}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">2</span>
            <span>Đối soát & Chọn Task</span>
          </div>
          <ChevronRightIcon className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
          <div className={`flex items-center gap-1.5 font-semibold ${step === 3 ? "text-primary" : "text-muted-foreground"}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">3</span>
            <span>Xác nhận</span>
          </div>
          <ChevronRightIcon className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
          <div className={`flex items-center gap-1.5 font-semibold ${step === 4 ? "text-primary" : "text-muted-foreground"}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">4</span>
            <span>Tiến độ thực hiện</span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-2">
                <p className="text-xs font-bold text-foreground">Nguồn Jira chuyển đi (Source):</p>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-primary">{source.projectKey}</span>
                    <span className="text-muted-foreground"> · {source.siteName}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {source.connectionStatus}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">
                  Chọn nguồn Jira đích hoạt động (Target Jira Source):
                </label>
                {activeTargetSources.length === 0 ? (
                  <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs text-warning space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <ShieldAlertIcon className="w-4 h-4" />
                      Chưa có nguồn Jira đích khả dụng
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      Để thực hiện chuyển giao, dự án cần ít nhất một nguồn Jira khác đang ở trạng thái ACTIVE. Hãy sử dụng nút <strong>&quot;Thêm nguồn Jira&quot;</strong> bên ngoài để kết nối nguồn mới trước.
                    </p>
                  </div>
                ) : (
                  <CustomSelect
                    value={targetIntegrationId}
                    onChange={setTargetIntegrationId}
                    options={targetSourceOptions}
                    placeholder="Chọn nguồn Jira đích..."
                  />
                )}
              </div>

              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3.5 flex items-start gap-2.5 text-xs text-muted-foreground">
                <InfoIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <p className="font-bold text-foreground">Quy tắc chuyển giao an toàn:</p>
                  <p>• Chỉ các công việc chưa hoàn thành (TODO, IN_PROGRESS, IN_REVIEW, BLOCKED) mới được chuyển giao.</p>
                  <p>• Toàn bộ công việc DONE được giữ nguyên tại nguồn cũ để bảo toàn tính toàn vẹn minh chứng học thuật.</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {previewQuery.isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
                  <span>Đang phân tích cấu trúc công việc và tùy chọn nguồn đích...</span>
                </div>
              ) : previewQuery.isError ? (
                <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-xs text-danger space-y-2">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertCircleIcon className="w-4 h-4" />
                    Không thể phân tích dữ liệu chuyển giao
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Vui lòng kiểm tra lại quyền truy cập hoặc thử lại sau ít phút.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Ứng viên dở dang</p>
                      <p className="font-mono font-bold text-base text-foreground">
                        {previewCounts?.eligible ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Bỏ qua (DONE)</p>
                      <p className="font-mono font-bold text-base text-muted-foreground">
                        {previewCounts?.skippedDone ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5">
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Sẵn sàng (Ready)</p>
                      <p className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
                        {previewCounts?.ready ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-2.5">
                      <p className="text-[10px] text-amber-600 dark:text-amber-400">Cảnh báo / Chặn</p>
                      <p className="font-mono font-bold text-base text-amber-600 dark:text-amber-400">
                        {(previewCounts?.withWarnings ?? 0) + (previewCounts?.blocked ?? 0)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Sprint trên Jira đích:</label>
                      <CustomSelect
                        value={targetSprintId || "backlog"}
                        onChange={setTargetSprintId}
                        options={targetSprintOptions}
                        placeholder="Chọn Sprint đích..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Issue Type dự phòng (Fallback):</label>
                      <CustomSelect
                        value={defaultIssueTypeId}
                        onChange={setDefaultIssueTypeId}
                        options={defaultIssueTypeOptions}
                        placeholder="Mặc định map theo tên..."
                      />
                    </div>
                  </div>

                  {(!targetSprintId || targetSprintId === "backlog") && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                      <AlertTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed">
                        <strong>Lưu ý:</strong> Task chuyển vào Backlog sẽ chưa đủ điều kiện tính điểm đóng góp (Slicing Pie) cho đến khi được đưa vào một Sprint chính thức trên Jira đích.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <p className="font-bold text-foreground">
                        Danh sách công việc ứng viên ({previewQuery.data?.items.length ?? 0}):
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAllEligible}
                        className="h-7 text-[11px] text-primary"
                      >
                        Chọn toàn bộ task hợp lệ ({previewCounts?.ready ?? 0})
                      </Button>
                    </div>

                    <div className="rounded-2xl border border-border/80 overflow-hidden max-h-56 overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-muted/40 sticky top-0 border-b border-border/60 text-[11px] text-muted-foreground font-semibold">
                          <tr>
                            <th className="p-2.5 w-10 text-center">#</th>
                            <th className="p-2.5">Mã Task & Tiêu đề</th>
                            <th className="p-2.5">Trạng thái</th>
                            <th className="p-2.5">Đánh giá khả chuyển</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {previewQuery.data?.items.map((item) => {
                            const isSelectable = item.readiness === "READY" || item.readiness === "WARNING";
                            const isSelected = selectedTaskIds.includes(item.sourceTaskId);

                            return (
                              <tr
                                key={item.sourceTaskId}
                                className={`hover:bg-muted/20 transition-colors ${!isSelectable ? "opacity-50" : ""}`}
                              >
                                <td className="p-2.5 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={!isSelectable}
                                    onChange={() => handleToggleTask(item.sourceTaskId)}
                                    className="rounded border-border text-primary cursor-pointer"
                                  />
                                </td>
                                <td className="p-2.5">
                                  <div className="font-mono font-bold text-foreground text-[11px]">
                                    {item.externalKey}
                                  </div>
                                  <div className="text-muted-foreground truncate max-w-xs text-[11px]">
                                    {item.title}
                                  </div>
                                </td>
                                <td className="p-2.5">
                                  <Badge variant="outline" className="text-[10px]">
                                    {item.status}
                                  </Badge>
                                </td>
                                <td className="p-2.5">
                                  {item.readiness === "READY" && (
                                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">
                                      Sẵn sàng
                                    </Badge>
                                  )}
                                  {item.readiness === "WARNING" && (
                                    <div className="space-y-0.5">
                                      <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10 text-[10px]">
                                        Cảnh báo mapping
                                      </Badge>
                                      {item.warnings.length > 0 && (
                                        <p className="text-[10px] text-muted-foreground truncate max-w-44">
                                          {item.warnings[0]}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  {item.readiness === "BLOCKED" && (
                                    <Badge variant="outline" className="text-rose-500 border-rose-500/30 bg-rose-500/10 text-[10px]">
                                      Bị chặn
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <input
                      type="checkbox"
                      id="revoke-source-check"
                      checked={revokeSource}
                      onChange={(e) => setRevokeSource(e.target.checked)}
                      className="rounded border-border text-primary cursor-pointer"
                    />
                    <label htmlFor="revoke-source-check" className="cursor-pointer text-muted-foreground">
                      Tự động ngắt kết nối (soft-revoke) nguồn Jira cũ sau khi hoàn tất chuyển giao.
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 space-y-3">
                <div className="flex items-center gap-2 text-warning font-bold text-sm">
                  <AlertTriangleIcon className="w-5 h-5" />
                  <span>Xác nhận chuyển giao công việc dở dang</span>
                </div>
                <div className="text-xs text-foreground space-y-2 leading-relaxed">
                  <p>
                    Bạn đang chuẩn bị chuyển giao{" "}
                    <strong className="text-primary font-mono text-sm">{selectedTaskIds.length}</strong> công việc từ nguồn{" "}
                    <strong className="font-mono">{source.projectKey}</strong> sang nguồn{" "}
                    <strong className="font-mono">{targetSource?.projectKey}</strong>.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-[11px]">
                    <li>Các task được chọn sẽ được tạo mới trên Jira đích tương ứng.</li>
                    <li>Nguồn gốc sẽ chuyển sang trạng thái <strong>REVOKED</strong> (Lịch sử).</li>
                    <li>
                      <strong>Bảo toàn minh chứng:</strong> Toàn bộ commit, work session và tệp đính kèm trước đây vẫn thuộc về Task cũ, không sao chép sang Jira đích.
                    </li>
                    <li>Task mới sẽ có liên kết dòng dõi (lineage) trỏ về Task gốc để phục vụ đối soát.</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nguồn cũ:</span>
                  <span className="font-mono font-bold text-foreground">{source.projectKey} ({source.siteName})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nguồn mới:</span>
                  <span className="font-mono font-bold text-primary">{targetSource?.projectKey} ({targetSource?.siteName})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sprint đích:</span>
                  <span className="font-semibold text-foreground">
                    {targetSprintId && targetSprintId !== "backlog"
                      ? previewQuery.data?.targetOptions.sprints.find((s) => s.id === targetSprintId)?.name
                      : "Backlog dự án"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Tiến độ chuyển giao công việc</h4>
                    <p className="text-[11px] text-muted-foreground font-mono">Run ID: {runId}</p>
                  </div>
                  {runData?.status === "PENDING" && (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">
                      Đang chuẩn bị...
                    </Badge>
                  )}
                  {runData?.status === "RUNNING" && (
                    <Badge className="bg-blue-600 text-white gap-1">
                      <Loader2Icon className="w-3 h-3 animate-spin" />
                      Đang chuyển giao...
                    </Badge>
                  )}
                  {runData?.status === "SUCCEEDED" && (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0">
                      Hoàn thành
                    </Badge>
                  )}
                  {runData?.status === "PARTIAL" && (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                      Hoàn thành một phần
                    </Badge>
                  )}
                  {runData?.status === "FAILED" && (
                    <Badge variant="outline" className="text-rose-500 border-rose-500/30 bg-rose-500/10">
                      Thất bại
                    </Badge>
                  )}
                  {runData?.status === "RECONCILIATION_REQUIRED" && (
                    <Badge variant="outline" className="text-warning border-warning/40 bg-warning/10">
                      Cần đối soát thủ công
                    </Badge>
                  )}
                </div>
              </div>

              {source.connectionStatus === "ACTIVE" && (
                <div className="rounded-2xl border border-warning/40 bg-warning/10 p-3.5 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2 text-warning">
                    <ShieldAlertIcon className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Nguồn Jira cũ vẫn đang ở trạng thái Hoạt động (ACTIVE)</p>
                      <p className="text-[11px] text-muted-foreground">
                        Backend yêu cầu nguồn cũ phải được ngắt kết nối (REVOKED) trước khi có thể thử lại các ca lỗi.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleSoftRevokeSource}
                    disabled={disconnectMutation.isPending}
                    className="h-7 text-[11px] shrink-0 border-warning/40 text-warning hover:bg-warning/10"
                  >
                    {disconnectMutation.isPending ? "Đang ngắt..." : "Ngắt kết nối nguồn"}
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-bold text-foreground">Chi tiết các công việc ({runData?.items.length ?? 0}):</p>
                <div className="rounded-2xl border border-border/80 overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/40 sticky top-0 border-b border-border/60 text-[11px] text-muted-foreground font-semibold">
                      <tr>
                        <th className="p-2.5">Task nguồn</th>
                        <th className="p-2.5">Trạng thái xử lý</th>
                        <th className="p-2.5">Kết quả chuyển giao</th>
                        <th className="p-2.5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {runData?.items.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-2.5">
                            <div className="font-mono font-bold text-foreground text-[11px]">
                              {item.sourceExternalKey}
                            </div>
                            <div className="text-muted-foreground truncate max-w-xs text-[11px]">
                              {item.sourceTitle}
                            </div>
                          </td>
                          <td className="p-2.5">
                            {item.status === "PENDING" && <span className="text-muted-foreground text-[11px]">Đang chờ</span>}
                            {item.status === "CREATING" && (
                              <span className="inline-flex items-center gap-1 text-primary text-[11px]">
                                <Loader2Icon className="w-3 h-3 animate-spin" /> Đang tạo...
                              </span>
                            )}
                            {item.status === "REMOTE_BOUND" && (
                              <Badge variant="outline" className="text-blue-500 border-blue-500/30 bg-blue-500/10 text-[10px]">
                                Đã tạo trên Jira, đang lưu
                              </Badge>
                            )}
                            {item.status === "SUCCEEDED" && (
                              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">
                                Thành công
                              </Badge>
                            )}
                            {item.status === "FAILED" && (
                              <Badge variant="outline" className="text-rose-500 border-rose-500/30 bg-rose-500/10 text-[10px]">
                                Lỗi: {item.errorCode || "Tạo thất bại"}
                              </Badge>
                            )}
                            {item.status === "REMOTE_OUTCOME_UNKNOWN" && (
                              <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10 text-[10px]">
                                Kết quả không rõ
                              </Badge>
                            )}
                          </td>
                          <td className="p-2.5">
                            {item.targetExternalKey ? (
                              <div className="flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                                <span>{item.sourceExternalKey}</span>
                                <ArrowRightIcon className="w-3 h-3" />
                                <span>{item.targetExternalKey}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-[11px]">—</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right">
                            {item.status === "REMOTE_OUTCOME_UNKNOWN" && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setReconcileItem(item)}
                                className="h-6.5 text-[10px] rounded-lg border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                              >
                                Đối soát & Liên kết
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/60 flex items-center justify-between gap-2.5 shrink-0 bg-muted/20">
          <div>
            {step === 4 && runData && (runData.status === "PARTIAL" || runData.status === "FAILED") && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={retryMutation.isPending}
                className="h-8.5 rounded-xl text-xs gap-1.5 border-blue-500/40 text-blue-600"
              >
                <RefreshCwIcon className={`w-3.5 h-3.5 ${retryMutation.isPending ? "animate-spin" : ""}`} />
                <span>Thử lại các ca lỗi an toàn</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step === 1 && (
              <>
                <Button type="button" variant="outline" size="sm" onClick={handleClose} className="h-8.5 rounded-xl text-xs">
                  Hủy
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!targetIntegrationId}
                  onClick={() => setStep(2)}
                  className="h-8.5 rounded-xl text-xs font-semibold gap-1.5"
                >
                  <span>Tiếp tục đối soát</span>
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <Button type="button" variant="outline" size="sm" onClick={() => setStep(1)} className="h-8.5 rounded-xl text-xs">
                  Quay lại
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={selectedTaskIds.length === 0}
                  onClick={() => setStep(3)}
                  className="h-8.5 rounded-xl text-xs font-semibold gap-1.5"
                >
                  <span>Xem xác nhận ({selectedTaskIds.length} tasks)</span>
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </Button>
              </>
            )}

            {step === 3 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(2)}
                  disabled={executeMutation.isPending}
                  className="h-8.5 rounded-xl text-xs"
                >
                  Quay lại chỉnh sửa
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleExecute}
                  disabled={executeMutation.isPending}
                  className="h-8.5 rounded-xl text-xs font-semibold gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {executeMutation.isPending ? (
                    <>
                      <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang khởi tạo chuyển giao...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2Icon className="w-3.5 h-3.5" />
                      <span>Xác nhận & Bắt đầu chuyển giao</span>
                    </>
                  )}
                </Button>
              </>
            )}

            {step === 4 && (
              <Button
                type="button"
                size="sm"
                onClick={handleClose}
                className="h-8.5 rounded-xl text-xs font-semibold"
              >
                Đóng & Cập nhật danh sách
              </Button>
            )}
          </div>
        </div>
      </div>

      <JiraReconcileItemDialog
        open={Boolean(reconcileItem)}
        onOpenChange={(open) => !open && setReconcileItem(null)}
        projectId={projectId}
        sourceIntegrationId={source.integrationId}
        runId={runId}
        item={reconcileItem}
        targetProjectKey={targetSource?.projectKey}
      />
    </div>
  );
}
