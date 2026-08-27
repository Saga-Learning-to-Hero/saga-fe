"use client";

import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/common/custom-select";
import type { Semester, SemesterStatus } from "../types/academic-management";

interface SemesterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Semester, "id" | "totalCourses">) => void;
  editingSemester?: Semester | null;
}

export function SemesterDialog({
  isOpen,
  onClose,
  onSubmit,
  editingSemester,
}: SemesterDialogProps) {
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    startDate: string;
    endDate: string;
    status: SemesterStatus;
  }>({
    code: "",
    name: "",
    startDate: "",
    endDate: "",
    status: "UPCOMING",
  });

  useEffect(() => {
    if (editingSemester) {
      setFormData({
        code: editingSemester.code,
        name: editingSemester.name,
        startDate: editingSemester.startDate,
        endDate: editingSemester.endDate,
        status: editingSemester.status,
      });
    } else {
      setFormData({
        code: "",
        name: "",
        startDate: "2027-01-10",
        endDate: "2027-04-25",
        status: "UPCOMING",
      });
    }
  }, [editingSemester, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    onSubmit({
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {editingSemester ? "Cập nhật học kỳ" : "Tạo học kỳ mới"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Thiết lập mã và khung thời gian cho học kỳ đào tạo.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Mã học kỳ *</label>
                <Input
                  placeholder="VD: FA26"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  className="h-9 text-xs font-mono uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Trạng thái *</label>
                <CustomSelect
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val as SemesterStatus })}
                  options={[
                    { value: "ACTIVE", label: "Đang diễn ra" },
                    { value: "UPCOMING", label: "Sắp diễn ra" },
                    { value: "CLOSED", label: "Đã kết thúc" },
                  ]}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Tên học kỳ *</label>
              <Input
                placeholder="VD: Fall 2026"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Ngày bắt đầu *</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Ngày kết thúc *</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Hủy bỏ
            </Button>
            <Button type="submit" size="sm" className="text-xs font-semibold">
              {editingSemester ? "Lưu thay đổi" : "Tạo học kỳ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
