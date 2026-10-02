"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDelayCaseDetail } from "@/features/delay-cases/hooks/use-delay-cases";
import { Loader2Icon } from "lucide-react";

function LecturerDelayCasesRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const caseId = searchParams.get("caseId");
  const projectId = searchParams.get("projectId");

  const { data: delayCase, isError } = useDelayCaseDetail(projectId || "", caseId || "");

  useEffect(() => {
    if (delayCase && delayCase.context?.courseId) {
      router.replace(
        `/lecturer/courses/${delayCase.context.courseId}/dashboard?delayCaseId=${caseId}&projectId=${projectId}`
      );
    } else if (isError || (!caseId && !projectId)) {
      router.replace("/lecturer/courses");
    }
  }, [delayCase, isError, caseId, projectId, router]);

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
        <p>Đang tải thông tin hồ sơ trễ hạn...</p>
      </div>
    </div>
  );
}

export default function LecturerDelayCasesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LecturerDelayCasesRedirect />
    </Suspense>
  );
}
