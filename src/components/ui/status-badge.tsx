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
    lg: "px-3.5 py-1 text-sm gap-2 font-bold",
  }[size];

  switch (normalized) {
    case "WAITING":
      return (
        <span
          className={cn(
            "inline-flex items-center font-semibold rounded-full bg-brand-gold/15 text-brand-navy border border-brand-gold/50 dark:bg-brand-gold/20 dark:text-brand-gold",
            sizeClasses,
            className
          )}
        >
          {showIcon && <Clock className="w-3 h-3 text-brand-navy dark:text-brand-gold" />}
          Waiting
        </span>
      );

    case "CALLED":
      return (
        <span
          className={cn(
            "inline-flex items-center font-bold rounded-full bg-brand-navy text-brand-gold border border-brand-navyDark shadow-xs animate-pulse dark:bg-brand-navyLight dark:text-brand-gold",
            sizeClasses,
            className
          )}
        >
          {showIcon && <Megaphone className="w-3 h-3 text-brand-gold" />}
          Called
        </span>
      );

    case "SERVING":
      return (
        <span
          className={cn(
            "inline-flex items-center font-bold rounded-full bg-brand-gold text-brand-navy border border-brand-goldHover shadow-xs",
            sizeClasses,
            className
          )}
        >
          {showIcon && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-navy opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-navy"></span>
            </span>
          )}
          Serving Now
        </span>
      );

    case "COMPLETED":
      return (
        <span
          className={cn(
            "inline-flex items-center font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60",
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
            "inline-flex items-center font-medium rounded-full bg-brand-platinum text-brand-navy/70 border border-brand-platinum dark:bg-brand-navy dark:text-brand-platinum/70 dark:border-brand-navyLight",
            sizeClasses,
            className
          )}
        >
          {showIcon && <FastForward className="w-3 h-3 text-brand-navy/60 dark:text-brand-platinum/60" />}
          Skipped
        </span>
      );

    default:
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-full bg-brand-platinum text-brand-navy border border-brand-platinum",
            sizeClasses,
            className
          )}
        >
          {status}
        </span>
      );
  }
}
