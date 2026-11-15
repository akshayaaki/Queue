import React from "react";
import { cn } from "@/lib/utils";
import { TokenStatus } from "@/types";
import { Clock, Megaphone, CheckCircle2, XCircle, FastForward } from "lucide-react";

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
    default: "px-2.5 py-0.5 text-xs gap-1.5",
    lg: "px-3.5 py-1 text-sm gap-2 font-semibold",
  }[size];

  switch (normalized) {
    case "WAITING":
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60",
            sizeClasses,
            className
          )}
        >
          {showIcon && <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
          Waiting
        </span>
      );

    case "CALLED":
      return (
        <span
          className={cn(
            "inline-flex items-center font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 shadow-xs animate-pulse dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900",
            sizeClasses,
            className
          )}
        >
          {showIcon && <Megaphone className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
          Called
        </span>
      );

    case "SERVING":
      return (
        <span
          className={cn(
            "inline-flex items-center font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900",
            sizeClasses,
            className
          )}
        >
          {showIcon && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
          )}
          Serving Now
        </span>
      );

    case "COMPLETED":
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60",
            sizeClasses,
            className
          )}
        >
          {showIcon && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
          Completed
        </span>
      );

    case "CANCELLED":
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60",
            sizeClasses,
            className
          )}
        >
          {showIcon && <XCircle className="w-3 h-3 text-rose-500" />}
          Cancelled
        </span>
      );

    case "SKIPPED":
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
            sizeClasses,
            className
          )}
        >
          {showIcon && <FastForward className="w-3 h-3 text-slate-500" />}
          Skipped
        </span>
      );

    default:
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200",
            sizeClasses,
            className
          )}
        >
          {status}
        </span>
      );
  }
}
