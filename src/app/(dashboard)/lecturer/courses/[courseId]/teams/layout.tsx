import { ReactNode } from "react";
import { PrimaryTabs } from "@/features/lecturer/team-project-activity/components/primary-tabs";
import { ChevronRightIcon } from "lucide-react";

export default async function LecturerTeamsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = await params;
  return (
    <div className="flex flex-col min-h-0 h-full w-full">
      <div className="shrink-0 p-4 md:p-6 lg:p-8 pb-4 border-b bg-background flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-3">
            <span className="hover:text-foreground cursor-pointer">Khóa học</span>
            <ChevronRightIcon className="w-3.5 h-3.5" />
            <span className="hover:text-foreground cursor-pointer uppercase">{resolvedParams.courseId}</span>
            <ChevronRightIcon className="w-3.5 h-3.5" />
            <span className="text-foreground">Hoạt động nhóm</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Hoạt động dự án của nhóm
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Theo dõi thành viên, GitHub, Jira và tiến độ dự án trong lớp.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground font-medium bg-muted/50 px-3 py-1.5 rounded-lg border">
            Lớp: {resolvedParams.courseId.toUpperCase()}
          </span>
          <span className="text-xs text-muted-foreground/60 hidden sm:inline-block">
            Cập nhật lần cuối: 10:30
          </span>
        </div>
      </div>
      <div className="px-6 border-b">
        <PrimaryTabs courseId={resolvedParams.courseId} />
      </div>
      <div className="flex-1 overflow-auto bg-muted/10">
        {children}
      </div>
    </div>
  );
}
