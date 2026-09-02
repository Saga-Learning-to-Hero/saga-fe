"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  PenToolIcon,
  PieChartIcon,
  TargetIcon,
  LayoutGridIcon,
  FileTextIcon,
  AwardIcon,
  LayersIcon,
  ShieldCheckIcon,
  ExternalLinkIcon,
  CalendarDaysIcon,
  SearchIcon,
  DownloadIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { MOCK_SUBJECTS } from "@/features/admin/academic/data/mock-academic";

export default function SubjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [sessionSearch, setSessionSearch] = useState("");

  const subject = MOCK_SUBJECTS.find((s) => s.id === id) || null;

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-in fade-in-0">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <BookOpenIcon className="w-8 h-8 text-muted-foreground opacity-50" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-foreground">Không tìm thấy môn học</h2>
          <p className="text-sm text-muted-foreground">Môn học này có thể đã bị xóa hoặc không tồn tại trong hệ thống FLM.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/admin/subjects")} className="mt-2 h-9 text-xs">
          <ArrowLeftIcon className="w-4 h-4 mr-1.5" /> Quay lại danh mục Môn học
        </Button>
      </div>
    );
  }

  const filteredSessions = subject.sessions?.filter(
    (ses) =>
      ses.topic.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      ses.session.toString().includes(sessionSearch) ||
      ses.clo.toLowerCase().includes(sessionSearch.toLowerCase())
  ) || [];

  const totalAssessmentWeight = subject.assessments?.reduce((acc, curr) => acc + curr.weight, 0) || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in-0 duration-300 pb-16">
      <div className="space-y-4">
        <Link
          href="/admin/subjects"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" /> Quay lại danh mục Môn học FLM
        </Link>

        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs border border-primary/20">
              <BookOpenIcon className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-xl font-extrabold text-primary bg-primary/10 px-3 py-0.5 rounded-lg border border-primary/20">
                  {subject.code}
                </span>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  {subject.vietnameseName || subject.name}
                </h1>
                {subject.isApproved ? (
                  <Badge variant="secondary" className="bg-success-muted text-success border-success/20 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5">
                    <CheckCircle2Icon className="w-3.5 h-3.5 mr-1" /> Đã phê duyệt (FLM Approved)
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-warning border-warning/50 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5">
                    <AlertCircleIcon className="w-3.5 h-3.5 mr-1" /> Bản nháp (Draft)
                  </Badge>
                )}
              </div>

              <p className="text-sm font-medium text-muted-foreground">
                {subject.courseNameEnglish || subject.englishName || subject.name}
              </p>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground pt-1">
                {subject.syllabusId && (
                  <span className="inline-flex items-center gap-1 font-mono text-foreground font-semibold">
                    Mã đề cương (Syllabus ID): <strong className="text-primary">{subject.syllabusId}</strong>
                  </span>
                )}
                {subject.decisionNo && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <FileTextIcon className="w-3.5 h-3.5 text-primary" /> Quyết định: {subject.decisionNo}
                    </span>
                  </>
                )}
                <span>·</span>
                <span>Bậc: <strong className="text-foreground font-semibold">{subject.degreeLevel === "Bachelor" ? "Đại học (Bachelor)" : subject.degreeLevel || "Đại học"}</strong></span>
                <span>·</span>
                <span>Số tín chỉ: <strong className="text-foreground font-semibold">{subject.credits || subject.noCredit} TC</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="h-9 text-xs font-semibold shadow-xs cursor-pointer">
              <PenToolIcon className="w-3.5 h-3.5 mr-1.5" />
              Chỉnh sửa đề cương (Syllabus)
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl flex-wrap h-auto gap-1">
          <TabsTrigger value="details" className="text-xs font-semibold gap-1.5 px-3.5 py-2">
            <LayoutGridIcon className="w-3.5 h-3.5" />
            1. Thông tin Đề cương
          </TabsTrigger>
          <TabsTrigger value="materials" className="text-xs font-semibold gap-1.5 px-3.5 py-2">
            <LayersIcon className="w-3.5 h-3.5" />
            2. Giáo trình & Tài liệu ({subject.materials?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="clos" className="text-xs font-semibold gap-1.5 px-3.5 py-2">
            <TargetIcon className="w-3.5 h-3.5" />
            3. Chuẩn đầu ra (CLO) ({subject.clos?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="assessments" className="text-xs font-semibold gap-1.5 px-3.5 py-2">
            <PieChartIcon className="w-3.5 h-3.5" />
            4. Cơ cấu Đánh giá ({subject.assessments?.length || 0})
          </TabsTrigger>
          {subject.sessions && subject.sessions.length > 0 && (
            <TabsTrigger value="sessions" className="text-xs font-semibold gap-1.5 px-3.5 py-2">
              <CalendarDaysIcon className="w-3.5 h-3.5" />
              5. Kế hoạch Giảng dạy ({subject.sessions.length} Buổi)
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-6">
              <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 py-3.5">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileTextIcon className="w-4 h-4 text-primary" /> Mô tả Học phần & Mục tiêu (Description)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed">
                    {subject.description || <span className="italic text-muted-foreground">Chưa có mô tả chi tiết.</span>}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="rounded-2xl border border-border shadow-xs">
                  <CardHeader className="bg-muted/30 border-b border-border/50 py-3">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <TargetIcon className="w-4 h-4" /> Nhiệm vụ Sinh viên (Student Tasks)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                      {subject.studentTasks || "Sinh viên tuân thủ các quy định đào tạo và chuẩn mực học thuật của FPT."}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-xs">
                  <CardHeader className="bg-muted/30 border-b border-border/50 py-3">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-info flex items-center gap-1.5">
                      <PenToolIcon className="w-4 h-4" /> Công cụ & Môi trường thực hành (Tools)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                      {subject.tools || "Không yêu cầu công cụ đặc thù."}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 py-3.5">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Thông số học thuật Đề cương FLM
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-border/60 text-xs">
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Mã đề cương (Syllabus ID)</span>
                    <span className="font-mono font-bold text-primary">{subject.syllabusId || "11637"}</span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Mã môn học (Subject Code)</span>
                    <span className="font-mono font-bold text-foreground">{subject.code}</span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Số tín chỉ</span>
                    <span className="font-semibold text-foreground">{subject.credits || subject.noCredit} tín chỉ</span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Bậc đào tạo</span>
                    <span className="font-semibold text-foreground">
                      {subject.degreeLevel === "Bachelor" ? "Đại học (Bachelor)" : subject.degreeLevel || "Đại học"}
                    </span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Phương pháp dạy & học</span>
                    <span className="font-semibold text-foreground text-right max-w-[180px]">
                      {subject.learningTeachingMethod || "Problem based learning, Blended Learning"}
                    </span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Môn học tiên quyết</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {subject.preRequisites ? (
                        subject.preRequisites.split(",").map((req) => (
                          <Badge key={req} variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                            {req.trim()}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">Không có</span>
                      )}
                    </div>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Thang điểm đánh giá</span>
                    <span className="font-semibold text-foreground">{subject.scoringScale || 10} / 10</span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between bg-primary/5">
                    <span className="text-primary font-bold flex items-center gap-1">
                      <ShieldCheckIcon className="w-3.5 h-3.5" /> Điều kiện qua môn
                    </span>
                    <span className="font-bold text-primary">
                      Điểm TB ≥ {subject.minAvgMarkToPass || subject.minAvgScore || 5} (Thi cuối kỳ ≥ {subject.minFinalScore || 4})
                    </span>
                  </div>
                  <div className="p-3.5 flex flex-col gap-1">
                    <span className="text-muted-foreground font-medium">Phân bổ thời lượng</span>
                    <span className="font-medium text-foreground text-[11px] leading-relaxed">
                      {subject.timeAllocation || "45h trên lớp + 102.5h tự học"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <LayersIcon className="w-4 h-4 text-primary" /> {subject.materials?.length || 0} Giáo trình & Tài liệu học tập (Materials)
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Danh mục giáo trình chính, tài liệu tham khảo và phần mềm được phê duyệt trong hệ thống FLM.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40 border-b border-border">
                    <TableRow>
                      <TableHead className="w-[50px] font-semibold text-xs py-3 px-3 text-center">STT</TableHead>
                      <TableHead className="font-semibold text-xs py-3 px-4 min-w-[280px]">Mô tả Tài liệu / Tên sách</TableHead>
                      <TableHead className="w-[140px] font-semibold text-xs py-3 px-3">Tác giả</TableHead>
                      <TableHead className="w-[150px] font-semibold text-xs py-3 px-3">Nhà xuất bản</TableHead>
                      <TableHead className="w-[110px] font-semibold text-xs py-3 px-3 text-center">Năm XB</TableHead>
                      <TableHead className="w-[90px] font-semibold text-xs py-3 px-3 text-center">Tái bản</TableHead>
                      <TableHead className="w-[110px] font-semibold text-xs py-3 px-3">ISBN</TableHead>
                      <TableHead className="w-[90px] font-semibold text-xs py-3 px-3 text-center">Tài liệu chính</TableHead>
                      <TableHead className="w-[80px] font-semibold text-xs py-3 px-3 text-center">Bản cứng</TableHead>
                      <TableHead className="w-[80px] font-semibold text-xs py-3 px-3 text-center">Bản online</TableHead>
                      <TableHead className="w-[100px] font-semibold text-xs py-3 px-3 text-center">Liên kết / Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/60">
                    {subject.materials && subject.materials.length > 0 ? (
                      subject.materials.map((mat) => (
                        <TableRow key={mat.no} className="hover:bg-muted/20 transition-colors">
                          <TableCell className="font-mono text-xs text-center py-3.5 px-3 font-semibold text-muted-foreground">
                            {mat.no}
                          </TableCell>
                          <TableCell className="font-semibold text-xs text-foreground py-3.5 px-4 leading-relaxed">
                            {mat.description}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground py-3.5 px-3">
                            {mat.author || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground py-3.5 px-3">
                            {mat.publisher || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground text-center py-3.5 px-3">
                            {mat.publishedDate || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground text-center py-3.5 px-3">
                            {mat.edition || "—"}
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-muted-foreground py-3.5 px-3">
                            {mat.isbn || "—"}
                          </TableCell>
                          <TableCell className="text-center py-3.5 px-3">
                            {mat.isMain ? (
                              <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">Chính</Badge>
                            ) : (
                              <span className="text-muted-foreground/60 text-xs">Tham khảo</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center py-3.5 px-3">
                            {mat.isHardCopy ? (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">Có</Badge>
                            ) : (
                              <span className="text-muted-foreground/60 text-xs">Không</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center py-3.5 px-3">
                            {mat.isOnline ? (
                              <Badge variant="secondary" className="bg-success-muted text-success text-[10px] px-1.5 py-0">Có</Badge>
                            ) : (
                              <span className="text-muted-foreground/60 text-xs">Không</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center py-3.5 px-3">
                            {mat.url ? (
                              <a href={mat.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                                Mở link <ExternalLinkIcon className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">{mat.note || "—"}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8 text-xs text-muted-foreground">
                          Chưa có danh mục tài liệu cho môn học này.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clos" className="space-y-4">
          <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AwardIcon className="w-4 h-4 text-primary" /> {subject.clos?.length || 0} Chuẩn đầu ra Học phần (Course Learning Outcomes - CLO)
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Các chuẩn đầu ra kiến thức, kỹ năng và mức độ tự chủ sinh viên đạt được sau môn học.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40 border-b border-border">
                  <TableRow>
                    <TableHead className="w-[60px] font-semibold text-xs py-3 px-4 text-center">STT</TableHead>
                    <TableHead className="w-[140px] font-semibold text-xs py-3 px-4">Mã chuẩn (CLO)</TableHead>
                    <TableHead className="font-semibold text-xs py-3 px-4">Mô tả chi tiết năng lực đạt được</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/60">
                  {subject.clos && subject.clos.length > 0 ? (
                    subject.clos.map((clo) => (
                      <TableRow key={clo.no} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="font-mono text-xs text-center py-3.5 px-4 font-semibold text-muted-foreground">
                          {clo.no}
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary bg-primary/5 px-2 py-0.5 font-bold">
                            {clo.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-foreground font-medium py-3.5 px-4 leading-relaxed">
                          {clo.details}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-xs text-muted-foreground">
                        Chưa cấu hình chuẩn đầu ra cho môn học này.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-primary" /> {subject.assessments?.length || 0} Đầu điểm - Bảng Cơ cấu Đánh giá (Assessment Scheme)
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Phân bổ trọng số các bài kiểm tra quá trình (on-going) và thi kết thúc môn (Final exam) theo chuẩn FLM.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Tổng trọng số:</span>
                  <Badge className={`text-xs font-bold ${totalAssessmentWeight === 100 ? "bg-success-muted text-success border-success/30" : "bg-destructive/10 text-destructive border-destructive/30"}`}>
                    {totalAssessmentWeight}% {totalAssessmentWeight === 100 ? "(Chuẩn FLM 100%)" : "(Chưa đạt 100%)"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40 border-b border-border">
                    <TableRow>
                      <TableHead className="w-[50px] font-semibold text-xs py-3 px-3 text-center">STT</TableHead>
                      <TableHead className="w-[150px] font-semibold text-xs py-3 px-3">Hạng mục (Category)</TableHead>
                      <TableHead className="w-[110px] font-semibold text-xs py-3 px-3">Loại đánh giá</TableHead>
                      <TableHead className="w-[60px] font-semibold text-xs py-3 px-3 text-center">Số bài</TableHead>
                      <TableHead className="w-[80px] font-semibold text-xs py-3 px-3 text-center">Trọng số</TableHead>
                      <TableHead className="w-[90px] font-semibold text-xs py-3 px-3 text-center">Điểm đạt</TableHead>
                      <TableHead className="w-[90px] font-semibold text-xs py-3 px-3 text-center">Thời lượng</TableHead>
                      <TableHead className="w-[140px] font-semibold text-xs py-3 px-3">Chuẩn CLO</TableHead>
                      <TableHead className="w-[160px] font-semibold text-xs py-3 px-3">Hình thức thi</TableHead>
                      <TableHead className="w-[120px] font-semibold text-xs py-3 px-3">Số câu hỏi</TableHead>
                      <TableHead className="w-[180px] font-semibold text-xs py-3 px-3">Hướng dẫn chấm</TableHead>
                      <TableHead className="min-w-[180px] font-semibold text-xs py-3 px-3">Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/60">
                    {subject.assessments && subject.assessments.length > 0 ? (
                      subject.assessments.map((as) => (
                        <TableRow key={as.no} className="hover:bg-muted/20 transition-colors">
                          <TableCell className="font-mono text-xs text-center py-3.5 px-3 font-semibold text-muted-foreground">
                            {as.no}
                          </TableCell>
                          <TableCell className="font-bold text-xs text-foreground py-3.5 px-3 whitespace-nowrap">
                            {as.category}
                          </TableCell>
                          <TableCell className="text-xs py-3.5 px-3 whitespace-nowrap">
                            <Badge variant="outline" className={`text-[10px] font-medium ${as.type === "Final exam" ? "bg-rose-500/10 text-rose-600 border-rose-500/30" : "bg-muted text-muted-foreground"}`}>
                              {as.type === "Final exam" ? "Thi cuối kỳ (FE)" : "Quá trình"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-center py-3.5 px-3">
                            {as.part}
                          </TableCell>
                          <TableCell className="font-mono font-extrabold text-xs text-center py-3.5 px-3 text-primary whitespace-nowrap">
                            {as.weight.toFixed(1)}%
                          </TableCell>
                          <TableCell className="font-mono text-xs text-center py-3.5 px-3 font-semibold text-foreground">
                            {as.completionCriteria}
                          </TableCell>
                          <TableCell className="text-xs text-center py-3.5 px-3 text-muted-foreground whitespace-nowrap">
                            {as.duration}
                          </TableCell>
                          <TableCell className="text-xs py-3.5 px-3">
                            <span className="font-mono text-[11px] text-primary font-medium">{as.clo}</span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground py-3.5 px-3">
                            {as.questionType || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground py-3.5 px-3">
                            {as.noQuestion || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground py-3.5 px-3 leading-tight">
                            {as.gradingGuide || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground py-3.5 px-3 leading-tight">
                            {as.note || "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-8 text-xs text-muted-foreground">
                          Chưa có cơ cấu điểm cho môn học này.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {subject.sessions && subject.sessions.length > 0 && (
          <TabsContent value="sessions" className="space-y-4">
            <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <CalendarDaysIcon className="w-4 h-4 text-primary" /> Kế hoạch Giảng dạy chi tiết ({subject.sessions.length} Buổi / Slots)
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Tiến trình đào tạo và phân bổ nội dung giảng dạy từng buổi theo chuẩn FLM.
                    </CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Tìm chủ đề, slot, CLO..."
                      value={sessionSearch}
                      onChange={(e) => setSessionSearch(e.target.value)}
                      className="pl-8 h-8 text-xs bg-background"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[600px]">
                  <Table>
                    <TableHeader className="bg-muted/40 border-b border-border sticky top-0 z-10 backdrop-blur-md">
                      <TableRow>
                        <TableHead className="w-[70px] font-semibold text-xs py-3 px-3 text-center">Buổi</TableHead>
                        <TableHead className="font-semibold text-xs py-3 px-4 min-w-[240px]">Chủ đề bài học (Topic)</TableHead>
                        <TableHead className="w-[100px] font-semibold text-xs py-3 px-3 text-center">Hình thức</TableHead>
                        <TableHead className="w-[120px] font-semibold text-xs py-3 px-3">Chuẩn CLO</TableHead>
                        <TableHead className="w-[60px] font-semibold text-xs py-3 px-3 text-center">Mức độ ITU</TableHead>
                        <TableHead className="w-[160px] font-semibold text-xs py-3 px-3">Tài liệu học tập</TableHead>
                        <TableHead className="w-[140px] font-semibold text-xs py-3 px-3">Nhiệm vụ sinh viên</TableHead>
                        <TableHead className="w-[120px] font-semibold text-xs py-3 px-3 text-right">Tải về / Liên kết</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border/60">
                      {filteredSessions.length > 0 ? (
                        filteredSessions.map((ses) => (
                          <TableRow key={ses.session} className="hover:bg-muted/20 transition-colors">
                            <TableCell className="font-mono text-xs text-center py-3 px-3 font-bold text-primary">
                              {ses.session}
                            </TableCell>
                            <TableCell className="font-medium text-xs text-foreground py-3 px-4">
                              {ses.topic}
                            </TableCell>
                            <TableCell className="text-center py-3 px-3">
                              <Badge variant="outline" className="text-[10px] font-semibold bg-muted/50 px-1.5 py-0">
                                {ses.type === "Offline" ? "Trực tiếp" : "Trực tuyến"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3 px-3">
                              <span className="font-mono text-xs font-semibold text-primary">{ses.clo}</span>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-center text-muted-foreground py-3 px-3">
                              {ses.itu || "—"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground py-3 px-3">
                              {ses.studentMaterials || "—"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground py-3 px-3">
                              {ses.studentTasks || "—"}
                            </TableCell>
                            <TableCell className="text-right py-3 px-3">
                              {ses.urls ? (
                                <a
                                  href={ses.urls}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                                >
                                  {ses.urls.includes(".zip") ? (
                                    <>
                                      <DownloadIcon className="w-3 h-3" /> Tải về
                                    </>
                                  ) : (
                                    <>
                                      Xem tài liệu <ExternalLinkIcon className="w-3 h-3" />
                                    </>
                                  )}
                                </a>
                              ) : (
                                <span className="text-xs text-muted-foreground/50">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                            Không tìm thấy buổi học nào phù hợp với từ khóa tìm kiếm.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
