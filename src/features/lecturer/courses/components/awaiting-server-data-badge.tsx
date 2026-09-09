import { Badge } from "@/components/ui/badge";

interface AwaitingServerDataBadgeProps {
  label?: string;
}

export function AwaitingServerDataBadge({
  label = "Dữ liệu đang chờ kết nối",
}: AwaitingServerDataBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="border-amber-500/30 bg-amber-500/15 text-[10px] font-semibold text-amber-700 dark:text-amber-300"
    >
      {label}
    </Badge>
  );
}
