"use client";

import Link from "next/link";
import { PanelLeftCloseIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SagaLogo } from "@/components/common/saga-logo";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUserProfile } from "./sidebar-user-profile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getRoleHomePath } from "@/features/auth/lib/role-routes";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuthStore();
  const homePath = user ? getRoleHomePath(user.role) : "/";

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full",
        "bg-sidebar border-r border-sidebar-border",
        "transition-all duration-300 ease-in-out will-change-[width]",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* ── Header: Logo SAGA & Nút thu gọn thanh thoát ── */}
      <div
        className={cn(
          "flex items-center h-15 px-3.5 shrink-0 border-b border-sidebar-border",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              onClick={onToggle}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-sidebar-accent transition-colors cursor-pointer"
              aria-label="Mở rộng thanh điều hướng"
            >
              <SagaLogo size="xs" showText={false} />
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              Mở rộng thanh điều hướng
            </TooltipContent>
          </Tooltip>
        ) : (
          <>
            <Link href={homePath} className="flex items-center min-w-0 hover:opacity-95 transition-opacity">
              <SagaLogo size="sm" showText={true} showSubtitle={true} subtitleText="v0.1.0 · Beta" />
            </Link>

            <Tooltip>
              <TooltipTrigger
                onClick={onToggle}
                className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors cursor-pointer"
                aria-label="Thu gọn thanh điều hướng"
              >
                <PanelLeftCloseIcon className="w-4 h-4" />
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                Thu gọn thanh điều hướng
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>

      {/* ── Thân Sidebar: Danh sách Menu Navigation (flex-1) ── */}
      <SidebarNav collapsed={collapsed} />

      {/* ── Đáy Sidebar: User Profile làm chân đế vững chắc ── */}
      <SidebarUserProfile collapsed={collapsed} />
    </aside>
  );
}
