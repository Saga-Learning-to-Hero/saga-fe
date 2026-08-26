"use client";

import { GitGraphIcon, PanelLeftCloseIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUserProfile } from "./sidebar-user-profile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
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
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-xs">
                <GitGraphIcon className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              Mở rộng thanh điều hướng
            </TooltipContent>
          </Tooltip>
        ) : (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-xs">
                <GitGraphIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sidebar-foreground text-base tracking-tight leading-tight select-none">
                  SAGA
                </span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase leading-tight select-none">
                  v0.1.0 · Beta
                </span>
              </div>
            </div>

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
