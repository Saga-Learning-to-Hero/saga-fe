"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  GraduationCapIcon,
  UploadCloudIcon,
  DownloadIcon,
  UsersIcon,
  SearchIcon,
  FolderKanbanIcon,
  ClockIcon,
  UserXIcon,
  BookOpenIcon,
  UserCheckIcon,
  MailIcon,
  XIcon,
  FilterIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ImportStudentsDialog } from "@/features/admin/academic/components/import-students-dialog";
import {
  MOCK_COURSES,
  MOCK_COURSE_STUDENTS,
} from "@/features/admin/academic/data/mock-academic";
import type {
  CourseStudent,
  ImportedStudentPreview,
} from "@/features/admin/academic/types/academic-management";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminCourseDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const course = useMemo(() => {
    return MOCK_COURSES.find((c) => c.id === resolvedParams.id);
  }, [resolvedParams.id]);

  const [students, setStudents] = useState<CourseStudent[]>(() => {
    return MOCK_COURSE_STUDENTS[resolvedParams.id] || MOCK_COURSE_STUDENTS["crs-01"] || [];
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "PENDING" | "BANNED">("ALL");
  const [groupFilter, setGroupFilter] = useState<"ALL" | "ASSIGNED" | "UNASSIGNED">("ALL");
  const [isImportOpen, setIsImportOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        search.trim() === "" ||
        s.studentCode.toLowerCase().includes(search.toLowerCase()) ||
        s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.groupName && s.groupName.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === "ALL" || s.status === statusFilter;

      let matchGroup = true;
      if (groupFilter === "ASSIGNED") {
        matchGroup = Boolean(s.groupName && s.groupName !== "Chưa phân nhóm");
      } else if (groupFilter === "UNASSIGNED") {
        matchGroup = !s.groupName || s.groupName === "Chưa phân nhóm";
      }

      return matchSearch && matchStatus && matchGroup;
    });
  }, [students, search, statusFilter, groupFilter]);

  if (!course) {
    return notFound();
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(-2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleConfirmImport = (
    _courseId: string,
    importedList: ImportedStudentPreview[]
  ) => {
    const newStudents: CourseStudent[] = importedList.map((item, index) => ({
      id: `new-sv-${Date.now()}-${index}`,
      studentCode: item.studentCode,
      fullName: item.fullName,
      email: item.email,
      groupName: item.groupName || "Chưa phân nhóm",
      status: "PENDING",
      enrolledAt: new Date().toISOString(),
    }));

    setStudents((prev) => [...prev, ...newStudents]);
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,MSSV,HoVaTen,Email,Nhom\nHE170504,Le Hoang Hai,hailhhe170504@fpt.edu.vn,Nhom 01\nSE171234,Nguyen Duc Trung,trungndse171234@fpt.edu.vn,Nhom 01\nSE172345,Vu Tuan Minh,minhvtse172345@fpt.edu.vn,Nhom 02";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Mau_Danh_Sach_Sinh_Vien_${course.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatusBadge = (status: "ACTIVE" | "PENDING" | "BANNED") => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-success-muted text-success whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Hoạt động
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-warning-muted text-warning whitespace-nowrap">
            <ClockIcon className="w-3 h-3" />
            Chờ đăng nhập
          </span>
        );
      case "BANNED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-danger-muted text-danger whitespace-nowrap">
            <UserXIcon className="w-3 h-3" />
            Đã khóa
          </span>
        );
    }
  };

  // Stats calculation
  const activeCount = students.filter((s) => s.status === "ACTIVE").length;
  const pendingCount = students.filter((s) => s.status === "PENDING").length;

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in-0 duration-200">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/admin/academic"
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Quay lại Dữ liệu học thuật
        </Link>
        <span>/</span>
        <span>Khóa học & Học phần</span>
        <span>/</span>
        <span className="font-semibold text-foreground">{course.code}</span>
      </div>

      {/* ── Hero Header Card ── */}
      <Card className="rounded-2xl border border-border shadow-xs bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Left: Course Info */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                <GraduationCapIcon className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground tracking-tight">
                    {course.name}
                  </h1>
                  <Badge variant="outline" className="text-xs font-mono font-bold text-primary border-primary/30">
                    {course.code}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {course.semesterName}
                  </Badge>
                </div>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 text-xs text-foreground font-medium border border-border/50">
                    <BookOpenIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                    {course.subjectName} ({course.subjectCode})
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 text-xs text-foreground font-medium border border-border/50">
                    <UsersIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    GV: {course.lecturer.fullName}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 text-xs text-muted-foreground border border-border/50">
                    <MailIcon className="w-3.5 h-3.5 shrink-0" />
                    {course.lecturer.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 lg:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="h-9 gap-1.5 text-xs font-medium cursor-pointer shadow-2xs"
              >
                <DownloadIcon className="w-3.5 h-3.5" />
                Tải file mẫu Excel
              </Button>

              <Button
                size="sm"
                onClick={() => setIsImportOpen(true)}
                className="h-9 gap-1.5 text-xs font-semibold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs"
              >
                <UploadCloudIcon className="w-4 h-4" />
                Import danh sách sinh viên
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Summary Metrics Grid (4 cột cân đối) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1 */}
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Sĩ số sinh viên</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">{students.length}</p>
              <p className="text-[11px] text-muted-foreground">Đã ghi danh vào khóa</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <UsersIcon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Nhóm đồ án</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">{course.groupsCount}</p>
              <p className="text-[11px] text-muted-foreground">Đang thực hiện đồ án</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-info-muted flex items-center justify-center text-info shrink-0">
              <FolderKanbanIcon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Đang hoạt động</p>
              <p className="text-2xl font-bold text-success tracking-tight">{activeCount}</p>
              <p className="text-[11px] text-muted-foreground">
                {students.length > 0 ? `${Math.round((activeCount / students.length) * 100)}% tổng số sinh viên` : "0%"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-success-muted flex items-center justify-center text-success shrink-0">
              <UserCheckIcon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Chờ đăng nhập</p>
              <p className="text-2xl font-bold text-warning tracking-tight">{pendingCount}</p>
              <p className="text-[11px] text-muted-foreground">Chưa kích hoạt tài khoản</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-warning-muted flex items-center justify-center text-warning shrink-0">
              <ClockIcon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Table Toolbar ── */}
      <Card className="rounded-2xl border border-border shadow-xs">
        <CardContent className="p-3 space-y-2.5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Tìm theo MSSV, họ tên, email, nhóm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-8 h-9 text-xs"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-muted/50 border border-border rounded-lg p-1">
                {(
                  [
                    { value: "ALL", label: "Tất cả trạng thái" },
                    { value: "ACTIVE", label: "Hoạt động" },
                    { value: "PENDING", label: "Chờ đăng nhập" },
                    { value: "BANNED", label: "Đã khóa" },
                  ] as const
                ).map((tab) => (
                  <Button
                    key={tab.value}
                    variant={statusFilter === tab.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setStatusFilter(tab.value)}
                    className={`h-7 px-2.5 text-xs font-medium rounded-md ${statusFilter === tab.value ? "shadow-2xs" : "text-muted-foreground"
                      }`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>

              {/* Group Filter */}
              <div className="flex items-center gap-1 bg-muted/50 border border-border rounded-lg p-1">
                {(
                  [
                    { value: "ALL", label: "Tất cả nhóm" },
                    { value: "ASSIGNED", label: "Đã có nhóm" },
                    { value: "UNASSIGNED", label: "Chưa nhóm" },
                  ] as const
                ).map((tab) => (
                  <Button
                    key={tab.value}
                    variant={groupFilter === tab.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setGroupFilter(tab.value)}
                    className={`h-7 px-2.5 text-xs font-medium rounded-md ${groupFilter === tab.value ? "shadow-2xs" : "text-muted-foreground"
                      }`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Indicator */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
            <span className="flex items-center gap-1.5">
              <FilterIcon className="w-3.5 h-3.5" />
              Hiển thị <strong className="text-foreground">{filteredStudents.length}</strong> / {students.length} sinh viên
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Students Table (Bố cục chặt chẽ, khoảng cách chuẩn mực) ── */}
      <Card className="rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs border-collapse">
            <TableHeader className="bg-muted/40 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap min-w-[130px]">
                  Mã sinh viên (MSSV)
                </TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold min-w-[260px]">
                  Sinh viên & Email
                </TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap min-w-[180px]">
                  Nhóm đồ án
                </TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap min-w-[130px]">
                  Trạng thái
                </TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap text-right min-w-[120px]">
                  Ngày ghi danh
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-border/60">
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Không tìm thấy sinh viên phù hợp. Hãy thử đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((sv) => (
                  <TableRow key={sv.id} className="hover:bg-muted/30 transition-colors">
                    {/* MSSV (Font Mono chuẩn) */}
                    <TableCell className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-muted text-foreground/90 border border-border/60">
                        {sv.studentCode}
                      </span>
                    </TableCell>

                    {/* Avatar + Full Name + Email (Gộp khối hài hòa) */}
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 rounded-xl shrink-0">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sv.studentCode}`} />
                          <AvatarFallback className="text-[10px] font-bold bg-primary text-primary-foreground rounded-xl">
                            {getInitials(sv.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-foreground text-sm leading-tight">
                            {sv.fullName}
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {sv.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Group Name */}
                    <TableCell className="py-3 px-4 whitespace-nowrap">
                      {sv.groupName && sv.groupName !== "Chưa phân nhóm" ? (
                        <Badge variant="outline" className="text-xs font-medium border-border gap-1.5 py-1">
                          <FolderKanbanIcon className="w-3 h-3 text-primary" />
                          {sv.groupName}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/60 text-xs italic">
                          Chưa phân nhóm
                        </span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3 px-4 whitespace-nowrap">
                      {renderStatusBadge(sv.status)}
                    </TableCell>

                    {/* Enrolled Date */}
                    <TableCell className="py-3 px-4 text-right whitespace-nowrap text-muted-foreground font-mono text-xs">
                      {new Date(sv.enrolledAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── Modal Import Sinh viên ── */}
      <ImportStudentsDialog
        course={course}
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onConfirmImport={handleConfirmImport}
      />
    </div>
  );
}
