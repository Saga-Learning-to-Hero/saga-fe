"use client";

import { useState, useEffect } from "react";
import { BookOpenIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import type { Subject } from "../types/academic-management";

interface SubjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Subject, "id" | "totalCourses">) => void;
  editingSubject?: Subject | null;
}

export function SubjectDialog({
  isOpen,
  onClose,
  onSubmit,
  editingSubject,
}: SubjectDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    credits: 3,
    department: "Kỹ thuật phần mềm",
    description: "",
  });

  useEffect(() => {
    if (editingSubject) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        code: editingSubject.code,
        name: editingSubject.name,
        credits: editingSubject.credits,
        department: editingSubject.department,
        description: editingSubject.description || "",
      });
    } else {
      setFormData({
        code: "",
        name: "",
        credits: 3,
        department: "Kỹ thuật phần mềm",
        description: "",
      });
    }
  }, [editingSubject, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    onSubmit({
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      credits: Number(formData.credits) || 3,
      department: formData.department.trim(),
      description: formData.description.trim(),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <BookOpenIcon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {editingSubject ? "Cập nhật môn học" : "Thêm môn học mới"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {editingSubject
                  ? "Chỉnh sửa thông tin mã môn, tên môn và số tín chỉ."
                  : "Tạo mã môn và cấu hình thông tin môn học vào hệ thống."}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Mã môn học *</label>
                <Input
                  placeholder="VD: SWP490"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  className="h-9 text-xs font-mono uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Số tín chỉ *</label>
                <Input
                  type="number"
                  min={1}
                  max={15}
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                  required
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Tên môn học *</label>
              <Input
                placeholder="VD: Đồ án Kỹ thuật phần mềm (Capstone)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Khoa / Bộ môn</label>
              <Input
                placeholder="VD: Kỹ thuật phần mềm"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Mô tả môn học</label>
              <Textarea
                placeholder="Mục tiêu môn học, yêu cầu làm đồ án theo nhóm..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="text-xs min-h-[60px]"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Hủy bỏ
            </Button>
            <Button type="submit" size="sm" className="text-xs font-semibold">
              {editingSubject ? "Lưu thay đổi" : "Tạo môn học"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
