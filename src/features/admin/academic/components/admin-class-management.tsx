"use client";

import { useState, useMemo } from "react";
import {
  PlusIcon,
  EditIcon,
  SearchIcon,
  MoreHorizontalIcon,
  SchoolIcon,
  CalendarIcon,
  LayoutGridIcon,
  TableIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { AdminClassDialog } from "./admin-class-dialog";
import { useAdminClasses, useCreateAdminClass, usePatchAdminClass, useSemesters } from "../hooks/use-academic";
import type { AcademicClassResponse } from "../types/academic-types";

export function AdminClassManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<AcademicClassResponse | null>(null);

  const { data: adminClasses = [], isLoading } = useAdminClasses();
  const { data: semesters = [] } = useSemesters({ enabled: isFormOpen });
  const createMutation = useCreateAdminClass();
  const patchMutation = usePatchAdminClass();

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const filteredClasses = useMemo(() => {
    return adminClasses.filter((c) => {
      if (!c) return false;
      const term = search.trim().toLowerCase();
      if (!term) return true;
      const code = c.classCode || c.code || "";
      return (
        code.toLowerCase().includes(term) ||
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.semesterCode && c.semesterCode.toLowerCase().includes(term))
      );
    });
  }, [adminClasses, search]);

  const handleOpenAdd = () => {
    setEditingClass(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cls: AcademicClassResponse) => {
    setEditingClass(cls);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Omit<AcademicClassResponse, "id" | "createdAt" | "semesterCode" | "updatedAt">) => {
    setIsFormOpen(false);
    if (editingClass) {
      patchMutation.mutate({
        id: editingClass.id,
        data: {
          classCode: data.classCode || data.code,
          name: data.name,
        },
      });
    } else {
      createMutation.mutate({
        classCode: data.classCode || data.code,
        code: data.classCode || data.code,
        name: data.name,
        semesterId: data.semesterId,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Tìm theo mã lớp (SE1705), tên lớp, học kỳ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/80">
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
            onClick={handleOpenAdd}
            size="sm"
            className="h-9 gap-1.5 text-xs font-semibold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs"
          >
            <PlusIcon className="w-4 h-4" />
            Thêm lớp hành chính mới
          </Button>
        </div>
      </div>

      {isLoading && adminClasses.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="rounded-2xl border border-border p-5 space-y-3.5 animate-pulse bg-card shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-5 bg-muted rounded w-24" />
                    <div className="h-4 bg-muted rounded w-40" />
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
              </div>
              <div className="pt-2">
                <div className="h-5 bg-muted/60 rounded w-24" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredClasses.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-xs text-muted-foreground">Không tìm thấy lớp hành chính nào phù hợp.</p>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((cls) => (
            <Card
              key={cls.id}
              className="rounded-2xl border border-border/80 hover:border-primary/40 transition-all duration-200 shadow-xs hover:shadow-md bg-card overflow-hidden group"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-info-muted flex items-center justify-center text-info shrink-0 shadow-2xs">
                      <SchoolIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className="font-mono text-xs font-bold text-primary border-primary/30 px-2 py-0.5"
                      >
                        {cls.classCode || cls.code}
                      </Badge>
                      <h3 className="font-bold text-foreground text-sm mt-1 leading-snug">
                        {cls.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer outline-none"
                        title="Tùy chọn thao tác"
                      >
                        <MoreHorizontalIcon className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 p-1">
                        <DropdownMenuItem
                          onClick={() => handleOpenEdit(cls)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                        >
                          <EditIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Chỉnh sửa lớp</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      Học kỳ đào tạo:
                    </span>
                    <span className="font-semibold text-foreground text-xs">
                      {cls.semesterCode ? `Học kỳ ${cls.semesterCode}` : "Chưa gắn kỳ"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
                  <span>Lớp sinh viên niên khóa</span>
                  <span className="font-mono">{cls.createdAt ? new Date(cls.createdAt).toLocaleDateString("vi-VN") : "—"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* ── DẠNG TABLE ── */
        <Card className="rounded-2xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table className="w-full text-left text-xs border-collapse">
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow>
                  <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[120px]">
                    Mã lớp (Cohort Code)
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold min-w-[280px]">
                    Tên lớp hành chính (Class Name)
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[220px]">
                    Học kỳ (Semester)
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap text-right w-[80px]">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-border/60">
                {filteredClasses.map((cls) => (
                  <TableRow key={cls.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-3 px-4 whitespace-nowrap font-mono font-bold text-foreground">
                      <Badge variant="outline" className="font-mono text-xs font-bold text-primary border-primary/30">
                        {cls.classCode || cls.code}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3 px-4 font-semibold text-foreground text-xs">
                      {cls.name}
                    </TableCell>

                    <TableCell className="py-3 px-4 whitespace-nowrap text-muted-foreground font-medium">
                      {cls.semesterCode || "-"}
                    </TableCell>

                    <TableCell className="py-3 px-4 text-right whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer outline-none"
                          title="Tùy chọn thao tác"
                        >
                          <MoreHorizontalIcon className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 p-1">
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(cls)}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                          >
                            <EditIcon className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Chỉnh sửa lớp</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <AdminClassDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingClass={editingClass}
        semesters={semesters}
      />
    </div>
  );
}
