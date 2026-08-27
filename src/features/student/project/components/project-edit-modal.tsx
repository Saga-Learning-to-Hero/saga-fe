"use client";

import { useState } from "react";
import {
  FolderKanbanIcon,
  XIcon,
  SaveIcon,
  LoaderCircleIcon,
  CheckCircle2Icon,
  Code2Icon,
  FileTextIcon,
} from "lucide-react";
import type { StudentProjectDetails, ProjectCategory } from "../types/student-project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProjectEditModalProps {
  isOpen: boolean;
  project: StudentProjectDetails;
  onClose: () => void;
  onSave: (updated: Partial<StudentProjectDetails>) => void;
}

const CATEGORIES: ProjectCategory[] = [
  "Web Application / EdTech",
  "Mobile Application",
  "AI & Machine Learning",
  "Cloud & DevOps",
  "Blockchain & Fintech",
  "IoT & Embedded Systems",
];

export function ProjectEditModal({
  isOpen,
  project,
  onClose,
  onSave,
}: ProjectEditModalProps) {
  const [form, setForm] = useState({
    name: project.name || "",
    category: project.category || ("Web Application / EdTech" as ProjectCategory),
    description: project.description || "",
    techStack: project.techStack ? project.techStack.join(", ") : "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg("");
    await new Promise((r) => setTimeout(r, 600));

    const techArray = form.techStack
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      name: form.name,
      category: form.category,
      description: form.description,
      techStack: techArray.length > 0 ? techArray : project.techStack,
    });

    setIsSubmitting(false);
    setSuccessMsg("Cập nhật thông tin dự án thành công!");
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-200">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FolderKanbanIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Tạo & Cập nhật Thông tin Dự án
              </h3>
              <p className="text-xs text-muted-foreground">
                Chỉnh sửa tên dự án, phân loại, mô tả bài toán và danh sách công nghệ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Success Feedback Alert */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
              <CheckCircle2Icon className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

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
              placeholder="Nhập tên dự án đồ án tốt nghiệp..."
              className="h-9 text-xs rounded-xl bg-card font-semibold"
            />
          </div>

          {/* Loại dự án */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-category" className="text-xs font-semibold">
              Loại dự án (Phân loại) <span className="text-destructive">*</span>
            </Label>
            <select
              id="proj-category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ProjectCategory }))}
              className="w-full h-9 px-3 text-xs rounded-xl bg-card border border-input focus:outline-hidden focus:ring-2 focus:ring-ring font-medium"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Mô tả dự án */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-desc" className="text-xs font-semibold flex items-center gap-1.5">
              <FileTextIcon className="w-3.5 h-3.5 text-primary" />
              Mô tả chi tiết dự án & Bài toán
            </Label>
            <Textarea
              id="proj-desc"
              rows={4}
              required
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả bài toán thực tế, mục tiêu của dự án, các phân hệ chức năng chính..."
              className="text-xs rounded-xl bg-card resize-none"
            />
          </div>

          {/* Tech Stack */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-tech" className="text-xs font-semibold flex items-center gap-1.5">
              <Code2Icon className="w-3.5 h-3.5 text-purple-500" />
              Công nghệ & Framework sử dụng (phân cách bằng dấu phẩy)
            </Label>
            <Input
              id="proj-tech"
              type="text"
              value={form.techStack}
              onChange={(e) => setForm((f) => ({ ...f, techStack: e.target.value }))}
              placeholder="Next.js, React, TypeScript, TailwindCSS, Cytoscape.js"
              className="h-9 text-xs rounded-xl bg-card font-mono"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 text-xs rounded-xl"
            >
              Hủy
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 text-xs font-bold rounded-xl gap-2 cursor-pointer shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 px-5"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4" />
                  Lưu cập nhật dự án
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
