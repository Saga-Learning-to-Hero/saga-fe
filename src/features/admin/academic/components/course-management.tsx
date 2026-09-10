"use client";

import { useState, useMemo, useDeferredValue } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  PlusIcon,
  EditIcon,
  SearchIcon,
  MoreHorizontalIcon,
  GraduationCapIcon,
  BookOpenIcon,
  UsersIcon,
  CalendarIcon,
  SchoolIcon,
  ArrowRightIcon,
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
import { CourseDialog } from "./course-dialog";
import {
  useCourses,
  useCreateCourse,
  usePatchCourse,
  useSemesters,
  useAdminClasses,
  prefetchCourseDetailQuery,
  prefetchRosterQuery,
} from "../hooks/use-academic";
import { useSubjects } from "@/features/admin/subjects/hooks/use-subjects";
import type { CourseResponse } from "../types/course-roster-types";

export interface CourseFormData {
  courseCode: string;
  name: string;
  subjectId: string;
  syllabusVersionId: string;
  academicClassId: string;
  semesterId: string;
  lecturerId: string;
}

export function CourseManagement() {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null);

  const { data: courses = [], isLoading } = useCourses();
  const { data: subjects = [] } = useSubjects(undefined, { enabled: isFormOpen });
  const { data: semesters = [] } = useSemesters({ enabled: isFormOpen });
  const { data: adminClasses = [] } = useAdminClasses({ enabled: isFormOpen });

  const queryClient = useQueryClient();
  const createMutation = useCreateCourse();
  const patchMutation = usePatchCourse();

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const handlePrefetchCourse = (courseId: string) => {
    router.prefetch(`/admin/academic/courses/${courseId}`);
    void prefetchCourseDetailQuery(queryClient, courseId);
    void prefetchRosterQuery(queryClient, courseId);
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (!c) return false;
      const term = deferredSearch.trim().toLowerCase();
      if (!term) return true;
      return (
        (c.courseCode && c.courseCode.toLowerCase().includes(term)) ||
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.subjectName && c.subjectName.toLowerCase().includes(term)) ||
        (c.lecturerFullName && c.lecturerFullName.toLowerCase().includes(term)) ||
        (c.lecturerName && c.lecturerName.toLowerCase().includes(term)) ||
        (c.lecturerEmail && c.lecturerEmail.toLowerCase().includes(term)) ||
        (c.classCode && c.classCode.toLowerCase().includes(term)) ||
        (c.semesterCode && c.semesterCode.toLowerCase().includes(term))
      );
    });
  }, [courses, deferredSearch]);

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (crs: CourseResponse) => {
    setEditingCourse(crs);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: CourseFormData) => {
    setIsFormOpen(false);
    if (editingCourse) {
      patchMutation.mutate({
        id: editingCourse.id,
        data: {
          name: data.name,
          courseCode: data.courseCode,
          lecturerId: data.lecturerId,
          syllabusVersionId: data.syllabusVersionId,
        },
      });
    } else {
      createMutation.mutate({
        academicClassId: data.academicClassId,
        subjectId: data.subjectId,
        syllabusVersionId: data.syllabusVersionId,
        lecturerId: data.lecturerId,
        courseCode: data.courseCode,
        name: data.name,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Tìm theo mã học phần, môn học, giảng viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
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
            Mở lớp học phần mới
          </Button>
        </div>
      </div>

      {isLoading && courses.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="rounded-2xl border border-border p-5 space-y-3.5 animate-pulse bg-card shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-5 bg-muted rounded w-24" />
                    <div className="h-4 bg-muted rounded w-44" />
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
              </div>

              <div className="space-y-2 pt-2">
                <div className="h-4 bg-muted/70 rounded w-36" />
                <div className="h-4 bg-muted/70 rounded w-48" />
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-5 bg-muted/60 rounded w-20" />
                  <div className="h-5 bg-muted/60 rounded w-20" />
                </div>
              </div>

              <div className="pt-3 border-t border-border/50">
                <div className="h-9 bg-muted/80 rounded-xl w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-xs text-muted-foreground">Không tìm thấy lớp học phần nào phù hợp.</p>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((crs) => (
            <Card
              key={crs.id}
              onMouseEnter={() => handlePrefetchCourse(crs.id)}
              className="rounded-2xl border border-border/80 hover:border-primary/40 transition-all duration-200 shadow-xs hover:shadow-md bg-card overflow-hidden group flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                        <GraduationCapIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <Badge
                          variant="outline"
                          className="font-mono text-xs font-bold text-primary border-primary/30 px-2 py-0.5"
                        >
                          {crs.courseCode}
                        </Badge>
                        <h3 className="font-bold text-foreground text-sm mt-1 leading-snug line-clamp-1">
                          {crs.name}
                        </h3>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer outline-none"
                        title="Tùy chọn thao tác"
                      >
                        <MoreHorizontalIcon className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 p-1">
                        <DropdownMenuItem
                          onClick={() => handleOpenEdit(crs)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                        >
                          <EditIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Chỉnh sửa thông tin</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 pt-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpenIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">
                        {crs.subjectName || crs.subjectCode || "Môn học"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UsersIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">
                        GV: <strong className="text-foreground font-medium">{crs.lecturerFullName || crs.lecturerName || crs.lecturerEmail || "Chưa phân công"}</strong>
                        {crs.lecturerEmail && crs.lecturerFullName && (
                          <span className="text-[11px] text-muted-foreground ml-1 font-normal">({crs.lecturerEmail})</span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-md border border-border/60">
                        <SchoolIcon className="w-3 h-3 text-muted-foreground" />
                        Lớp: <strong className="text-foreground">{crs.classCode || "—"}</strong>
                      </span>
                      <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-md border border-border/60">
                        <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                        Kỳ: <strong className="text-foreground">{crs.semesterCode || "—"}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50">
                  <Link
                    href={`/admin/academic/courses/${crs.id}`}
                    prefetch={true}
                    onMouseEnter={() => handlePrefetchCourse(crs.id)}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all duration-150 cursor-pointer shadow-2xs group-hover:shadow-xs"
                  >
                    <span>Quản lý Roster sinh viên</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table className="w-full text-left text-xs border-collapse">
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow>
                  <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[130px]">
                    Mã học phần
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold min-w-[240px]">
                    Tên học phần
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap min-w-[160px]">
                    Môn học
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap min-w-[180px]">
                    Giảng viên
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap text-right w-[120px]">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-border/60">
                {filteredCourses.map((crs) => (
                  <TableRow
                    key={crs.id}
                    onMouseEnter={() => handlePrefetchCourse(crs.id)}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="py-3 px-4 whitespace-nowrap font-mono font-bold text-foreground">
                      <Badge variant="outline" className="font-mono text-xs font-bold text-primary border-primary/30">
                        {crs.courseCode}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3 px-4 font-semibold text-foreground text-xs">
                      {crs.name}
                    </TableCell>

                    <TableCell className="py-3 px-4 whitespace-nowrap text-muted-foreground font-medium">
                      {crs.subjectName || crs.subjectCode || "—"}
                    </TableCell>

                    <TableCell className="py-3 px-4 whitespace-nowrap text-muted-foreground font-medium">
                      {crs.lecturerFullName || crs.lecturerName || crs.lecturerEmail || "—"}
                    </TableCell>

                    <TableCell className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/academic/courses/${crs.id}`}
                          prefetch={true}
                          onMouseEnter={() => handlePrefetchCourse(crs.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-colors cursor-pointer"
                        >
                          <span>Roster</span>
                          <ArrowRightIcon className="w-3 h-3" />
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer outline-none"
                            title="Tùy chọn thao tác"
                          >
                            <MoreHorizontalIcon className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 p-1">
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(crs)}
                              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                            >
                              <EditIcon className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>Chỉnh sửa thông tin</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <CourseDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingCourse={editingCourse}
        subjects={subjects}
        semesters={semesters}
        adminClasses={adminClasses}
      />
    </div>
  );
}
