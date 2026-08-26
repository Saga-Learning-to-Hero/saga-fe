"use client";

import { useState, useEffect } from "react";
import { GraduationCapIcon, UserIcon, MailIcon, SchoolIcon, BookOpenIcon, CalendarIcon, ActivityIcon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/common/custom-select";
import { MOCK_LECTURERS } from "../data/mock-academic";
import type { Course, Subject, Semester, CourseStatus, AdminClass } from "../types/academic-management";

interface CourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    code: string;
    name: string;
    subjectCode: string;
    subjectName: string;
    semesterCode: string;
    semesterName: string;
    adminClassCode?: string;
    status: CourseStatus;
    lecturer: { id: string; fullName: string; email: string };
  }) => void;
  editingCourse?: Course | null;
  subjects: Subject[];
  semesters: Semester[];
  adminClasses: AdminClass[];
}

export function CourseDialog({
  isOpen,
  onClose,
  onSubmit,
  editingCourse,
  subjects,
  semesters,
  adminClasses,
}: CourseDialogProps) {
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    subjectCode: string;
    semesterCode: string;
    adminClassCode: string;
    status: CourseStatus;
    lecturerId: string;
  }>({
    code: "",
    name: "",
    subjectCode: subjects[0]?.code || "SWP490",
    semesterCode: semesters[0]?.code || "FA26",
    adminClassCode: adminClasses[0]?.code || "SE1701",
    status: "IN_PROGRESS",
    lecturerId: MOCK_LECTURERS[0]?.id || "usr-gv-001",
  });

  useEffect(() => {
    if (editingCourse) {
      const matchedLecturer = MOCK_LECTURERS.find(
        (l) => l.email === editingCourse.lecturer.email || l.fullName === editingCourse.lecturer.fullName
      );
      setFormData({
        code: editingCourse.code,
        name: editingCourse.name,
        subjectCode: editingCourse.subjectCode,
        semesterCode: editingCourse.semesterCode,
        adminClassCode: editingCourse.adminClassCode || adminClasses[0]?.code || "SE1701",
        status: editingCourse.status,
        lecturerId: matchedLecturer?.id || editingCourse.lecturer.id || MOCK_LECTURERS[0]?.id,
      });
    } else {
      setFormData({
        code: "",
        name: "",
        subjectCode: subjects[0]?.code || "SWP490",
        semesterCode: semesters[0]?.code || "FA26",
        adminClassCode: adminClasses[0]?.code || "SE1701",
        status: "IN_PROGRESS",
        lecturerId: MOCK_LECTURERS[0]?.id || "usr-gv-001",
      });
    }
  }, [editingCourse, isOpen, subjects, semesters, adminClasses]);

  const selectedLecturer = MOCK_LECTURERS.find((l) => l.id === formData.lecturerId) || MOCK_LECTURERS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    const sub = subjects.find((s) => s.code === formData.subjectCode);
    const sem = semesters.find((s) => s.code === formData.semesterCode);

    onSubmit({
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      subjectCode: formData.subjectCode,
      subjectName: sub?.name || formData.subjectCode,
      semesterCode: formData.semesterCode,
      semesterName: sem?.name || formData.semesterCode,
      adminClassCode: formData.adminClassCode,
      status: formData.status,
      lecturer: {
        id: selectedLecturer.id,
        fullName: selectedLecturer.fullName,
        email: selectedLecturer.email,
      },
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-6 rounded-2xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left pb-2 border-b border-border/60">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <GraduationCapIcon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {editingCourse ? "Cập nhật Khóa học / Học phần" : "Mở Khóa học / Học phần mới"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Thiết lập học phần đồ án, gán môn học, học kỳ, lớp hành chính và giảng viên.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 pt-1">
            {/* Row 1: Code & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Mã khóa học *</label>
                <Input
                  placeholder="VD: SWP490_FA26"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  className="h-9 text-xs font-mono uppercase bg-muted/30 border-border/80 focus:border-primary rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <ActivityIcon className="w-3 h-3 text-primary" />
                  Trạng thái *
                </label>
                <CustomSelect
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val as CourseStatus })}
                  options={[
                    { value: "IN_PROGRESS", label: "Đang học / Làm đồ án" },
                    { value: "UPCOMING", label: "Sắp diễn ra" },
                    { value: "COMPLETED", label: "Đã hoàn thành" },
                  ]}
                />
              </div>
            </div>

            {/* Row 2: Course Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Tên Khóa học / Học phần *</label>
              <Input
                placeholder="VD: Đồ án Kỹ thuật phần mềm - Fall 2026"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-9 text-xs bg-muted/30 border-border/80 focus:border-primary rounded-xl"
              />
            </div>

            {/* Row 3: Subject, Semester & Administrative Class */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <BookOpenIcon className="w-3 h-3 text-primary" />
                  Môn học *
                </label>
                <CustomSelect
                  value={formData.subjectCode}
                  onChange={(val) => setFormData({ ...formData, subjectCode: val })}
                  options={subjects.map((sub) => ({
                    value: sub.code,
                    label: sub.code,
                    subLabel: sub.name,
                  }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3 text-primary" />
                  Học kỳ *
                </label>
                <CustomSelect
                  value={formData.semesterCode}
                  onChange={(val) => setFormData({ ...formData, semesterCode: val })}
                  options={semesters.map((sem) => ({
                    value: sem.code,
                    label: `${sem.name} (${sem.code})`,
                  }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <SchoolIcon className="w-3 h-3 text-primary" />
                  Lớp hành chính *
                </label>
                <CustomSelect
                  value={formData.adminClassCode}
                  onChange={(val) => setFormData({ ...formData, adminClassCode: val })}
                  options={adminClasses.map((cls) => ({
                    value: cls.code,
                    label: cls.code,
                    subLabel: cls.name,
                  }))}
                />
              </div>
            </div>

            {/* Row 4: Lecturer Selection Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-primary" />
                Giảng viên phụ trách (Chọn từ danh sách) *
              </label>
              <CustomSelect
                value={formData.lecturerId}
                onChange={(val) => setFormData({ ...formData, lecturerId: val })}
                options={MOCK_LECTURERS.map((lec) => ({
                  value: lec.id,
                  label: lec.fullName,
                  subLabel: `${lec.email} — ${lec.department}`,
                }))}
              />

              {/* Selected Lecturer Info Preview */}
              {selectedLecturer && (
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs mt-1.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    GV
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-xs leading-none">
                      {selectedLecturer.fullName}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                      <MailIcon className="w-3 h-3 text-muted-foreground" />
                      {selectedLecturer.email}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground shrink-0 border-border">
                    {selectedLecturer.department}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Hủy bỏ
            </Button>
            <Button type="submit" size="sm" className="text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
              {editingCourse ? "Lưu thay đổi" : "Tạo khóa học"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
