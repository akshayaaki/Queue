import React from "react";
import { cn } from "@/lib/utils";
import { TokenStatus } from "@/types";
import { Clock, Megaphone, Sparkles, CheckCircle2, XCircle, FastForward } from "lucide-react";

interface StatusBadgeProps {
  status: TokenStatus | string;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "default" | "lg";
}

export function StatusBadge({
  status,
  className,
  showIcon = true,
  size = "default",
}: StatusBadgeProps) {
  const normalized = (status || "WAITING").toUpperCase() as TokenStatus;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    default: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3.5 py-1.5 text-sm gap-2 font-semibold",
  }[size];

  switch (normalized) {
    case "WAITING":
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-full bg-palette-bisque/90 text-[#7D5A25] border border-palette-ochre/30 dark:bg-[#342A1D] dark:text-[#E8C28A] dark:border-palette-ochre/20",
            sizeClasses,
            className
          )}
        >
          {showIcon && <Clock className="w-3 h-3 text-palette-ochreDark" />}
          Waiting
        </span>
      );

    case "CALLED":
      return (
        <span
          className={cn(
            "inline-flex items-center font-semibold rounded-full bg-palette-parchment text-[#805018] border-2 border-palette-ochre shadow-xs animate-pulse dark:bg-[#3E2F1E] dark:text-[#F3CE9B]",
            sizeClasses,
            className
          )}
        >
          {showIcon && <Megaphone className="w-3.5 h-3.5 text-palette-ochreDark animate-bounce" />}
          Called
        </span>
      );

    case "SERVING":
      return (
        <span
          className={cn(
            "inline-flex items-center font-semibold rounded-full bg-palette-celery text-[#2A3E1B] border border-palette-sage shadow-xs dark:bg-[#27351D] dark:text-[#D1E2A5] dark:border-palette-sage/40",
            sizeClasses,
            className
          )}
        >
          {showIcon && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#586938] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#425227]"></span>
            </span>
          )}
          Serving Now
        </span>
      );

    case "COMPLETED":
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-full bg-palette-sage/40 text-[#2C3B20] border border-palette-sage/60 dark:bg-[#202C1B] dark:text-[#C5D49E] dark:border-palette-sage/30",
            sizeClasses,
            className
          )}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-[#586938]" />}
          Completed
        </span>
      );

    case "CANCELLED":
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-full bg-red-50 text-red-700 border border-red-200/80 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60",
            sizeClasses,
            className
          )}
        >
          {showIcon && <XCircle className="w-3.5 h-3.5 text-red-500" />}
          Cancelled
        </span>
      );

    case "SKIPPED":
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-full bg-stone-100 text-stone-600 border border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700",
            sizeClasses,
            className
          )}
        >
          {showIcon && <FastForward className="w-3 h-3 text-stone-500" />}
          Skipped
        </span>
      );

    default:
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-full bg-muted text-muted-foreground border border-border",
            sizeClasses,
            className
          )}
        >
          {status}
        </span>
      );
  }
}
