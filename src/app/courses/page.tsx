"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOutIcon, ShieldCheckIcon, UserIcon } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { StudentCourseSelection } from "@/features/student/courses/components/student-course-selection";
import { SagaLogo } from "@/components/common/saga-logo";
import type { StudentCourse } from "@/features/student/courses/types/student-course";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CoursesSelectionPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout, setSelectedCourse, switchRole } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleSelectCourse = (course: StudentCourse) => {
    setSelectedCourse(course);
    router.push("/dashboard");
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Standalone Top Navigation Header (Không dùng Sidebar) ──────── */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border/80 px-4 sm:px-8 h-16 flex items-center justify-between shadow-xs">
        {/* Logo SAGA */}
        <Link href="/courses" className="hover:opacity-95 transition-opacity">
          <SagaLogo size="sm" showText={true} showSubtitle={true} subtitleText="Student Portal" />
        </Link>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {/* Admin Switcher for Demo */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              switchRole("ADMIN");
              router.push("/dashboard");
            }}
            className="hidden sm:inline-flex h-8 text-xs font-semibold rounded-xl gap-1.5 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
          >
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            Xem Admin View
          </Button>

          <div className="h-6 w-px bg-border hidden sm:block" />

          {/* Student Profile Pill */}
          <div className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-muted/50 border border-border/60">
            <Avatar className="h-7 w-7 border border-background">
              <AvatarImage src={user?.avatar} alt={user?.name || "Student"} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                SV
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground leading-tight truncate">
                {user?.name || "Lê Hoàng Hải"}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono leading-tight">
                HE170504
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Đăng xuất"
          >
            <LogOutIcon className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* ── Main Content: Course Selection Layout ──────────────────────── */}
      <main className="flex-1 p-4 sm:p-8">
        <StudentCourseSelection onSelectCourse={handleSelectCourse} />
      </main>
    </div>
  );
}
