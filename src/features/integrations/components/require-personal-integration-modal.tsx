"use client";

import { AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface RequirePersonalIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingProviders: string[];
}

export function RequirePersonalIntegrationModal({
  isOpen,
  onClose,
  missingProviders,
}: RequirePersonalIntegrationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card border-border/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden w-full max-w-md slide-in-from-bottom-4 animate-in duration-300"
      >
        <div className="p-5 border-b border-border/60 bg-amber-500/10 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangleIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-amber-900 dark:text-amber-100">
              Yêu cầu liên kết tài khoản
            </h3>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80 font-medium">
              Thiếu tích hợp cá nhân
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-foreground leading-relaxed">
            Hệ thống yêu cầu bạn phải liên kết tài khoản cá nhân <strong>{missingProviders.join(" và ")}</strong> trước khi thực hiện thao tác này. Việc liên kết giúp định danh chính xác công sức đóng góp của bạn trên hệ thống.
          </p>

          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${missingProviders.includes("Jira") ? "bg-muted text-muted-foreground" : "bg-emerald-500 text-white"}`}>
                <CheckCircle2Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-sm font-semibold ${missingProviders.includes("Jira") ? "text-muted-foreground" : "text-foreground"}`}>
                Tài khoản Jira
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${missingProviders.includes("GitHub") ? "bg-muted text-muted-foreground" : "bg-emerald-500 text-white"}`}>
                <CheckCircle2Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-sm font-semibold ${missingProviders.includes("GitHub") ? "text-muted-foreground" : "text-foreground"}`}>
                Tài khoản GitHub
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-end gap-2.5 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto h-10 text-sm font-semibold rounded-xl cursor-pointer"
          >
            Đóng
          </Button>
          <Link href="/profile/integrations" className="w-full sm:w-auto" target="_blank" rel="noopener noreferrer">
            <Button
              type="button"
              className="w-full h-10 text-sm font-bold rounded-xl cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              Đi đến Tích hợp
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
