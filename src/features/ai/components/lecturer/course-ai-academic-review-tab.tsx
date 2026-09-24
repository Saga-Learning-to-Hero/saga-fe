import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2Icon,
  XCircleIcon,
  Edit3Icon,
  Loader2Icon,
  GraduationCapIcon,
  SparklesIcon,
  TagIcon,
  XIcon,
  GitCommitIcon,
  CheckSquareIcon,
  UsersIcon,
  FolderGit2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/common/custom-select";
import { useCourseAcademicClassifications, AI_LECTURER_QUERY_KEYS } from "../../hooks/use-lecturer-ai";
import { AcademicAiService } from "../../api/academic-ai-api";
import type {
  LecturerCourseAcademicClassificationResponse,
  AiAcademicTargetType,
  AiAcademicClassificationStatus,
  AiArtifactType,
} from "../../types";

interface CourseAiAcademicReviewTabProps {
  courseId: string;
}

export function CourseAiAcademicReviewTab({ courseId }: CourseAiAcademicReviewTabProps) {
  const queryClient = useQueryClient();

  const [artifactTypeFilter, setArtifactTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const queryParams = {
    artifactType: artifactTypeFilter !== "ALL" ? (artifactTypeFilter as Extract<AiArtifactType, "TASK" | "COMMIT">) : undefined,
    status: statusFilter !== "ALL" ? (statusFilter as AiAcademicClassificationStatus) : undefined,
    page,
    size: pageSize,
  };

  const { data, isLoading, isPlaceholderData } = useCourseAcademicClassifications(
    courseId,
    queryParams
  );

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const [selectedRow, setSelectedRow] = useState<LecturerCourseAcademicClassificationResponse | null>(null);
  const [reviewAction, setReviewAction] = useState<"CONFIRM" | "REJECT" | "CORRECT" | null>(null);
  const [reason, setReason] = useState("");
  const [correctedTargetType, setCorrectedTargetType] = useState<AiAcademicTargetType>("PHASE");
  const [correctedTargetId, setCorrectedTargetId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenReview = (
    row: LecturerCourseAcademicClassificationResponse,
    action: "CONFIRM" | "REJECT" | "CORRECT"
  ) => {
    setSelectedRow(row);
    setReviewAction(action);
    setReason("");
    setCorrectedTargetType(row.classification.targetType || "PHASE");
    setCorrectedTargetId(row.classification.targetId || "");
  };

  const handleCloseReview = () => {
    setSelectedRow(null);
    setReviewAction(null);
    setReason("");
    setIsSubmitting(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRow || !reviewAction) return;

    setIsSubmitting(true);
    try {
      await AcademicAiService.reviewAcademicClassification(
        selectedRow.projectId,
        selectedRow.classification.id,
        {
          action: reviewAction,
          reason: reason.trim() || undefined,
          correctedTargetType: reviewAction === "CORRECT" ? correctedTargetType : undefined,
          correctedTargetId: reviewAction === "CORRECT" ? correctedTargetId.trim() : undefined,
        }
      );
      await queryClient.invalidateQueries({
        queryKey: AI_LECTURER_QUERY_KEYS.academicClassifications(courseId),
      });
      handleCloseReview();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Đối soát và Phê duyệt Phân loại Học thuật Toàn Khóa học
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tổng hợp toàn bộ các đề xuất AI gán Task và Commit vào từng Giai đoạn (Phase) hoặc Sản phẩm bàn giao (Deliverable) của Đề cương cho mọi nhóm trong lớp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-40">
            <CustomSelect
              id="filter-artifact-type"
              value={artifactTypeFilter}
              onChange={(val) => {
                setArtifactTypeFilter(val);
                setPage(0);
              }}
              options={[
                { value: "ALL", label: "Tất cả đối tượng" },
                { value: "TASK", label: "Task Jira" },
                { value: "COMMIT", label: "Commit Git" },
              ]}
            />
          </div>

          <div className="w-48">
            <CustomSelect
              id="filter-status"
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(0);
              }}
              options={[
                { value: "ALL", label: "Tất cả trạng thái" },
                { value: "PROPOSED", label: "Chờ duyệt (Proposed)" },
                { value: "CONFIRMED", label: "Đã duyệt (Confirmed)" },
                { value: "REJECTED", label: "Đã từ chối (Rejected)" },
                { value: "CORRECTED", label: "Đã điều chỉnh (Corrected)" },
              ]}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 rounded-2xl border border-border bg-card flex flex-col items-center justify-center gap-3">
          <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Đang tải dữ liệu phân loại học thuật toàn khóa học...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-border bg-muted/10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <GraduationCapIcon className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">Không có bản ghi phân loại học thuật nào</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Chưa có đề xuất phân loại nào phù hợp với bộ lọc hiện tại. Khi sinh viên đẩy commit hoặc cập nhật task có kích hoạt phân loại AI, các bản ghi sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="p-4">Dự án & Nhóm</th>
                    <th className="p-4">Đối tượng (Task / Commit)</th>
                    <th className="p-4">Mục tiêu đề cương (AI đề xuất)</th>
                    <th className="p-4">Độ tin cậy</th>
                    <th className="p-4">Tính pháp lý</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {items.map((row) => {
                    const { classification, authoritative } = row;
                    const isTask = classification.artifactType === "TASK";

                    return (
                      <tr key={classification.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-medium">
                          <div className="flex items-center gap-1.5 text-foreground font-semibold">
                            <UsersIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{row.teamName || "Chưa chia nhóm"}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <FolderGit2Icon className="w-3 h-3 shrink-0" />
                            <span>{row.projectName}</span>
                          </div>
                        </td>

                        <td className="p-4 max-w-xs">
                          {isTask ? (
                            <div>
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold text-[11px]">
                                <CheckSquareIcon className="w-3 h-3" />
                                {row.taskExternalKey || "JIRA-TASK"}
                              </div>
                              <div className="text-foreground font-medium mt-1 truncate" title={row.taskTitle || ""}>
                                {row.taskTitle || "Không có tiêu đề task"}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-bold text-[11px]">
                                <GitCommitIcon className="w-3 h-3" />
                                {row.commitSha ? row.commitSha.slice(0, 7) : classification.artifactRevision.slice(0, 7)}
                              </div>
                              <div className="text-foreground font-medium mt-1 truncate font-mono text-[11px]" title={row.commitMessage || ""}>
                                {row.commitMessage || "Không có thông điệp commit"}
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="font-semibold text-foreground">{classification.targetName}</div>
                          <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                            <TagIcon className="w-3 h-3 text-muted-foreground" />
                            <span>{classification.targetType} • {classification.targetCode}</span>
                          </div>
                        </td>

                        <td className="p-4 font-mono">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold text-[11px]">
                            <SparklesIcon className="w-3 h-3" />
                            {(classification.confidence * 100).toFixed(0)}%
                          </span>
                        </td>

                        <td className="p-4">
                          {authoritative ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              <ShieldCheckIcon className="w-3 h-3" />
                              Chính thức
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                              Đề xuất AI
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          {classification.status === "PROPOSED" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Chờ duyệt
                            </span>
                          ) : classification.status === "CONFIRMED" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Đã chấp thuận
                            </span>
                          ) : classification.status === "REJECTED" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                              Đã từ chối
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              Đã điều chỉnh
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          {classification.status === "PROPOSED" && (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenReview(row, "CONFIRM")}
                                className="h-7 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border-emerald-500/30 text-xs cursor-pointer"
                              >
                                <CheckCircle2Icon className="w-3.5 h-3.5 mr-1" />
                                Duyệt
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenReview(row, "CORRECT")}
                                className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 border-blue-500/30 text-xs cursor-pointer"
                              >
                                <Edit3Icon className="w-3.5 h-3.5 mr-1" />
                                Sửa
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenReview(row, "REJECT")}
                                className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-500/30 text-xs cursor-pointer"
                              >
                                <XCircleIcon className="w-3.5 h-3.5 mr-1" />
                                Bác bỏ
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
            <div>
              Tổng số bản ghi: <span className="font-semibold text-foreground font-mono">{total}</span>
              {totalPages > 1 && (
                <span> • Trang <span className="font-semibold text-foreground font-mono">{page + 1}</span> / <span className="font-semibold text-foreground font-mono">{totalPages}</span></span>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 0 || isPlaceholderData}
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  className="h-8 px-2.5 text-xs cursor-pointer"
                >
                  <ChevronLeftIcon className="w-3.5 h-3.5 mr-1" />
                  Trang trước
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages - 1 || isPlaceholderData}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="h-8 px-2.5 text-xs cursor-pointer"
                >
                  Trang sau
                  <ChevronRightIcon className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedRow && reviewAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/20">
              <h3 className="text-base font-extrabold text-foreground">
                {reviewAction === "CONFIRM"
                  ? "Xác nhận phân loại của AI"
                  : reviewAction === "REJECT"
                    ? "Bác bỏ đề xuất phân loại"
                    : "Điều chỉnh mục tiêu đề cương"}
              </h3>
              <button onClick={handleCloseReview} className="rounded-xl p-1.5 hover:bg-muted cursor-pointer">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-muted-foreground font-medium">
                    <span>Nhóm: {selectedRow.teamName || "N/A"}</span>
                    <span>Dự án: {selectedRow.projectName}</span>
                  </div>
                  <div className="font-semibold text-foreground text-sm">{selectedRow.classification.targetName}</div>
                  <div className="font-mono text-muted-foreground text-[11px]">
                    Loại: {selectedRow.classification.targetType} • Mã: {selectedRow.classification.targetCode} • Độ tin cậy: {(selectedRow.classification.confidence * 100).toFixed(0)}%
                  </div>
                </div>

                {reviewAction === "CORRECT" && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-foreground block">
                      Loại mục tiêu cần hiệu chỉnh
                    </label>
                    <CustomSelect
                      id="corrected-target-type"
                      value={correctedTargetType}
                      onChange={(val) => setCorrectedTargetType(val as AiAcademicTargetType)}
                      options={[
                        { value: "PHASE", label: "Giai đoạn đề cương (Phase)" },
                        { value: "EXPECTED_DELIVERABLE", label: "Sản phẩm bàn giao (Deliverable)" },
                      ]}
                    />

                    <label className="text-xs font-semibold text-foreground block">
                      ID Mục tiêu chính xác trong Syllabus
                    </label>
                    <Input
                      required
                      placeholder="Nhập UUID của Phase hoặc Deliverable..."
                      value={correctedTargetId}
                      onChange={(e) => setCorrectedTargetId(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    {reviewAction === "CONFIRM" ? "Ghi chú phê duyệt (Tùy chọn)" : "Lý do xem xét (Bắt buộc)"}
                  </label>
                  <textarea
                    required={reviewAction !== "CONFIRM"}
                    rows={3}
                    placeholder={
                      reviewAction === "CONFIRM"
                        ? "Nhập nhận xét hoặc để trống..."
                        : "Giải thích lý do bác bỏ hoặc thay đổi..."
                    }
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-border/60 flex items-center justify-end gap-2.5 shrink-0 bg-muted/20">
                <Button type="button" variant="outline" onClick={handleCloseReview}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || (reviewAction !== "CONFIRM" && !reason.trim())}
                  variant={reviewAction === "REJECT" ? "destructive" : "default"}
                >
                  {isSubmitting ? (
                    <Loader2Icon className="w-4 h-4 animate-spin mr-1.5" />
                  ) : null}
                  Xác nhận
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
