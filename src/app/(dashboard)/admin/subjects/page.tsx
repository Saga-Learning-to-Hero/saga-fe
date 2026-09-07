"use client";

import { useState } from "react";
import { BookOpenIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubjectList } from "@/features/admin/subjects/components/subject-list";
import { SubjectDialog } from "@/features/admin/subjects/components/subject-dialog";
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
} from "@/features/admin/subjects/hooks/use-subjects";
import type {
  SubjectResponse,
  CreateSubjectRequest,
  PatchSubjectRequest,
} from "@/features/admin/subjects/types/subject-types";

export default function AdminSubjectsPage() {
  const { data: subjects = [], isLoading, isFetching, refetch } = useSubjects();
  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectResponse | null>(null);

  const handleOpenCreate = () => {
    setSelectedSubject(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (subject: SubjectResponse) => {
    setSelectedSubject(subject);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSubject(null);
  };

  const handleCreateSubject = async (data: CreateSubjectRequest) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdateSubject = async (id: string, data: PatchSubjectRequest) => {
    await updateMutation.mutateAsync({ id, data });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in-0 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs border border-primary/20">
            <BookOpenIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Quản Lý Môn Học & Đề Cương (FLM Curriculum)
            </h1>
            <p className="text-xs text-muted-foreground">
              Danh mục môn học chuyên ngành SE và các phiên bản đề cương chi tiết (Syllabus).
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs h-9 gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCwIcon className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      <SubjectList
        subjects={subjects}
        isLoading={isLoading}
        onOpenCreateDialog={handleOpenCreate}
        onOpenEditDialog={handleOpenEdit}
      />

      <SubjectDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmitCreate={handleCreateSubject}
        onSubmitUpdate={handleUpdateSubject}
        initialData={selectedSubject}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
