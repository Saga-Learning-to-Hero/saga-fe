"use client";

import { useState, useEffect } from "react";
import {
  GraduationCapIcon,
  UserIcon,
  SchoolIcon,
  BookOpenIcon,
  CalendarIcon,
  LayersIcon,
  AlertCircleIcon,
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
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/common/custom-select";
import { useSyllabi } from "@/features/admin/subjects/hooks/use-syllabi";
import type { CourseResponse } from "../types/course-roster-types";
import type { SubjectResponse } from "@/features/admin/subjects/types/subject-types";
import type { AcademicClassResponse, SemesterResponse } from "../types/academic-types";

interface CourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    courseCode: string;
    name: string;
    subjectId: string;
    syllabusVersionId: string;
    academicClassId: string;
    semesterId: string;
    lecturerId: string;
  }) => void;
  editingCourse?: CourseResponse | null;
  subjects: SubjectResponse[];
  semesters: SemesterResponse[];
  adminClasses: AcademicClassResponse[];
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
    courseCode: string;
    name: string;
    subjectId: string;
    syllabusVersionId: string;
    semesterId: string;
    academicClassId: string;
    lecturerId: string;
  }>({
    courseCode: "",
    name: "",
    subjectId: subjects[0]?.id || "",
    syllabusVersionId: "",
    semesterId: semesters[0]?.id || "",
    academicClassId: adminClasses[0]?.id || "",
    lecturerId: "",
  });

  const { data: syllabi = [], isLoading: isLoadingSyllabi } = useSyllabi(formData.subjectId);

  useEffect(() => {
    if (editingCourse) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        courseCode: editingCourse.courseCode,
        name: editingCourse.name,
        subjectId: editingCourse.subjectId,
        syllabusVersionId: editingCourse.syllabusVersionId || "",
        semesterId: editingCourse.semesterId || semesters[0]?.id || "",
        academicClassId: editingCourse.academicClassId,
        lecturerId: editingCourse.lecturerId || "",
      });
    } else {
      setFormData({
        courseCode: "",
        name: "",
        subjectId: subjects[0]?.id || "",
        syllabusVersionId: "",
        semesterId: semesters[0]?.id || "",
        academicClassId: adminClasses[0]?.id || "",
        lecturerId: "",
      });
    }
  }, [editingCourse, isOpen, subjects, semesters, adminClasses]);

  useEffect(() => {
    if (!editingCourse && syllabi.length > 0) {
      const isCurrentValid = syllabi.some((s) => s.id === formData.syllabusVersionId);
      if (!isCurrentValid) {
        const published = syllabi.find((s) => s.status === "PUBLISHED");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData((prev) => ({
          ...prev,
          syllabusVersionId: published?.id || syllabi[0]?.id || "",
        }));
      }
    }
  }, [syllabi, formData.syllabusVersionId, editingCourse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.courseCode.trim() ||
      !formData.name.trim() ||
      !formData.lecturerId.trim() ||
      !formData.syllabusVersionId.trim()
    ) {
      return;
    }

    onSubmit({
      courseCode: formData.courseCode.trim().toUpperCase(),
      name: formData.name.trim(),
      subjectId: formData.subjectId,
      syllabusVersionId: formData.syllabusVersionId,
      semesterId: formData.semesterId,
      academicClassId: formData.academicClassId,
      lecturerId: formData.lecturerId.trim(),
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
                Thiết lập học phần đồ án, gán môn học, học kỳ, lớp sinh viên và giảng viên.
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
                  value={formData.courseCode}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                  required
                  className="h-9 text-xs font-mono uppercase bg-muted/30 border-border/80 focus:border-primary rounded-xl"
                />
              </div>

              {/* Status removed as not in DTO */}
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

            {/* Row 3: Subject & Syllabus Version */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <BookOpenIcon className="w-3 h-3 text-primary" />
                  Môn học *
                </label>
                <CustomSelect
                  value={formData.subjectId}
                  onChange={(val) => {
                    setFormData((prev) => ({
                      ...prev,
                      subjectId: val,
                      syllabusVersionId: "",
                    }));
                  }}
                  options={subjects.map((sub) => ({
                    value: sub.id,
                    label: sub.code,
                    subLabel: sub.nameEnglish,
                  }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <LayersIcon className="w-3 h-3 text-primary" />
                  Đề cương chi tiết (Syllabus) *
                </label>
                <CustomSelect
                  value={formData.syllabusVersionId}
                  onChange={(val) => setFormData((prev) => ({ ...prev, syllabusVersionId: val }))}
                  options={
                    syllabi.length > 0
                      ? syllabi.map((s) => ({
                        value: s.id,
                        label: s.versionLabel,
                        subLabel:
                          s.status === "PUBLISHED"
                            ? "Bản chuẩn áp dụng"
                            : s.status === "DRAFT"
                              ? "Bản nháp"
                              : "Đã lưu trữ",
                      }))
                      : [{ value: "", label: "Chưa có đề cương" }]
                  }
                  disabled={syllabi.length === 0}
                />
              </div>
            </div>

            {syllabi.length === 0 && !isLoadingSyllabi && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                <AlertCircleIcon className="w-4 h-4 shrink-0" />
                <span>
                  Môn học này chưa có phiên bản đề cương nào. Cần vào mục <strong>Môn học & Đề cương</strong> để tạo đề cương trước khi mở lớp.
                </span>
              </div>
            )}

            {/* Row 4: Semester & Academic Class */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3 text-primary" />
                  Học kỳ *
                </label>
                <CustomSelect
                  value={formData.semesterId}
                  onChange={(val) => setFormData({ ...formData, semesterId: val })}
                  options={semesters.map((sem) => ({
                    value: sem.id,
                    label: `${sem.name} (${sem.code})`,
                  }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <SchoolIcon className="w-3 h-3 text-primary" />
                  Lớp sinh viên *
                </label>
                <CustomSelect
                  value={formData.academicClassId}
                  onChange={(val) => setFormData({ ...formData, academicClassId: val })}
                  options={adminClasses.map((cls) => ({
                    value: cls.id,
                    label: cls.classCode || cls.code || cls.name,
                    subLabel: cls.name,
                  }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-primary" />
                ID Giảng viên phụ trách (Tạm thời) *
              </label>
              <Input
                placeholder="Nhập ID/UUID của giảng viên (VD: d67d58a3-...)"
                value={formData.lecturerId}
                onChange={(e) => setFormData({ ...formData, lecturerId: e.target.value })}
                required
                className="h-9 text-xs font-mono bg-muted/30 border-border/80 focus:border-primary rounded-xl"
              />
              <p className="text-[11px] text-muted-foreground">
                Nhập ID định danh tài khoản Giảng viên trong hệ thống.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!formData.syllabusVersionId}
              className="text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {editingCourse ? "Lưu thay đổi" : "Tạo khóa học"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
