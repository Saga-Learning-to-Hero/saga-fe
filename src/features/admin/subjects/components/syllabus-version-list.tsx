"use client";

import {
  LayersIcon,
  PlusIcon,
  CheckCircle2Icon,
  ClockIcon,
  ArchiveIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SyllabusSummaryResponse } from "../types/syllabus-types";

interface SyllabusVersionListProps {
  syllabi: SyllabusSummaryResponse[];
  selectedVersionId: string | null;
  onSelectVersion: (id: string) => void;
  onOpenCreateDialog: () => void;
  onPublish: (versionId: string) => Promise<void>;
  onArchive: (versionId: string) => Promise<void>;
  onViewStructure?: (versionId: string) => void;
  isPublishing?: boolean;
  isArchiving?: boolean;
}

export function SyllabusVersionList({
  syllabi,
  selectedVersionId,
  onSelectVersion,
  onOpenCreateDialog,
  onPublish,
  onArchive,
  onViewStructure,
  isPublishing = false,
  isArchiving = false,
}: SyllabusVersionListProps) {
  const currentSelected = syllabi.find((s) => s.id === selectedVersionId) || null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <LayersIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Phiên bản Đề cương ({syllabi.length})
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Chọn phiên bản để xem hoặc chỉnh sửa cây cấu trúc tiêu chí đào tạo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onViewStructure && currentSelected && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onViewStructure(currentSelected.id)}
              className="h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <LayersIcon className="w-3.5 h-3.5" />
              <span>Xem cấu trúc ({currentSelected.versionLabel})</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Button>
          )}

          {currentSelected && currentSelected.status === "DRAFT" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPublish(currentSelected.id)}
              disabled={isPublishing}
              className="h-8 text-xs font-semibold gap-1.5 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 cursor-pointer shadow-xs"
            >
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              {isPublishing ? "Đang xuất bản..." : "Xuất bản chính thức"}
            </Button>
          )}

          {currentSelected && currentSelected.status === "PUBLISHED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onArchive(currentSelected.id)}
              disabled={isArchiving}
              className="h-8 text-xs font-semibold gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ArchiveIcon className="w-3.5 h-3.5" />
              {isArchiving ? "Đang lưu trữ..." : "Lưu trữ (ARCHIVE)"}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCreateDialog}
            className="h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Tạo bản nháp mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {syllabi.map((s) => {
          const isSelected = s.id === selectedVersionId;

          return (
            <div
              key={s.id}
              onClick={() => onSelectVersion(s.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2 relative overflow-hidden ${isSelected
                ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/30"
                : "bg-card border-border hover:border-border/80 hover:bg-muted/10"
                }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-extrabold text-foreground tracking-tight">
                  {s.versionLabel}
                </span>

                {s.status === "PUBLISHED" && (
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold px-2 py-0">
                    <CheckCircle2Icon className="w-3 h-3 mr-1" />
                    Chính thức
                  </Badge>
                )}

                {s.status === "DRAFT" && (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold px-2 py-0">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    Bản nháp
                  </Badge>
                )}

                {s.status === "ARCHIVED" && (
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] font-semibold px-2 py-0">
                    <ArchiveIcon className="w-3 h-3 mr-1" />
                    Lưu trữ
                  </Badge>
                )}
              </div>

              <p className="text-xs font-medium text-foreground/80 line-clamp-1">
                {s.titleEnglish || "Chưa có tiêu đề tiếng Anh"}
              </p>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40 font-mono">
                <span>{s.credits || 3} Tín chỉ</span>
                {onViewStructure ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVersion(s.id);
                      onViewStructure(s.id);
                    }}
                    className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <span>Cấu trúc</span>
                    <ArrowRightIcon className="w-3 h-3" />
                  </button>
                ) : (
                  <span>{new Date(s.createdAt).toLocaleDateString("vi-VN")}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
