"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogInIcon,
  LayoutDashboardIcon,
  UserIcon,
  LogOutIcon,
  ArrowRightIcon,
  ChevronDownIcon,
} from "lucide-react";
import { SagaLogo } from "@/components/common/saga-logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useLogout, useSession } from "@/features/auth/hooks/useAuth";
import { getRoleHomePath } from "@/features/auth/lib/role-routes";
import { ROLE_LABELS, getInitials } from "@/components/layout/sidebar/nav-config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { label: "Tính năng", href: "#tinh-nang" },
  { label: "Góc nhìn", href: "#goc-nhin" },
  { label: "Quy trình", href: "#quy-trinh" },
  { label: "Hỏi đáp", href: "#hoi-dap" },
];

export function LandingNavbar() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { mutate: logout } = useLogout();
  useSession();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const targetElem = document.getElementById(targetId);
    if (targetElem) {
      targetElem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const homePath = user ? getRoleHomePath(user.role) : "/login";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md shadow-xs font-sans">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
          <SagaLogo size="sm" showText={true} showSubtitle={false} />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg transition-colors hover:text-foreground hover:bg-muted/60 cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                href={homePath}
                className={buttonVariants({
                  size: "sm",
                  className: "gap-1.5 font-bold px-4 py-2 h-9 shadow-xs rounded-xl text-sm",
                })}
              >
                <span>Vào ứng dụng</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 p-1 pl-1.5 rounded-xl border border-border hover:bg-muted/60 transition-colors cursor-pointer outline-none">
                  <Avatar className="w-7 h-7 rounded-lg border border-border shrink-0">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs font-bold bg-primary/20 text-primary">
                      {getInitials(user.name || user.fullName || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-xs font-semibold text-foreground max-w-28 truncate">
                    {user.name || user.fullName}
                  </span>
                  <ChevronDownIcon className="w-3.5 h-3.5 text-muted-foreground mr-1" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl border-border shadow-md">
                  <div className="px-2.5 py-2 space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <p className="text-xs font-bold text-foreground truncate">
                        {user.name || user.fullName}
                      </p>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-1.5 py-0 font-medium">
                        {ROLE_LABELS[user.role]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => router.push(homePath)}
                    className="cursor-pointer gap-2 text-xs py-2 rounded-xl flex items-center"
                  >
                    <LayoutDashboardIcon className="w-3.5 h-3.5 text-primary" />
                    <span>Không gian làm việc</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="cursor-pointer gap-2 text-xs py-2 rounded-xl flex items-center"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-primary" />
                    <span>Hồ sơ cá nhân</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer gap-2 text-xs py-2 text-destructive focus:text-destructive rounded-xl flex items-center"
                  >
                    <LogOutIcon className="w-3.5 h-3.5" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link
              href="/login"
              className={buttonVariants({
                size: "sm",
                className: "gap-2 font-bold px-5 py-2 h-9 shadow-xs rounded-xl text-sm",
              })}
            >
              <LogInIcon className="w-3.5 h-3.5" />
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
