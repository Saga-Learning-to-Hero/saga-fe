"use client";

import { useState, useMemo, useDeferredValue } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { SUBJECT_QUERY_KEYS } from "../hooks/use-subjects";
import { SYLLABUS_QUERY_KEYS } from "../hooks/use-syllabi";
import { SubjectService } from "../api/subject-service";
import { SyllabusService } from "../api/syllabus-service";
import {
  SearchIcon,
  PlusIcon,
  BookOpenIcon,
  EditIcon,
  LayersIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  LayoutGridIcon,
  TableIcon,
  CalendarIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { CustomSelect } from "@/components/common/custom-select";
import type { SubjectResponse, SubjectStatus } from "../types/subject-types";

interface SubjectListProps {
  subjects: SubjectResponse[];
  isLoading?: boolean;
  onOpenCreateDialog: () => void;
  onOpenEditDialog: (subject: SubjectResponse) => void;
}

export function SubjectList({
  subjects,
  isLoading = false,
  onOpenCreateDialog,
  onOpenEditDialog,
}: SubjectListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const router = useRouter();
  const queryClient = useQueryClient();

  const handlePrefetch = (subjectId: string, activeVersionId?: string) => {
    router.prefetch(`/admin/subjects/${subjectId}`);
    queryClient.prefetchQuery({
      queryKey: SUBJECT_QUERY_KEYS.detail(subjectId),
      queryFn: () => SubjectService.getSubjectById(subjectId),
      staleTime: 1000 * 60 * 5,
    });
    queryClient.prefetchQuery({
      queryKey: SYLLABUS_QUERY_KEYS.bySubject(subjectId),
      queryFn: () => SyllabusService.getSyllabi(subjectId),
      staleTime: 1000 * 60 * 5,
    });
    if (activeVersionId) {
      queryClient.prefetchQuery({
        queryKey: SYLLABUS_QUERY_KEYS.detail(subjectId, activeVersionId),
        queryFn: () => SyllabusService.getSyllabusDetail(subjectId, activeVersionId),
        staleTime: 1000 * 60 * 5,
      });
    }
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter((sub) => {
      const matchSearch =
        sub.code.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        sub.nameEnglish.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        (sub.nameVietnamese && sub.nameVietnamese.toLowerCase().includes(deferredSearch.toLowerCase()));

      const matchStatus =
        statusFilter === "ALL" ? true : sub.status === (statusFilter as SubjectStatus);

      return matchSearch && matchStatus;
    });
  }, [subjects, deferredSearch, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã môn (SWP391) hoặc tên môn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-background"
            />
          </div>

          <div className="w-full sm:w-56">
            <CustomSelect
              id="status-filter"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "ALL", label: "Tất cả trạng thái", subLabel: "Tất cả môn học trong hệ thống" },
                { value: "ACTIVE", label: "Đang hoạt động (ACTIVE)", subLabel: "Môn học được phép mở lớp" },
                { value: "INACTIVE", label: "Tạm ngừng (INACTIVE)", subLabel: "Môn học bị ngưng đào tạo" },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/80 shrink-0">
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-md text-xs cursor-pointer transition-colors ${viewMode === "cards"
                ? "bg-card text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
                }`}
              title="Dạng thẻ Card"
            >
              <LayoutGridIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md text-xs cursor-pointer transition-colors ${viewMode === "table"
                ? "bg-card text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
                }`}
              title="Dạng bảng Table"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            onClick={onOpenCreateDialog}
            className="h-9 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <PlusIcon className="w-4 h-4" />
            Thêm Môn học
          </Button>
        </div>
      </div>

      {isLoading && subjects.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="rounded-2xl border border-border p-5 space-y-4 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-8 bg-muted rounded w-full" />
            </Card>
          ))}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <BookOpenIcon className="w-5 h-5 text-muted-foreground/60" />
            </div>
            <p className="font-semibold text-foreground text-sm">Không tìm thấy môn học nào</p>
            <p className="text-xs text-muted-foreground">
              Thử điều chỉnh từ khóa tìm kiếm hoặc bấm &quot;Thêm Môn học&quot; để tạo mới.
            </p>
          </div>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((sub) => {
            const syllabiCount = sub.syllabi?.length || 0;
            const activeSyllabus = sub.syllabi?.find((s) => s.status === "PUBLISHED");

            return (
              <Card
                key={sub.id}
                onMouseEnter={() => handlePrefetch(sub.id, activeSyllabus?.id || sub.syllabi?.[0]?.id)}
                className="rounded-2xl border border-border/80 hover:border-primary/40 transition-all duration-200 shadow-xs hover:shadow-md bg-card overflow-hidden group flex flex-col justify-between h-full"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                          {sub.code}
                        </span>
                        {sub.status === "ACTIVE" ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 inline-flex items-center gap-1"
                          >
                            <CheckCircle2Icon className="w-3 h-3" />
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-muted text-muted-foreground border-border text-[10px] font-semibold px-2 py-0.5 inline-flex items-center gap-1"
                          >
                            <AlertCircleIcon className="w-3 h-3" />
                            Tạm ngừng
                          </Badge>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer outline-none"
                          title="Tùy chọn thao tác"
                        >
                          <MoreHorizontalIcon className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-1">
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/subjects/${sub.id}`)}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                          >
                            <LayersIcon className="w-3.5 h-3.5 text-primary" />
                            <span>Xem đề cương chi tiết</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onOpenEditDialog(sub)}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                          >
                            <EditIcon className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Chỉnh sửa môn học</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="min-h-[44px] flex flex-col justify-start">
                      <h3 className="font-bold text-foreground text-sm leading-snug truncate" title={sub.nameEnglish}>
                        {sub.nameEnglish}
                      </h3>
                      {sub.nameVietnamese ? (
                        <p className="text-xs text-muted-foreground truncate mt-0.5" title={sub.nameVietnamese}>
                          {sub.nameVietnamese}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/40 italic truncate mt-0.5 select-none">
                          (Chưa cập nhật tên tiếng Việt)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs h-[46px]">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <LayersIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      Đề cương:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground">
                        {syllabiCount} phiên bản
                      </span>
                      {activeSyllabus && (
                        <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0">
                          {activeSyllabus.versionLabel}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground/70" />
                      {new Date(sub.createdAt).toLocaleDateString("vi-VN")}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenEditDialog(sub)}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <EditIcon className="w-3 h-3 mr-1" />
                        Sửa
                      </Button>

                      <Link
                        href={`/admin/subjects/${sub.id}`}
                        prefetch={true}
                        onMouseEnter={() => handlePrefetch(sub.id, activeSyllabus?.id || sub.syllabi?.[0]?.id)}
                        className="inline-flex items-center justify-center rounded-lg border border-border/80 bg-background hover:bg-primary/10 hover:text-primary h-7 px-2.5 text-xs font-semibold text-primary transition-colors cursor-pointer shadow-2xs"
                      >
                        Đề cương
                        <ArrowRightIcon className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow>
                  <TableHead className="w-[110px] text-xs font-bold py-3.5 px-4">Mã môn</TableHead>
                  <TableHead className="min-w-[240px] text-xs font-bold py-3.5 px-4">Tên môn học</TableHead>
                  <TableHead className="w-[140px] text-xs font-bold py-3.5 px-4 text-center">Trạng thái</TableHead>
                  <TableHead className="w-[160px] text-xs font-bold py-3.5 px-4 text-center">Phiên bản Đề cương</TableHead>
                  <TableHead className="w-[130px] text-xs font-bold py-3.5 px-4 text-center">Ngày tạo</TableHead>
                  <TableHead className="w-[90px] text-xs font-bold py-3.5 px-4 text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {filteredSubjects.map((sub) => {
                  const syllabiCount = sub.syllabi?.length || 0;
                  const activeSyllabus = sub.syllabi?.find((s) => s.status === "PUBLISHED");

                  return (
                    <TableRow
                      key={sub.id}
                      onMouseEnter={() => handlePrefetch(sub.id, activeSyllabus?.id || sub.syllabi?.[0]?.id)}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="py-3.5 px-4">
                        <span className="font-mono text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                          {sub.code}
                        </span>
                      </TableCell>

                      <TableCell className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-foreground">{sub.nameEnglish}</p>
                          {sub.nameVietnamese && (
                            <p className="text-[11px] text-muted-foreground">{sub.nameVietnamese}</p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 px-4 text-center">
                        {sub.status === "ACTIVE" ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 inline-flex items-center gap-1"
                          >
                            <CheckCircle2Icon className="w-3 h-3" />
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-muted text-muted-foreground border-border text-[10px] font-semibold px-2 py-0.5 inline-flex items-center gap-1"
                          >
                            <AlertCircleIcon className="w-3 h-3" />
                            Tạm ngừng
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <Badge
                            variant="outline"
                            className="font-mono text-[11px] font-semibold gap-1 px-2 py-0.5 bg-muted/30"
                          >
                            <LayersIcon className="w-3 h-3 text-muted-foreground" />
                            {syllabiCount} phiên bản
                          </Badge>
                          {activeSyllabus && (
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                              Chuẩn: {activeSyllabus.versionLabel}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 px-4 text-center font-mono text-xs text-muted-foreground">
                        {new Date(sub.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>

                      <TableCell className="py-3.5 px-4 text-center whitespace-nowrap w-[90px]">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer outline-none"
                            title="Tùy chọn thao tác"
                          >
                            <MoreHorizontalIcon className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 p-1">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/subjects/${sub.id}`)}
                              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                            >
                              <LayersIcon className="w-3.5 h-3.5 text-primary" />
                              <span>Xem đề cương chi tiết</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onOpenEditDialog(sub)}
                              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                            >
                              <EditIcon className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>Chỉnh sửa môn học</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
