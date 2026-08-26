"use client";

import { useState } from "react";
import {
  UploadCloudIcon,
  FileSpreadsheetIcon,
  DownloadIcon,
  CheckCircle2Icon,
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
import type { Course, ImportedStudentPreview } from "../types/academic-management";

interface ImportStudentsDialogProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (courseId: string, students: ImportedStudentPreview[]) => void;
}

// Mock preview sinh viên khi upload file thành công
const MOCK_IMPORTED_STUDENTS: ImportedStudentPreview[] = [
  {
    studentCode: "HE170504",
    fullName: "Lê Hoàng Hải",
    email: "hailhhe170504@fpt.edu.vn",
    groupName: "Nhóm 01",
    isValid: true,
  },
  {
    studentCode: "SE171234",
    fullName: "Nguyễn Đức Trung",
    email: "trungndse171234@fpt.edu.vn",
    groupName: "Nhóm 01",
    isValid: true,
  },
  {
    studentCode: "SE172345",
    fullName: "Vũ Tuấn Minh",
    email: "minhvtse172345@fpt.edu.vn",
    groupName: "Nhóm 02",
    isValid: true,
  },
  {
    studentCode: "SE173456",
    fullName: "Phạm Phương Anh",
    email: "anhptse173456@fpt.edu.vn",
    groupName: "Nhóm 01",
    isValid: true,
  },
  {
    studentCode: "SE174567",
    fullName: "Nguyễn Văn Đức",
    email: "ducnvse174567@fpt.edu.vn",
    groupName: "Nhóm 03",
    isValid: true,
  },
  {
    studentCode: "SE175678",
    fullName: "Đỗ Thùy Linh",
    email: "linhdtse175678@fpt.edu.vn",
    groupName: "Nhóm 01",
    isValid: true,
  },
];

export function ImportStudentsDialog({
  course,
  isOpen,
  onClose,
  onConfirmImport,
}: ImportStudentsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewList, setPreviewList] = useState<ImportedStudentPreview[]>([]);

  if (!course) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (uploadedFile: File) => {
    setFile(uploadedFile);
    setPreviewList(MOCK_IMPORTED_STUDENTS);
  };

  const handleReset = () => {
    setFile(null);
    setPreviewList([]);
  };

  const handleConfirm = () => {
    onConfirmImport(course.id, previewList);
    handleReset();
    onClose();
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,MSSV,HoVaTen,Email,Nhom\nHE170504,Le Hoang Hai,hailhhe170504@fpt.edu.vn,Nhom 01\nSE171234,Nguyen Duc Trung,trungndse171234@fpt.edu.vn,Nhom 01\nSE172345,Vu Tuan Minh,minhvtse172345@fpt.edu.vn,Nhom 02";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Mau_Danh_Sach_Sinh_Vien_${course.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-6 rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 text-left border-b border-border pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <FileSpreadsheetIcon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Import danh sách sinh viên vào khóa học
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Khóa học: <strong className="text-foreground">{course.code}</strong> · {course.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Download Template Bar */}
          <div className="flex items-center justify-between bg-muted/40 border border-border/80 p-3 rounded-xl text-xs">
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">Chưa có file mẫu chuẩn?</p>
              <p className="text-muted-foreground text-[11px]">
                Tải file mẫu Excel (.xlsx / .csv) để nhập đúng định dạng MSSV, họ tên và nhóm đồ án.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="h-8 gap-1.5 text-xs shrink-0 cursor-pointer"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              Tải file mẫu
            </Button>
          </div>

          {/* Drag and Drop Zone */}
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-background"
                }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-primary mb-3">
                <UploadCloudIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Kéo thả file danh sách sinh viên vào đây
              </p>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Hỗ trợ định dạng Excel (.xlsx, .xls) hoặc CSV. Tối đa 150 sinh viên/khóa học.
              </p>
              <label>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer transition-colors shadow-2xs">
                  Chọn file từ máy tính
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              {/* File Info Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheetIcon className="w-5 h-5 text-success" />
                  <div>
                    <p className="text-xs font-bold text-foreground">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB · Đã nhận diện {previewList.length} sinh viên
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 text-xs text-destructive hover:bg-destructive/10"
                >
                  <XIcon className="w-3.5 h-3.5 mr-1" />
                  Chọn file khác
                </Button>
              </div>

              {/* Preview Table */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Xem trước danh sách (Preview):</span>
                  <Badge className="bg-success-muted text-success border-0 text-[11px] gap-1">
                    <CheckCircle2Icon className="w-3 h-3" />
                    {previewList.length} sinh viên hợp lệ
                  </Badge>
                </div>
                <div className="border border-border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <Table className="text-xs">
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="py-2 px-3">MSSV</TableHead>
                        <TableHead className="py-2 px-3">Họ và tên</TableHead>
                        <TableHead className="py-2 px-3">Email FPT</TableHead>
                        <TableHead className="py-2 px-3">Nhóm đồ án</TableHead>
                        <TableHead className="py-2 px-3 text-right">Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border/60">
                      {previewList.map((sv) => (
                        <TableRow key={sv.studentCode} className="hover:bg-muted/30">
                          <TableCell className="py-2 px-3 font-mono font-semibold text-foreground">
                            {sv.studentCode}
                          </TableCell>
                          <TableCell className="py-2 px-3 font-medium text-foreground">
                            {sv.fullName}
                          </TableCell>
                          <TableCell className="py-2 px-3 text-muted-foreground">
                            {sv.email}
                          </TableCell>
                          <TableCell className="py-2 px-3">
                            <Badge variant="outline" className="text-[10px]">
                              {sv.groupName || "Chưa chia"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2 px-3 text-right">
                            <span className="text-success text-[11px] font-semibold inline-flex items-center gap-1">
                              <CheckCircle2Icon className="w-3 h-3" />
                              Hợp lệ
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Hủy bỏ
          </Button>
          <Button
            size="sm"
            disabled={!file || previewList.length === 0}
            onClick={handleConfirm}
            className="text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Xác nhận Import ({previewList.length} sinh viên)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
