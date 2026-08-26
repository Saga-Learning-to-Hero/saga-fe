"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — desktop */}
      <div className="hidden md:flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </div>

      {/* Sidebar — mobile (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center md:hidden px-4 h-14 border-b border-border gap-3 bg-background shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu"
          >
            <MenuIcon className="w-4 h-4" />
          </Button>
          <span className="font-bold text-foreground tracking-tight text-sm">SAGA</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
