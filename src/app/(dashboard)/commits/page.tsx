import { Metadata } from "next";
import { CommitsView } from "@/features/student/commits/components/commits-view";

export const metadata: Metadata = {
  title: "GitHub Commits | SAGA Capstone",
  description: "Theo dõi nhật ký commit mã nguồn GitHub phân loại theo Repository và Branch.",
};

export default function CommitsPage() {
  return <CommitsView />;
}
