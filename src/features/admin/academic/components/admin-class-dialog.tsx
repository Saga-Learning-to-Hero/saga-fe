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
import { CustomSelect } from "@/components/common/custom-select";
import type { AcademicClassResponse, SemesterResponse } from "../types/academic-types";

interface AdminClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<AcademicClassResponse, "id" | "createdAt" | "semesterCode">) => void;
  editingClass?: AcademicClassResponse | null;
  semesters: SemesterResponse[];
}

export function AdminClassDialog({
  isOpen,
  onClose,
  onSubmit,
  editingClass,
  semesters,
}: AdminClassDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    semesterId: semesters[0]?.id || "",
  });

  useEffect(() => {
    if (editingClass) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        code: editingClass.classCode || editingClass.code || "",
        name: editingClass.name,
        semesterId: editingClass.semesterId,
      });
    } else {
      setFormData({
        code: "",
        name: "",
        semesterId: semesters[0]?.id || "",
      });
    }
  }, [editingClass, isOpen, semesters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    const codeVal = formData.code.trim().toUpperCase();
    onSubmit({
      classCode: codeVal,
      code: codeVal,
      name: formData.name.trim(),
      semesterId: formData.semesterId,
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
                <label className="text-xs font-semibold text-foreground">Học kỳ *</label>
                <CustomSelect
                  value={formData.semesterId}
                  onChange={(val) => setFormData({ ...formData, semesterId: val as string })}
                  options={semesters.map((s) => ({ value: s.id, label: s.name }))}
                  disabled={Boolean(editingClass)}
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
