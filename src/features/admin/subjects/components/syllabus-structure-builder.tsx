"use client";

import { useState } from "react";
import {
  AwardIcon,
  LayersIcon,
  CalendarDaysIcon,
  PlusIcon,
  Trash2Icon,
  SaveIcon,
  LockIcon,
  CheckCircle2Icon,
  SparklesIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import type {
  SyllabusDetailResponse,
  ReplaceSyllabusStructureRequest,
  LearningOutcomeRequest,
  LearningUnitRequest,
  PhaseRequest,
} from "../types/syllabus-types";

interface SyllabusStructureBuilderProps {
  syllabus: SyllabusDetailResponse;
  onSaveStructure: (data: ReplaceSyllabusStructureRequest) => Promise<void>;
  isSaving?: boolean;
}

export function SyllabusStructureBuilder({
  syllabus,
  onSaveStructure,
  isSaving = false,
}: SyllabusStructureBuilderProps) {
  const isImmutable = syllabus.status !== "DRAFT";
  const [activeTab, setActiveTab] = useState<string>("clos");

  const [outcomes, setOutcomes] = useState<LearningOutcomeRequest[]>(() =>
    syllabus.learningOutcomes?.map((lo) => ({
      code: lo.code,
      name: lo.name,
      description: lo.description,
      orderIndex: lo.orderIndex,
    })) || []
  );

  const [units, setUnits] = useState<LearningUnitRequest[]>(() =>
    syllabus.learningUnits?.map((u) => ({
      code: u.code,
      name: u.name,
      description: u.description,
      orderIndex: u.orderIndex,
      learningOutcomeCodes: u.learningOutcomeCodes || [],
    })) || []
  );

  const [phases, setPhases] = useState<PhaseRequest[]>(() =>
    syllabus.phases?.map((p) => ({
      code: p.code,
      name: p.name,
      description: p.description,
      orderIndex: p.orderIndex,
      learningOutcomeCodes: p.learningOutcomeCodes || [],
      activities: p.activities?.map((a) => ({
        code: a.code,
        name: a.name,
        description: a.description,
        orderIndex: a.orderIndex,
      })) || [],
      deliverables: p.deliverables?.map((d) => ({
        code: d.code,
        name: d.name,
        description: d.description,
        orderIndex: d.orderIndex,
        learningOutcomeCodes: d.learningOutcomeCodes || [],
      })) || [],
    })) || []
  );

  const handleAddOutcome = () => {
    const nextIndex = outcomes.length + 1;
    setOutcomes((prev) => [
      ...prev,
      {
        code: `LO${nextIndex}`,
        name: `Chuẩn đầu ra năng lực ${nextIndex}`,
        orderIndex: nextIndex,
      },
    ]);
  };

  const handleRemoveOutcome = (index: number) => {
    setOutcomes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddUnit = () => {
    const nextIndex = units.length + 1;
    setUnits((prev) => [
      ...prev,
      {
        code: `UNIT_${nextIndex}`,
        name: `Bài học lý thuyết / Thực hành ${nextIndex}`,
        orderIndex: nextIndex,
        outcomeCodes: [],
      },
    ]);
  };

  const handleRemoveUnit = (index: number) => {
    setUnits((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPhase = () => {
    const nextIndex = phases.length + 1;
    setPhases((prev) => [
      ...prev,
      {
        code: `SPRINT_${nextIndex}`,
        name: `Giai đoạn / Sprint ${nextIndex}`,
        orderIndex: nextIndex,
        activities: [
          {
            code: `ACT_${nextIndex}_1`,
            name: `Hoạt động phát triển Sprint ${nextIndex}`,
            orderIndex: 1,
          },
        ],
        deliverables: [
          {
            code: `DELIV_${nextIndex}_1`,
            name: `Báo cáo sản phẩm Sprint ${nextIndex}`,
            orderIndex: 1,
            weightPercentage: 20,
          },
        ],
      },
    ]);
  };

  const handleRemovePhase = (index: number) => {
    setPhases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdatePhaseName = (phaseIndex: number, name: string) => {
    setPhases((prev) =>
      prev.map((ph, idx) => (idx === phaseIndex ? { ...ph, name } : ph))
    );
  };

  const handleAddDeliverable = (phaseIndex: number) => {
    setPhases((prev) =>
      prev.map((ph, idx) => {
        if (idx !== phaseIndex) return ph;
        const nextDelivIndex = (ph.deliverables?.length || 0) + 1;
        return {
          ...ph,
          deliverables: [
            ...(ph.deliverables || []),
            {
              code: `DELIV_${idx + 1}_${nextDelivIndex}`,
              name: `Tiêu chí / Sản phẩm bàn giao ${nextDelivIndex}`,
              orderIndex: nextDelivIndex,
            },
          ],
        };
      })
    );
  };

  const handleUpdateDeliverableName = (
    phaseIndex: number,
    delivIndex: number,
    name: string
  ) => {
    setPhases((prev) =>
      prev.map((ph, idx) => {
        if (idx !== phaseIndex) return ph;
        return {
          ...ph,
          deliverables: (ph.deliverables || []).map((d, dIdx) => {
            if (dIdx !== delivIndex) return d;
            return {
              ...d,
              name,
            };
          }),
        };
      })
    );
  };

  const handleRemoveDeliverable = (phaseIndex: number, delivIndex: number) => {
    setPhases((prev) =>
      prev.map((ph, idx) => {
        if (idx !== phaseIndex) return ph;
        return {
          ...ph,
          deliverables: (ph.deliverables || []).filter((_, dIdx) => dIdx !== delivIndex),
        };
      })
    );
  };

  const handleLoadTemplate = () => {
    setOutcomes([
      {
        code: "LO1",
        name: "Nắm vững kỹ thuật thu thập, phân tích và quản lý yêu cầu phần mềm",
        description: "Hiểu rõ quy trình xác định nhu cầu các bên liên quan và phân loại yêu cầu",
        orderIndex: 1,
      },
      {
        code: "LO2",
        name: "Mô hình hóa và viết tài liệu đặc tả yêu cầu phần mềm (SRS)",
        description: "Xây dựng Use Case, User Stories, BPMN và tài liệu SRS chuẩn IEEE 830",
        orderIndex: 2,
      },
      {
        code: "LO3",
        name: "Kiểm thử chấp nhận và thẩm định đặc tả yêu cầu",
        description: "Thiết kế Acceptance Criteria và đánh giá tính khả thi kỹ thuật",
        orderIndex: 3,
      },
    ]);

    setUnits([
      {
        code: "UNIT_1",
        name: "Tuần 1-4: Thu thập & Khảo sát yêu cầu (Elicitation)",
        description: "Phỏng vấn người dùng, khảo sát hiện trạng và định nghĩa phạm vi",
        orderIndex: 1,
        outcomeCodes: ["LO1"],
      },
      {
        code: "UNIT_2",
        name: "Tuần 5-8: Phân tích & Viết tài liệu SRS (Specification)",
        description: "Mô hình hóa dữ liệu, hành vi và tiêu chuẩn tài liệu SRS",
        orderIndex: 2,
        outcomeCodes: ["LO2"],
      },
      {
        code: "UNIT_3",
        name: "Tuần 9-12: Thẩm định, Kiểm thử & Đánh giá (Validation)",
        description: "Review đặc tả, xây dựng Prototype và nghiệm thu tiêu chí",
        orderIndex: 3,
        outcomeCodes: ["LO3"],
      },
    ]);

    setPhases([
      {
        code: "SPRINT_1",
        name: "Giai đoạn 1: Khảo sát & Đặc tả sơ bộ",
        description: "Thu thập yêu cầu và phân tích miền nghiệp vụ",
        orderIndex: 1,
        activities: [
          {
            code: "ACT_1_1",
            name: "Họp khảo sát khách hàng & Phỏng vấn",
            description: "Thu thập tài liệu và khảo sát nhu cầu nghiệp vụ",
            orderIndex: 1,
            outcomeCodes: ["LO1"],
          },
        ],
        deliverables: [
          {
            code: "DELIV_1_1",
            name: "Tài liệu khảo sát hiện trạng & Scope Baseline",
            description: "Báo cáo phạm vi và các Use Case cốt lõi",
            orderIndex: 1,
            outcomeCodes: ["LO1"],
            weightPercentage: 25,
          },
        ],
      },
      {
        code: "SPRINT_2",
        name: "Giai đoạn 2: Tài liệu SRS & Wireframe",
        description: "Mô hình hóa chi tiết và hoàn thiện đặc tả kỹ thuật",
        orderIndex: 2,
        activities: [
          {
            code: "ACT_2_1",
            name: "Thiết kế Use Case Diagram & Sequence Diagram",
            description: "Mô hình hóa luồng nghiệp vụ và tương tác hệ thống",
            orderIndex: 1,
            outcomeCodes: ["LO2"],
          },
        ],
        deliverables: [
          {
            code: "DELIV_2_1",
            name: "Tài liệu đặc tả phần mềm SRS v1.0",
            description: "Đặc tả đầy đủ yêu cầu chức năng và phi chức năng",
            orderIndex: 1,
            outcomeCodes: ["LO2"],
            weightPercentage: 35,
          },
        ],
      },
      {
        code: "SPRINT_3",
        name: "Giai đoạn 3: Prototype & Báo cáo nghiệm thu",
        description: "Kiểm định yêu cầu qua prototype tương tác và đánh giá cuối kỳ",
        orderIndex: 3,
        activities: [
          {
            code: "ACT_3_1",
            name: "Kiểm thử chấp nhận người dùng (UAT) & Review SRS",
            description: "Thẩm định chéo và nghiệm thu sản phẩm",
            orderIndex: 1,
            outcomeCodes: ["LO3"],
          },
        ],
        deliverables: [
          {
            code: "DELIV_3_1",
            name: "Prototype tương tác & Báo cáo tổng kết đồ án",
            description: "Bản báo cáo hoàn chỉnh bảo vệ trước hội đồng",
            orderIndex: 1,
            outcomeCodes: ["LO3"],
            weightPercentage: 40,
          },
        ],
      },
    ]);
    toast.success("Đã nạp thành công cấu trúc đề cương mẫu chuẩn (Tổng 100% trọng số).");
  };

  const handleSave = async () => {
    if (!outcomes || outcomes.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 Chuẩn đầu ra (CLO) trước khi lưu.");
      setActiveTab("clos");
      return;
    }
    if (!phases || phases.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 Giai đoạn & Tiêu chí đánh giá (Phase) trước khi lưu.");
      setActiveTab("phases");
      return;
    }

    try {
      await onSaveStructure({
        learningOutcomes: outcomes,
        learningUnits: units,
        phases,
      });
    } catch {
      return;
    }
  };

  return (
    <div className="space-y-6">
      {isImmutable ? (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <LockIcon className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              Đề cương phiên bản <strong>{syllabus.versionLabel}</strong> đã được <strong>BAN HÀNH CHÍNH THỨC</strong>. Cấu trúc chuẩn đã khóa bất biến (Immutable) và sẵn sàng áp dụng cho các Lớp học phần.
            </span>
          </div>
          <Badge className="bg-emerald-600 text-white font-mono text-[10px] px-2.5 py-0.5 shrink-0">
            <CheckCircle2Icon className="w-3.5 h-3.5 mr-1" /> PUBLISHED
          </Badge>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-amber-800 dark:text-amber-200">
            <p className="font-bold">Đề cương đang ở trạng thái Biên soạn (Bản nháp - DRAFT)</p>
            <p className="text-[11px] opacity-90">
              Bạn có thể cấu hình Chuẩn đầu ra (CLOs), phân bổ bài học (Units) và thiết lập các tiêu chí nghiệm thu từng Sprint. Sau khi lưu hoàn tất, hãy bấm &quot;Ban hành chính thức&quot; để sử dụng.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleLoadTemplate}
              disabled={isSaving}
              size="sm"
              className="h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs border-amber-500/40 text-amber-900 dark:text-amber-100 hover:bg-amber-500/10"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Nạp cấu trúc mẫu đồ án SE (SWP/SWR)
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <SaveIcon className="w-3.5 h-3.5" />
              {isSaving ? "Đang lưu..." : "Lưu Cấu Trúc Đề Cương"}
            </Button>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="clos" className="text-xs font-semibold gap-1.5 px-3.5 py-1.5">
            <AwardIcon className="w-3.5 h-3.5" />
            1. Chuẩn đầu ra môn học CLOs ({outcomes.length})
          </TabsTrigger>
          <TabsTrigger value="units" className="text-xs font-semibold gap-1.5 px-3.5 py-1.5">
            <LayersIcon className="w-3.5 h-3.5" />
            2. Nội dung đào tạo & Bài học Units ({units.length})
          </TabsTrigger>
          <TabsTrigger value="phases" className="text-xs font-semibold gap-1.5 px-3.5 py-1.5">
            <CalendarDaysIcon className="w-3.5 h-3.5" />
            3. Giai đoạn Sprints & Tiêu chí nghiệm thu ({phases.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clos" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Danh sách Chuẩn Đầu Ra (Course Learning Outcomes - CLOs)
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Định nghĩa các năng lực, kỹ năng cốt lõi sinh viên ngành Phần mềm cần đạt sau môn học.
              </p>
            </div>
            {!isImmutable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddOutcome}
                className="h-7 text-[11px] font-semibold gap-1 cursor-pointer"
              >
                <PlusIcon className="w-3 h-3" /> Thêm chuẩn
              </Button>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow>
                  <TableHead className="w-[100px] text-xs font-bold py-3 px-4">Mã CLO</TableHead>
                  <TableHead className="min-w-[280px] text-xs font-bold py-3 px-4">Tên chuẩn năng lực</TableHead>
                  <TableHead className="w-[80px] text-xs font-bold py-3 px-4 text-center">Thứ tự</TableHead>
                  {!isImmutable && <TableHead className="w-[80px] text-xs font-bold py-3 px-4 text-right">Xóa</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {outcomes.length > 0 ? (
                  outcomes.map((lo, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/10">
                      <TableCell className="py-2.5 px-4">
                        {isImmutable ? (
                          <span className="font-mono text-xs font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                            {lo.code}
                          </span>
                        ) : (
                          <Input
                            value={lo.code}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              setOutcomes((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, code: val } : item))
                              );
                            }}
                            className="font-mono text-xs h-8 uppercase bg-background"
                          />
                        )}
                      </TableCell>

                      <TableCell className="py-2.5 px-4">
                        {isImmutable ? (
                          <span className="text-xs font-medium text-foreground">{lo.name}</span>
                        ) : (
                          <Input
                            value={lo.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOutcomes((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                              );
                            }}
                            className="text-xs h-8 bg-background"
                          />
                        )}
                      </TableCell>

                      <TableCell className="py-2.5 px-4 text-center font-mono text-xs text-muted-foreground">
                        {lo.orderIndex}
                      </TableCell>

                      {!isImmutable && (
                        <TableCell className="py-2.5 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOutcome(idx)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                          >
                            <Trash2Icon className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isImmutable ? 3 : 4} className="text-center py-6 text-xs text-muted-foreground">
                      Chưa có chuẩn đầu ra nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="units" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Nội Dung Đào Tạo & Bài Học (Learning Units)
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Phân bổ chủ đề học tập và nội dung đào tạo theo từng tuần.
              </p>
            </div>
            {!isImmutable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddUnit}
                className="h-7 text-[11px] font-semibold gap-1 cursor-pointer"
              >
                <PlusIcon className="w-3 h-3" /> Thêm bài học
              </Button>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow>
                  <TableHead className="w-[140px] text-xs font-bold py-3 px-4">Mã học phần</TableHead>
                  <TableHead className="min-w-[280px] text-xs font-bold py-3 px-4">Tên chủ đề bài học</TableHead>
                  <TableHead className="w-[80px] text-xs font-bold py-3 px-4 text-center">Thứ tự</TableHead>
                  {!isImmutable && <TableHead className="w-[80px] text-xs font-bold py-3 px-4 text-right">Xóa</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {units.length > 0 ? (
                  units.map((u, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/10">
                      <TableCell className="py-2.5 px-4">
                        {isImmutable ? (
                          <span className="font-mono text-xs font-bold text-foreground">
                            {u.code}
                          </span>
                        ) : (
                          <Input
                            value={u.code}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              setUnits((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, code: val } : item))
                              );
                            }}
                            className="font-mono text-xs h-8 uppercase bg-background"
                          />
                        )}
                      </TableCell>

                      <TableCell className="py-2.5 px-4">
                        {isImmutable ? (
                          <span className="text-xs font-medium text-foreground">{u.name}</span>
                        ) : (
                          <Input
                            value={u.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setUnits((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                              );
                            }}
                            className="text-xs h-8 bg-background"
                          />
                        )}
                      </TableCell>

                      <TableCell className="py-2.5 px-4 text-center font-mono text-xs text-muted-foreground">
                        {u.orderIndex}
                      </TableCell>

                      {!isImmutable && (
                        <TableCell className="py-2.5 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveUnit(idx)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                          >
                            <Trash2Icon className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isImmutable ? 3 : 4} className="text-center py-6 text-xs text-muted-foreground">
                      Chưa có học phần nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Các Mốc Sprint & Sản Phẩm Bàn Giao (Phases & Deliverables)
                </h4>
                <Badge
                  variant="outline"
                  className="text-[11px] font-mono font-bold px-2 py-0.5 bg-primary/10 text-primary border-primary/20"
                >
                  {phases.length} Mốc Sprint
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground pt-0.5">
                Thiết lập các đợt nghiệm thu đồ án, sản phẩm bàn giao (SRS, GitHub, Jira) và % trọng số đánh giá.
              </p>
            </div>
            {!isImmutable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddPhase}
                className="h-7 text-[11px] font-semibold gap-1 cursor-pointer"
              >
                <PlusIcon className="w-3 h-3" /> Thêm Sprint / Giai đoạn
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {phases.length > 0 ? (
              phases.map((ph, pIdx) => (
                <div
                  key={pIdx}
                  className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2.5 flex-1 max-w-lg">
                      <span className="font-mono text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 shrink-0">
                        {ph.code}
                      </span>
                      {isImmutable ? (
                        <span className="text-xs font-bold text-foreground">{ph.name}</span>
                      ) : (
                        <Input
                          value={ph.name}
                          onChange={(e) => handleUpdatePhaseName(pIdx, e.target.value)}
                          placeholder="Tên giai đoạn / Sprint..."
                          className="h-8 text-xs font-bold bg-background flex-1"
                        />
                      )}
                    </div>

                    {!isImmutable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePhase(pIdx)}
                        className="h-7 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        <Trash2Icon className="w-3.5 h-3.5 mr-1" /> Xóa Sprint
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Sản phẩm bàn giao & Tiêu chí đánh giá (Deliverables):
                      </p>
                      {!isImmutable && (
                        <button
                          type="button"
                          onClick={() => handleAddDeliverable(pIdx)}
                          className="text-[11px] text-primary hover:underline font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <PlusIcon className="w-3 h-3" /> Thêm tiêu chí
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-border/40 border border-border/50 rounded-xl overflow-hidden bg-background/50">
                      {ph.deliverables && ph.deliverables.length > 0 ? (
                        ph.deliverables.map((d, dIdx) => (
                          <div key={dIdx} className="p-2.5 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="font-mono text-primary text-[11px] font-bold bg-primary/5 px-2 py-0.5 rounded border border-primary/15 shrink-0">
                                {d.code}
                              </span>
                              {isImmutable ? (
                                <span className="font-medium text-foreground">{d.name}</span>
                              ) : (
                                <Input
                                  value={d.name}
                                  onChange={(e) =>
                                    handleUpdateDeliverableName(pIdx, dIdx, e.target.value)
                                  }
                                  className="h-7 text-xs bg-background flex-1"
                                />
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {(d.learningOutcomeCodes || d.outcomeCodes) && (d.learningOutcomeCodes || d.outcomeCodes)!.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {(d.learningOutcomeCodes || d.outcomeCodes)!.map((c) => (
                                    <Badge key={c} variant="secondary" className="font-mono text-[9px] px-1.5 py-0">
                                      {c}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {!isImmutable && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDeliverable(pIdx, dIdx)}
                                  className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-muted cursor-pointer"
                                >
                                  <Trash2Icon className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-muted-foreground">
                          Chưa có sản phẩm bàn giao nào trong Sprint này.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                Chưa có giai đoạn đồ án nào được thiết lập.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
