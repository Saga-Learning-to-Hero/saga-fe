"use client";

import { useState } from "react";
import { XIcon, PlusIcon, LayersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateSyllabusRequest } from "../types/syllabus-types";

interface SyllabusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSyllabusRequest) => Promise<void>;
  isSubmitting?: boolean;
}

export function SyllabusDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: SyllabusDialogProps) {
  const [versionLabel, setVersionLabel] = useState("v1.0");
  const [titleEnglish, setTitleEnglish] = useState("");
  const [credits, setCredits] = useState<number>(3);
  const [minAvgMarkToPass, setMinAvgMarkToPass] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!versionLabel.trim()) {
      setError("Vui lòng nhập nhãn phiên bản (ví dụ: v1.0, v2.0).");
      return;
    }

    try {
      await onSubmit({
        versionLabel: versionLabel.trim(),
        titleEnglish: titleEnglish.trim() || undefined,
        credits: Number(credits) || 3,
        gradingScale: `Thang 10 (Điểm đạt tối thiểu: ${Number(minAvgMarkToPass) || 5})`,
      });
      onClose();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Đã có lỗi xảy ra khi tạo bản nháp đề cương.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <LayersIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Tạo Phiên bản Đề cương Mới (DRAFT)</h3>
              <p className="text-xs text-muted-foreground">
                Khởi tạo bản nháp đề cương để cấu hình chuẩn đầu ra và tiêu chí đánh giá.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="version-label" className="text-xs font-semibold">
                Nhãn phiên bản (Version Label) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="version-label"
                placeholder="Ví dụ: v1.0, v2.0-Spring2026..."
                value={versionLabel}
                onChange={(e) => setVersionLabel(e.target.value)}
                disabled={isSubmitting}
                className="font-mono text-sm bg-background"
              />
              <p className="text-[11px] text-muted-foreground">
                Tên phiên bản để nhận diện đề cương khi gán vào lớp học phần.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title-english" className="text-xs font-semibold">
                Tiêu đề đề cương (Title)
              </Label>
              <Input
                id="title-english"
                placeholder="Ví dụ: Software Project Official Syllabus"
                value={titleEnglish}
                onChange={(e) => setTitleEnglish(e.target.value)}
                disabled={isSubmitting}
                className="text-sm bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="credits" className="text-xs font-semibold">
                  Số tín chỉ (Credits)
                </Label>
                <Input
                  id="credits"
                  type="number"
                  min={1}
                  max={20}
                  value={credits}
                  onChange={(e) => setCredits(Number(e.target.value))}
                  disabled={isSubmitting}
                  className="font-mono text-sm bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="min-mark" className="text-xs font-semibold">
                  Điểm đạt tối thiểu (Thang 10)
                </Label>
                <Input
                  id="min-mark"
                  type="number"
                  min={1}
                  max={10}
                  step={0.5}
                  value={minAvgMarkToPass}
                  onChange={(e) => setMinAvgMarkToPass(Number(e.target.value))}
                  disabled={isSubmitting}
                  className="font-mono text-sm bg-background"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border/60 flex items-center justify-end gap-2.5 shrink-0 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs h-9 cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs h-9 gap-1.5 cursor-pointer font-semibold"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              {isSubmitting ? "Đang khởi tạo..." : "Tạo bản nháp"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
