import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StudentFinalGrade } from "../types/final-grades";

export function StatusBadge({ status }: { status: StudentFinalGrade["status"] }) {
  const config = {
    COMPLETE: { label: "Hoàn chỉnh", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
    INCOMPLETE: { label: "Thiếu điểm", cls: "bg-amber-500/20 text-amber-950 dark:text-amber-200 border border-amber-500/40" },
    NOT_GRADED: { label: "Chưa chấm", cls: "bg-muted text-muted-foreground" },
    FAILED: { label: "Dưới chuẩn", cls: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
    MANUALLY_ADJUSTED: { label: "Đã chỉnh sửa", cls: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400" },
    LOCKED: { label: "Đã khóa", cls: "bg-muted text-muted-foreground" },
  }[status];

  return (
    <Badge className={cn("border-0 text-[11px] font-bold shadow-none", config.cls)}>
      {config.label}
    </Badge>
  );
}
