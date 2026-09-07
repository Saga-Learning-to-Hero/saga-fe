"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  LayersIcon,
  AwardIcon,
  ClockIcon,
  ArchiveIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SyllabusVersionList } from "@/features/admin/subjects/components/syllabus-version-list";
import { SyllabusDialog } from "@/features/admin/subjects/components/syllabus-dialog";
import { useSubjectDetail } from "@/features/admin/subjects/hooks/use-subjects";
import {
  useSyllabi,
  useSyllabusDetail,
  useCreateSyllabusDraft,
  useReplaceSyllabusStructure,
  usePublishSyllabus,
  useArchiveSyllabus,
} from "@/features/admin/subjects/hooks/use-syllabi";
import type {
  CreateSyllabusRequest,
  ReplaceSyllabusStructureRequest,
} from "@/features/admin/subjects/types/syllabus-types";

const DynamicSyllabusStructureBuilder = dynamic(
  () =>
    import("@/features/admin/subjects/components/syllabus-structure-builder").then(
      (mod) => mod.SyllabusStructureBuilder
    ),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-xs animate-pulse">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="space-y-2">
            <div className="h-5 bg-muted rounded w-48" />
            <div className="h-3.5 bg-muted rounded w-72" />
          </div>
          <div className="h-9 bg-muted rounded-xl w-32" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 bg-muted rounded-lg w-32" />
          <div className="h-8 bg-muted rounded-lg w-36" />
          <div className="h-8 bg-muted rounded-lg w-40" />
        </div>
        <div className="space-y-3 pt-2">
          <div className="h-10 bg-muted/60 rounded-xl w-full" />
          <div className="h-12 bg-muted/40 rounded-xl w-full" />
          <div className="h-12 bg-muted/40 rounded-xl w-full" />
          <div className="h-12 bg-muted/40 rounded-xl w-full" />
        </div>
      </div>
    ),
  }
);

export default function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const {
    data: subject,
    isLoading: isSubjectLoading,
    refetch: refetchSubject,
  } = useSubjectDetail(id);

  const {
    data: syllabi = [],
    refetch: refetchSyllabi,
  } = useSyllabi(id);

  const [activeTab, setActiveTab] = useState<"versions" | "structure">("versions");
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const activeVersionId = useMemo(() => {
    if (selectedVersionId && syllabi.some((s) => s.id === selectedVersionId)) {
      return selectedVersionId;
    }
    const published = syllabi.find((s) => s.status === "PUBLISHED");
    return published ? published.id : syllabi[0]?.id || null;
  }, [selectedVersionId, syllabi]);

  const activeSyllabusSummary = useMemo(() => {
    return syllabi.find((s) => s.id === activeVersionId) || null;
  }, [syllabi, activeVersionId]);

  const {
    data: syllabusDetail,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useSyllabusDetail(id, activeVersionId || "", {
    enabled: activeTab === "structure" && Boolean(activeVersionId),
  });

  const createDraftMutation = useCreateSyllabusDraft();
  const replaceStructureMutation = useReplaceSyllabusStructure();
  const publishMutation = usePublishSyllabus();
  const archiveMutation = useArchiveSyllabus();

  const handleCreateDraft = async (data: CreateSyllabusRequest) => {
    const res = await createDraftMutation.mutateAsync({ subjectId: id, data });
    setSelectedVersionId(res.id);
    setActiveTab("structure");
  };

  const handleSaveStructure = async (data: ReplaceSyllabusStructureRequest) => {
    if (!activeVersionId) return;
    try {
      await replaceStructureMutation.mutateAsync({
        subjectId: id,
        versionId: activeVersionId,
        data,
      });
    } catch {
      return;
    }
  };

  const handlePublish = async (versionId: string) => {
    try {
      await publishMutation.mutateAsync({ subjectId: id, versionId });
    } catch {
      return;
    }
  };

  const handleArchive = async (versionId: string) => {
    try {
      await archiveMutation.mutateAsync({ subjectId: id, versionId });
    } catch {
      return;
    }
  };

  const handleRefreshAll = () => {
    refetchSubject();
    refetchSyllabi();
    if (activeVersionId && activeTab === "structure") refetchDetail();
  };

  if (isSubjectLoading && !subject) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse pb-16">
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded w-36" />
          <div className="p-6 rounded-2xl bg-card border border-border flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-muted shrink-0" />
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <div className="h-7 bg-muted rounded-lg w-20" />
                <div className="h-7 bg-muted rounded-lg w-64" />
                <div className="h-6 bg-muted rounded-full w-28" />
              </div>
              <div className="h-4 bg-muted rounded w-48" />
              <div className="h-4 bg-muted rounded w-32" />
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="h-5 bg-muted rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="h-28 bg-muted rounded-2xl" />
            <div className="h-28 bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-in fade-in-0">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <BookOpenIcon className="w-8 h-8 text-muted-foreground opacity-50" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-foreground">Không tìm thấy môn học</h2>
          <p className="text-sm text-muted-foreground">Môn học này không tồn tại hoặc đã bị gỡ bỏ.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/subjects")}
          className="mt-2 h-9 text-xs"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1.5" /> Quay lại danh mục Môn học
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in-0 duration-300 pb-16">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/subjects"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" /> Quay lại danh mục Môn học
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshAll}
            className="text-xs h-8 gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <RefreshCwIcon className="w-3.5 h-3.5" /> Làm mới
          </Button>
        </div>

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
                  {subject.nameEnglish}
                </h1>
                {subject.status === "ACTIVE" ? (
                  <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold px-2 py-0.5">
                    <CheckCircle2Icon className="w-3.5 h-3.5 mr-1" /> Đang hoạt động
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground border-border text-[10px] uppercase font-semibold px-2 py-0.5">
                    <AlertCircleIcon className="w-3.5 h-3.5 mr-1" /> Tạm ngừng
                  </Badge>
                )}
              </div>

              {subject.nameVietnamese && (
                <p className="text-sm font-medium text-muted-foreground">
                  {subject.nameVietnamese}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap font-mono">
                <span>Ngày tạo: <strong className="text-foreground">{new Date(subject.createdAt).toLocaleDateString("vi-VN")}</strong></span>
                <span>•</span>
                <span>Cập nhật lần cuối: <strong className="text-foreground">{new Date(subject.updatedAt || subject.createdAt).toLocaleDateString("vi-VN")}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "versions" | "structure")} className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="versions" className="text-xs font-semibold gap-1.5 px-3.5 py-1.5 cursor-pointer">
            <LayersIcon className="w-3.5 h-3.5" />
            1. Phiên bản Đề cương ({syllabi.length})
          </TabsTrigger>
          <TabsTrigger value="structure" className="text-xs font-semibold gap-1.5 px-3.5 py-1.5 cursor-pointer">
            <AwardIcon className="w-3.5 h-3.5" />
            2. Cấu trúc đào tạo chi tiết
          </TabsTrigger>
        </TabsList>

        <TabsContent value="versions" keepMounted className="space-y-4">
          <SyllabusVersionList
            syllabi={syllabi}
            selectedVersionId={activeVersionId}
            onSelectVersion={(verId) => setSelectedVersionId(verId)}
            onOpenCreateDialog={() => setIsCreateDialogOpen(true)}
            onPublish={handlePublish}
            onArchive={handleArchive}
            onViewStructure={(verId) => {
              setSelectedVersionId(verId);
              setActiveTab("structure");
            }}
            isPublishing={publishMutation.isPending}
            isArchiving={archiveMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="structure" keepMounted className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <AwardIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-foreground">
                    Cấu trúc đề cương:
                  </h3>
                  <span className="font-mono text-xs font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                    {activeSyllabusSummary?.versionLabel || "Đang chọn"}
                  </span>
                  {activeSyllabusSummary?.status === "PUBLISHED" ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0">
                      <CheckCircle2Icon className="w-3 h-3 mr-1" />
                      Chính thức
                    </Badge>
                  ) : activeSyllabusSummary?.status === "DRAFT" ? (
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold px-2 py-0">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      Bản nháp
                    </Badge>
                  ) : activeSyllabusSummary?.status === "ARCHIVED" ? (
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] font-semibold px-2 py-0">
                      <ArchiveIcon className="w-3 h-3 mr-1" />
                      Lưu trữ
                    </Badge>
                  ) : null}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Chuẩn đầu ra năng lực (CLOs), bài học (Units) và tiêu chí nghiệm thu (Phases).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("versions")}
                className="h-8 text-xs font-semibold gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <LayersIcon className="w-3.5 h-3.5" />
                <span>Đổi phiên bản khác</span>
              </Button>
            </div>
          </div>

          {isDetailLoading ? (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-xs animate-pulse">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="space-y-2">
                  <div className="h-5 bg-muted rounded w-48" />
                  <div className="h-3.5 bg-muted rounded w-72" />
                </div>
                <div className="h-9 bg-muted rounded-xl w-32" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 bg-muted rounded-lg w-32" />
                <div className="h-8 bg-muted rounded-lg w-36" />
                <div className="h-8 bg-muted rounded-lg w-40" />
              </div>
              <div className="space-y-3 pt-2">
                <div className="h-10 bg-muted/60 rounded-xl w-full" />
                <div className="h-12 bg-muted/40 rounded-xl w-full" />
                <div className="h-12 bg-muted/40 rounded-xl w-full" />
                <div className="h-12 bg-muted/40 rounded-xl w-full" />
              </div>
            </div>
          ) : syllabusDetail ? (
            <DynamicSyllabusStructureBuilder
              key={syllabusDetail.id}
              syllabus={syllabusDetail}
              onSaveStructure={handleSaveStructure}
              isSaving={replaceStructureMutation.isPending}
            />
          ) : (
            <div className="p-12 text-center space-y-3 bg-card border border-border rounded-2xl">
              <p className="text-sm font-bold text-foreground">Chưa có đề cương nào cho môn học này</p>
              <p className="text-xs text-muted-foreground">
                Bấm nút &quot;Tạo bản nháp mới&quot; ở tab Phiên bản để bắt đầu cấu hình đề cương học phần.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <SyllabusDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateDraft}
        isSubmitting={createDraftMutation.isPending}
      />
    </div>
  );
}
