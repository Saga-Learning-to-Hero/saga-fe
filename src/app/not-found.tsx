"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, LayoutDashboardIcon, CompassIcon, FileQuestionIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background text-foreground relative overflow-hidden">
      {/* Background Glow Decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-md w-full text-center space-y-6">
        {/* Floating Icon Illustration */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xl shadow-primary/5 animate-pulse">
            <CompassIcon className="w-12 h-12" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-card border border-border flex items-center justify-center text-muted-foreground shadow-md">
            <FileQuestionIcon className="w-5 h-5" />
          </div>
        </div>

        {/* 404 Big Heading */}
        <div className="space-y-2">
          <p className="text-7xl sm:text-8xl font-extrabold tracking-tight bg-gradient-to-b from-primary via-primary/80 to-primary/30 bg-clip-text text-transparent select-none font-mono">
            404
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Không tìm thấy trang yêu cầu
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Đường dẫn bạn vừa truy cập có thể đã bị di chuyển, xóa bỏ hoặc tạm thời không khả dụng trên hệ thống SAGA.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto h-10 px-5 gap-2 text-xs font-semibold rounded-xl border-border hover:bg-muted cursor-pointer"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Quay lại trang trước
          </Button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto h-10 px-5 inline-flex items-center justify-center gap-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-colors cursor-pointer"
          >
            <LayoutDashboardIcon className="w-4 h-4" />
            Về trang tổng quan
          </Link>
        </div>

        {/* Footer subtle text */}
        <p className="text-[11px] text-muted-foreground/60 pt-4 font-mono">
          Mã lỗi: HTTP_404_PAGE_NOT_FOUND · SAGA Platform
        </p>
      </div>
    </div>
  );
}
