"use client";

import { useState } from "react";
import {
  UploadCloudIcon,
  FileSpreadsheetIcon,
  DownloadIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  MailIcon,
  UserCheckIcon,
  XIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import {
  usePreviewRosterImport,
  useConfirmRosterImport,
  useDownloadRosterTemplate,
} from "../hooks/use-academic";
import type { RosterPreviewResponse, RosterPreviewRow } from "../types/course-roster-types";

interface ImportStudentsDialogProps {
  courseId?: string | null;
  courseCode?: string;
  course?: { id: string; code: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onConfirmImport?: (_courseId: string) => void;
}

export function ImportStudentsDialog({
  courseId,
  courseCode,
  course,
  isOpen,
  onClose,
  onSuccess,
  onConfirmImport,
}: ImportStudentsDialogProps) {
  const effectiveCourseId = courseId || course?.id || null;
  const effectiveCourseCode = courseCode || course?.code || "course";

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<RosterPreviewResponse | null>(null);

  const previewMutation = usePreviewRosterImport();
  const confirmMutation = useConfirmRosterImport();
  const downloadMutation = useDownloadRosterTemplate();

  const handleDownloadTemplate = async () => {
    if (!effectiveCourseId) return;
    await downloadMutation.mutateAsync({
      courseId: effectiveCourseId,
      courseCode: effectiveCourseCode,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !effectiveCourseId) return;

    setSelectedFile(file);
    try {
      const res = await previewMutation.mutateAsync({ courseId: effectiveCourseId, file });
      setPreviewData(res);
      toast.success(`Đã đọc ${res.summary.totalRows} dòng từ file Excel.`);
    } catch {
      setPreviewData(null);
    }
  };

  const handleConfirm = async () => {
    if (!effectiveCourseId || !previewData) return;

    await confirmMutation.mutateAsync(
      {
        courseId: effectiveCourseId,
        data: { previewToken: previewData.previewToken },
      },
      {
        onSuccess: () => {
          if (onConfirmImport) {
            onConfirmImport(effectiveCourseId);
          }
          if (onSuccess) onSuccess();
          handleClose();
        },
      }
    );
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewData(null);
    onClose();
  };

  if (!isOpen) return null;

  const summary = previewData?.summary;
  const validCount = summary ? (summary.validRows ?? summary.validCount ?? 0) : 0;
  const existingCount = summary ? (summary.existingAccounts ?? summary.existingAccountsCount ?? 0) : 0;
  const invitesCount = summary ? (summary.newInvitations ?? summary.newInvitesCount ?? 0) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl p-6 rounded-3xl max-h-[92vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-border space-y-0 text-left shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <FileSpreadsheetIcon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Import Danh Sách Sinh Viên (Course Roster)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-mono">
                Lớp học phần: <strong className="text-foreground font-bold">{effectiveCourseCode || effectiveCourseId}</strong>
              </DialogDescription>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            disabled={downloadMutation.isPending}
            className="text-xs h-8 gap-1.5 cursor-pointer"
          >
            <DownloadIcon className="w-3.5 h-3.5" />
            {downloadMutation.isPending ? "Đang tải..." : "Tải Excel mẫu"}
          </Button>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 py-4 space-y-4">
          {!previewData ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl bg-muted/10 hover:bg-muted/20 transition-colors text-center">
              <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-bold text-foreground">Chọn file Excel danh sách sinh viên</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                File .xlsx chuẩn theo mẫu danh sách sinh viên gồm Mã sinh viên, Họ và tên, Email FPT/FE.
              </p>

              <label className="mt-4">
                <div className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 text-xs cursor-pointer gap-1.5 font-semibold shadow-xs transition-colors">
                  <UploadCloudIcon className="w-4 h-4" />
                  {previewMutation.isPending ? "Đang phân tích..." : "Tải file lên"}
                </div>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  disabled={previewMutation.isPending}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 bg-muted/30 border border-border rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <FileSpreadsheetIcon className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">{selectedFile?.name}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewData(null);
                  }}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <XIcon className="w-3.5 h-3.5 mr-1" /> Chọn file khác
                </Button>
              </div>

              {summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-card border border-border rounded-xl text-center space-y-0.5">
                    <p className="text-[11px] text-muted-foreground">Tổng số dòng</p>
                    <p className="font-mono text-lg font-extrabold text-foreground">{summary.totalRows}</p>
                  </div>
                  <div className="p-3 bg-card border border-border rounded-xl text-center space-y-0.5">
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Hợp lệ</p>
                    <p className="font-mono text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{validCount}</p>
                  </div>
                  <div className="p-3 bg-card border border-border rounded-xl text-center space-y-0.5">
                    <p className="text-[11px] text-primary">Đã có tài khoản</p>
                    <p className="font-mono text-lg font-extrabold text-primary">{existingCount}</p>
                  </div>
                  <div className="p-3 bg-card border border-border rounded-xl text-center space-y-0.5">
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">Gửi lời mời mới</p>
                    <p className="font-mono text-lg font-extrabold text-amber-600 dark:text-amber-400">{invitesCount}</p>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-muted/40 border-b border-border sticky top-0 z-10 backdrop-blur-md">
                    <TableRow>
                      <TableHead className="w-[60px] text-xs font-bold py-2.5 px-3 text-center">Dòng</TableHead>
                      <TableHead className="w-[110px] text-xs font-bold py-2.5 px-3">MSSV</TableHead>
                      <TableHead className="text-xs font-bold py-2.5 px-3">Họ và tên</TableHead>
                      <TableHead className="text-xs font-bold py-2.5 px-3">Email</TableHead>
                      <TableHead className="w-[140px] text-xs font-bold py-2.5 px-3 text-center">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/60">
                    {previewData.rows.map((r: RosterPreviewRow, idx: number) => (
                      <TableRow key={idx} className="hover:bg-muted/10">
                        <TableCell className="font-mono text-xs text-center py-2 px-3 text-muted-foreground">
                          {r.rowNumber}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-foreground py-2 px-3">
                          {r.studentCode}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-foreground py-2 px-3">
                          {r.fullName}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground py-2 px-3">
                          <div>{r.email}</div>
                          {(r.errorMessage || (r.errors && r.errors.length > 0)) && (
                            <p className="text-[11px] text-destructive font-sans font-medium mt-0.5">
                              {r.errorMessage || r.errors?.join(", ")}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-center py-2 px-3">
                          {r.action === "READY_ENROLL" || (r.valid && r.accountExists) ? (
                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0 inline-flex items-center gap-1">
                              <UserCheckIcon className="w-3 h-3" /> Ghi danh
                            </Badge>
                          ) : r.action === "READY_INVITE" || (r.valid && !r.accountExists) ? (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] px-1.5 py-0 inline-flex items-center gap-1">
                              <MailIcon className="w-3 h-3" /> Gửi thư mời
                            </Badge>
                          ) : r.action === "ALREADY_ENROLLED" ? (
                            <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] px-1.5 py-0 inline-flex items-center gap-1">
                              <CheckCircle2Icon className="w-3 h-3" /> Đã trong lớp
                            </Badge>
                          ) : r.action === "ALREADY_INVITED" ? (
                            <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] px-1.5 py-0 inline-flex items-center gap-1">
                              <MailIcon className="w-3 h-3" /> Đã gửi lời mời
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="text-[10px] px-1.5 py-0 inline-flex items-center gap-1"
                              title={r.errorMessage || r.errors?.join(", ") || "Dữ liệu không hợp lệ"}
                            >
                              <AlertCircleIcon className="w-3 h-3" /> Lỗi
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleClose} className="text-xs cursor-pointer">
            Hủy bỏ
          </Button>
          {previewData && (
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={confirmMutation.isPending || validCount === 0}
              className="text-xs font-semibold gap-1.5 cursor-pointer bg-primary text-primary-foreground"
            >
              <CheckCircle2Icon className="w-3.5 h-3.5" />
              {confirmMutation.isPending
                ? "Đang xác nhận..."
                : `Xác nhận Import (${validCount} sinh viên)`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
