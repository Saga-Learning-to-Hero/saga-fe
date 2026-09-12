"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  GraduationCapIcon,
  UploadCloudIcon,
  DownloadIcon,
  UsersIcon,
  SearchIcon,
  ClockIcon,
  UserXIcon,
  BookOpenIcon,
  UserCheckIcon,
  XIcon,
  FilterIcon,
  RefreshCwIcon,
  LayoutGridIcon,
  TableIcon,
  MailIcon,
  UserPlusIcon,
  UserMinusIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ImportStudentsDialog } from "@/features/admin/academic/components/import-students-dialog";
import { AddStudentDialog } from "@/features/admin/academic/components/add-student-dialog";
import { RemoveStudentDialog } from "@/features/admin/academic/components/remove-student-dialog";
import {
  useCourseDetail,
  useRoster,
  useDownloadRosterTemplate,
} from "@/features/admin/academic/hooks/use-academic";
import type {
  CourseRosterEntry,
  CourseRosterResponse,
  RosterEnrollmentStatus,
} from "@/features/admin/academic/types/course-roster-types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminCourseDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const { data: course, isLoading: isCourseLoading } = useCourseDetail(courseId);
  const { data: rosterData, isLoading: isRosterLoading, refetch: refetchRoster } = useRoster(courseId);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [statusFilter, setStatusFilter] = useState<"ALL" | RosterEnrollmentStatus>("ALL");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedStudentForRemoval, setSelectedStudentForRemoval] = useState<CourseRosterEntry | null>(null);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  const handleOpenRemoveDialog = (student: CourseRosterEntry) => {
    setSelectedStudentForRemoval(student);
    setIsRemoveOpen(true);
  };

  const downloadMutation = useDownloadRosterTemplate();

  const studentsList: CourseRosterEntry[] = useMemo(() => {
    if (!rosterData) return [];
    if (Array.isArray(rosterData)) return rosterData;
    if (Array.isArray((rosterData as CourseRosterResponse).entries)) {
      return (rosterData as CourseRosterResponse).entries;
    }
    if (Array.isArray((rosterData as unknown as { items?: CourseRosterEntry[] }).items)) {
      return (rosterData as unknown as { items: CourseRosterEntry[] }).items;
    }
    return [];
  }, [rosterData]);

  const filteredStudents = useMemo(() => {
    return studentsList.filter((s) => {
      const term = search.trim().toLowerCase();
      const matchSearch =
        term === "" ||
        (s.studentCode && s.studentCode.toLowerCase().includes(term)) ||
        (s.fullName && s.fullName.toLowerCase().includes(term)) ||
        (s.email && s.email.toLowerCase().includes(term));

      const isEnrolled =
        s.kind === "ENROLLMENT" || s.status === "ENROLLED" || s.enrollmentStatus === "ACTIVE";
      const isInvited =
        s.kind === "INVITATION" || s.status === "INVITED" || s.invitationStatus === "PENDING";
      const isDropped = s.status === "DROPPED";

      const currentStatus: RosterEnrollmentStatus = isEnrolled
        ? "ENROLLED"
        : isInvited
          ? "INVITED"
          : isDropped
            ? "DROPPED"
            : "ENROLLED";

      const matchStatus = statusFilter === "ALL" || currentStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [studentsList, search, statusFilter]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(-2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleDownloadTemplate = async () => {
    if (!courseId) return;
    await downloadMutation.mutateAsync({
      courseId,
      courseCode: course?.courseCode,
    });
  };

  const renderStatusBadge = (s: CourseRosterEntry) => {
    const isEnrolled = s.kind === "ENROLLMENT" || s.status === "ENROLLED" || s.enrollmentStatus === "ACTIVE";
    const isInvited = s.kind === "INVITATION" || s.status === "INVITED" || s.invitationStatus === "PENDING";
    const isDropped = s.status === "DROPPED";

    if (isEnrolled) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-success-muted text-success whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Đã ghi danh
        </span>
      );
    }
    if (isInvited) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-warning-muted text-warning whitespace-nowrap">
          <ClockIcon className="w-3 h-3" />
          Chờ kích hoạt
        </span>
      );
    }
    if (isDropped) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-danger-muted text-danger whitespace-nowrap">
          <UserXIcon className="w-3 h-3" />
          Đã rút / Đã khóa
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground whitespace-nowrap">
        {s.status || "Chưa xác định"}
      </span>
    );
  };

  const enrolledCount = useMemo(() => {
    if (typeof (rosterData as CourseRosterResponse)?.enrolledCount === "number") {
      return (rosterData as CourseRosterResponse).enrolledCount;
    }
    return studentsList.filter(
      (s) => s.kind === "ENROLLMENT" || s.status === "ENROLLED" || s.enrollmentStatus === "ACTIVE"
    ).length;
  }, [rosterData, studentsList]);

  const invitedCount = useMemo(() => {
    if (typeof (rosterData as CourseRosterResponse)?.pendingInvitationCount === "number") {
      return (rosterData as CourseRosterResponse).pendingInvitationCount;
    }
    return studentsList.filter(
      (s) => s.kind === "INVITATION" || s.status === "INVITED" || s.invitationStatus === "PENDING"
    ).length;
  }, [rosterData, studentsList]);

  const droppedCount = useMemo(() => {
    return studentsList.filter((s) => s.status === "DROPPED").length;
  }, [studentsList]);

  if (isCourseLoading && !course) {
    return (
      <div className="max-w-7xl mx-auto space-y-5 animate-pulse pb-16">
        <div className="h-4 bg-muted rounded w-48" />
        <div className="p-6 rounded-2xl bg-card border border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-muted shrink-0" />
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded w-64" />
              <div className="h-4 bg-muted rounded w-40" />
            </div>
          </div>
          <div className="h-9 bg-muted rounded-xl w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-20 bg-muted/60 rounded-2xl border border-border" />
          <div className="h-20 bg-muted/60 rounded-2xl border border-border" />
          <div className="h-20 bg-muted/60 rounded-2xl border border-border" />
        </div>
        <div className="h-64 bg-muted/40 rounded-2xl border border-border" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in-0 duration-200">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/admin/academic"
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Quay lại Dữ liệu học thuật
        </Link>
        <span>/</span>
        <span>Lớp học phần</span>
        <span>/</span>
        <span className="font-semibold text-foreground font-mono">{course?.courseCode || courseId}</span>
      </div>

      <Card className="rounded-2xl border border-border shadow-xs bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                <GraduationCapIcon className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground tracking-tight">
                    {course?.name || "Chi tiết Lớp học phần"}
                  </h1>
                  <Badge variant="outline" className="text-xs font-mono font-bold text-primary border-primary/30">
                    {course?.courseCode || "CHƯA CÓ MÃ"}
                  </Badge>
                  {course?.semesterCode && (
                    <Badge variant="secondary" className="text-xs font-medium">
                      Học kỳ {course.semesterCode}
                    </Badge>
                  )}
                  {course?.classCode && (
                    <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
                      Lớp: {course.classCode}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 text-xs text-foreground font-medium border border-border/50">
                    <BookOpenIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                    {course?.subjectName || "Môn học"} ({course?.subjectCode || "N/A"})
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 text-xs text-foreground font-medium border border-border/50">
                    <UsersIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    GV: <strong className="text-foreground">{course?.lecturerFullName || course?.lecturerName || course?.lecturerEmail || "Giảng viên phụ trách"}</strong>
                    {course?.lecturerEmail && course?.lecturerFullName && (
                      <span className="text-[11px] text-muted-foreground font-normal">({course.lecturerEmail})</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 lg:self-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetchRoster()}
                disabled={isRosterLoading}
                className="h-9 w-9 rounded-xl cursor-pointer shadow-2xs text-muted-foreground hover:text-foreground"
                title="Làm mới danh sách"
              >
                <RefreshCwIcon className={`w-4 h-4 ${isRosterLoading ? "animate-spin" : ""}`} />
                <span className="sr-only">Làm mới danh sách</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={downloadMutation.isPending}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-border/80 bg-card hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none shadow-2xs"
                  title="Tùy chọn thao tác khác"
                >
                  <MoreHorizontalIcon className="w-4 h-4" />
                  <span className="sr-only">Tùy chọn khác</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 p-1 rounded-xl shadow-lg border-border/80">
                  <DropdownMenuItem
                    onClick={handleDownloadTemplate}
                    disabled={downloadMutation.isPending}
                    className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium cursor-pointer rounded-lg"
                  >
                    <DownloadIcon className="w-3.5 h-3.5 text-primary" />
                    <span>Tải file mẫu Excel (.xlsx)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddStudentOpen(true)}
                className="h-9 gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs border-border/80 hover:bg-muted"
              >
                <UserPlusIcon className="w-4 h-4 text-primary" />
                Thêm sinh viên
              </Button>

              <Button
                size="sm"
                onClick={() => setIsImportOpen(true)}
                className="h-9 gap-1.5 text-xs font-semibold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs"
              >
                <UploadCloudIcon className="w-4 h-4" />
                Import sinh viên
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Sĩ số sinh viên</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">{studentsList.length}</p>
              <p className="text-[11px] text-muted-foreground">Sinh viên trong lớp học phần</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <UsersIcon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Đã ghi danh</p>
              <p className="text-2xl font-bold text-success tracking-tight">{enrolledCount}</p>
              <p className="text-[11px] text-muted-foreground">Đã sẵn sàng tham gia</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-success-muted flex items-center justify-center text-success shrink-0">
              <UserCheckIcon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Chờ kích hoạt</p>
              <p className="text-2xl font-bold text-warning tracking-tight">{invitedCount}</p>
              <p className="text-[11px] text-muted-foreground">Chưa kích hoạt tài khoản</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-warning-muted flex items-center justify-center text-warning shrink-0">
              <ClockIcon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Đã rút môn</p>
              <p className="text-2xl font-bold text-danger tracking-tight">{droppedCount}</p>
              <p className="text-[11px] text-muted-foreground">Không còn hoạt động</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-danger-muted flex items-center justify-center text-danger shrink-0">
              <UserXIcon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border border-border shadow-xs">
        <CardContent className="p-3 space-y-2.5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Tìm theo MSSV, họ tên, email..."
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

            <div className="flex items-center gap-2">
              <div className="flex flex-wrap items-center gap-1 bg-muted/50 border border-border rounded-lg p-1">
                {(
                  [
                    { value: "ALL", label: "Tất cả trạng thái" },
                    { value: "ENROLLED", label: "Đã ghi danh" },
                    { value: "INVITED", label: "Chờ đăng nhập" },
                    { value: "DROPPED", label: "Đã rút / Đã khóa" },
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
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
            <span className="flex items-center gap-1.5">
              <FilterIcon className="w-3.5 h-3.5" />
              Hiển thị <strong className="text-foreground">{filteredStudents.length}</strong> / {studentsList.length} sinh viên
            </span>
          </div>
        </CardContent>
      </Card>

      {isRosterLoading && studentsList.length === 0 ? (
        viewMode === "cards" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-card border border-border/80 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
                <div className="pt-2 border-t border-border/50 flex justify-between">
                  <div className="h-3 bg-muted rounded w-12" />
                  <div className="h-4 bg-muted rounded-full w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted/60 rounded-lg w-full" />
            ))}
          </div>
        )
      ) : filteredStudents.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-xs text-muted-foreground">
            Không tìm thấy sinh viên nào phù hợp. Hãy import danh sách từ file Excel.
          </p>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((sv) => (
            <Card
              key={sv.enrollmentId || sv.invitationId || sv.studentCode}
              className="rounded-2xl border border-border/80 hover:border-primary/40 transition-all duration-200 shadow-xs hover:shadow-md bg-card overflow-hidden group flex flex-col justify-between"
            >
              <CardContent className="p-4 space-y-3.5">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-10 h-10 rounded-xl shrink-0 shadow-2xs border border-border">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sv.studentCode}`} />
                      <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground rounded-xl">
                        {getInitials(sv.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground text-sm truncate leading-snug" title={sv.fullName}>
                        {sv.fullName}
                      </h3>
                      <Badge variant="outline" className="font-mono text-[11px] font-bold text-primary border-primary/30 mt-1 px-1.5 py-0">
                        {sv.studentCode}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                    <MailIcon className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
                    <span className="truncate" title={sv.email}>{sv.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                    <span>Loại:</span>
                    <span className="font-medium text-foreground">
                      {sv.kind === "ENROLLMENT" ? "Sinh viên" : "Lời mời"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Tài khoản:</span>
                    <span className={sv.accountState === "REGISTERED" ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                      {sv.accountState === "REGISTERED" ? "Đã kích hoạt" : "Chưa kích hoạt"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Trạng thái:</span>
                  <div className="flex items-center gap-1.5">
                    {renderStatusBadge(sv)}
                    {sv.status !== "DROPPED" && sv.enrollmentStatus !== "WITHDRAWN" && sv.invitationStatus !== "CANCELLED" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer"
                        title={sv.kind === "ENROLLMENT" ? "Rút tên sinh viên" : "Hủy thư mời"}
                        onClick={() => handleOpenRemoveDialog(sv)}
                      >
                        <UserMinusIcon className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
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
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap min-w-[130px]">
                    Mã sinh viên
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold min-w-[260px]">
                    Sinh viên & Email
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap min-w-[130px]">
                    Trạng thái
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap text-right min-w-[120px]">
                    Tài khoản
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap text-right min-w-[80px]">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-border/60">
                {filteredStudents.map((sv) => (
                  <TableRow key={sv.enrollmentId || sv.invitationId || sv.studentCode} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-muted text-foreground/90 border border-border/60">
                        {sv.studentCode}
                      </span>
                    </TableCell>

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

                    <TableCell className="py-3 px-4 whitespace-nowrap">
                      {renderStatusBadge(sv)}
                    </TableCell>

                    <TableCell className="py-3 px-4 text-right whitespace-nowrap font-medium text-xs">
                      <span className={sv.accountState === "REGISTERED" ? "text-emerald-600" : "text-amber-600"}>
                        {sv.accountState === "REGISTERED" ? "Đã kích hoạt" : "Chưa kích hoạt"}
                      </span>
                    </TableCell>

                    <TableCell className="py-3 px-4 text-right whitespace-nowrap">
                      {sv.status !== "DROPPED" && sv.enrollmentStatus !== "WITHDRAWN" && sv.invitationStatus !== "CANCELLED" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                          title={sv.kind === "ENROLLMENT" ? "Rút tên sinh viên" : "Hủy thư mời"}
                          onClick={() => handleOpenRemoveDialog(sv)}
                        >
                          <UserMinusIcon className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <ImportStudentsDialog
        courseId={courseId}
        courseCode={course?.courseCode}
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => refetchRoster()}
      />

      <AddStudentDialog
        courseId={courseId}
        courseCode={course?.courseCode}
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
      />

      <RemoveStudentDialog
        courseId={courseId}
        courseCode={course?.courseCode}
        student={selectedStudentForRemoval}
        isOpen={isRemoveOpen}
        onClose={() => {
          setIsRemoveOpen(false);
          setSelectedStudentForRemoval(null);
        }}
        onSuccess={() => refetchRoster()}
      />
    </div>
  );
}
