"use client";

import { DatabaseIcon, GraduationCapIcon, CalendarIcon, SchoolIcon, RefreshCwIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CourseManagement } from "@/features/admin/academic/components/course-management";
import { AdminClassManagement } from "@/features/admin/academic/components/admin-class-management";
import { SemesterManagement } from "@/features/admin/academic/components/semester-management";
import {
  useSemesters,
  useAdminClasses,
  useCourses,
} from "@/features/admin/academic/hooks/use-academic";

export default function AdminAcademicPage() {
  const {
    data: semesterResponses = [],
    isLoading: isSemLoading,
    refetch: refetchSemesters,
  } = useSemesters();

  const {
    data: classResponses = [],
    isLoading: isClassLoading,
    refetch: refetchClasses,
  } = useAdminClasses();

  const {
    data: courseResponses = [],
    isLoading: isCourseLoading,
    refetch: refetchCourses,
  } = useCourses();

  const handleRefreshAll = () => {
    refetchSemesters();
    refetchClasses();
    refetchCourses();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in-0 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs">
            <DatabaseIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Cấu trúc Học thuật & Danh sách Lớp (Academic Structure & Roster)
            </h1>
            <p className="text-xs text-muted-foreground">
              Quản trị Lớp học phần (Course Sections), Lớp hành chính niên khóa (Cohort Classes) và Học kỳ đào tạo (Semesters).
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshAll}
          className="text-xs h-9 gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCwIcon className="w-3.5 h-3.5" />
          Làm mới dữ liệu
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Lớp học phần (Course Sections)</p>
              <p className="text-2xl font-bold text-foreground">{courseResponses.length}</p>
              <p className="text-[11px] text-muted-foreground">
                {isCourseLoading ? "Đang đồng bộ..." : "Lớp học phần đồ án"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <GraduationCapIcon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Lớp hành chính (Cohort Classes)</p>
              <p className="text-2xl font-bold text-foreground">{classResponses.length}</p>
              <p className="text-[11px] text-muted-foreground">
                {isClassLoading ? "Đang đồng bộ..." : "Lớp sinh viên niên khóa"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-info-muted flex items-center justify-center text-info">
              <SchoolIcon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Học kỳ đào tạo (Semesters)</p>
              <p className="text-2xl font-bold text-foreground">{semesterResponses.length}</p>
              <p className="text-[11px] text-muted-foreground">
                {isSemLoading ? "Đang đồng bộ..." : `${semesterResponses.filter((s) => s.active).length} kỳ đang diễn ra`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-success-muted flex items-center justify-center text-success">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="courses" className="text-xs font-semibold gap-1.5 px-3.5 py-1.5">
            <GraduationCapIcon className="w-3.5 h-3.5" />
            Lớp học phần ({courseResponses.length})
          </TabsTrigger>
          <TabsTrigger value="admin-classes" className="text-xs font-semibold gap-1.5 px-3.5 py-1.5">
            <SchoolIcon className="w-3.5 h-3.5" />
            Lớp hành chính ({classResponses.length})
          </TabsTrigger>
          <TabsTrigger value="semesters" className="text-xs font-semibold gap-1.5 px-3.5 py-1.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            Học kỳ đào tạo ({semesterResponses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" keepMounted>
          <CourseManagement />
        </TabsContent>

        <TabsContent value="admin-classes" keepMounted>
          <AdminClassManagement />
        </TabsContent>

        <TabsContent value="semesters" keepMounted>
          <SemesterManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
