"use client";

import { useState, useEffect } from "react";
import { DatabaseIcon, GraduationCapIcon, CalendarIcon, SchoolIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import {
  prefetchClassesQuery,
  prefetchSemestersQuery,
} from "@/features/admin/academic/hooks/use-academic";
import { CourseManagement } from "@/features/admin/academic/components/course-management";
import { AdminClassManagement } from "@/features/admin/academic/components/admin-class-management";
import { SemesterManagement } from "@/features/admin/academic/components/semester-management";

export default function AdminAcademicPage() {
  const [visitedTabs, setVisitedTabs] = useState<Record<string, boolean>>({ courses: true });
  const queryClient = useQueryClient();

  useEffect(() => {
    void prefetchClassesQuery(queryClient);
    void prefetchSemestersQuery(queryClient);
  }, [queryClient]);

  const handleRefreshAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["academic"] });
  };

  const handlePrefetchClasses = () => {
    void prefetchClassesQuery(queryClient);
  };

  const handlePrefetchSemesters = () => {
    void prefetchSemestersQuery(queryClient);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in-0 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs border border-primary/20">
            <DatabaseIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Quản Lý Lớp Học & Học Kỳ Đào Tạo
            </h1>
            <p className="text-xs text-muted-foreground">
              Quản lý lớp học phần trong kỳ, lớp sinh viên niên khóa và các học kỳ đào tạo.
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

      <Tabs
        defaultValue="courses"
        onValueChange={(tab) => setVisitedTabs((prev) => ({ ...prev, [tab]: true }))}
        className="space-y-4"
      >
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="courses" className="text-xs font-semibold gap-1.5 px-3.5 py-1.5 cursor-pointer">
            <GraduationCapIcon className="w-3.5 h-3.5" />
            Lớp học phần
          </TabsTrigger>
          <TabsTrigger
            value="admin-classes"
            onMouseEnter={handlePrefetchClasses}
            className="text-xs font-semibold gap-1.5 px-3.5 py-1.5 cursor-pointer"
          >
            <SchoolIcon className="w-3.5 h-3.5" />
            Lớp sinh viên
          </TabsTrigger>
          <TabsTrigger
            value="semesters"
            onMouseEnter={handlePrefetchSemesters}
            className="text-xs font-semibold gap-1.5 px-3.5 py-1.5 cursor-pointer"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Học kỳ đào tạo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" keepMounted>
          <CourseManagement />
        </TabsContent>

        <TabsContent value="admin-classes" keepMounted>
          {visitedTabs["admin-classes"] ? <AdminClassManagement /> : null}
        </TabsContent>

        <TabsContent value="semesters" keepMounted>
          {visitedTabs["semesters"] ? <SemesterManagement /> : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
