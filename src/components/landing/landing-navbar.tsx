import Link from "next/link";
import { SagaLogo } from "@/components/common/saga-logo";
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
        <Link href="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
          <SagaLogo size="sm" showText={true} showSubtitle={false} />
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
