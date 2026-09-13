import { Metadata } from "next";
import { Suspense } from "react";
import { CommitsView } from "@/features/student/commits/components/commits-view";

export const metadata: Metadata = {
  title: "GitHub Commits | SAGA Capstone",
  description: "Theo dõi nhật ký commit mã nguồn GitHub phân loại theo Repository và Branch.",
};

export default function StudentCommitsPage() {
  return (
    <Suspense fallback={<div className="min-h-48 animate-pulse rounded-2xl bg-muted" />}>
      <CommitsView />
    </Suspense>
  );
}
