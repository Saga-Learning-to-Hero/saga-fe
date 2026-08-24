import Link from "next/link";
import { GitGraphIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const navLinks = [
  { label: "Tính năng", href: "#tinh-nang" },
  { label: "Kiến trúc", href: "#kien-truc" },
  { label: "Công nghệ", href: "#cong-nghe" },
];

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GitGraphIcon className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-lg tracking-tight">SAGA</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm text-muted-foreground rounded-md transition-fast hover:text-foreground hover:bg-muted"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link href="/login" className={buttonVariants({ size: "sm" })}>
          Đăng nhập
        </Link>
      </div>
    </header>
  );
}
