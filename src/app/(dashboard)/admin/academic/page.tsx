"use client";

import { useState } from "react";
import { DatabaseIcon, GraduationCapIcon, CalendarIcon, SchoolIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CourseManagement } from "@/features/admin/academic/components/course-management";
import { AdminClassManagement } from "@/features/admin/academic/components/admin-class-management";
import { SemesterManagement } from "@/features/admin/academic/components/semester-management";
import {
  MOCK_COURSES,
  MOCK_ADMIN_CLASSES,
  MOCK_SUBJECTS,
  MOCK_SEMESTERS,
} from "@/features/admin/academic/data/mock-academic";
import {
  Course,
  AdminClass,
  Subject,
  Semester,
} from "@/features/admin/academic/types/academic-management";

export default function AdminAcademicPage() {
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [adminClasses, setAdminClasses] = useState<AdminClass[]>(MOCK_ADMIN_CLASSES);
  const [subjects] = useState<Subject[]>(MOCK_SUBJECTS);
  const [semesters, setSemesters] = useState<Semester[]>(MOCK_SEMESTERS);


  // Course CRUD (TRUNG TÂM)
  const handleAddCourse = (
    newCrs: Omit<Course, "id" | "studentsCount" | "groupsCount" | "createdAt">
  ) => {
    const created: Course = {
      ...newCrs,
      id: `crs-${Date.now()}`,
      studentsCount: 0,
      groupsCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCourses((prev) => [created, ...prev]);
  };

  const handleEditCourse = (id: string, updated: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  const handleDeleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  // AdminClass CRUD
  const handleAddAdminClass = (newCls: Omit<AdminClass, "id" | "createdAt">) => {
    const created: AdminClass = {
      ...newCls,
      id: `adm-cls-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAdminClasses((prev) => [created, ...prev]);
  };

  const handleEditAdminClass = (id: string, updated: Partial<AdminClass>) => {
    setAdminClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  const handleDeleteAdminClass = (id: string) => {
    setAdminClasses((prev) => prev.filter((c) => c.id !== id));
  };


  // Semester CRUD
  const handleAddSemester = (newSem: Omit<Semester, "id" | "totalCourses">) => {
    const created: Semester = {
      ...newSem,
      id: `sem-${Date.now()}`,
      totalCourses: 0,
    };
    setSemesters((prev) => [created, ...prev]);
  };

  const handleEditSemester = (id: string, updated: Partial<Semester>) => {
    setSemesters((prev) =>
      prev.map((sem) => (sem.id === id ? { ...sem, ...updated } : sem))
    );
  };

  const handleDeleteSemester = (id: string) => {
    setSemesters((prev) => prev.filter((sem) => sem.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in-0 duration-200">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs">
            <DatabaseIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Quản lý Dữ liệu học thuật
            </h1>
            <p className="text-xs text-muted-foreground">
              Quản lý Khóa học đồ án, Lớp hành chính niên khóa, danh mục Môn học và Học kỳ đào tạo.
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats Summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Khóa học / Học phần</p>
              <p className="text-2xl font-bold text-foreground">{courses.length}</p>
              <p className="text-[11px] text-muted-foreground">Học phần đồ án đang mở</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <GraduationCapIcon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Lớp hành chính</p>
              <p className="text-2xl font-bold text-foreground">{adminClasses.length}</p>
              <p className="text-[11px] text-muted-foreground">Lớp sinh viên niên khóa</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-info-muted flex items-center justify-center text-info">
              <SchoolIcon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>


        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Học kỳ đào tạo</p>
              <p className="text-2xl font-bold text-foreground">{semesters.length}</p>
              <p className="text-[11px] text-muted-foreground">
                {semesters.filter((s) => s.status === "ACTIVE").length} kỳ đang diễn ra
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-success-muted flex items-center justify-center text-success">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Tabs: Courses (Trung tâm) / Admin Classes / Semesters ── */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="courses" className="text-xs font-semibold gap-1.5 px-3.5 py-1.5">
            <GraduationCapIcon className="w-3.5 h-3.5" />
            Khóa học / Học phần ({courses.length})
          </TabsTrigger>
          <TabsTrigger value="admin-classes" className="text-xs font-semibold gap-1.5 px-3.5 py-1.5">
            <SchoolIcon className="w-3.5 h-3.5" />
            Lớp hành chính ({adminClasses.length})
          </TabsTrigger>
          <TabsTrigger value="semesters" className="text-xs font-semibold gap-1.5 px-3.5 py-1.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            Học kỳ ({semesters.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Khóa học / Học phần (TRUNG TÂM) */}
        <TabsContent value="courses">
          <CourseManagement
            courses={courses}
            subjects={subjects}
            semesters={semesters}
            adminClasses={adminClasses}
            onAddCourse={handleAddCourse}
            onEditCourse={handleEditCourse}
            onDeleteCourse={handleDeleteCourse}
          />
        </TabsContent>

        {/* Tab 2: Lớp hành chính */}
        <TabsContent value="admin-classes">
          <AdminClassManagement
            adminClasses={adminClasses}
            onAddClass={handleAddAdminClass}
            onEditClass={handleEditAdminClass}
            onDeleteClass={handleDeleteAdminClass}
          />
        </TabsContent>


        {/* Tab 4: Học kỳ */}
        <TabsContent value="semesters">
          <SemesterManagement
            semesters={semesters}
            onAddSemester={handleAddSemester}
            onEditSemester={handleEditSemester}
            onDeleteSemester={handleDeleteSemester}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
