"use client";

import { Toaster as SonnerToaster } from "sonner";
import {
  CheckCircle2Icon,
  AlertCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  Loader2Icon,
} from "lucide-react";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      expand={false}
      duration={4000}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card/95 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl group-[.toaster]:p-4 group-[.toaster]:text-xs group-[.toaster]:font-medium",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-[11px]",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl group-[.toast]:text-xs group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl group-[.toast]:text-xs",
          closeButton:
            "group-[.toast]:bg-card group-[.toast]:border-border group-[.toast]:text-muted-foreground group-[.toast]:hover:text-foreground",
          success:
            "group-[.toaster]:border-emerald-500/30 group-[.toaster]:bg-emerald-500/10 group-[.toaster]:text-emerald-900 dark:group-[.toaster]:text-emerald-200",
          error:
            "group-[.toaster]:border-destructive/30 group-[.toaster]:bg-destructive/10 group-[.toaster]:text-destructive",
          warning:
            "group-[.toaster]:border-amber-500/30 group-[.toaster]:bg-amber-500/10 group-[.toaster]:text-amber-900 dark:group-[.toaster]:text-amber-200",
          info:
            "group-[.toaster]:border-primary/30 group-[.toaster]:bg-primary/10 group-[.toaster]:text-primary",
        },
      }}
      icons={{
        success: <CheckCircle2Icon className="size-4.5 text-emerald-600 dark:text-emerald-400" />,
        info: <InfoIcon className="size-4.5 text-primary" />,
        warning: <AlertTriangleIcon className="size-4.5 text-amber-600 dark:text-amber-400" />,
        error: <AlertCircleIcon className="size-4.5 text-destructive" />,
        loading: <Loader2Icon className="size-4.5 animate-spin text-primary" />,
      }}
      {...props}
    />
  );
}

export { toast } from "sonner";
