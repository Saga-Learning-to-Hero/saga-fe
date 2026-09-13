import { ClockIcon, UserCheckIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PeerAssessmentHeaderProps {
  teamName?: string;
  courseCode?: string;
}

export function PeerAssessmentHeader({ teamName, courseCode }: PeerAssessmentHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-card/60 p-4 rounded-3xl border border-border/70 backdrop-blur-xs shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
          <UserCheckIcon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
              Đánh Giá Chéo
            </h1>
            {courseCode && (
              <Badge variant="outline" className="font-mono text-[11px] font-bold border-primary/30 bg-primary/10 text-primary">
                {courseCode}
              </Badge>
            )}
            {teamName && (
              <Badge variant="secondary" className="text-[11px] font-medium gap-1 text-muted-foreground border-border/60">
                <UsersIcon className="w-3 h-3 text-primary" />
                {teamName}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tính năng đánh giá đồng đẳng theo Sprint đang chờ backend công bố contract API.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold">
          <ClockIcon className="w-3.5 h-3.5" />
          <span>Đang chờ API</span>
        </div>
      </div>
    </div>
  );
}
