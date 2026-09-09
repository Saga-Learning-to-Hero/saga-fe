"use client";

import { useState } from "react";
import { XIcon, PlusIcon, SaveIcon, LayersIcon, BookOpenIcon, ClockIcon, FileTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  CreateSyllabusRequest,
  SyllabusDetailResponse,
  SyllabusSummaryResponse,
} from "../types/syllabus-types";

interface SyllabusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSyllabusRequest) => Promise<void>;
  initialData?: Partial<SyllabusDetailResponse | SyllabusSummaryResponse> | null;
  mode?: "create" | "edit";
  isSubmitting?: boolean;
}

interface SyllabusFormProps {
  initialData?: Partial<SyllabusDetailResponse | SyllabusSummaryResponse> | null;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (data: CreateSyllabusRequest) => Promise<void>;
  isSubmitting: boolean;
}

function SyllabusForm({
  initialData,
  mode,
  onClose,
  onSubmit,
  isSubmitting,
}: SyllabusFormProps) {
  const [activeTab, setActiveTab] = useState<"general" | "academic" | "details">("general");

  const detail = initialData as Partial<SyllabusDetailResponse> | undefined;

  const [versionLabel, setVersionLabel] = useState(() => initialData?.versionLabel || "v1.0");
  const [externalSyllabusId, setExternalSyllabusId] = useState(() => initialData?.externalSyllabusId || "");
  const [titleEnglish, setTitleEnglish] = useState(() => initialData?.titleEnglish || "");
  const [titleVietnamese, setTitleVietnamese] = useState(() => initialData?.titleVietnamese || "");
  const [credits, setCredits] = useState<number>(() => initialData?.credits || 3);
  const [level, setLevel] = useState(() => detail?.level || "Bachelor");

  const [minAvgMarkToPass, setMinAvgMarkToPass] = useState<number>(() => {
    if (detail?.gradingScale) {
      const match = detail.gradingScale.match(/(\d+(\.\d+)?)/);
      if (match && match[1]) {
        return parseFloat(match[1]);
      }
    }
    return 5;
  });

  const [prerequisites, setPrerequisites] = useState(() => detail?.prerequisites || "");
  const [timeAllocation, setTimeAllocation] = useState(() => detail?.timeAllocation || "");
  const [learningTeachingMethod, setLearningTeachingMethod] = useState(() => detail?.learningTeachingMethod || "");
  const [tools, setTools] = useState(() => detail?.tools || "");

  const [description, setDescription] = useState(() => detail?.description || "");
  const [studentDuties, setStudentDuties] = useState(() => detail?.studentDuties || "");
  const [textbooks, setTextbooks] = useState(() => detail?.textbooks || "");
  const [referenceMaterials, setReferenceMaterials] = useState(() => detail?.referenceMaterials || "");

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!versionLabel.trim()) {
      setError("Vui lòng nhập nhãn phiên bản đề cương (ví dụ: v1.0, v2.0).");
      setActiveTab("general");
      return;
    }

    try {
      await onSubmit({
        versionLabel: versionLabel.trim(),
        externalSyllabusId: externalSyllabusId.trim() || undefined,
        titleEnglish: titleEnglish.trim() || undefined,
        titleVietnamese: titleVietnamese.trim() || undefined,
        credits: Number(credits) || 3,
        level: level.trim() || undefined,
        prerequisites: prerequisites.trim() || undefined,
        timeAllocation: timeAllocation.trim() || undefined,
        learningTeachingMethod: learningTeachingMethod.trim() || undefined,
        tools: tools.trim() || undefined,
        description: description.trim() || undefined,
        studentDuties: studentDuties.trim() || undefined,
        textbooks: textbooks.trim() || undefined,
        referenceMaterials: referenceMaterials.trim() || undefined,
        gradingScale: `Thang 10 (Điểm đạt tối thiểu: ${Number(minAvgMarkToPass) || 5})`,
      });
      onClose();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Đã có lỗi xảy ra khi lưu thông tin đề cương.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 pt-4 border-b border-border/40 shrink-0 bg-card">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "general" | "academic" | "details")}
          className="w-full"
        >
          <TabsList className="bg-muted/60 p-1 rounded-xl w-full grid grid-cols-3">
            <TabsTrigger
              value="general"
              className="text-xs font-semibold gap-1.5 py-1.5 cursor-pointer data-[state=active]:bg-card"
            >
              <BookOpenIcon className="w-3.5 h-3.5" />
              1. Thông tin chung
            </TabsTrigger>
            <TabsTrigger
              value="academic"
              className="text-xs font-semibold gap-1.5 py-1.5 cursor-pointer data-[state=active]:bg-card"
            >
              <ClockIcon className="w-3.5 h-3.5" />
              2. Khung đào tạo
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="text-xs font-semibold gap-1.5 py-1.5 cursor-pointer data-[state=active]:bg-card"
            >
              <FileTextIcon className="w-3.5 h-3.5" />
              3. Mô tả &amp; Nhiệm vụ
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-6 overflow-y-auto flex-1 space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
            {error}
          </div>
        )}

        {activeTab === "general" && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="version-label" className="text-xs font-semibold">
                  Nhãn phiên bản (Version Label) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="version-label"
                  placeholder="Ví dụ: v1.0, 2026-v1, Fall2026..."
                  value={versionLabel}
                  onChange={(e) => setVersionLabel(e.target.value)}
                  disabled={isSubmitting}
                  className="font-mono text-sm bg-background"
                />
                <p className="text-[11px] text-muted-foreground">
                  Mã phiên bản nhận diện khi phân bổ vào lớp học phần.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="external-syllabus-id" className="text-xs font-semibold">
                  Mã Đề cương FLM (Syllabus ID)
                </Label>
                <Input
                  id="external-syllabus-id"
                  placeholder="Ví dụ: 14176, 12055..."
                  value={externalSyllabusId}
                  onChange={(e) => setExternalSyllabusId(e.target.value)}
                  disabled={isSubmitting}
                  className="font-mono text-sm bg-background"
                />
                <p className="text-[11px] text-muted-foreground">
                  Mã định danh gốc trên cổng đề cương chi tiết FLM.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title-english" className="text-xs font-semibold">
                Tên môn học Tiếng Anh (Course Name English)
              </Label>
              <Input
                id="title-english"
                placeholder="Ví dụ: Software Requirement, Software Development Project..."
                value={titleEnglish}
                onChange={(e) => setTitleEnglish(e.target.value)}
                disabled={isSubmitting}
                className="text-sm bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title-vietnamese" className="text-xs font-semibold">
                Tên môn học Tiếng Việt (Course Name Vietnamese)
              </Label>
              <Input
                id="title-vietnamese"
                placeholder="Ví dụ: Yêu cầu phần mềm, Đồ án phát triển phần mềm..."
                value={titleVietnamese}
                onChange={(e) => setTitleVietnamese(e.target.value)}
                disabled={isSubmitting}
                className="text-sm bg-background"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="credits" className="text-xs font-semibold">
                  Số tín chỉ (Credits)
                </Label>
                <Input
                  id="credits"
                  type="number"
                  min={1}
                  max={20}
                  value={credits}
                  onChange={(e) => setCredits(Number(e.target.value))}
                  disabled={isSubmitting}
                  className="font-mono text-sm bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="level" className="text-xs font-semibold">
                  Bậc đào tạo (Level)
                </Label>
                <Input
                  id="level"
                  placeholder="Ví dụ: Bachelor, Master..."
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  disabled={isSubmitting}
                  className="text-sm bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="min-mark" className="text-xs font-semibold">
                  Điểm đạt tối thiểu (Thang 10)
                </Label>
                <Input
                  id="min-mark"
                  type="number"
                  min={1}
                  max={10}
                  step={0.5}
                  value={minAvgMarkToPass}
                  onChange={(e) => setMinAvgMarkToPass(Number(e.target.value))}
                  disabled={isSubmitting}
                  className="font-mono text-sm bg-background"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "academic" && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <div className="space-y-1.5">
              <Label htmlFor="prerequisites" className="text-xs font-semibold">
                Học phần tiên quyết (Pre-Requisites)
              </Label>
              <Input
                id="prerequisites"
                placeholder="Ví dụ: SWE102 or SWE201c or SWE202c"
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                disabled={isSubmitting}
                className="font-mono text-sm bg-background"
              />
              <p className="text-[11px] text-muted-foreground">
                Các môn sinh viên bắt buộc phải hoàn thành trước khi học môn này.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="time-allocation" className="text-xs font-semibold">
                Phân bổ thời gian học tập (Time Allocation)
              </Label>
              <Input
                id="time-allocation"
                placeholder="Ví dụ: Study hour (150h) = 45h contact hours + 145-minute final exam + 102,6h self-study"
                value={timeAllocation}
                onChange={(e) => setTimeAllocation(e.target.value)}
                disabled={isSubmitting}
                className="text-sm bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="learning-method" className="text-xs font-semibold">
                Phương pháp Dạy &amp; Học (Learning-Teaching Method)
              </Label>
              <Input
                id="learning-method"
                placeholder="Ví dụ: Social Constructivism, In-class lecture, Inquiry-based Teaching"
                value={learningTeachingMethod}
                onChange={(e) => setLearningTeachingMethod(e.target.value)}
                disabled={isSubmitting}
                className="text-sm bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tools" className="text-xs font-semibold">
                Công cụ &amp; Môi trường phát triển (Tools)
              </Label>
              <Input
                id="tools"
                placeholder="Ví dụ: Jira Software, GitHub, Enterprise Architect, Visual Studio Code"
                value={tools}
                onChange={(e) => setTools(e.target.value)}
                disabled={isSubmitting}
                className="text-sm bg-background"
              />
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">
                Mô tả tổng quan học phần (Course Description)
              </Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Mô tả mục tiêu, kiến thức và kỹ năng sinh viên tiếp cận trong học phần..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="text-xs bg-background leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="student-duties" className="text-xs font-semibold">
                Nhiệm vụ của sinh viên (Student&apos;s Tasks &amp; Duties)
              </Label>
              <Textarea
                id="student-duties"
                rows={3}
                placeholder="Ví dụ: Tham gia tối thiểu 80% số buổi học, hoàn thành đầy đủ bài tập nhóm, tham gia nghiệm thu Sprint..."
                value={studentDuties}
                onChange={(e) => setStudentDuties(e.target.value)}
                disabled={isSubmitting}
                className="text-xs bg-background leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="textbooks" className="text-xs font-semibold">
                  Giáo trình chính (Textbooks)
                </Label>
                <Input
                  id="textbooks"
                  placeholder="Tên sách, tác giả, năm xuất bản..."
                  value={textbooks}
                  onChange={(e) => setTextbooks(e.target.value)}
                  disabled={isSubmitting}
                  className="text-xs bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reference-materials" className="text-xs font-semibold">
                  Tài liệu tham khảo (References)
                </Label>
                <Input
                  id="reference-materials"
                  placeholder="Sách, bài báo nghiên cứu, liên kết..."
                  value={referenceMaterials}
                  onChange={(e) => setReferenceMaterials(e.target.value)}
                  disabled={isSubmitting}
                  className="text-xs bg-background"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border/60 flex items-center justify-between gap-2.5 shrink-0 bg-muted/20">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-mono font-bold text-foreground">
            {activeTab === "general" ? "Trang 1/3" : activeTab === "academic" ? "Trang 2/3" : "Trang 3/3"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs h-9 cursor-pointer"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="text-xs h-9 gap-1.5 cursor-pointer font-semibold"
          >
            {mode === "create" ? (
              <>
                <PlusIcon className="w-3.5 h-3.5" />
                {isSubmitting ? "Đang khởi tạo..." : "Tạo bản nháp"}
              </>
            ) : (
              <>
                <SaveIcon className="w-3.5 h-3.5" />
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function SyllabusDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "create",
  isSubmitting = false,
}: SyllabusDialogProps) {
  if (!isOpen) return null;

  const formKey = mode === "edit" ? (initialData?.id || "edit") : "create-new";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <LayersIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {mode === "create"
                  ? "Tạo Phiên bản Đề cương Mới (DRAFT)"
                  : "Chỉnh sửa Thông tin Đề cương (DRAFT)"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {mode === "create"
                  ? "Khởi tạo bản nháp đề cương với đầy đủ thông số học thuật chuẩn FLM."
                  : "Cập nhật siêu dữ liệu phiên bản đề cương trước khi ban hành chính thức."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <SyllabusForm
          key={formKey}
          initialData={initialData}
          mode={mode}
          onClose={onClose}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
