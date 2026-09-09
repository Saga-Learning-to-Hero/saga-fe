"use client";

import {
  LayersIcon,
  PlusIcon,
  CheckCircle2Icon,
  ClockIcon,
  ArchiveIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  ChevronDownIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { SyllabusSummaryResponse } from "../types/syllabus-types";

interface SyllabusVersionListProps {
  syllabi: SyllabusSummaryResponse[];
  selectedVersionId: string | null;
  onSelectVersion: (id: string) => void;
  onOpenCreateDialog: () => void;
  onPublish: (versionId: string) => Promise<void>;
  onArchive: (versionId: string) => Promise<void>;
  onViewStructure?: (versionId: string) => void;
  onEditMetadata?: (versionId: string) => void;
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
  onEditMetadata,
  isPublishing = false,
  isArchiving = false,
}: SyllabusVersionListProps) {
  const currentSelected = syllabi.find((s) => s.id === selectedVersionId) || null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <LayersIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Danh sách Phiên bản Đề cương ({syllabi.length})
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Chọn phiên bản để xem cấu trúc chuẩn đầu ra (CLOs) và các mốc bàn giao Sprint.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {onViewStructure && currentSelected && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onViewStructure(currentSelected.id)}
              className="h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <LayersIcon className="w-3.5 h-3.5" />
              <span>Cấu trúc ({currentSelected.versionLabel})</span>
              <ArrowRightIcon className="w-3 h-3" />
            </Button>
          )}

          {currentSelected && (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer shadow-2xs outline-none">
                <MoreHorizontalIcon className="w-3.5 h-3.5" />
                <span>Thao tác</span>
                <ChevronDownIcon className="w-3 h-3 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1">
                {currentSelected.status === "DRAFT" && (
                  <>
                    {onEditMetadata && (
                      <DropdownMenuItem
                        onClick={() => onEditMetadata(currentSelected.id)}
                        className="text-xs font-medium cursor-pointer gap-2 py-2"
                      >
                        <FileTextIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Sửa thông tin đề cương</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onPublish(currentSelected.id)}
                      disabled={isPublishing}
                      className="text-xs font-semibold cursor-pointer gap-2 py-2 text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 focus:bg-emerald-500/10"
                    >
                      <ShieldCheckIcon className="w-3.5 h-3.5" />
                      <span>{isPublishing ? "Đang xử lý..." : "Ban hành chính thức (PUBLISH)"}</span>
                    </DropdownMenuItem>
                  </>
                )}

                {currentSelected.status === "PUBLISHED" && (
                  <DropdownMenuItem
                    onClick={() => onArchive(currentSelected.id)}
                    disabled={isArchiving}
                    className="text-xs font-medium cursor-pointer gap-2 py-2 text-muted-foreground focus:text-foreground"
                  >
                    <ArchiveIcon className="w-3.5 h-3.5" />
                    <span>{isArchiving ? "Đang lưu trữ..." : "Lưu trữ (ARCHIVE)"}</span>
                  </DropdownMenuItem>
                )}

                {currentSelected.status === "ARCHIVED" && (
                  <div className="p-2 text-[11px] text-muted-foreground text-center font-medium">
                    Phiên bản đề cương đã được lưu trữ
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCreateDialog}
            className="h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Tạo bản mới</span>
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
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-extrabold text-foreground tracking-tight">
                    {s.versionLabel}
                  </span>
                  {s.externalSyllabusId && (
                    <Badge variant="outline" className="font-mono text-[9px] px-1.5 py-0 text-muted-foreground">
                      ID: {s.externalSyllabusId}
                    </Badge>
                  )}
                </div>

                {s.status === "PUBLISHED" && (
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold px-2 py-0">
                    <CheckCircle2Icon className="w-3 h-3 mr-1" />
                    Bản chuẩn áp dụng
                  </Badge>
                )}

                {s.status === "DRAFT" && (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold px-2 py-0">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    Bản nháp biên soạn
                  </Badge>
                )}

                {s.status === "ARCHIVED" && (
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] font-semibold px-2 py-0">
                    <ArchiveIcon className="w-3 h-3 mr-1" />
                    Đã lưu trữ
                  </Badge>
                )}
              </div>

              <div className="space-y-0.5">
                <p className="text-xs font-medium text-foreground/90 line-clamp-1">
                  {s.titleEnglish || "Chưa có tiêu đề tiếng Anh"}
                </p>
                {s.titleVietnamese && (
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {s.titleVietnamese}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/40 font-mono">
                <span>{s.credits || 3} Tín chỉ</span>
                <div className="flex items-center gap-2">
                  {onEditMetadata && s.status === "DRAFT" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVersion(s.id);
                        onEditMetadata(s.id);
                      }}
                      className="font-sans text-[11px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                    >
                      <FileTextIcon className="w-3 h-3" />
                      <span>Sửa</span>
                    </button>
                  )}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
