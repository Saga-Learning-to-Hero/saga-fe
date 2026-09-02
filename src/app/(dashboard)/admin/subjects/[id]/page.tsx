"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  ClockIcon,
  GraduationCapIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  PenToolIcon,
  PieChartIcon,
  TargetIcon,
  LayoutGridIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_SUBJECTS } from "@/features/admin/academic/data/mock-academic";
import type { Subject } from "@/features/admin/academic/types/academic-management";

export default function SubjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [subject, setSubject] = useState<Subject | null>(null);

  useEffect(() => {
    if (id) {
      const found = MOCK_SUBJECTS.find((s) => s.id === id);
      if (found) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSubject(found);
      }
    }
  }, [id]);

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-in fade-in-0">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <BookOpenIcon className="w-8 h-8 text-muted-foreground opacity-50" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-foreground">Không tìm thấy môn học</h2>
          <p className="text-sm text-muted-foreground">Môn học này có thể đã bị xóa hoặc không tồn tại.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/admin/subjects")} className="mt-2 h-9 text-xs">
          <ArrowLeftIcon className="w-4 h-4 mr-1.5" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  // Generate a distinct color for each category
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      PE: "bg-blue-500",
      FE: "bg-red-500",
      Assignment: "bg-emerald-500",
      Quiz: "bg-amber-500",
      Project: "bg-purple-500",
      Presentation: "bg-pink-500",
      Other: "bg-slate-500",
    };
    return colors[category] || colors.Other;
  };

  const totalWeight = subject.assessmentScheme?.reduce((acc, item) => acc + item.weight, 0) || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in-0 duration-300 pb-10">
      {/* Breadcrumb & Header */}
      <div className="space-y-4">
        <Link
          href="/admin/subjects"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" /> Quay lại danh sách môn học
        </Link>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 mt-1 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs border border-primary/20">
              <BookOpenIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {subject.code}
                </h1>
                {subject.isApproved ? (
                  <Badge variant="secondary" className="bg-success-muted text-success border-success/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                    <CheckCircle2Icon className="w-3 h-3 mr-1" /> FLM Approved
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-warning border-warning/50 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                    <AlertCircleIcon className="w-3 h-3 mr-1" /> Draft Mode
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm font-medium">{subject.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 text-xs font-semibold shadow-xs">
              <PenToolIcon className="w-3.5 h-3.5 mr-1.5" />
              Chỉnh sửa Syllabus
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left Column: Details */}
        <div className="space-y-6">
          {/* General Overview Card */}
          <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <LayoutGridIcon className="w-4 h-4 text-primary" /> Tổng quan Môn học (Overview)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y divide-border/60 border-b border-border/60">
                <div className="p-4 space-y-1 hover:bg-muted/10 transition-colors">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Khoa / Bộ môn</p>
                  <p className="text-xs font-medium text-foreground">{subject.department}</p>
                </div>
                <div className="p-4 space-y-1 hover:bg-muted/10 transition-colors">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Số tín chỉ</p>
                  <p className="text-xs font-medium text-foreground">{subject.credits} tín chỉ</p>
                </div>
                <div className="p-4 space-y-1 hover:bg-muted/10 transition-colors">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Hệ đào tạo</p>
                  <p className="text-xs font-medium text-foreground">{subject.degreeLevel === "University" ? "Đại học" : subject.degreeLevel === "College" ? "Cao đẳng" : "Thạc sĩ"}</p>
                </div>
                <div className="p-4 space-y-1 hover:bg-muted/10 transition-colors">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Phân bổ thời gian</p>
                  <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <ClockIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    {subject.timeAllocation || "Chưa xác định"}
                  </p>
                </div>
                <div className="p-4 space-y-1 hover:bg-muted/10 transition-colors">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Thang điểm</p>
                  <p className="text-xs font-medium text-foreground">{subject.scoringScale || 10}</p>
                </div>
                <div className="p-4 space-y-1 hover:bg-muted/10 transition-colors">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Khóa học đang mở</p>
                  <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <GraduationCapIcon className="w-3.5 h-3.5 text-primary" />
                    {subject.totalCourses} khóa học
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Môn tiên quyết (Pre-requisites)</p>
                  <div className="flex flex-wrap gap-2">
                    {subject.preRequisites ? (
                      subject.preRequisites.split(",").map((req) => (
                        <Badge key={req} variant="secondary" className="text-xs font-mono font-medium rounded-md px-2 bg-muted">
                          {req.trim()}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Không có môn tiên quyết</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Mô tả chi tiết</p>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    {subject.description || <span className="italic text-muted-foreground">Chưa có mô tả.</span>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Tasks & Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-2xl border border-border shadow-xs">
              <CardContent className="p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-primary">
                  <TargetIcon className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Nhiệm vụ Sinh viên</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {subject.studentTasks || "Sinh viên tuân thủ các quy định đào tạo chung của FPT."}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border shadow-xs">
              <CardContent className="p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-info">
                  <PenToolIcon className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Công cụ (Tools)</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {subject.tools || "Không yêu cầu công cụ đặc thù."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Assessment Scheme */}
        <div className="space-y-6">
          <Card className="rounded-2xl border border-border shadow-xs sticky top-6">
            <CardHeader className="pb-3 border-b border-border/50 bg-gradient-to-br from-muted/30 to-background">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-primary" /> Cấu trúc điểm (Assessment)
              </CardTitle>
              <CardDescription className="text-xs">
                Phân bổ trọng số điểm theo chuẩn FLM.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              {/* Progress Bar Chart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Tổng phân bổ</span>
                  <span className={totalWeight === 100 ? "text-success" : "text-destructive"}>{totalWeight}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
                  {subject.assessmentScheme?.map((item) => (
                    <div
                      key={item.id}
                      className={`h-full ${getCategoryColor(item.category)} transition-all`}
                      style={{ width: `${item.weight}%` }}
                      title={`${item.category}: ${item.weight}%`}
                    />
                  ))}
                </div>
                {totalWeight !== 100 && totalWeight > 0 && (
                  <p className="text-[10px] text-destructive font-medium flex items-center gap-1">
                    <AlertCircleIcon className="w-3 h-3" /> Tổng trọng số chưa đạt 100%
                  </p>
                )}
                {!subject.assessmentScheme?.length && (
                  <p className="text-[10px] text-muted-foreground italic">Chưa cấu hình cơ cấu điểm.</p>
                )}
              </div>

              {/* Assessment Items List */}
              {subject.assessmentScheme && subject.assessmentScheme.length > 0 && (
                <div className="space-y-3 pt-2">
                  {subject.assessmentScheme.map((item) => (
                    <div key={item.id} className="group flex items-start justify-between gap-3 p-3 rounded-xl border border-border/60 hover:border-border hover:bg-muted/20 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${getCategoryColor(item.category)}`} />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-foreground">{item.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-border font-medium text-muted-foreground bg-muted/50">
                              {item.category}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-[10px] text-muted-foreground/80 leading-tight mt-1 line-clamp-2 group-hover:line-clamp-none transition-all">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-sm font-extrabold text-foreground">{item.weight}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
