"use client";

import { useState } from "react";
import {
  XIcon,
  SaveIcon,
  LoaderCircleIcon,
  CheckCircle2Icon,
  CalendarIcon,
  SparklesIcon,
} from "lucide-react";
import type { Sprint } from "../types/sprint-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SprintModalProps {
  isOpen: boolean;
  sprint: Sprint | null; // Null means creating a new sprint
  onClose: () => void;
  onSave: (sprint: Sprint) => void;
}

export function SprintModal({
  isOpen,
  sprint,
  onClose,
  onSave,
}: SprintModalProps) {
  const isEditing = Boolean(sprint);

  const [form, setForm] = useState({
    name: sprint?.name || "Sprint Mới",
    goal: sprint?.goal || "",
    startDate: sprint?.startDate || "2026-09-01",
    endDate: sprint?.endDate || "2026-09-15",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg("");
    await new Promise((r) => setTimeout(r, 600));

    const finalSprint: Sprint = {
      id: sprint?.id || `sprint-${Date.now()}`,
      name: form.name,
      goal: form.goal || "Mục tiêu Sprint nâng cao tiến độ đồ án",
      status: sprint?.status || "PLANNED",
      startDate: form.startDate,
      endDate: form.endDate,
      totalStoryPoints: sprint?.totalStoryPoints || 0,
      completedStoryPoints: sprint?.completedStoryPoints || 0,
    };

    onSave(finalSprint);

    setIsSubmitting(false);
    setSuccessMsg(isEditing ? "Đã cập nhật Sprint!" : "Tạo Sprint mới thành công!");
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-200">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {isEditing ? "Chỉnh sửa thông tin Sprint" : "Tạo Sprint mới"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Khởi tạo mốc thời gian và mục tiêu Sprint (Sprint Goal)
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Success Feedback */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
              <CheckCircle2Icon className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tên Sprint */}
          <div className="space-y-1.5">
            <Label htmlFor="sprint-name" className="text-xs font-semibold">
              Tên Sprint <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sprint-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="VD: Sprint 5 - Final Review & Testing"
              className="h-9 text-xs rounded-xl bg-card font-semibold"
            />
          </div>

          {/* Goal */}
          <div className="space-y-1.5">
            <Label htmlFor="sprint-goal" className="text-xs font-semibold">
              Mục tiêu Sprint (Sprint Goal)
            </Label>
            <Textarea
              id="sprint-goal"
              rows={3}
              value={form.goal}
              onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
              placeholder="Nhập mục tiêu tập trung trong chu kỳ Sprint này..."
              className="text-xs rounded-xl bg-card resize-none"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sprint-start" className="text-xs font-semibold">
                Ngày bắt đầu <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="sprint-start"
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  className="pl-9 h-9 text-xs rounded-xl bg-card font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sprint-end" className="text-xs font-semibold">
                Ngày kết thúc <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="sprint-end"
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  className="pl-9 h-9 text-xs rounded-xl bg-card font-mono"
                />
              </div>
            </div>
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
              className="h-9 text-xs font-bold rounded-xl gap-2 cursor-pointer shadow-xs bg-purple-600 hover:bg-purple-700 text-white px-5"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4" />
                  {isEditing ? "Lưu Sprint" : "Tạo Sprint mới"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
