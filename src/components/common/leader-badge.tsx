import type { ReactNode } from "react";
import { CrownIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface LeaderBadgeProps {
  size?: "sm" | "md";
  theme?: "outline" | "solid";
  variant?: "badge" | "icon-only";
  showEnglish?: boolean;
  children?: ReactNode;
  className?: string;
}

export function LeaderBadge({
  size = "sm",
  theme = "outline",
  variant = "badge",
  showEnglish = false,
  children,
  className,
}: LeaderBadgeProps) {
  if (variant === "icon-only") {
    return (
      <span title="Trưởng nhóm" className={cn("inline-flex items-center", className)}>
        <CrownIcon className="size-3.5 shrink-0 text-amber-500 fill-amber-500/40" />
      </span>
    );
  }

  const label = children ?? (showEnglish ? "Trưởng nhóm (Leader)" : "Trưởng nhóm");

  return (
    <Badge
      variant="outline"
      className={cn(
        theme === "solid"
          ? "border-0 bg-amber-300 text-amber-950 font-bold shadow-xs shrink-0 select-none"
          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 shrink-0 font-semibold select-none",
        size === "sm" && "gap-1 text-[10px] px-2 py-0.5",
        size === "md" && "gap-1.5 text-xs px-2.5 py-1 font-bold",
        className
      )}
    >
      <CrownIcon
        className={cn(
          "shrink-0",
          theme === "solid"
            ? "text-amber-950 fill-amber-950/30"
            : "text-amber-500 fill-amber-500/40",
          size === "sm" ? "size-3" : "size-3.5"
        )}
      />
      <span>{label}</span>
    </Badge>
  );
}

export interface MemberRoleBadgeProps {
  role?: string | null;
  size?: "sm" | "md";
  theme?: "outline" | "solid";
  showEnglish?: boolean;
  className?: string;
}

export function MemberRoleBadge({
  role,
  size = "sm",
  theme = "outline",
  showEnglish = false,
  className,
}: MemberRoleBadgeProps) {
  const isLeader = (role || "").trim().toUpperCase() === "LEADER";

  if (isLeader) {
    return (
      <LeaderBadge
        size={size}
        theme={theme}
        showEnglish={showEnglish}
        className={className}
      />
    );
  }

  const label = showEnglish ? "Thành viên (Member)" : "Thành viên";

  return (
    <Badge
      variant="outline"
      className={cn(
        theme === "solid"
          ? "border-0 bg-white/20 text-white backdrop-blur-md font-medium shrink-0 select-none"
          : "border-border/60 bg-muted/50 text-muted-foreground font-medium shrink-0 select-none",
        size === "sm" && "text-[10px] px-2 py-0.5",
        size === "md" && "text-xs px-2.5 py-1",
        className
      )}
    >
      {label}
    </Badge>
  );
}
