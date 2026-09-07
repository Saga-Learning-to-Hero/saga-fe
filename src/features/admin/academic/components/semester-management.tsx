"use client";

import { useState, useMemo } from "react";
import {
  PlusIcon,
  EditIcon,
  SearchIcon,
  CalendarIcon,
  MoreHorizontalIcon,
  LayoutGridIcon,
  TableIcon,
  ClockIcon,
  CheckCircle2Icon,
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
import { SemesterDialog } from "./semester-dialog";
import { useSemesters, useCreateSemester, usePatchSemester, useSetActiveSemester } from "../hooks/use-academic";
import type { SemesterResponse } from "../types/academic-types";

export function SemesterManagement() {
  const { data: semesters = [], isLoading } = useSemesters();
  const createMutation = useCreateSemester();
  const patchMutation = usePatchSemester();
  const setActiveMutation = useSetActiveSemester();

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<SemesterResponse | null>(null);

  const filteredSemesters = useMemo(() => {
    return semesters.filter((sem) => {
      if (!sem) return false;
      const term = search.trim().toLowerCase();
      if (!term) return true;
      return (
        (sem.code && sem.code.toLowerCase().includes(term)) ||
        (sem.name && sem.name.toLowerCase().includes(term))
      );
    });
  }, [semesters, search]);

  const handleOpenAdd = () => {
    setEditingSemester(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (sem: SemesterResponse) => {
    setEditingSemester(sem);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: { code: string; name: string; startDate: string; endDate: string }) => {
    setIsFormOpen(false);
    if (editingSemester) {
      patchMutation.mutate({
        id: editingSemester.id,
        data: {
          code: data.code,
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
        },
      });
    } else {
      createMutation.mutate({
        code: data.code,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
      });
    }
  };

  const handleSetActive = async (semesterId: string) => {
    setActiveMutation.mutate(semesterId);
  };

  const renderStatusBadge = (active: boolean) => {
    if (active) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Học kỳ hiện tại (Active)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground whitespace-nowrap border border-border">
        Chưa kích hoạt
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Tìm theo mã kỳ (FA26), tên học kỳ..."
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
            Thêm học kỳ đào tạo
          </Button>
        </div>
      </div>

      {isLoading && semesters.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="rounded-2xl border border-border p-5 space-y-4 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-8 bg-muted rounded w-full" />
            </Card>
          ))}
        </div>
      ) : filteredSemesters.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-xs text-muted-foreground">Không tìm thấy học kỳ nào phù hợp.</p>
        </Card>
      ) : viewMode === "cards" ? (
        /* ── DẠNG CARD (Card Grid Layout) ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSemesters.map((sem) => (
            <Card
              key={sem.id}
              className="rounded-2xl border border-border/80 hover:border-primary/40 transition-all duration-200 shadow-xs hover:shadow-md bg-card overflow-hidden group"
            >
              <CardContent className="p-5 space-y-4">
                {/* Header: Code + Status + Dropdown */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className="font-mono text-xs font-bold text-primary border-primary/30 px-2 py-0.5"
                      >
                        {sem.code}
                      </Badge>
                      <h3 className="font-bold text-foreground text-sm mt-1 leading-snug">
                        {sem.name}
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
                      <DropdownMenuContent align="end" className="w-52 p-1">
                        <DropdownMenuItem
                          onClick={() => handleOpenEdit(sem)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                        >
                          <EditIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Chỉnh sửa học kỳ</span>
                        </DropdownMenuItem>
                        {!sem.active && (
                          <DropdownMenuItem
                            onClick={() => handleSetActive(sem.id)}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 focus:bg-emerald-500/10"
                          >
                            <CheckCircle2Icon className="w-3.5 h-3.5" />
                            <span>Đặt làm học kỳ hiện tại</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Duration info */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      Thời gian đào tạo:
                    </span>
                    <span className="font-mono font-medium text-foreground text-[11px]">
                      {sem.startDate} → {sem.endDate}
                    </span>
                  </div>
                </div>

                {/* Footer status */}
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <span className="text-[11px] text-muted-foreground">Trạng thái:</span>
                  {renderStatusBadge(sem.active)}
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
                  <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[110px]">
                    Mã học kỳ (Semester Code)
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold min-w-[200px]">
                    Tên học kỳ (Semester Name)
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[220px]">
                    Thời gian (Duration)
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[160px]">
                    Trạng thái (Status)
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap text-right w-[100px]">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-border/60">
                {filteredSemesters.map((sem) => (
                  <TableRow key={sem.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-3 px-4 whitespace-nowrap font-mono font-bold text-foreground w-[110px]">
                      <Badge variant="outline" className="font-mono text-xs font-bold border-border">
                        {sem.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4 font-semibold text-foreground text-xs min-w-[200px]">
                      {sem.name}
                    </TableCell>
                    <TableCell className="py-3 px-4 whitespace-nowrap text-muted-foreground font-mono text-xs w-[220px]">
                      {sem.startDate} → {sem.endDate}
                    </TableCell>
                    <TableCell className="py-3 px-4 whitespace-nowrap w-[160px]">
                      {renderStatusBadge(sem.active)}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right whitespace-nowrap w-[80px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer outline-none"
                          title="Tùy chọn thao tác"
                        >
                          <MoreHorizontalIcon className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 p-1">
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(sem)}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                          >
                            <EditIcon className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Chỉnh sửa học kỳ</span>
                          </DropdownMenuItem>
                          {!sem.active && (
                            <DropdownMenuItem
                              onClick={() => handleSetActive(sem.id)}
                              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 focus:bg-emerald-500/10"
                            >
                              <CheckCircle2Icon className="w-3.5 h-3.5" />
                              <span>Đặt làm học kỳ hiện tại</span>
                            </DropdownMenuItem>
                          )}
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

      <SemesterDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingSemester={editingSemester}
      />
    </div>
  );
}
