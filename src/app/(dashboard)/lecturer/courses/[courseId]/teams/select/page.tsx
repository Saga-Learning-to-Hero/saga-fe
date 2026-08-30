"use client";

import { use } from "react";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UsersIcon } from "lucide-react";
import { lecturerCourseTeamsPath } from "@/features/lecturer/team-project-activity/lib/team-project-routes";

export default function LecturerTeamSelectPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <UsersIcon className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold mb-2">Chưa chọn dự án nhóm</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Hãy chọn một nhóm để xem thông tin dự án, commit GitHub, bảng Jira và các chỉ số tiến độ.
      </p>
      <Button 
        onClick={() => router.push(lecturerCourseTeamsPath(resolvedParams.courseId))}
        className="font-semibold"
      >
        Quay lại Danh sách lớp
      </Button>
    </div>
  );
}
