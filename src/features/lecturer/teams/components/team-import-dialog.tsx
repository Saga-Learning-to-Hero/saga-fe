"use client";

import { useState } from "react";
import {
  CheckCircle2Icon,
  DownloadIcon,
  FileSpreadsheetIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TeamPreviewTable } from "./team-preview-table";
import {
  getTeamImportErrorMessage,
  shouldClearTeamPreview,
  useConfirmTeamImport,
  useDownloadTeamTemplate,
  usePreviewTeamImport,
} from "../hooks/use-lecturer-teams";
import {
  canConfirmTeamImport,
  TEAM_TEMPLATE_FILENAME,
  type TeamPreviewResponse,
} from "../types/lecturer-team";
import { getApiErrorCode } from "@/lib/api-error";

interface TeamImportDialogProps {
  courseId: string;
  courseCode?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onForbidden?: () => void;
}

export function TeamImportDialog({
  courseId,
  courseCode,
  isOpen,
  onOpenChange,
  onForbidden,
}: TeamImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<TeamPreviewResponse | null>(null);

  const downloadMutation = useDownloadTeamTemplate();
  const previewMutation = usePreviewTeamImport();
  const confirmMutation = useConfirmTeamImport();

  const resetPreviewState = () => {
    setSelectedFile(null);
    setPreviewData(null);
    previewMutation.reset();
    confirmMutation.reset();
  };

  const handleClose = () => {
    resetPreviewState();
    onOpenChange(false);
  };

  const handleForbidden = (error: unknown) => {
    if (getApiErrorCode(error) === "LECTURER_COURSE_FORBIDDEN") {
      toast.error(getTeamImportErrorMessage(error));
      handleClose();
      onForbidden?.();
      return true;
    }
    return false;
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadMutation.mutateAsync(courseId);
    } catch (error) {
      if (!handleForbidden(error)) {
        toast.error(getTeamImportErrorMessage(error));
      }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setSelectedFile(file);
    setPreviewData(null);

    try {
      const preview = await previewMutation.mutateAsync({ courseId, file });
      setPreviewData(preview);
      toast.success(`Đã phân tích ${preview.summary.totalRows} dòng từ file Excel.`);
    } catch (error) {
      setPreviewData(null);
      if (!handleForbidden(error)) {
        toast.error(getTeamImportErrorMessage(error));
      }
    }
  };

  const handleConfirm = async () => {
    if (!canConfirmTeamImport(previewData) || !previewData) return;

    try {
      await confirmMutation.mutateAsync({
        courseId,
        data: { previewToken: previewData.previewToken },
      });
      handleClose();
    } catch (error) {
      if (handleForbidden(error)) return;

      const code = getApiErrorCode(error);
      toast.error(getTeamImportErrorMessage(error));

      if (shouldClearTeamPreview(error)) {
        resetPreviewState();
        return;
      }

      if (code === "TEAM_CONFIRM_BLOCKED" || code === "TEAM_LEADER_INVALID") {
        return;
      }
    }
  };

  const confirmEnabled = canConfirmTeamImport(previewData) && !confirmMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? handleClose() : onOpenChange(true))}>
      <DialogContent className="flex max-h-[92vh] max-w-5xl flex-col overflow-hidden rounded-3xl p-0">
        <DialogHeader className="shrink-0 space-y-0 border-b border-border bg-muted/20 p-5 text-left">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileSpreadsheetIcon className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold">
                  Phân nhóm bằng Excel
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Lớp học phần:{" "}
                  <strong className="font-mono text-foreground">
                    {courseCode || courseId}
                  </strong>
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleDownloadTemplate()}
              disabled={downloadMutation.isPending}
              className="h-8 cursor-pointer gap-1.5 text-xs"
            >
              <DownloadIcon className="size-3.5" />
              {downloadMutation.isPending ? "Đang tải..." : `Tải ${TEAM_TEMPLATE_FILENAME}`}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-2xl border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Quy tắc file mẫu backend</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Sheet phải tên đúng <span className="font-mono">Team_Assignment</span>.</li>
              <li>Chỉ sửa ba cột: TeamNo (số nguyên dương), TeamName, TeamRole (Leader hoặc Member).</li>
              <li>Không sửa Class, FullName, StudentCode, Email. Không dùng MENTOR.</li>
              <li>Mọi sinh viên ACTIVE phải xuất hiện đúng một lần; mỗi TeamNo đúng một Leader.</li>
              <li>Một sinh viên chỉ thuộc một nhóm. Workflow: tải mẫu → preview → xác nhận.</li>
            </ul>
          </div>

          {!previewData ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/10 p-8 text-center">
              <UploadCloudIcon className="mb-3 size-10 text-muted-foreground" />
              <p className="text-sm font-bold">Tải file Excel đã điền TeamNo / TeamName / TeamRole</p>
              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                Kết quả hợp lệ do backend quyết định. Giới hạn dung lượng hiện tại là 2 MB.
              </p>
              <label className="mt-4">
                <div className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground">
                  <UploadCloudIcon className="size-4" />
                  {previewMutation.isPending ? "Đang phân tích..." : "Chọn file Excel"}
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(event) => void handleFileChange(event)}
                  disabled={previewMutation.isPending}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/30 p-3">
                <div className="flex min-w-0 items-center gap-2 text-xs">
                  <FileSpreadsheetIcon className="size-4 text-primary" />
                  <span className="truncate font-semibold">{selectedFile?.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetPreviewState}
                  className="h-7 cursor-pointer text-xs"
                >
                  <XIcon className="mr-1 size-3.5" />
                  Chọn file khác
                </Button>
              </div>
              <TeamPreviewTable preview={previewData} />
            </div>
          )}
        </div>

        <DialogFooter className="m-0 shrink-0 rounded-none">
          <Button variant="outline" size="sm" onClick={handleClose} className="cursor-pointer text-xs">
            Đóng
          </Button>
          <Button
            size="sm"
            onClick={() => void handleConfirm()}
            disabled={!confirmEnabled}
            className="cursor-pointer gap-1.5 text-xs font-semibold"
          >
            <CheckCircle2Icon className="size-3.5" />
            {confirmMutation.isPending ? "Đang xác nhận..." : "Xác nhận phân nhóm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
