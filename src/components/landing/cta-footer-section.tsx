import Link from "next/link";
import { ArrowRightIcon, GitGraphIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function CtaFooterSection() {
  return (
    <>
      <section className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div
            className="rounded-2xl p-12 md:p-20 text-center space-y-6"
            style={{
              background: "oklch(from var(--muted) l c h / 50%)",
              border: "1px solid var(--border)",
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground max-w-xl mx-auto leading-tight">
              Sẵn sàng thay đổi cách đánh giá học tập?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Tham gia nền tảng SAGA và trải nghiệm hệ thống đánh giá minh bạch, công bằng
              ngay hôm nay.
            </p>
            <Link
              href="/login"
              className={buttonVariants({ size: "lg", className: "gap-2 font-semibold mt-2" })}
            >
              Tham gia nền tảng
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <GitGraphIcon className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground text-sm">SAGA</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Nhóm SAGA — Capstone Project
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-fast">Tài liệu</Link>
            <Link href="#" className="hover:text-foreground transition-fast">Liên hệ</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
