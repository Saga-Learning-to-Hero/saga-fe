import Link from "next/link";
import { ArrowRightIcon, FileTextIcon, NetworkIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 60% 40%, oklch(from var(--saga-primary) l c h / 8%), transparent)",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 py-20 w-full grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="space-y-7">
          <Badge variant="outline" className="gap-1.5 text-primary border-primary/30 bg-primary/5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Dự án Capstone 2025 – 2026
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Hệ thống Đánh giá{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, var(--saga-primary), var(--saga-accent))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                dựa trên Đồ thị
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Chấm dứt tình trạng {'"'}free-riding{'"'} trong các nhóm học tập. SAGA định lượng
              đóng góp của từng sinh viên theo thời gian thực bằng Traceability Graph và AI.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className={buttonVariants({ size: "lg", className: "gap-2 font-semibold" })}
            >
              Bắt đầu ngay
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <Link
              href="#"
              className={buttonVariants({ variant: "outline", size: "lg", className: "gap-2" })}
            >
              <FileTextIcon className="w-4 h-4" />
              Xem tài liệu
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
            {[
              { so: "100%", nhan: "Minh bạch" },
              { so: "Real-time", nhan: "Cập nhật" },
              { so: "AI-powered", nhan: "Phân tích" },
            ].map((s) => (
              <div key={s.nhan} className="flex flex-col">
                <span className="font-bold text-foreground text-base">{s.so}</span>
                <span>{s.nhan}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden md:flex items-center justify-center">
          <div
            className="w-full aspect-[4/3] rounded-2xl border border-border bg-muted flex flex-col items-center justify-center gap-4"
            style={{
              background:
                "linear-gradient(145deg, var(--muted), oklch(from var(--saga-primary) l c h / 5%))",
            }}
          >
            <NetworkIcon
              className="w-16 h-16 text-primary/30"
              strokeWidth={1}
            />
            <p className="text-sm text-muted-foreground">Dashboard Preview</p>
          </div>
          <div
            className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full -z-10 blur-3xl"
            style={{ background: "oklch(from var(--saga-accent) l c h / 20%)" }}
          />
        </div>
      </div>
    </section>
  );
}
