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
            "inline-flex items-center font-semibold rounded-full bg-brand-sage/20 text-brand-forest border border-brand-sage/40 dark:bg-brand-sage/20 dark:text-brand-stone",
            sizeClasses,
            className
          )}
        >
          {showIcon && <Clock className="w-3 h-3 text-brand-forest dark:text-brand-stone" />}
          Waiting
        </span>
      );

    case "CALLED":
      return (
        <span
          className={cn(
            "inline-flex items-center font-bold rounded-full bg-brand-forest text-brand-stone border border-brand-pine shadow-xs animate-pulse dark:bg-brand-pine dark:text-white",
            sizeClasses,
            className
          )}
        >
          {showIcon && <Megaphone className="w-3 h-3 text-brand-sage" />}
          Called
        </span>
      );

    case "SERVING":
      return (
        <span
          className={cn(
            "inline-flex items-center font-bold rounded-full bg-brand-pine text-white border border-brand-forest shadow-xs",
            sizeClasses,
            className
          )}
        >
          {showIcon && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-sage opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-sage"></span>
            </span>
          )}
          Serving Now
        </span>
      );

    case "COMPLETED":
      return (
        <span
          className={cn(
            "inline-flex items-center font-semibold rounded-full bg-brand-fern/15 text-brand-forest border border-brand-fern/40 dark:bg-brand-fern/20 dark:text-brand-stone",
            sizeClasses,
            className
          )}
        >
          {showIcon && <CheckCircle2 className="w-3 h-3 text-brand-fern dark:text-brand-sage" />}
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
            "inline-flex items-center font-medium rounded-full bg-brand-stone/40 text-brand-forest/70 border border-brand-stone dark:bg-brand-forest dark:text-brand-stone/70 dark:border-brand-pine",
            sizeClasses,
            className
          )}
        >
          {showIcon && <FastForward className="w-3 h-3 text-brand-forest/60 dark:text-brand-stone/60" />}
          Skipped
        </span>
      );

    default:
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-full bg-brand-stone/30 text-brand-forest border border-brand-stone",
            sizeClasses,
            className
          )}
        >
          {status}
        </span>
      );
  }
}
