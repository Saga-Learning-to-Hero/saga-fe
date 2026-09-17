"use client";

import { usePathname } from "next/navigation";
import {
  MenuIcon,
  LayoutDashboardIcon,
  UsersIcon,
  GraduationCapIcon,
  BookOpenIcon,
  ScrollTextIcon,
  SendIcon,
  BellIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
} from "lucide-react";
import { SagaLogo } from "@/components/common/saga-logo";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/features/notification/components/notification-bell";
import { GlobalCommandSearch } from "./global-command-search";

interface AdminTopHeaderProps {
  onOpenMobileMenu: () => void;
}

interface PathContextInfo {
  group: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

function getPathContext(pathname: string): PathContextInfo {
  if (pathname === "/admin/dashboard" || pathname === "/admin") {
    return {
      group: "Hệ thống",
      title: "Tổng quan hệ thống",
      icon: LayoutDashboardIcon,
    };
  }
  if (pathname.startsWith("/admin/users")) {
    return {
      group: "Quản trị tài khoản",
      title: "Tài khoản người dùng & Phân quyền",
      icon: UsersIcon,
    };
  }
  if (pathname.startsWith("/admin/academic")) {
    return {
      group: "Quản trị học thuật",
      title: "Lớp học & Học kỳ đào tạo",
      icon: GraduationCapIcon,
    };
  }
  if (pathname.startsWith("/admin/subjects")) {
    return {
      group: "Khung chương trình",
      title: "Môn học & Đề cương FLM",
      icon: BookOpenIcon,
    };
  }
  if (pathname.startsWith("/admin/audit-log")) {
    return {
      group: "Hạ tầng & An ninh",
      title: "Nhật ký kiểm toán hệ thống",
      icon: ScrollTextIcon,
    };
  }
  if (pathname.startsWith("/admin/notifications")) {
    return {
      group: "Hạ tầng & An ninh",
      title: "Trung tâm phát thông báo hệ thống",
      icon: SendIcon,
    };
  }
  if (pathname.startsWith("/notifications")) {
    return {
      group: "Cá nhân",
      title: "Trung tâm thông báo",
      icon: BellIcon,
    };
  }
  return {
    group: "Quản trị viên",
    title: "Cổng điều hành hệ thống SAGA",
    icon: ShieldCheckIcon,
  };
}

export function AdminTopHeader({ onOpenMobileMenu }: AdminTopHeaderProps) {
  const pathname = usePathname();
  const context = getPathContext(pathname);
  const ContextIcon = context.icon;

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-border bg-background/95 backdrop-blur-xs shrink-0 select-none gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8.5 w-8.5 rounded-lg md:hidden cursor-pointer"
          onClick={onOpenMobileMenu}
          aria-label="Mở menu"
        >
          <MenuIcon className="size-4.5" />
        </Button>

        <div className="md:hidden">
          <SagaLogo size="xs" showText={true} showSubtitle={false} />
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <ContextIcon className="size-3.5 text-primary" />
            <span>{context.group}</span>
          </div>
          <ChevronRightIcon className="size-3 text-muted-foreground/50" />
          <span className="font-bold text-foreground truncate max-w-[200px] lg:max-w-xs">
            {context.title}
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-center flex-1 max-w-xs lg:max-w-sm">
        <GlobalCommandSearch />
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
          </span>
          <span>Hệ thống ổn định</span>
        </div>

        <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/60 border border-border text-muted-foreground text-[11px] font-mono">
          <span>Kỳ FA26</span>
        </div>

        <div className="h-4 w-px bg-border/80 hidden sm:block" />

        <NotificationBell />
      </div>
    </header>
  );
}
