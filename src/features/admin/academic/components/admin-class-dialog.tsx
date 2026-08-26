"use client";

import { useState, useEffect } from "react";
import { SchoolIcon } from "lucide-react";
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
import type { AdminClass } from "../types/academic-management";

interface AdminClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<AdminClass, "id" | "createdAt">) => void;
  editingClass?: AdminClass | null;
}

export function AdminClassDialog({
  isOpen,
  onClose,
  onSubmit,
  editingClass,
}: AdminClassDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    department: "Kỹ thuật phần mềm",
    academicYear: "K17 (2021 - 2025)",
  });

  useEffect(() => {
    if (editingClass) {
      setFormData({
        code: editingClass.code,
        name: editingClass.name,
        department: editingClass.department,
        academicYear: editingClass.academicYear,
      });
    } else {
      setFormData({
        code: "",
        name: "",
        department: "Kỹ thuật phần mềm",
        academicYear: "K17 (2021 - 2025)",
      });
    }
  }, [editingClass, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    onSubmit({
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      department: formData.department.trim(),
      academicYear: formData.academicYear.trim(),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <SchoolIcon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {editingClass ? "Cập nhật Lớp hành chính" : "Thêm Lớp hành chính mới"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Quản lý lớp sinh viên theo chuyên ngành và khóa tuyển sinh.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Mã lớp *</label>
                <Input
                  placeholder="VD: SE1703"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  className="h-9 text-xs font-mono uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Niên khóa *</label>
                <Input
                  placeholder="VD: K17 (2021 - 2025)"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Tên lớp hành chính *</label>
              <Input
                placeholder="VD: Kỹ thuật phần mềm K17 - Lớp 03"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Chuyên ngành / Khoa</label>
              <Input
                placeholder="VD: Kỹ thuật phần mềm"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Hủy bỏ
            </Button>
            <Button type="submit" size="sm" className="text-xs font-semibold">
              {editingClass ? "Lưu thay đổi" : "Tạo lớp hành chính"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
