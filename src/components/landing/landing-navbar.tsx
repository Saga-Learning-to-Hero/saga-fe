"use client";

import Link from "next/link";
import { LogInIcon } from "lucide-react";
import { SagaLogo } from "@/components/common/saga-logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { buttonVariants } from "@/components/ui/button";

const navLinks = [
  { label: "Tính năng", href: "#tinh-nang" },
  { label: "Góc nhìn", href: "#goc-nhin" },
  { label: "Quy trình", href: "#quy-trinh" },
  { label: "Hỏi đáp", href: "#hoi-dap" },
];

export function LandingNavbar() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const targetElem = document.getElementById(targetId);
    if (targetElem) {
      targetElem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-md shadow-2xs">
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

          <Link
            href="/login"
            className={buttonVariants({
              size: "sm",
              className: "gap-2 font-bold px-5 py-2 h-9 shadow-xs shadow-primary/20 rounded-lg",
            })}
          >
            <LogInIcon className="w-3.5 h-3.5" />
            Đăng nhập
          </Link>
        </div>
      </div>
    </header>
  );
}
