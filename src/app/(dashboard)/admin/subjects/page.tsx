"use client";

import { useState } from "react";
import { BookOpenIcon } from "lucide-react";
import { SubjectManagement } from "@/features/admin/academic/components/subject-management";
import { MOCK_SUBJECTS } from "@/features/admin/academic/data/mock-academic";
import type { Subject } from "@/features/admin/academic/types/academic-management";

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS);

  const handleAddSubject = (newSub: Omit<Subject, "id" | "totalCourses">) => {
    const created: Subject = {
      ...newSub,
      id: `sub-${Date.now()}`,
      totalCourses: 0,
    };
    setSubjects((prev) => [created, ...prev]);
  };

  const handleEditSubject = (id: string, updated: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in-0 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning-muted flex items-center justify-center text-warning shrink-0 shadow-2xs">
            <BookOpenIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Quản lý Môn học (FLM)
            </h1>
            <p className="text-xs text-muted-foreground">
              Quản lý danh sách môn học, Syllabus, tín chỉ và tài nguyên chuẩn theo cấu trúc FPT Learning Material.
            </p>
          </div>
        </div>
      </div>

      <SubjectManagement
        subjects={subjects}
        onAddSubject={handleAddSubject}
        onEditSubject={handleEditSubject}
        onDeleteSubject={handleDeleteSubject}
      />
    </div>
  );
}
