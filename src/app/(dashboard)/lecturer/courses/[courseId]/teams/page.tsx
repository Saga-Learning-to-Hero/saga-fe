import { Suspense } from "react";
import { CourseWorkspacePage } from "@/features/lecturer/courses/components/course-workspace-page";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function LecturerTeamsPage({ params }: Props) {
  const { courseId } = await params;
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-[1600px] space-y-4 pb-12">
          <div className="h-8 w-64 animate-pulse rounded-xl bg-muted" />
          <div className="h-48 animate-pulse rounded-2xl bg-muted/60" />
        </div>
      }
    >
      <CourseWorkspacePage key={courseId} courseId={courseId} />
    </Suspense>
  );
}
