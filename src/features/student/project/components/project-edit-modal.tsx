"use client";

import { useState } from "react";
import {
  FolderKanbanIcon,
  XIcon,
  SaveIcon,
  PlusIcon,
  LoaderCircleIcon,
  FileTextIcon,
} from "lucide-react";
import type { StudentProjectDetails } from "../types/student-project";
import { useProjectTypes, useCreateStudentProject } from "../hooks/useStudentProject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomSelect } from "@/components/common/custom-select";

interface ProjectEditModalProps {
  isOpen: boolean;
  project: StudentProjectDetails;
  courseId?: string;
  onClose: () => void;
  onSave: (updated: Partial<StudentProjectDetails>) => void;
}

export function ProjectEditModal({
  isOpen,
  project,
  courseId,
  onClose,
  onSave,
}: ProjectEditModalProps) {
  // Lấy danh sách loại dự án thực tế từ API: GET /api/student/project-types
  const { data: projectTypes, isLoading: isLoadingTypes } = useProjectTypes();
  const createProjectMutation = useCreateStudentProject();

  const hasProject = Boolean(
    (project.name && project.name.trim() !== "") ||
    (project.projectId && project.projectId.trim() !== "")
  );

  const [form, setForm] = useState({
    name: project.name || "",
    projectTypeId: project.projectType?.id || "",
    description: project.description || "",
  });

  const effectiveProjectTypeId =
    form.projectTypeId || project.projectType?.id || projectTypes?.[0]?.id || "";

  if (!isOpen) return null;

  const isSubmitting = createProjectMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Nếu có courseId, gọi API Backend: POST /api/student/courses/{courseId}/project
    if (courseId) {
      try {
        const createdProject = await createProjectMutation.mutateAsync({
          courseId,
          payload: {
            name: form.name.trim(),
            projectTypeId: effectiveProjectTypeId,
            description: form.description.trim(),
          },
        });

        onSave({
          id: createdProject.projectId,
          projectId: createdProject.projectId,
          name: createdProject.name,
          description: createdProject.description,
          projectType: createdProject.projectType,
          category: createdProject.projectType.name,
          teamId: createdProject.teamId,
          teamNo: createdProject.teamNo,
          teamName: createdProject.teamName,
          groupName: createdProject.teamName
            ? `Nhóm ${createdProject.teamNo} - ${createdProject.teamName}`
            : undefined,
          createdBy: createdProject.createdBy,
          createdAt: createdProject.createdAt,
        });

        onClose();
        return;
      } catch {
        return;
      }
    }

    // Fallback cập nhật local nếu không có courseId
    const selectedType = projectTypes?.find((pt) => pt.id === effectiveProjectTypeId);
    onSave({
      name: form.name,
      description: form.description,
      projectType: selectedType
        ? { id: selectedType.id, code: selectedType.code, name: selectedType.name }
        : project.projectType,
      category: selectedType?.name || project.category,
    });
    onClose();
  };

  const projectTypeOptions = (projectTypes || []).map((pt) => ({
    value: pt.id,
    label: pt.name,
    subLabel: pt.code,
  }));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-200">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-2xl shadow-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FolderKanbanIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {hasProject ? "Cập nhật Thông tin Dự án" : "Tạo Dự án Mới (Team Leader)"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {hasProject
                  ? "Chỉnh sửa tên dự án, loại đề tài và mô tả giải pháp"
                  : "Đăng ký tên dự án, phân loại đề tài và mô tả bài toán"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
          {/* Tên dự án */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-name" className="text-xs font-semibold">
              Tên dự án <span className="text-destructive">*</span>
            </Label>
            <Input
              id="proj-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nhập tên dự án..."
              className="h-9 text-xs rounded-xl bg-card font-semibold"
            />
          </div>

          {/* Loại dự án */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-category" className="text-xs font-semibold">
              Loại dự án (Danh mục từ hệ thống) <span className="text-destructive">*</span>
            </Label>
            <CustomSelect
              id="proj-category"
              value={effectiveProjectTypeId}
              onChange={(val) => setForm((f) => ({ ...f, projectTypeId: val }))}
              options={
                isLoadingTypes
                  ? [{ value: "", label: "Đang tải danh mục loại dự án..." }]
                  : projectTypeOptions
              }
              disabled={isLoadingTypes}
            />
          </div>

          {/* Mô tả dự án */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-desc" className="text-xs font-semibold flex items-center gap-1.5">
              <FileTextIcon className="w-3.5 h-3.5 text-primary" />
              Mô tả chi tiết dự án & Bài toán <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="proj-desc"
              rows={5}
              required
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả bài toán thực tế, mục tiêu của dự án, các phân hệ chức năng chính..."
              className="text-xs rounded-xl bg-card resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 text-xs rounded-xl"
            >
              Hủy
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !form.name || !effectiveProjectTypeId || !form.description}
              className="h-9 text-xs font-bold rounded-xl gap-2 cursor-pointer shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 px-5"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : hasProject ? (
                <>
                  <SaveIcon className="w-4 h-4" />
                  Cập nhật dự án
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4" />
                  Tạo dự án
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
